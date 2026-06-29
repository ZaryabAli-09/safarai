import { response } from "@/lib/helperFunctions";
import { NextRequest } from "next/server";
import { Trip } from "@/models/Trip";
import { dbConnect } from "@/config/db";
import { generateAICompletion, OpenRouterMessage } from "@/config/ai";
import { geocodeLocation } from "@/lib/services/location";
import { getWeatherForLocation } from "@/lib/services/weather";

// Helper to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Sanitize and validate trip input
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
    endDate: input.endDate ? new Date(input.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    duration: Math.max(1, Math.min(30, duration)),
    budget: Math.max(1, Math.min(10000000, budget)),
    currency: "USD",
    tripType: String(input.tripType || "adventure").slice(0, 50),
    transportation: String(input.transportation || "mix").slice(0, 50),
    accommodation: String(input.accommodation || "mid-range").slice(0, 50),
    tripPace: String(input.tripPace || "moderate").slice(0, 50),
    interests: Array.isArray(input.interests) ? input.interests.filter((i: any) => typeof i === "string").slice(0, 20) : [],
    travelers: Math.max(1, Math.min(20, parseInt(input.travelers) || 1)),
  };
}

// Generate itinerary using OpenRouter AI
async function generateItineraryWithAI(tripData: any): Promise<any> {
  const systemMessage: OpenRouterMessage = {
    role: "system",
    content: `You are an expert travel planner AI. Generate a detailed day-by-day itinerary for a trip.
    
    IMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations, no additional text.
    
    The JSON must follow this exact structure:
    {
      "itinerary": [
        {
          "dayNumber": 1,
          "title": "Day title",
          "location": "Main location for the day",
          "activities": [
            {
              "id": "unique-id",
              "timeOfDay": "morning|afternoon|evening",
              "title": "Activity name",
              "description": "Detailed description",
              "location": "Specific location/address",
              "estimatedCost": "$XX-XX",
              "duration": "2-3 hours",
              "category": "sightseeing|food|adventure|culture|shopping|nature"
            }
          ]
        }
      ],
      "summary": {
        "totalDays": number,
        "destinations": ["destination names"],
        "estimatedBudget": "budget range",
        "bestSeason": "recommended season",
        "travelStyle": "adventure/cultural/relaxed/etc",
        "familyFriendly": true/false
      },
      "budgetBreakdown": {
        "accommodation": number,
        "food": number,
        "transport": number,
        "activities": number,
        "miscellaneous": number,
        "total": number,
        "currency": "USD"
      },
      "packingList": ["item1", "item2", ...],
      "travelTips": ["tip1", "tip2", ...],
      "aiNotes": "Any additional notes"
    }

    Rules:
    - Each day should have 3 activities (morning, afternoon, evening)
    - Suggest specific real places when possible
    - Keep activities realistic and within the budget
    - Include variety in activities (sightseeing, food, culture, etc.)
    - Packing list should be 10-15 essential items
    - Travel tips should be 5-8 practical tips`
  };

  const userMessage: OpenRouterMessage = {
    role: "user",
    content: `Plan my trip:
    - Destinations: ${tripData.destinations.join(", ")}
    - Duration: ${tripData.duration} days
    - Budget: $${tripData.budget}
    - Trip Type: ${tripData.tripType}
    - Interests: ${tripData.interests.join(", ")}
    - Travelers: ${tripData.travelers}
    - Pace: ${tripData.tripPace}
    - Accommodation: ${tripData.accommodation}
    
    Start date: ${tripData.startDate.toISOString().split("T")[0]}`
  };

  const aiResponse = await generateAICompletion([systemMessage, userMessage]);
  
  // Parse the JSON response
  let parsed;
  try {
    // Try to extract JSON from response (in case AI adds markdown)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(aiResponse);
    }
  } catch (parseError) {
    console.error("Failed to parse AI response:", aiResponse);
    throw new Error("Failed to generate valid itinerary");
  }

  return parsed;
}

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

    // Sanitize input
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

    // Create trip in "generating" status
    const trip = new Trip({
      userId: userid,
      ...tripData,
      status: "generating",
    });
    await trip.save();

    try {
      // Generate itinerary with AI
      const aiResult = await generateItineraryWithAI(tripData);

      // Add unique IDs to activities if not present
      if (aiResult.itinerary) {
        aiResult.itinerary = aiResult.itinerary.map((day: any) => ({
          ...day,
          dayNumber: day.dayNumber,
          activities: day.activities.map((activity: any) => ({
            ...activity,
            id: activity.id || generateId(),
          })),
        }));
      }

      // Try to get location coordinates for main destination (optional, won't fail if unavailable)
      let coordinates = undefined;
      try {
        const locationData = await geocodeLocation(tripData.destinations[0]);
        if (locationData) {
          coordinates = { lat: locationData.lat, lng: locationData.lng };
        }
      } catch (locError) {
        console.warn("Location geocoding failed, continuing without coordinates");
      }

      // Try to get weather data (optional, won't fail if unavailable)
      let weatherData = null;
      try {
        if (coordinates) {
          weatherData = await getWeatherForLocation(
            coordinates.lat,
            coordinates.lng,
            tripData.startDate.toISOString().split("T")[0],
            tripData.endDate.toISOString().split("T")[0]
          );
        }
      } catch (weatherError) {
        console.warn("Weather lookup failed, continuing without weather data");
      }

      // Update trip with generated content
      trip.itinerary = aiResult.itinerary || [];
      trip.summary = aiResult.summary || {
        totalDays: tripData.duration,
        destinations: tripData.destinations,
        estimatedBudget: `$${tripData.budget}`,
      };
      trip.budgetBreakdown = aiResult.budgetBreakdown || {
        accommodation: Math.round(tripData.budget * 0.35),
        food: Math.round(tripData.budget * 0.25),
        transport: Math.round(tripData.budget * 0.15),
        activities: Math.round(tripData.budget * 0.15),
        miscellaneous: Math.round(tripData.budget * 0.10),
        total: tripData.budget,
        currency: "USD",
      };
      trip.packingList = aiResult.packingList || [];
      trip.travelTips = aiResult.travelTips || [];
      trip.aiNotes = aiResult.aiNotes || "";
      trip.status = "completed";

      await trip.save();

      return response(true, 201, "Trip generated successfully", trip);
    } catch (aiError) {
      // If AI generation fails, mark trip as draft
      trip.status = "draft";
      trip.aiNotes = "Trip created but AI generation failed. Please try again.";
      await trip.save();
      
      console.error("AI generation error:", aiError);
      return response(true, 201, "Trip created but AI generation failed", trip);
    }
  } catch (error) {
    console.error("Trip generation error:", error);
    return response(false, 500, "Failed to generate trip. Please try again.");
  }
}
