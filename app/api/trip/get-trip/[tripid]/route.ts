import { dbConnect } from "@/config/db";
import { response } from "@/lib/helperFunctions";
import { Trip } from "@/models/Trip";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

/**
 * GET /api/trip/get-trip/[tripid]
 * Fetch a single trip by its ID.
 */
export async function GET(
  req: NextRequest,
  params: { params: { tripid: string } },
) {
  try {
    const { tripid } = await params.params;

    if (!tripid || !mongoose.Types.ObjectId.isValid(tripid)) {
      return response(false, 400, "Valid trip ID is required");
    }

    await dbConnect();

    const trip = await Trip.findById(tripid).lean();

    if (!trip) {
      return response(false, 404, "Trip not found");
    }

    return response(true, 200, "Trip retrieved successfully", trip);
  } catch (error) {
    console.error("Get trip error:", error);
    return response(false, 500, "Internal server error");
  }
}
