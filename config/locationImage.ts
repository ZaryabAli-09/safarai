export interface LocationImageData {
  url: string;
  attribution?: string;
}

const LOCATION_IMAGE_API = {
  apiUrl: "https://en.wikipedia.org/w/api.php",
  userAgent: "SafarAI/1.0 (travel-planning-app)",
  timeoutMs: 5000,
  requestDelayMs: 500,
};

interface ThumbnailHit {
  title: string;
  thumb: string;
}

/** Minimal shape of a MediaWiki `query.pages` entry we care about. */
interface WikiPage {
  index?: number;
  title?: string;
  thumbnail?: { source?: string };
}

/**
 * Search Wikipedia and return the top results that HAVE a thumbnail, all in
 * ONE request (generator=search + prop=pageimages). This doubles the hit
 * rate versus the old search-then-summary flow and halves the API calls.
 */
async function searchThumbnails(query: string): Promise<ThumbnailHit[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: query,
        gsrlimit: "4",
        gsrnamespace: "0",
        prop: "pageimages",
        piprop: "thumbnail",
        pithumbsize: "800",
        format: "json",
        origin: "*",
      });
      const response = await fetch(`${LOCATION_IMAGE_API.apiUrl}?${params}`, {
        headers: { "User-Agent": LOCATION_IMAGE_API.userAgent },
        signal: AbortSignal.timeout(LOCATION_IMAGE_API.timeoutMs),
      });
      if (response.ok) {
        const payload = await response.json();
        const pages = payload?.query?.pages as
          | Record<string, WikiPage>
          | undefined;
        if (pages) {
          const ordered = Object.values(pages).sort(
            (a, b) => (a.index ?? 0) - (b.index ?? 0),
          );
          const hits = ordered
            .filter((page) => page?.thumbnail?.source)
            .map((page) => ({
              title: String(page.title),
              thumb: String(page.thumbnail?.source),
            }));
          if (hits.length > 0) return hits;
        }
      }
    } catch {
      // fall through to retry
    }
    // Transient failure (rate limit / timeout) → one retry after a pause.
    if (attempt === 0)
      await new Promise((resolve) =>
        setTimeout(resolve, LOCATION_IMAGE_API.requestDelayMs * 2),
      );
  }
  return [];
}

export async function getLocationImage(
  placeName: string,
): Promise<LocationImageData | null> {
  // Try the full label first ("Louvre Museum, Paris"), then the bare venue
  // name ("Louvre Museum") — the city suffix often breaks the search match.
  const variants = [placeName];
  const primary = placeName.split(",")[0]?.trim();
  if (primary && primary !== placeName) variants.push(primary);

  for (const variant of variants) {
    const hits = await searchThumbnails(variant);
    if (hits.length > 0) {
      // Prefer an exact-ish title match, otherwise the top result.
      const norm = variant.toLowerCase().replace(/[^a-z0-9]/g, "");
      const best =
        hits.find((hit) =>
          hit.title.toLowerCase().replace(/[^a-z0-9]/g, "").includes(norm),
        ) || hits[0];
      return { url: best.thumb, attribution: "Wikipedia" };
    }
    await new Promise((resolve) =>
      setTimeout(resolve, LOCATION_IMAGE_API.requestDelayMs),
    );
  }
  return null;
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

