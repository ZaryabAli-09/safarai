/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLocationImages } from "@/config/locationImage";

export async function attachItineraryImages(itinerary: any[]) {
  const names = new Set<string>();
  itinerary.forEach((day) =>
    day.activities?.forEach((activity: any) => {
      const name = activity.location || day.location;
      if (name) names.add(name);
    }),
  );
  const images = await getLocationImages(Array.from(names));
  return itinerary.map((day) => ({
    ...day,
    activities: (day.activities || []).map((activity: any) => {
      const name = activity.location || day.location;
      return { ...activity, image: name ? images.get(name) : undefined };
    }),
  }));
}
