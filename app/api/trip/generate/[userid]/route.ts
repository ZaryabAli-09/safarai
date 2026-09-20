/* eslint-disable @typescript-eslint/no-explicit-any */
import { response } from "@/lib/helperFunctions";
import { NextRequest } from "next/server";
import { Trip } from "@/models/Trip";
import { IActivity } from "@/models/Trip";
import { dbConnect } from "@/config/db";
import { generateAICompletion, OpenRouterMessage } from "@/config/ai";
import { geocodeMultipleLocations } from "@/lib/services/location";
import { getWeatherForLocation } from "@/lib/services/weather";
import { getLocationImages } from "@/lib/services/locationImage";
import { sanitizeTripInput, LIMITS } from "@/lib/tripInput";
import { toUSD } from "@/lib/services/fx";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function buildDateForDay(startDate: Date, dayIndex: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().split("T")[0];
}

/**
 * Extract JSON from AI response — handles markdown fences, extra text, etc.
 */
function extractJSON(text: string): any {
  // Remove markdown code fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  // Try direct parse, but only accept JSON objects. A model may return a
  // valid-looking destination array even though the itinerary object is missing.
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {}

  // Try every object start so malformed wrapper characters (for example "{{
  // ... }") do not hide a valid itinerary object that follows them.
  for (let start = cleaned.indexOf("{"); start !== -1; ) {
    let braceCount = 0;
    let end = -1;
    let inString = false;
    let escapeNext = false;

    for (let i = start; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") braceCount++;
        if (char === "}") {
          braceCount--;
          if (braceCount === 0) {
            end = i;
            break;
          }
        }
      }
    }

    if (end !== -1) {
      try {
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        if (Array.isArray(parsed?.itinerary)) {
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse JSON object with brace matching:", e);
      }
    }

    const nextStart = cleaned.indexOf("{", start + 1);
    if (nextStart === -1) break;
    start = nextStart;
  }

  // Log the problematic text for debugging
  console.error(
    "Could not extract JSON from response. First 500 chars:",
    cleaned.slice(0, 500),
  );
  throw new Error("No valid JSON found in AI response");
}

// ─── AI Itinerary Generation ──────────────────────────────────────────────────

const SLOT_HINT: Record<string, string> = {
  morning: "morning (6am-11am)",
  afternoon: "afternoon (12pm-4pm)",
  evening: "evening (5pm-9pm)",
  night: "night (after 10pm)",
};

/** Turns the structured input into the plain-language brief the model sees. */
function buildTripBrief(t: any): string {
  const startStr = t.startDate.toISOString().split("T")[0];
  const endStr = t.endDate.toISOString().split("T")[0];
  const lines: string[] = [];

  lines.push(
    `- Starting from: ${t.origin.name}${t.origin.country ? ` (${t.origin.country})` : ""}, getting to the destination by ${t.outbound}`,
  );
  lines.push(`- Destinations: ${t.destinations.join(", ")}`);
  if (t.destinationDays.length > 0) {
    lines.push(
      `- Days per destination (follow exactly): ${t.destinationDays.map((d: any) => `${d.name} ${d.days}d`).join(", ")}`,
    );
  }
  lines.push(`- Dates: ${startStr} to ${endStr} (${t.duration} days)`);
  lines.push(
    `- Arrival at first destination: ${SLOT_HINT[t.arrivalTime]}. Day 1 must only contain activities AFTER arrival.`,
  );
  lines.push(
    `- Departure from last destination: ${SLOT_HINT[t.departureTime]}. The last day must finish before departure.`,
  );
  lines.push(
    `- Travelers: ${t.adults} adult(s)${t.children ? `, ${t.children} child(ren)` : ""} (${t.companions})`,
  );
  lines.push(
    `- Trip style: ${t.styles.length ? t.styles.join(", ") : "general sightseeing"}`,
  );
  lines.push(
    `- Interests: ${t.interests.length ? t.interests.join(", ") : "general sightseeing"}`,
  );
  lines.push(
    `- Pace: ${t.pace}; stay level: ${t.stayLevel}; local transport: ${t.localTransport}`,
  );

  const booked = t.prebooked
    .map(
      (p: any) =>
        `${p.type} already booked${p.amount ? ` (${p.amount} ${t.currency})` : ""}`,
    )
    .join(", ");
  lines.push(
    `- Budget: ${t.budget} ${t.currency} (~${Math.round(t.budgetUSD)} USD) for the whole group. ` +
      (t.includesFlights
        ? "This INCLUDES getting to the destination and back."
        : "This does NOT include flights/long-distance travel to the destination.") +
      (booked ? ` ${booked}.` : ""),
  );
  if (t.food.length) lines.push(`- Food requirements: ${t.food.join(", ")}`);
  if (t.mustInclude.length)
    lines.push(`- MUST include: ${t.mustInclude.join("; ")}`);
  if (t.avoid.length) lines.push(`- AVOID: ${t.avoid.join("; ")}`);
  lines.push(`- Traveler's additional notes: ${t.comment || "None provided"}`);

  return lines.join("\n");
}


async function generateItineraryWithAI(tripData: any): Promise<any> {
  /**
   * IMPORTANT: Keep the prompt concise and the JSON schema minimal.
   * Large/complex prompts cause free models to fail or truncate output.
   * We ask for exactly 3 activities per day with minimal fields.
   */
  const systemMessage: OpenRouterMessage = {
    role: "system",
    content: `You are a JSON-only travel planner. RESPOND WITH ONLY VALID JSON. NO TEXT BEFORE OR AFTER JSON. NO MARKDOWN. NO EXPLANATION.

{
  "itinerary": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "location": "City/Area",
      "activities": [
        {
          "id": "act1",
          "timeOfDay": "morning",
          "title": "Activity name",
          "description": "2-3 sentence description",
          "venue": "Specific place name (e.g., Faisal Mosque)",
          "city": "City name (e.g., Islamabad)",
          "country": "Country name (e.g., Pakistan)",
          "estimatedCost": "20-30 ${tripData.currency}",
          "duration": "2 hours",
          "category": "sightseeing"
        }
      ]
    }
  ],
  "summary": {
    "totalDays": 0,
    "destinations": [],
    "estimatedBudget": "X ${tripData.currency}",
    "bestSeason": "string",
    "travelStyle": "string",
    "familyFriendly": true
  },
  "budgetBreakdown": {
    "accommodation": 0,
    "food": 0,
    "transport": 0,
    "activities": 0,
    "miscellaneous": 0,
    "total": 0,
    "currency": "${tripData.currency}"
  },
  "packingList": ["item1", "item2"],
  "travelTips": ["tip1", "tip2"],
  "aiNotes": "Brief notes"
}

RULES: 3 activities/day (morning, afternoon, evening). venue=specific real place. city=destination city. country=destination country. packingList=8-10 items. travelTips=4-6 items. All costs in ${tripData.currency}.`,
  };

  const userMessage: OpenRouterMessage = {
    role: "user",
    content: `Plan a ${tripData.duration}-day trip:
${buildTripBrief(tripData)}

IMPORTANT:
- Create a realistic, practical itinerary with SPECIFIC, real place names
- Respect arrival/departure times: fewer activities on Day 1 if arrival is late, and none after departure on the last day
- Honor the food requirements, MUST include and AVOID items
- Give every estimatedCost as a numeric range in ${tripData.currency} (e.g. "20-30 ${tripData.currency}"); use "0 ${tripData.currency}" only for genuinely free places
- Make budgetBreakdown add up to roughly the budget, and reflect anything already booked or excluded (flights)
- Avoid generic activities like "Hotel Check-in" unless necessary

Generate the complete JSON itinerary now.`,
  };

  const aiResponse = await generateAICompletion(
    [systemMessage, userMessage],
    8000,
  );

  console.log(`[Generate] AI response length: ${aiResponse.length} chars`);
  console.log(`[Generate] First 200 chars: ${aiResponse.slice(0, 200)}`);

  const parsed = extractJSON(aiResponse);

  if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
    console.error(
      "[Generate] Missing itinerary array in:",
      JSON.stringify(parsed).slice(0, 300),
    );
    throw new Error("AI response missing itinerary array");
  }

  if (parsed.itinerary.length === 0) {
    throw new Error("AI returned empty itinerary");
  }

  return parsed;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  params: { params: Promise<{ userid: string }> },
) {
  try {
    const { userid } = await params.params;
    const tripDetails = await req.json();

    if (!userid) {
      return response(false, 400, "User id not found");
    }

    // Sanitize and validate input (shared with the form; duration is derived
    // from the dates, budgetUSD from a server-side FX lookup)
    const parsed = sanitizeTripInput(tripDetails);
    if (!parsed.ok) {
      return response(false, 400, parsed.error);
    }
    const budgetUSD = await toUSD(parsed.data.budget, parsed.data.currency);
    if (budgetUSD > LIMITS.maxBudgetUSD) {
      return response(false, 400, "That budget looks too large. Please check the amount.");
    }
    const tripData = { ...parsed.data, budgetUSD };

    await dbConnect();

    // Create trip record with "generating" status
    const trip = new Trip({
      userId: userid,
      ...tripData,
      status: "generating",
    });
    await trip.save();

    console.log(
      `[Generate] Trip created: ${trip._id}, starting AI generation...`,
    );

    try {
      // ── Step 1: Generate itinerary with AI ──────────────────────────────
      const aiResult = await generateItineraryWithAI(tripData);

      const normalizedItinerary = (aiResult.itinerary || []).map(
        (day: any, idx: number) => ({
          ...day,
          dayNumber: day.dayNumber ?? idx + 1,
          date: day.date || buildDateForDay(tripData.startDate, idx),
          activities: (day.activities || []).map((activity: any) => {
            // Normalize activity: set location from venue/city for backward compatibility
            const normalizedActivity = {
              ...activity,
              id: activity.id || generateId(),
            };
            // If venue and city are present, derive location as "venue, city"
            if (activity.venue && activity.city) {
              normalizedActivity.location = `${activity.venue}, ${activity.city}`;
            } else if (!normalizedActivity.location && activity.venue) {
              normalizedActivity.location = activity.venue;
            }
            return normalizedActivity;
          }),
        }),
      );

      // Assign itinerary BEFORE enrichment so there's something to attach to
      trip.itinerary = normalizedItinerary;

      // ── Step 2: Geocode all activities and fetch location images ────────
      let dayCoordinates: { lat: number; lng: number } | undefined;
      try {
        // Build geocoding queries from venue/city/country for each activity
        const geocodingQueries = new Set<string>();
        trip.itinerary.forEach((day: any) => {
          day.activities.forEach((activity: IActivity) => {
            // Add full venue query first
            if (activity.venue && activity.city && activity.country) {
              geocodingQueries.add(
                `${activity.venue}, ${activity.city}, ${activity.country}`,
              );
            } else if (activity.venue && activity.city) {
              geocodingQueries.add(`${activity.venue}, ${activity.city}`);
            } else if (activity.location) {
              geocodingQueries.add(activity.location);
            }
            // Also add city-level fallback query
            if (activity.city && activity.country) {
              geocodingQueries.add(`${activity.city}, ${activity.country}`);
            }
          });
        });

        const uniqueQueries = Array.from(geocodingQueries);
        console.log(
          `[Generate] Geocoding ${uniqueQueries.length} unique locations...`,
        );

        // Geocode all locations in one batch (with rate limiting)
        const geocodedMap = await geocodeMultipleLocations(uniqueQueries);

        // Attach coordinates to each activity with fallback logic
        trip.itinerary = trip.itinerary.map((day: any) => ({
          ...day,
          activities: day.activities.map((activity: IActivity) => {
            // Try full query first (venue, city, country)
            let query = activity.location || day.location;
            if (activity.venue && activity.city && activity.country) {
              query = `${activity.venue}, ${activity.city}, ${activity.country}`;
            } else if (activity.venue && activity.city) {
              query = `${activity.venue}, ${activity.city}`;
            }

            let coords = query ? geocodedMap.get(query) : null;

            // Fallback: if full query failed and we have venue/city/country, try city-level
            if (!coords && activity.city && activity.country) {
              const fallbackQuery = `${activity.city}, ${activity.country}`;
              coords = geocodedMap.get(fallbackQuery);
            }

            if (coords && !dayCoordinates) {
              dayCoordinates = { lat: coords.lat, lng: coords.lng };
            }
            return {
              ...activity,
              coordinates: coords
                ? { lat: coords.lat, lng: coords.lng }
                : undefined,
            };
          }),
        }));

        console.log(
          `[Generate] Geocoding complete. Found coordinates for ${geocodedMap.size} locations.`,
        );
      } catch {
        console.warn(
          "[Generate] Geocoding failed, continuing without coordinates",
        );
      }

      // ── Step 2b: Fetch location images for all activities ───────────────
      try {
        const locationStrings = new Set<string>();
        trip.itinerary.forEach((day: any) => {
          day.activities.forEach((activity: IActivity) => {
            const locStr = activity.location || day.location;
            if (locStr) {
              locationStrings.add(locStr);
            }
          });
        });

        const uniqueLocations = Array.from(locationStrings);
        console.log(
          `[Generate] Fetching images for ${uniqueLocations.length} locations...`,
        );

        const imagesMap = await getLocationImages(uniqueLocations);

        // Attach images to each activity
        trip.itinerary = trip.itinerary.map((day: any) => ({
          ...day,
          activities: day.activities.map((activity: IActivity) => {
            const locStr = activity.location || day.location;
            const image = locStr ? imagesMap.get(locStr) : null;
            return {
              ...activity,
              image: image || undefined,
            };
          }),
        }));

        console.log(
          `[Generate] Image fetching complete. Found images for ${imagesMap.size} locations.`,
        );
      } catch {
        console.warn(
          "[Generate] Image lookup failed, continuing without images",
        );
      }

      // ── Step 3: Get weather forecast and enhance activities ─────────────
      try {
        if (dayCoordinates) {
          const weatherData = await getWeatherForLocation(
            dayCoordinates.lat,
            dayCoordinates.lng,
            tripData.startDate.toISOString().split("T")[0],
            tripData.endDate.toISOString().split("T")[0],
          );
          if (weatherData) {
            console.log(
              `[Generate] Got weather for ${weatherData.length} days`,
            );

            trip.itinerary = trip.itinerary.map((day: any, index: number) => {
              const dayWeather = weatherData[index];
              if (dayWeather) {
                return {
                  ...day,
                  activities: day.activities.map((activity: IActivity) => ({
                    ...activity,
                    weather: {
                      temp: dayWeather.temp_max, // e.g. "27°C"
                      condition: dayWeather.condition,
                      icon: dayWeather.icon,
                    },
                  })),
                };
              }
              return day;
            });
          }
        }
      } catch {
        console.warn(
          "[Generate] Weather lookup failed, continuing without weather",
        );
      }

      // ── Step 4: Save completed trip ─────────────────────────────────────
      trip.summary = aiResult.summary || {
        totalDays: tripData.duration,
        destinations: tripData.destinations,
        estimatedBudget: `${tripData.budget} ${tripData.currency}`,
        bestSeason: "Year-round",
        travelStyle: tripData.tripType,
        familyFriendly: true,
      };
      trip.budgetBreakdown = aiResult.budgetBreakdown || {
        accommodation: Math.round(tripData.budget * 0.35),
        food: Math.round(tripData.budget * 0.25),
        transport: Math.round(tripData.budget * 0.15),
        activities: Math.round(tripData.budget * 0.15),
        miscellaneous: Math.round(tripData.budget * 0.1),
        total: tripData.budget,
        currency: tripData.currency,
      };
      trip.packingList = aiResult.packingList || [];
      trip.travelTips = aiResult.travelTips || [];
      trip.aiNotes = aiResult.aiNotes || "";
      trip.status = "completed";

      await trip.save();

      console.log(`[Generate] Trip ${trip._id} completed successfully!`);
      return response(true, 201, "Trip generated successfully", trip);
    } catch (aiError) {
      // Mark trip as draft if AI fails — don't delete it
      trip.status = "draft";
      trip.aiNotes =
        aiError instanceof Error
          ? `Generation failed: ${aiError.message}`
          : "Trip created but AI generation failed. Please try again.";
      await trip.save();

      console.error("[Generate] AI generation error:", aiError);
      return response(
        false,
        500,
        aiError instanceof Error
          ? aiError.message
          : "AI generation failed. Please try again.",
      );
    }
  } catch (error) {
    console.error("[Generate] Unexpected error:", error);
    return response(false, 500, "Failed to generate trip. Please try again.");
  }
}
