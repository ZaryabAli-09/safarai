export interface LocationImageData {
  url: string;
  attribution?: string;
}

const LOCATION_IMAGE_API = {
  searchUrl: "https://en.wikipedia.org/w/api.php",
  summaryUrl: "https://en.wikipedia.org/api/rest_v1/page/summary",
  userAgent: "SafarAI/1.0 (travel-planning-app)",
  timeoutMs: 5000,
  requestDelayMs: 400,
};

async function searchArticle(query: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
      origin: "*",
    });
    const response = await fetch(`${LOCATION_IMAGE_API.searchUrl}?${params}`, {
      headers: { "User-Agent": LOCATION_IMAGE_API.userAgent },
      signal: AbortSignal.timeout(LOCATION_IMAGE_API.timeoutMs),
    });
    if (!response.ok) return null;
    return (await response.json())?.query?.search?.[0]?.title || null;
  } catch {
    return null;
  }
}

export async function getLocationImage(
  placeName: string,
): Promise<LocationImageData | null> {
  try {
    const article = await searchArticle(placeName);
    if (!article) return null;
    const response = await fetch(
      `${LOCATION_IMAGE_API.summaryUrl}/${encodeURIComponent(article)}`,
      {
        headers: { "User-Agent": LOCATION_IMAGE_API.userAgent },
        signal: AbortSignal.timeout(LOCATION_IMAGE_API.timeoutMs),
      },
    );
    if (!response.ok) return null;
    const thumbnail = (await response.json())?.thumbnail?.source;
    return thumbnail ? { url: thumbnail, attribution: "Wikipedia" } : null;
  } catch {
    return null;
  }
}

export async function getLocationImages(
  placeNames: string[],
): Promise<Map<string, LocationImageData>> {
  const results = new Map<string, LocationImageData>();
  for (const name of Array.from(new Set(placeNames))) {
    const image = await getLocationImage(name);
    if (image) results.set(name, image);
    await new Promise((resolve) =>
      setTimeout(resolve, LOCATION_IMAGE_API.requestDelayMs),
    );
  }
  return results;
}
