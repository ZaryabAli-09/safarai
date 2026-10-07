import { response } from "@/lib/helperFunctions";
import { NextRequest } from "next/server";
import { Trip } from "@/models/Trip";
import { dbConnect } from "@/config/db";
import { sanitizeTripInput, LIMITS } from "@/lib/trip-creation-input";
import { toUSD } from "@/lib/services/fx";
import { generateTripItinerary } from "@/lib/services/ai-pipeline";
import { attachItineraryLocations } from "@/lib/services/location-service";
import { attachItineraryImages } from "@/lib/services/location-images-service";
import { attachItineraryWeather } from "@/lib/services/weather-service";
import {
  reconcileBudget,
  totalActivityCosts,
} from "@/lib/services/budget-service";

export async function POST(
  req: NextRequest,
  params: { params: Promise<{ userid: string }> },
) {
  try {
    const { userid } = await params.params;
    if (!userid) return response(false, 400, "User id not found");

    const parsed = sanitizeTripInput(await req.json());
    if (!parsed.ok) return response(false, 400, parsed.error);

    const budgetUSD = await toUSD(parsed.data.budget, parsed.data.currency);
    if (budgetUSD > LIMITS.maxBudgetUSD) {
      return response(
        false,
        400,
        "That budget looks too large. Please check the amount.",
      );
    }

    const tripData = { ...parsed.data, budgetUSD };
    await dbConnect();

    const trip = new Trip({
      userId: userid,
      ...tripData,
      status: "generating",
    });
    await trip.save();

    try {
      const aiResult = await generateTripItinerary(tripData);
      const located = await attachItineraryLocations(aiResult.itinerary).catch(
        (error) => {
          console.warn("[Generate] Location enrichment failed:", error);
          return { itinerary: aiResult.itinerary, coordinates: undefined };
        },
      );
      const withImages = await attachItineraryImages(located.itinerary).catch(
        (error) => {
          console.warn("[Generate] Image enrichment failed:", error);
          return located.itinerary;
        },
      );
      const enrichedItinerary = await attachItineraryWeather(
        withImages,
        located.coordinates,
        tripData.startDate,
        tripData.endDate,
      ).catch((error) => {
        console.warn("[Generate] Weather enrichment failed:", error);
        return withImages;
      });

      trip.itinerary = enrichedItinerary;
      trip.summary = aiResult.summary || {
        totalDays: tripData.duration,
        destinations: tripData.destinations,
        estimatedBudget: `${tripData.budget} ${tripData.currency}`,
        bestSeason: "Year-round",
        travelStyle: tripData.styles[0] || "general sightseeing",
        familyFriendly: true,
      };

      const breakdown = aiResult.budgetBreakdown || {};
      // The AI's split is only a suggestion: reconcileBudget guarantees
      // flights + categories === the user's budget, and that every listed
      // activity cost is covered by the activities line.
      trip.budgetBreakdown = reconcileBudget({
        budget: tripData.budget,
        currency: tripData.currency,
        flights: tripData.includesFlights
          ? Math.min(tripData.flightBudget || 0, tripData.budget)
          : 0,
        ai: breakdown,
        activityCostTotal: totalActivityCosts(enrichedItinerary),
      });
      trip.packingList = aiResult.packingList || [];
      trip.travelTips = aiResult.travelTips || [];
      trip.aiNotes = aiResult.aiNotes || "";
      trip.status = "completed";
      await trip.save();

      return response(true, 201, "Trip generated successfully", trip);
    } catch (error) {
      // Keep raw model/network details in the server log only — clients get
      // a friendly message (and the full text lands in trip.aiNotes above).
      console.error("[Generate] Trip generation failed:", error);
      const errorMessage =
        error instanceof Error && error.message.startsWith("All AI models")
          ? "Our travel planner is busy right now. Please try again in a moment."
          : "We couldn't build your itinerary this time. Please try again.";
      trip.status = "draft";
      trip.aiNotes = `Generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
      await trip.save();
      return response(false, 500, errorMessage);
    }
  } catch (error) {
    console.error("[Generate] Unexpected error:", error);
    return response(false, 500, "Failed to generate trip. Please try again.");
  }
}
