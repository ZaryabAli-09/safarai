/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateAICompletion, OpenRouterMessage } from "@/config/ai";
import type { SanitizedTrip } from "@/lib/trip-creation-input";

export interface TripAIInput extends SanitizedTrip {
  budgetUSD: number;
}

export interface GeneratedActivity {
  id?: string;
  timeOfDay?: string;
  title?: string;
  description?: string;
  location?: string;
  venue?: string;
  city?: string;
  country?: string;
  estimatedCost?: string;
  duration?: string;
  category?: string;
  [key: string]: unknown;
}

export interface GeneratedDay {
  dayNumber?: number;
  date?: string;
  title?: string;
  location?: string;
  activities?: GeneratedActivity[];
  [key: string]: unknown;
}

export interface AIItineraryResult {
  itinerary: GeneratedDay[];
  summary?: any;
  budgetBreakdown?: any;
  packingList?: string[];
  travelTips?: string[];
  aiNotes?: string;
}

const SLOT_HINT: Record<string, string> = {
  morning: "morning (6am-11am)",
  afternoon: "afternoon (12pm-4pm)",
  evening: "evening (5pm-9pm)",
  night: "night (after 10pm)",
};

function buildTripBrief(trip: TripAIInput): string {
  const lines = [
    `- Starting location: ${trip.origin.name}${trip.origin.country ? ` (${trip.origin.country})` : ""}`,
    `- Long-distance transport: ${trip.outbound}`,
    `- Destinations: ${trip.destinations.join(", ")}`,
    `- Dates: ${trip.startDate.toISOString().split("T")[0]} to ${trip.endDate.toISOString().split("T")[0]} (${trip.duration} days)`,
    `- Arrival time: ${SLOT_HINT[trip.arrivalTime]}`,
    `- Departure time: ${SLOT_HINT[trip.departureTime]}`,
    `- Travelers: ${trip.adults} adult(s), ${trip.children} child(ren), ${trip.pets} pet(s)`,
    `- Styles: ${trip.styles.length ? trip.styles.join(", ") : "general sightseeing"}`,
    `- Interests: ${trip.interests.length ? trip.interests.join(", ") : "general sightseeing"}`,
    `- Pace: ${trip.pace}`,
    `- Stay level: ${trip.stayLevel}`,
    `- Local transport: ${trip.localTransport}`,
    `- Budget: ${trip.budget} ${trip.currency} (approximately ${Math.round(trip.budgetUSD)} USD)`,
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
    date: day.date || dateForDay(startDate, dayIndex),
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

export async function generateTripItinerary(
  trip: TripAIInput,
): Promise<AIItineraryResult & { itinerary: GeneratedDay[] }> {
  const systemMessage: OpenRouterMessage = {
    role: "system",
    content: `You are a JSON-only travel planner. Return only valid JSON. Do not use markdown or explanatory text.

The input fields are the complete source of truth. Preserve every style and interest label exactly as provided. Never abbreviate, rename, translate, or convert labels such as "Nature & Scenery" into codes or shortened values.

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

Rules: create three practical activities per full day, use real venues, respect arrival and departure times, return costs in ${trip.currency}, include 8-10 packing items and 4-6 travel tips.`,
  };

  const userMessage: OpenRouterMessage = {
    role: "user",
    content: `Plan this trip using the fields exactly as given:\n${buildTripBrief(trip)}\n\nGenerate the complete JSON itinerary now.`,
  };

  const response = await generateAICompletion(
    [systemMessage, userMessage],
    8000,
  );
  const parsed = extractJSON(response);
  if (!Array.isArray(parsed.itinerary) || parsed.itinerary.length === 0) {
    throw new Error("AI response missing itinerary array");
  }

  return {
    ...parsed,
    itinerary: normalizeItinerary(parsed.itinerary, trip.startDate),
  };
}
