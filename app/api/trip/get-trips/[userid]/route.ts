import { dbConnect } from "@/config/db";
import { response } from "@/lib/helperFunctions";
import { Trip } from "@/models/Trip";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  params: { params: Promise<{ userid: string }> },
) {
  try {
    const { userid } = await params.params;
    const { searchParams } = new URL(req.url);

    if (!userid) {
      return response(false, 400, "User id not found");
    }

    // Get pagination parameters with defaults and limits
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10")),
    );
    const skip = (page - 1) * limit;

    const searchTerm = searchParams.get("searchTerm")?.trim();
    const sortBy = searchParams.get("sortBy") || "latest";
    const statusFilter = searchParams.get("statusFilter") || "all";
    const durationMin = Number(searchParams.get("durationMin"));
    const durationMax = Number(searchParams.get("durationMax"));

    const query: Record<string, unknown> = { userId: userid };

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { destinations: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (statusFilter === "ready") query.status = "completed";
    if (statusFilter === "draft") query.status = "draft";
    if (statusFilter === "in-progress") query.status = "generating";

    if (Number.isFinite(durationMin) || Number.isFinite(durationMax)) {
      query.duration = {};
      if (Number.isFinite(durationMin)) {
        (query.duration as Record<string, number>).$gte = durationMin;
      }
      if (Number.isFinite(durationMax)) {
        (query.duration as Record<string, number>).$lte = durationMax;
      }
    }

    const sort = sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    await dbConnect();

    // Get total count for pagination
    const total = await Trip.countDocuments(query);

    // Fetch paginated trips
    const trips = await Trip.find(query)
      .sort(sort)
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
  } catch {
    return response(false, 500, "Internal server error");
  }
}
