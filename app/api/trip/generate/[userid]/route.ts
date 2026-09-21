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
      trip.budgetBreakdown = {
        accommodation:
          Number(breakdown.accommodation) || Math.round(tripData.budget * 0.35),
        food: Number(breakdown.food) || Math.round(tripData.budget * 0.25),
        transport:
          Number(breakdown.transport) || Math.round(tripData.budget * 0.15),
        activities:
          Number(breakdown.activities) || Math.round(tripData.budget * 0.15),
        miscellaneous:
          Number(breakdown.miscellaneous) || Math.round(tripData.budget * 0.1),
        total: Number(breakdown.total) || tripData.budget,
        currency: tripData.currency,
      };
      trip.packingList = aiResult.packingList || [];
      trip.travelTips = aiResult.travelTips || [];
      trip.aiNotes = aiResult.aiNotes || "";
      trip.status = "completed";
      await trip.save();

      return response(true, 201, "Trip generated successfully", trip);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "AI generation failed. Please try again.";
      trip.status = "draft";
      trip.aiNotes = `Generation failed: ${errorMessage}`;
      await trip.save();
      console.error("[Generate] Trip generation failed:", error);
      return response(false, 500, errorMessage);
    }
  } catch (error) {
    console.error("[Generate] Unexpected error:", error);
    return response(false, 500, "Failed to generate trip. Please try again.");
  }
}
