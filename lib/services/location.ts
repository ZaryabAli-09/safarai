// Location Service - Uses Nominatim (OpenStreetMap, free, no API key needed)
// Falls back gracefully if unavailable

interface LocationData {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  country: string;
  state?: string;
}

/**
 * Geocode a place name to coordinates using Nominatim (OpenStreetMap).
 * Free, no API key required. Rate limited to 1 request/second.
 */
export async function geocodeLocation(
  placeName: string,
): Promise<LocationData | null> {
  try {
    const encoded = encodeURIComponent(placeName);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "SafarAI/1.0 (travel-planning-app)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.length === 0) return null;

    const place = data[0];
    return {
      name: placeName,
      displayName: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      country: place.address?.country || "",
      state: place.address?.state || "",
    };
  } catch (error) {
    console.warn(`Geocoding failed for "${placeName}", continuing without coordinates`);
    return null;
  }
}

/**
 * Geocode multiple locations with a delay between requests (rate limiting).
 */
export async function geocodeMultipleLocations(
  placeNames: string[],
): Promise<Map<string, LocationData>> {
  const results = new Map<string, LocationData>();

  for (const name of placeNames) {
    const result = await geocodeLocation(name);
    if (result) {
      results.set(name, result);
    }
    // Rate limiting: wait 1 second between requests for Nominatim
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  return results;
}

export type { LocationData };
