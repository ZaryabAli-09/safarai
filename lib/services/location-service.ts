/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  geocodeCity,
  geocodeVenue,
  type LocationData,
} from "@/config/location";

interface VenueQuery {
  venue?: string;
  city?: string;
  country?: string;
}

/** City keys ("city||country") this itinerary needs geocoded. */
function cityKey(city?: string, country?: string): string {
  return `${(city || "").trim().toLowerCase()}||${(country || "").trim().toLowerCase()}`;
}

/**
 * Attach coordinates to every activity.
 *
 * Two-step strategy for accuracy:
 *   1. Geocode each unique city once — it anchors the search AND acts as the
 *      honest fallback when a venue can't be validated.
 *   2. Geocode each unique venue inside its city (validated: name tokens must
 *      match and the result must be within 50 km of the city centre).
 *
 * Also fixes the old bug where `day.location` was used as a lookup key but
 * never geocoded.
 */
export async function attachItineraryLocations(itinerary: any[]) {
  // ── Collect unique cities (from activities AND day titles) ──
  const cityQueries = new Map<string, { city: string; country?: string }>();
  for (const day of itinerary) {
    day.activities?.forEach((activity: any) => {
      if (activity.city) {
        const key = cityKey(activity.city, activity.country);
        if (!cityQueries.has(key))
          cityQueries.set(key, {
            city: String(activity.city).trim(),
            country: activity.country ? String(activity.country).trim() : undefined,
          });
      }
    });
    // day.location is often just "City/Area" — geocode it too so its
    // activities (and weather) have something to fall back to.
    if (day.location && !day.activities?.some((a: any) => a.city)) {
      const key = cityKey(String(day.location));
      if (!cityQueries.has(key))
        cityQueries.set(key, { city: String(day.location).trim() });
    }
  }

  const cityCenters = new Map<string, LocationData | null>();
  for (const [key, { city, country }] of cityQueries) {
    cityCenters.set(key, await geocodeCity(city, country));
  }

  // ── Geocode each unique venue once (inside its city) ──
  const venueQueries = new Map<string, VenueQuery>();
  itinerary.forEach((day) =>
    day.activities?.forEach((activity: any) => {
      const venue = String(activity.venue || activity.location || "").trim();
      if (!venue) return;
      const query: VenueQuery = {
        venue,
        city: activity.city
          ? String(activity.city).trim()
          : day.location
            ? String(day.location).trim()
            : undefined,
        country: activity.country
          ? String(activity.country).trim()
          : undefined,
      };
      const key =
        cityKey(query.city, query.country) + "||" + venue.toLowerCase();
      if (!venueQueries.has(key)) venueQueries.set(key, query);
    }),
  );

  const venueResults = new Map<string, LocationData | null>();
  for (const [key, query] of venueQueries) {
    if (!query.venue) continue;
    const center = cityCenters.get(cityKey(query.city, query.country));
    venueResults.set(
      key,
      await geocodeVenue(
        query.venue,
        query.city || "",
        query.country,
        center ? { lat: center.lat, lng: center.lng } : undefined,
      ),
    );
  }

  // ── Attach, with city-centre fallback ──
  let coordinates: { lat: number; lng: number } | undefined;
  const enriched = itinerary.map((day) => ({
    ...day,
    activities: (day.activities || []).map((activity: any) => {
      const venue = String(activity.venue || activity.location || "").trim();
      const city = activity.city
        ? String(activity.city).trim()
        : day.location
          ? String(day.location).trim()
          : undefined;
      const country = activity.country
        ? String(activity.country).trim()
        : undefined;

      let location =
        venue && city
          ? venueResults.get(cityKey(city, country) + "||" + venue.toLowerCase())
          : undefined;
      if (!location && city) {
        location = cityCenters.get(cityKey(city, country)) || undefined;
      }
      if (!location && day.location) {
        location = cityCenters.get(cityKey(String(day.location))) || undefined;
      }

      if (location && !coordinates)
        coordinates = { lat: location.lat, lng: location.lng };

      return {
        ...activity,
        coordinates: location
          ? { lat: location.lat, lng: location.lng }
          : undefined,
      };
    }),
  }));

  return { itinerary: enriched, coordinates };
}

