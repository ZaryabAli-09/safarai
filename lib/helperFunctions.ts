import { NextResponse } from "next/server";
import { ITrip } from "@/models/Trip";

// function to format response
export function response(
  success: boolean,
  status: number,
  message: string,
  data?: any,
) {
  return NextResponse.json(
    {
      success,
      message,
      data,
    },
    { status },
  );
}

// function for genrating otp
export async function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // Set expiry for 10 minutes

  return { otp, expiry };
}

// function to calculate trip statistics
export function calculateTripStatistics(trip: ITrip) {
  const budgetPerDay = Math.round(trip.budget / trip.duration);
  const budgetPerDestination = Math.round(
    trip.budget / trip.destinations.length,
  );
  const daysPerDestination = Math.round(
    trip.duration / trip.destinations.length,
  );
  const activitiesCount = trip.aiSuggestions.reduce(
    (total, day) => total + day.activities.length,
    0,
  );

  return {
    budgetPerDay,
    budgetPerDestination,
    daysPerDestination,
    totalActivities: activitiesCount,
    totalDestinations: trip.destinations.length,
    totalDays: trip.duration,
    totalBudget: trip.budget,
  };
}
