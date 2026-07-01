import { dbConnect } from "@/config/db";
import { response } from "@/lib/helperFunctions";
import { Trip } from "@/models/Trip";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

/**
 * DELETE /api/trip/delete/[tripid]
 * Permanently delete a trip by its ID.
 */
export async function DELETE(
  req: NextRequest,
  params: { params: { tripid: string } },
) {
  try {
    const { tripid } = await params.params;

    if (!tripid || !mongoose.Types.ObjectId.isValid(tripid)) {
      return response(false, 400, "Valid trip ID is required");
    }

    await dbConnect();

    const deleted = await Trip.findByIdAndDelete(tripid);

    if (!deleted) {
      return response(false, 404, "Trip not found");
    }

    return response(true, 200, "Trip deleted successfully");
  } catch (error) {
    console.error("Delete trip error:", error);
    return response(false, 500, "Internal server error");
  }
}
