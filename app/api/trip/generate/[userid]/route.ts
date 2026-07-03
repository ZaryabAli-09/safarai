import { response } from "@/lib/helperFunctions";
import { NextRequest } from "next/server";
import { Trip } from "@/models/Trip";
import { IActivity } from "@/models/Trip";
import { dbConnect } from "@/config/db";
import { generateAICompletion, OpenRouterMessage } from "@/config/ai";
import { geocodeLocation } from "@/lib/services/location";
import { getWeatherForLocation } from "@/lib/services/weather";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function sanitizeTripInput(input: any) {
  const destinations = Array.isArray(input.destinations)
    ? input.destinations.filter((d: any) => typeof d === "string").slice(0, 10)
    : [];

  const duration = parseInt(input.duration) || 0;
  const budget = parseFloat(input.budget) || 0;

  return {
    name: String(input.name || "My Trip").slice(0, 200),
    destinations,
    startDate: input.startDate ? new Date(input.startDate) : new Date(),
    endDate: input.endDate
      ? new Date(input.endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: Math.max(1, Math.min(30, duration)),
    budget: Math.max(1, Math.min(10000000, budget)),
    currency: String(input.currency || "USD").slice(0, 10),
    tripType: String(input.tripType || "adventure").slice(0, 50),
    transportation: String(input.transportation || "mix").slice(0, 50),
    accommodation: String(input.accommodation || "mid-range").slice(0, 50),
    tripPace: String(input.tripPace || "moderate").slice(0, 50),
    interests: Array.isArray(input.interests)
      ? input.interests.filter((i: any) => typeof i === "string").slice(0, 20)
      : [],
    travelers: Math.max(1, Math.min(20, parseInt(input.travelers) || 1)),
  };
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
  let cleaned = text
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .trim();

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Find the outermost JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {}
  }

  // Try to find JSON array
  const arrStart = cleaned.indexOf("[");
  const arrEnd = cleaned.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    try {
      return JSON.parse(cleaned.slice(arrStart, arrEnd + 1));
    } catch {}
  }

  throw new Error("No valid JSON found in AI response");
}

// ─── AI Itinerary Generation ──────────────────────────────────────────────────

async function generateItineraryWithAI(tripData: any): Promise<any> {
  const startStr = tripData.startDate.toISOString().split("T")[0];
  const interestStr =
    tripData.interests.length > 0
      ? tripData.interests.join(", ")
      : "general sightseeing";

  /**
   * IMPORTANT: Keep the prompt concise and the JSON schema minimal.
   * Large/complex prompts cause free models to fail or truncate output.
   * We ask for exactly 3 activities per day with minimal fields.
   */
  const systemMessage: OpenRouterMessage = {
    role: "system",
    content: `You are a travel planner. Output ONLY valid JSON, no markdown, no explanation.

Return this exact structure:
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
          "location": "Specific place",
          "estimatedCost": "$20-30",
          "duration": "2 hours",
          "category": "sightseeing"
        }
      ]
    }
  ],
  "summary": {
    "totalDays": 0,
    "destinations": [],
    "estimatedBudget": "$X",
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
    "currency": "USD"
  },
  "packingList": ["item1", "item2"],
  "travelTips": ["tip1", "tip2"],
  "aiNotes": "Brief notes"
}

Rules:
- Exactly 3 activities per day: morning, afternoon, evening
- timeOfDay: "morning" | "afternoon" | "evening" only
- category: "sightseeing" | "food" | "adventure" | "culture" | "shopping" | "nature" | "accommodation" | "transport"
- packingList: 8-10 items
- travelTips: 4-6 items
- All costs in USD`,
  };

  const userMessage: OpenRouterMessage = {
    role: "user",
    content: `Plan a ${tripData.duration}-day ${tripData.tripType} trip:
- Destinations: ${tripData.destinations.join(", ")}
- Start: ${startStr}
- Budget: $${tripData.budget} for ${tripData.travelers} traveler(s)
- Pace: ${tripData.tripPace}
- Accommodation: ${tripData.accommodation}
- Interests: ${interestStr}

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
  params: { params: { userid: string } },
) {
  try {
    const { userid } = await params.params;
    const tripDetails = await req.json();

    if (!userid) {
      return response(false, 400, "User id not found");
    }

    // Sanitize and validate input
    const tripData = sanitizeTripInput(tripDetails);

    if (!tripData.destinations || tripData.destinations.length === 0) {
      return response(false, 400, "Please enter at least one destination");
    }
    if (tripData.duration < 1 || tripData.duration > 30) {
      return response(false, 400, "Duration must be between 1 and 30 days");
    }
    if (tripData.budget <= 0) {
      return response(false, 400, "Budget must be a positive number");
    }

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
          activities: (day.activities || []).map((activity: any) => ({
            ...activity,
            id: activity.id || generateId(),
          })),
        }),
      );

      // Assign itinerary BEFORE enrichment so there's something to attach to
      trip.itinerary = normalizedItinerary;

      // ── Step 2: Geocode main destination and enhance activities ─────────
      let coordinates: { lat: number; lng: number } | undefined;
      try {
        const locationData = await geocodeLocation(tripData.destinations[0]);
        if (locationData) {
          coordinates = { lat: locationData.lat, lng: locationData.lng };
          console.log(
            `[Generate] Geocoded ${tripData.destinations[0]}: ${coordinates.lat}, ${coordinates.lng}`,
          );

          if (trip.itinerary[0]?.activities) {
            trip.itinerary[0].activities = trip.itinerary[0].activities.map(
              (activity: IActivity) => ({ ...activity, coordinates }),
            );
          }
        }
      } catch {
        console.warn(
          "[Generate] Geocoding failed, continuing without coordinates",
        );
      }

      // ── Step 3: Get weather forecast and enhance activities ─────────────
      try {
        if (coordinates) {
          const weatherData = await getWeatherForLocation(
            coordinates.lat,
            coordinates.lng,
            tripData.startDate.toISOString().split("T")[0],
            tripData.endDate.toISOString().split("T")[0],
          );
          if (weatherData) {
            console.log(
              `[Generate] Got weather for ${weatherData.length} days`,
            );

            trip.itinerary = trip.itinerary.map((day, index) => {
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
        estimatedBudget: `$${tripData.budget}`,
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
        currency: "USD",
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
