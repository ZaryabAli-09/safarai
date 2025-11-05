import { dbConnect } from "@/lib/db";
import { response } from "@/lib/helperFunctions";
import { Trip } from "@/models/Trip";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  params: { params: { userid: string } }
) {
  try {
    const { userid } = await params.params;
    if (!userid) {
      return response(false, 400, "User id not found");
    }

    await dbConnect();

    const trips = await Trip.find({ userId: userid });
    if (!trips) {
      return response(false, 400, "No trips found");
    }

    return response(true, 200, "Trips get successfully", trips);
  } catch (error) {
    response(false, 500, "Something went wrong");
  }
}
