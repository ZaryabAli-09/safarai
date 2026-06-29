import { response } from "@/lib/helperFunctions";
import { NextRequest } from "next/server";
import { Trip } from "@/models/Trip";
import { dbConnect } from "@/config/db";
import { generateAICompletion, OpenRouterMessage } from "@/config/ai";
import mongoose from "mongoose";

// Replace a specific activity in the itinerary
export async function PATCH(
  req: NextRequest,
  params: { params: { userid: string } },
) {
  try {
    const { userid } = await params.params;
    const body = await req.json();
    const { tripId, dayIndex, activityId, action, replacement, customRequest } =
      body;

    if (!userid) {
      return response(false, 400, "User id not found");
    }

    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return response(false, 400, "Valid trip ID is required");
    }

    await dbConnect();

    const trip = await Trip.findOne({ _id: tripId, userId: userid });

    if (!trip) {
      return response(false, 404, "Trip not found");
    }

    if (!trip.itinerary || trip.itinerary.length === 0) {
      return response(false, 400, "No itinerary found for this trip");
    }

    // Handle different actions
    if (action === "replace" && replacement) {
      // Replace specific activity
      const day = trip.itinerary[dayIndex];
      if (!day) {
        return response(false, 400, "Day not found");
      }

      const activityIndex = day.activities.findIndex(
        (a: any) => a.id === activityId,
      );

      if (activityIndex === -1) {
        return response(false, 400, "Activity not found");
      }

      // Update the activity
      day.activities[activityIndex] = {
        ...day.activities[activityIndex],
        ...replacement,
        id: replacement.id || day.activities[activityIndex].id,
      };

      trip.markModified("itinerary");
      await trip.save();

      return response(true, 200, "Activity replaced successfully", trip);
    }

    if (action === "remove" && activityId) {
      // Remove an activity
      const day = trip.itinerary[dayIndex];
      if (!day) {
        return response(false, 400, "Day not found");
      }

      day.activities = day.activities.filter((a: any) => a.id !== activityId);

      trip.markModified("itinerary");
      await trip.save();

      return response(true, 200, "Activity removed successfully", trip);
    }

    if (action === "ai-suggest" && customRequest) {
      // Use AI to get a new suggestion
      const day = trip.itinerary[dayIndex];
      const currentActivity = day?.activities.find(
        (a: any) => a.id === activityId,
      );

      const systemMessage: OpenRouterMessage = {
        role: "system",
        content: `You are a travel expert. Suggest a replacement activity for a trip itinerary.
        
        Respond with ONLY valid JSON (no markdown):
        {
          "id": "unique-id",
          "timeOfDay": "morning|afternoon|evening",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Specific location/address",
          "estimatedCost": "$XX-XX",
          "duration": "2-3 hours",
          "category": "sightseeing|food|adventure|culture|shopping|nature"
        }`,
      };

      const userMessage: OpenRouterMessage = {
        role: "user",
        content: `Replace "${currentActivity?.title || "this activity"}" with something ${customRequest}.
        
        Current context:
        - Day ${dayIndex + 1}: ${day?.title || "Unknown"}
        - Location: ${day?.location || "Not specified"}
        - Trip budget: $${trip.budget}
        - Trip type: ${trip.tripType}`,
      };

      const aiResponse = await generateAICompletion([
        systemMessage,
        userMessage,
      ]);

      let suggestion;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        suggestion = jsonMatch
          ? JSON.parse(jsonMatch[0])
          : JSON.parse(aiResponse);
      } catch {
        return response(false, 500, "Failed to generate suggestion");
      }

      if (currentActivity && activityId) {
        // Replace the activity
        const activityIndex = day.activities.findIndex(
          (a: any) => a.id === activityId,
        );
        day.activities[activityIndex] = {
          ...suggestion,
          id: Math.random().toString(36).substring(2, 15),
        };
      } else {
        // Add new activity
        day.activities.push({
          ...suggestion,
          id: Math.random().toString(36).substring(2, 15),
        });
      }

      trip.markModified("itinerary");
      await trip.save();

      return response(true, 200, "AI suggestion applied", trip);
    }

    if (action === "move") {
      // Move activity to different day/time
      const { targetDayIndex, targetTimeOfDay } = body;

      const sourceDay = trip.itinerary[dayIndex];
      if (!sourceDay) {
        return response(false, 400, "Source day not found");
      }

      const activityIndex = sourceDay.activities.findIndex(
        (a: any) => a.id === activityId,
      );

      if (activityIndex === -1) {
        return response(false, 400, "Activity not found");
      }

      const [activity] = sourceDay.activities.splice(activityIndex, 1);
      activity.timeOfDay = targetTimeOfDay;

      if (targetDayIndex !== undefined && trip.itinerary[targetDayIndex]) {
        trip.itinerary[targetDayIndex].activities.push(activity);
      } else {
        sourceDay.activities.push(activity);
      }

      trip.markModified("itinerary");
      await trip.save();

      return response(true, 200, "Activity moved successfully", trip);
    }

    return response(false, 400, "Invalid action");
  } catch (error) {
    console.error("Update trip error:", error);
    return response(false, 500, "Internal server error");
  }
}

// Get single trip details
export async function GET(
  req: NextRequest,
  params: { params: { userid: string } },
) {
  try {
    const { userid } = await params.params;
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!userid) {
      return response(false, 400, "User id not found");
    }

    await dbConnect();

    if (tripId && mongoose.Types.ObjectId.isValid(tripId)) {
      const trip = await Trip.findOne({ _id: tripId, userId: userid });
      if (!trip) {
        return response(false, 404, "Trip not found");
      }
      return response(true, 200, "Trip retrieved successfully", trip);
    }

    return response(false, 400, "Valid trip ID is required");
  } catch (error) {
    console.error("Get trip error:", error);
    return response(false, 500, "Internal server error");
  }
}
