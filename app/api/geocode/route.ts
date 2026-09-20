import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/authOptions";
import { response } from "@/lib/helperFunctions";
import { geocodeLocation } from "@/lib/services/location";

// Resolve ONE place name (used to confirm the traveler's starting location).
// Login required so this can't be used as an open proxy to Nominatim.
// Note: Nominatim forbids client-side autocomplete, so we only geocode on submit.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return response(false, 401, "Please sign in");
  }

  const q = (req.nextUrl.searchParams.get("q") || "").trim().slice(0, 200);
  if (q.length < 2) {
    return response(false, 400, "Enter a place name");
  }

  const place = await geocodeLocation(q);
  if (!place) {
    return response(false, 404, "Place not found");
  }

  return response(true, 200, "Found", {
    displayName: place.displayName,
    lat: place.lat,
    lng: place.lng,
    country: place.country,
  });
}
