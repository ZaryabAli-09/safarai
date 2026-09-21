/* eslint-disable @typescript-eslint/no-explicit-any */
import { geocodeMultipleLocations } from "@/config/location";

export async function attachItineraryLocations(itinerary: any[]) {
  const queries = new Set<string>();
  itinerary.forEach((day) =>
    day.activities?.forEach((activity: any) => {
      if (activity.venue && activity.city && activity.country)
        queries.add(`${activity.venue}, ${activity.city}, ${activity.country}`);
      else if (activity.venue && activity.city)
        queries.add(`${activity.venue}, ${activity.city}`);
      else if (activity.location) queries.add(activity.location);
      if (activity.city && activity.country)
        queries.add(`${activity.city}, ${activity.country}`);
    }),
  );

  const locations = await geocodeMultipleLocations(Array.from(queries));
  let coordinates: { lat: number; lng: number } | undefined;
  const enriched = itinerary.map((day) => ({
    ...day,
    activities: (day.activities || []).map((activity: any) => {
      let query = activity.location || day.location;
      if (activity.venue && activity.city && activity.country)
        query = `${activity.venue}, ${activity.city}, ${activity.country}`;
      else if (activity.venue && activity.city)
        query = `${activity.venue}, ${activity.city}`;
      let location = query ? locations.get(query) : undefined;
      if (!location && activity.city && activity.country)
        location = locations.get(`${activity.city}, ${activity.country}`);
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
