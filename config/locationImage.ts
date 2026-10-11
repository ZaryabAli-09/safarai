export interface LocationImageData {
  url: string;
  attribution?: string;
}

const LOCATION_IMAGE_API = {
  apiUrl: "https://en.wikipedia.org/w/api.php",
  userAgent: "SafarAI/1.0 (travel-planning-app)",
  timeoutMs: 5000,
};
const MAX_IMAGE_CONCURRENCY = 6;

interface ThumbnailHit {
  title: string;
  thumb: string;
}

const thumbnailCache = new Map<string, ThumbnailHit[]>();
const imageCache = new Map<string, LocationImageData | null>();

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, run),
  );
  return results;
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
  const cached = thumbnailCache.get(query);
  if (cached) return cached;

  // One attempt only — images are decorative, so a failed lookup just
  // moves on instead of retrying after a pause.
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
        if (hits.length > 0) {
          thumbnailCache.set(query, hits);
          return hits;
        }
      }
    }
  } catch {
    // Transient failure — no retries.
  }
  thumbnailCache.set(query, []);
  return [];
}

export async function getLocationImage(
  placeName: string,
): Promise<LocationImageData | null> {
  if (imageCache.has(placeName)) return imageCache.get(placeName) || null;

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
      const image = { url: best.thumb, attribution: "Wikipedia" };
      imageCache.set(placeName, image);
      return image;
    }
  }
  imageCache.set(placeName, null);
  return null;
}

export async function getLocationImages(
  placeNames: string[],
): Promise<Map<string, LocationImageData>> {
  const results = new Map<string, LocationImageData>();
  const uniqueNames = Array.from(new Set(placeNames)).filter(Boolean);
  const entries = await mapWithConcurrency(
    uniqueNames,
    MAX_IMAGE_CONCURRENCY,
    async (name) => [name, await getLocationImage(name)] as const,
  );

  for (const [name, image] of entries) {
    if (image) results.set(name, image);
  }
  return results;
}

