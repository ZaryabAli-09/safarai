/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateAICompletion, OpenRouterMessage } from "@/config/ai";
import { getRates } from "@/lib/services/fx";
import type {
  AIItineraryResult,
  GeneratedDay,
  TripAIInput,
} from "@/types/app-types";

const SLOT_HINT: Record<string, string> = {
  morning: "morning (6am-11am)",
  afternoon: "afternoon (12pm-4pm)",
  evening: "evening (5pm-9pm)",
  night: "night (after 10pm)",
};

/** Budget/FX context computed once per generation and fed to the prompt. */
interface PromptContext {
  /** Total budget minus the flight expense — what the ground trip may spend. */
  groundBudget: number;
  /** Ground budget per day (rounded). */
  perDay: number;
  /** Nights of accommodation (at least 1). */
  nights: number;
  /** Units of the trip currency per 1 USD (cost-conversion anchor). */
  fxRate: number;
  /** Logger instance for this generation. */
  logger: any;
  /** OpenRouter conversation messages accumulated during generation. */
  messages: OpenRouterMessage[];
}

function buildTripBrief(trip: TripAIInput, ctx: PromptContext): string {
  const lines = [
    `- Starting location: ${trip.origin.name}${trip.origin.country ? ` (${trip.origin.country})` : ""}`,
    `- Long-distance transport: ${trip.outbound}`,
    `- Destinations: ${trip.destinations.join(", ")}`,
    `- Dates: ${trip.startDate.toISOString().split("T")[0]} to ${trip.endDate.toISOString().split("T")[0]} (${trip.duration} days, ${ctx.nights} night(s))`,
    `- Arrival time: ${SLOT_HINT[trip.arrivalTime]}`,
    `- Departure time: ${SLOT_HINT[trip.departureTime]}`,
    `- Travelers: ${trip.adults} adult(s), ${trip.children} child(ren), ${trip.pets} pet(s)`,
    `- Styles: ${trip.styles.length ? trip.styles.join(", ") : "general sightseeing"}`,
    `- Interests: ${trip.interests.length ? trip.interests.join(", ") : "general sightseeing"}`,
    `- Pace: ${trip.pace}`,
    `- Stay level: ${trip.stayLevel}`,
    `- Local transport: ${trip.localTransport}`,
    `- Budget: ${trip.budget} ${trip.currency} (approximately ${Math.round(trip.budgetUSD)} USD)`,
    `- Ground-trip budget (everything except the flight): ${ctx.groundBudget} ${trip.currency} — about ${ctx.perDay} ${trip.currency} per day`,
    `- FX anchor: 1 USD ≈ ${ctx.fxRate} ${trip.currency}`,
    `- Flights included in budget: ${trip.includesFlights ? "yes" : "no"}`,
    trip.flightBudget === undefined
      ? "- Flight expense: not provided"
      : `- Flight expense: ${trip.flightBudget} ${trip.currency}`,
    `- Additional notes: ${trip.comment || "None provided"}`,
  ];

  if (trip.destinationDays.length > 0) {
    lines.splice(
      4,
      0,
      `- Days per destination: ${trip.destinationDays.map((item) => `${item.name} ${item.days}d`).join(", ")}`,
    );
  }

  if (trip.prebooked.length > 0) {
    lines.push(
      `- Already booked: ${trip.prebooked.map((item) => `${item.type}${item.amount === undefined ? "" : ` (${item.amount} ${trip.currency})`}`).join(", ")}`,
    );
  }

  return lines.join("\n");
}

function extractJSON(text: string): any {
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}

  for (let start = cleaned.indexOf("{"); start !== -1; ) {
    let depth = 0;
    let end = -1;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleaned.length; index++) {
      const character = cleaned[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if (character === '"') {
        inString = !inString;
        continue;
      }
      if (!inString && character === "{") depth++;
      if (!inString && character === "}" && --depth === 0) {
        end = index;
        break;
      }
    }

    if (end !== -1) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        if (Array.isArray(parsed?.itinerary)) return parsed;
      } catch {}
    }

    start = cleaned.indexOf("{", start + 1);
  }

  throw new Error("No valid JSON found in AI response");
}

function dateForDay(startDate: Date, dayIndex: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayIndex);
  return date.toISOString().split("T")[0];
}

function activityId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function normalizeItinerary(
  itinerary: GeneratedDay[],
  startDate: Date,
): GeneratedDay[] {
  return itinerary.map((day, dayIndex) => ({
    ...day,
    dayNumber: day.dayNumber ?? dayIndex + 1,
    // Trust the AI's date only when it's a real ISO date — models sometimes
    // echo the example "YYYY-MM-DD" placeholder.
    date:
      day.date && /^\d{4}-\d{2}-\d{2}$/.test(day.date)
        ? day.date
        : dateForDay(startDate, dayIndex),
    activities: (day.activities || []).map((activity) => ({
      ...activity,
      id: activity.id || activityId(),
      location:
        activity.venue && activity.city
          ? `${activity.venue}, ${activity.city}`
          : activity.location || activity.venue,
    })),
  }));
}

/** Placeholder strings from the prompt's shape example — never real content. */
const PLACEHOLDER_MARKERS = [
  "day title",
  "city/area",
  "specific real place",
  "city name",
  "country name",
  "activity name",
  "estimated budget",
  "bestseason",
];

/**
 * Structural sanity check of a generated itinerary.
 * Returns human-readable problems; `severe` problems trigger a re-generation.
 */
function validateGeneratedItinerary(
  itinerary: GeneratedDay[],
  trip: TripAIInput,
): { severe: string[]; soft: string[] } {
  const severe: string[] = [];
  const soft: string[] = [];

  if (itinerary.length === 0) severe.push("no days generated");
  if (itinerary.length !== trip.duration)
    soft.push(
      `expected ${trip.duration} days, got ${itinerary.length}`,
    );

  let totalActivities = 0;
  for (const day of itinerary) {
    const activities = day.activities || [];
    totalActivities += activities.length;
    if (activities.length === 0)
      severe.push(`day ${day.dayNumber} has no activities`);
    for (const activity of activities) {
      const haystack = `${day.title}|${day.location}|${activity.title}|${activity.venue}|${activity.city}|${activity.country}`.toLowerCase();
      if (PLACEHOLDER_MARKERS.some((marker) => haystack.includes(marker))) {
        severe.push(
          `placeholder text in "${activity.title || day.title}" (model returned the example)`,
        );
        break;
      }
    }
  }
  if (totalActivities < trip.duration)
    severe.push(
      `only ${totalActivities} activities for ${trip.duration} days`,
    );

  return { severe, soft };
}

export async function generateTripItinerary(
  trip: TripAIInput,
): Promise<AIItineraryResult & { itinerary: GeneratedDay[] }> {
  // Budget/FX context shared by the brief and the system rules.
  const { rates } = await getRates();
  const fxRate = Math.round((rates[trip.currency] ?? 1) * 100) / 100;
  const flights =
    trip.includesFlights && trip.flightBudget !== undefined
      ? Math.min(trip.flightBudget, trip.budget)
      : 0;
  const groundBudget = Math.max(trip.budget - flights, 0);
  const nights = Math.max(trip.duration - 1, 1);
  const perDay = Math.round(groundBudget / Math.max(trip.duration, 1));
  const systemMessage: OpenRouterMessage = {
    role: "system",
    content: `You are a JSON-only travel planner. Return only valid JSON. Do not use markdown or explanatory text.

The input fields are the complete source of truth. Preserve every style and interest label exactly as provided. Never abbreviate, rename, translate, or convert labels such as "Nature & Scenery" into codes or shortened values.

BUDGET MATH (must hold exactly):
- Ground-trip budget G = ${groundBudget} ${trip.currency} (total budget minus the flight expense). This is what the whole ground portion of the trip may spend.
- The budgetBreakdown categories (accommodation, food, transport, activities, miscellaneous) must sum EXACTLY to ${groundBudget} ${trip.currency}. Never include flights inside them.
- budgetBreakdown.total must be ${trip.budget} ${trip.currency}.
- accommodation = realistic nightly rate for ${trip.stayLevel} stays × ${nights} night(s) for ${trip.adults + trip.children} traveler(s).
- activities = the sum of the estimatedCost values of ALL activities you list.
- food = daily meals for the group that are NOT already listed as activities.
- transport = local transport only. miscellaneous = small buffer (souvenirs, tips, SIM cards).
- Plan roughly ${perDay} ${trip.currency} per day against G.

COST REALISM (every estimatedCost):
- Use a realistic LOCAL price in ${trip.currency}. Reference: 1 USD ≈ ${fxRate} ${trip.currency}.
- Typical USD-equivalent prices: major attraction ticket $10-35, museum $5-20, casual meal $5-20, nice dinner $15-45, taxi ride $3-15, metro/bus ride $1-5, mid-range hotel per night $60-250.
- Convert to ${trip.currency} with the FX anchor (e.g. a $15 ticket ≈ ${Math.round(15 * fxRate)} ${trip.currency}) — never write USD-scale numbers under a different currency, and never give every activity the same number. Use "Free" or "0 ${trip.currency}" for free entries.

ITINERARY RULES:
- Use real venues (named hotels, restaurants, sights) — never generic placeholders or invented names like "City Food Tour".
- timeOfDay must be exactly one of: morning, afternoon, evening.
- category must be exactly one of: sightseeing, food, museum, culture, nature, adventure, shopping, accommodation, transport.
- Day 1: include the outbound journey from ${trip.origin.name} by ${trip.outbound} (respect the ${trip.arrivalTime} arrival slot), an airport/station transfer, and hotel check-in at a REAL named ${trip.stayLevel} hotel in the destination — then activities that fit after arrival.
- The final day must end with the journey home per the ${trip.departureTime} departure slot: include the transfer + outbound transport and schedule NO paid activities at or after the departure slot.
- Whenever the destination or hotel changes, name the new hotel.
- Create three practical activities per full day (fewer on arrival/departure days), and respect arrival and departure times.

Return this shape:
{
  "itinerary": [{
    "dayNumber": 1,
    "date": "YYYY-MM-DD",
    "title": "Day title",
    "location": "City/Area",
    "activities": [{
      "id": "act1",
      "timeOfDay": "morning",
      "title": "Activity name",
      "description": "2-3 sentence description",
      "venue": "Specific real place",
      "city": "City name",
      "country": "Country name",
      "estimatedCost": "20-30 ${trip.currency}",
      "duration": "2 hours",
      "category": "sightseeing"
    }]
  }],
  "summary": {"totalDays": 0, "destinations": [], "estimatedBudget": "X ${trip.currency}", "bestSeason": "string", "travelStyle": "string", "familyFriendly": true},
  "budgetBreakdown": {"accommodation": 0, "food": 0, "transport": 0, "activities": 0, "miscellaneous": 0, "total": 0, "currency": "${trip.currency}"},
  "packingList": ["item1"],
  "travelTips": ["tip1"],
  "aiNotes": "Brief notes"
}

Rules: return costs in ${trip.currency} as realistic local prices, include 8-10 packing items and 4-6 travel tips.`,
  };

  const ctx: PromptContext = {
    groundBudget,
    perDay,
    nights,
    fxRate,
    logger: console,
    messages: [systemMessage],
  };

  const userMessage: OpenRouterMessage = {
    role: "user",
    content: `Plan this trip using the fields exactly as given:\n${buildTripBrief(trip, ctx)}\n\nGenerate the complete JSON itinerary now.`,
  };

  ctx.messages.push(userMessage);

  // Retry loop: free-tier models occasionally return the example shape or a
  // structurally broken itinerary. `severe` problems force a second attempt.
  let parsedResult: any = null;
  let problems: { severe: string[]; soft: string[] } = {
    severe: [],
    soft: [],
  };
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await generateAICompletion(ctx.messages, 8000, {
        // Do not spend another full fallback cycle on the model that already
        // returned an unparseable response.
        skipModels:
          attempt > 1
            ? ["nvidia/nemotron-3-ultra-550b-a55b:free"]
            : [],
      });
      parsedResult = extractJSON(response);
    } catch (error) {
      parsedResult = null;
      problems = {
        severe: [`unparseable AI response (${(error as Error).message})`],
        soft: [],
      };
      ctx.logger.error(`[AI] attempt ${attempt}: ${problems.severe[0]}`);
    }

    if (parsedResult) {
      const itinerary = normalizeItinerary(
        parsedResult.itinerary || [],
        trip.startDate,
      );
      if (itinerary.length === 0) {
        problems = {
          severe: ["AI response missing itinerary array"],
          soft: [],
        };
        ctx.logger.error(
          `[AI] attempt ${attempt}: empty itinerary — ${JSON.stringify(parsedResult)}`,
        );
      } else {
        problems = validateGeneratedItinerary(itinerary, trip);
        if (problems.severe.length === 0) break;
        ctx.logger.warn(
          `[AI] attempt ${attempt} problems: ${problems.severe.join("; ")}`,
        );
      }
    }
    if (attempt === 1) {
      // Corrective nudge on the retry — models echo the example when confused.
      ctx.messages.push({
        role: "user",
        content:
          "IMPORTANT: the JSON below is the REQUIRED shape — never repeat the example values. Generate a fully real itinerary: every day must have at least one real activity with a real venue and city (e.g. title 'Lahore Heritage Walk', venue 'Walled City of Lahore', city 'Lahore', country 'Pakistan'). Never include placeholder text like 'Day title', 'City/Area', 'Specific real place' or 'City name'.",
      });
    }
  }

  if (problems.severe.length) {
    ctx.logger.error(
      `[AI] reverted to draft: ${problems.severe.join("; ")}`,
    );
    throw new Error(
      `This outing didn't come together (${problems.severe.join("; ")}) — try again in a bit.`,
    );
  }

  return {
    ...parsedResult,
    itinerary: normalizeItinerary(parsedResult.itinerary || [], trip.startDate),
  };
}
