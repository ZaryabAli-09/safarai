// Location Image Service - Uses Wikipedia REST API (free, no API key needed)
// Falls back gracefully if unavailable

interface LocationImageData {
  url: string;
  attribution?: string;
}

/**
 * Search Wikipedia for an article matching the query and return the best match title.
 * Returns null if no results found.
 */
async function searchWikipediaArticle(query: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&origin=*`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "SafarAI/1.0 (travel-planning-app)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const results = data.query?.search;

    if (results && results.length > 0) {
      // Return the title of the first (best matching) result
      return results[0].title;
    }

    return null;
  } catch (error) {
    console.warn(
      `Wikipedia search failed for "${query}", continuing without article`,
    );
    return null;
  }
}

/**
 * Fetch a location image from Wikipedia REST API.
 * First searches for the best-matching article title, then fetches its summary.
 * Free, no API key required. Generous rate limits.
 */
export async function getLocationImage(
  placeName: string,
): Promise<LocationImageData | null> {
  try {
    // First, search for the article to get the correct title
    const articleTitle = await searchWikipediaArticle(placeName);
    if (!articleTitle) {
      return null;
    }

    // Now fetch the summary using the resolved title
    const encoded = encodeURIComponent(articleTitle);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "SafarAI/1.0 (travel-planning-app)",
      },
      signal: AbortSignal.timeout(5000),
    });

    // 404 or other errors are not fatal — just return null
    if (!res.ok) return null;

    const data = await res.json();

    // Check if thumbnail exists
    if (data.thumbnail?.source) {
      return {
        url: data.thumbnail.source,
        attribution: "Wikipedia",
      };
    }

    return null;
  } catch (error) {
    console.warn(
      `Location image lookup failed for "${placeName}", continuing without image`,
    );
    return null;
  }
}

/**
 * Fetch location images for multiple places with rate limiting.
 * Dedupes the input list to avoid redundant requests.
 */
export async function getLocationImages(
  placeNames: string[],
): Promise<Map<string, LocationImageData>> {
  const results = new Map<string, LocationImageData>();

  // Dedupe the input
  const uniqueNames = Array.from(new Set(placeNames));

  for (const name of uniqueNames) {
    const result = await getLocationImage(name);
    if (result) {
      results.set(name, result);
    }
    // Rate limiting: wait ~300-500ms between requests for Wikipedia REST API
    // (more permissive than Nominatim, but still respectful)
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return results;
}

export type { LocationImageData };
