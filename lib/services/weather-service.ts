/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWeatherForLocation, type WeatherForecast } from "@/config/weather";

/** Safety cap so huge itineraries can't hammer the weather API. */
const MAX_UNIQUE_LOOKUPS = 8;

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

/**
 * Pick the coordinates that represent a DAY's weather.
 *
 * A day's first activity is often a transport leg FROM the origin city (day 1
 * flight) — its coordinates would put origin weather on the whole day. Use the
 * city that appears most often in the day instead (the day's real location).
 */
function pickDayCoords(
  day: any,
  fallback: { lat: number; lng: number } | undefined,
): { lat: number; lng: number } | undefined {
  const pinned = (day.activities || []).filter(
    (activity: any) =>
      activity.coordinates?.lat != null && activity.coordinates?.lng != null,
  );
  if (pinned.length === 0) return fallback;

  const counts = new Map<string, number>();
  for (const activity of pinned) {
    const city = String(activity.city || "").toLowerCase();
    counts.set(city, (counts.get(city) || 0) + 1);
  }
  let modalCity = "";
  let best = -1;
  for (const [city, count] of counts) {
    if (count > best) {
      best = count;
      modalCity = city;
    }
  }
  const preferred = pinned.filter(
    (activity: any) => String(activity.city || "").toLowerCase() === modalCity,
  );
  return preferred[0]?.coordinates || pinned[0].coordinates;
}

/**
 * Attach daily weather to every activity.
 *
 * Each day uses the coordinates of its dominant city (multi-city trips get
 * per-city weather), matched by date rather than array position. The
 * trip-level `coordinates` remains as a fallback for days with no pins.
 */
export async function attachItineraryWeather(
  itinerary: any[],
  coordinates: { lat: number; lng: number } | undefined,
  startDate: Date,
  endDate: Date,
) {
  const start = startDate.toISOString().split("T")[0];
  const end = endDate.toISOString().split("T")[0];

  // One forecast per unique coordinate, cached for the whole call.
  const forecasts = new Map<string, WeatherForecast[] | null>();
  const lookup = async (lat: number, lng: number) => {
    const key = coordKey(lat, lng);
    if (forecasts.has(key)) return forecasts.get(key) || null;
    if (forecasts.size >= MAX_UNIQUE_LOOKUPS) return null;
    const result = await getWeatherForLocation(lat, lng, start, end);
    forecasts.set(key, result);
    return result;
  };

  // Resolve each day's coordinates (dominant city of the day).
  const dayCoords: Array<{ lat: number; lng: number } | undefined> = [];
  for (const day of itinerary) {
    const resolved = pickDayCoords(day, coordinates);
    dayCoords.push(resolved);
    if (resolved) await lookup(resolved.lat, resolved.lng);
  }

  if (coordinates && forecasts.size === 0) return itinerary;

  return itinerary.map((day, dayIndex) => {
    const resolved = dayCoords[dayIndex];
    const forecast = resolved ? lookupSync(resolved, forecasts) : null;
    if (!forecast) return day;

    // Match by date first; fall back to position for missing/mismatched dates.
    const entry =
      forecast.find((item) => item.date === day.date) ||
      (day.date ? undefined : forecast[dayIndex]);
    if (!entry) return day;

    return {
      ...day,
      activities: (day.activities || []).map((activity: any) => ({
        ...activity,
        weather: {
          temp: entry.temp_max,
          tempMin: entry.temp_min,
          condition: entry.condition,
          icon: entry.icon,
          isTypical: entry.isTypical || undefined,
        },
      })),
    };
  });
}

function lookupSync(
  coords: { lat: number; lng: number },
  forecasts: Map<string, WeatherForecast[] | null>,
): WeatherForecast[] | null {
  return forecasts.get(coordKey(coords.lat, coords.lng)) || null;
}

