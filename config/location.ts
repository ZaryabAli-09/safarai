export interface LocationData {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  country: string;
  state?: string;
}

const LOCATION_API = {
  baseUrl: "https://nominatim.openstreetmap.org",
  userAgent: "SafarAI/1.0 (travel-planning-app)",
  timeoutMs: 5000,
  requestDelayMs: 1100,
};

export async function geocodeLocation(
  placeName: string,
): Promise<LocationData | null> {
  try {
    const params = new URLSearchParams({
      q: placeName,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });
    const response = await fetch(`${LOCATION_API.baseUrl}/search?${params}`, {
      headers: { "User-Agent": LOCATION_API.userAgent },
      signal: AbortSignal.timeout(LOCATION_API.timeoutMs),
    });
    if (!response.ok) return null;
    const place = (await response.json())?.[0];
    if (!place) return null;
    return {
      name: placeName,
      displayName: place.display_name,
      lat: Number.parseFloat(place.lat),
      lng: Number.parseFloat(place.lon),
      country: place.address?.country || "",
      state: place.address?.state || "",
    };
  } catch {
    console.warn(`Geocoding failed for "${placeName}"`);
    return null;
  }
}

export async function geocodeMultipleLocations(
  placeNames: string[],
): Promise<Map<string, LocationData>> {
  const results = new Map<string, LocationData>();
  for (const name of placeNames) {
    const location = await geocodeLocation(name);
    if (location) results.set(name, location);
    await new Promise((resolve) =>
      setTimeout(resolve, LOCATION_API.requestDelayMs),
    );
  }
  return results;
}
