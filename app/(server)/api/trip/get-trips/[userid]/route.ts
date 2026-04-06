import { dbConnect } from "@/lib/db";
import { response } from "@/lib/helperFunctions";
import { apiError } from "@/lib/apiResponse";
import { Trip } from "@/models/Trip";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  params: { params: { userid: string } }
) {
  try {
    const { userid } = await params.params;
    const { searchParams } = new URL(req.url);
    
    if (!userid) {
      return apiError("User id not found", 400);
    }

    // Get pagination parameters with defaults and limits
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    await dbConnect();

    // Get total count for pagination
    const total = await Trip.countDocuments({ userId: userid });
    
    // Fetch paginated trips
    const trips = await Trip.find({ userId: userid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean for better performance on read-only queries

    const totalPages = Math.ceil(total / limit);

    return response(true, 200, "Trips retrieved successfully", {
      trips,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    return apiError("Failed to retrieve trips", 500);
  }
}
