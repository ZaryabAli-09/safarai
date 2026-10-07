export interface LocationData {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  country: string;
  state?: string;
  /**
   * "venue" — matched a named place that passed validation.
   * "city"  — approximate: city-level coordinates (venue match failed).
   */
  precision?: "venue" | "city";
}

const LOCATION_API = {
  baseUrl: "https://nominatim.openstreetmap.org",
  userAgent: "SafarAI/1.0 (travel-planning-app)",
  timeoutMs: 5000,
  // Nominatim's fair-use policy allows max 1 request/second.
  requestDelayMs: 1050,
};

/** Result classes that are never a sensible match for a place search. */
const BAD_CLASSES = new Set([
  "emergency",
  "barrier",
  "highway",
  "waterway",
  "craft",
  "office",
  "building",
]);

/** Words too generic to prove a venue match. */
const STOPWORDS = new Set([
  "the", "of", "and", "for", "de", "del", "la", "le", "el", "los", "las",
  "at", "on", "in", "by", "to", "a", "an", "et", "en", "y", "or", "ub",
]);

/** Distance beyond which a "venue" can't belong to the stated city. */
const MAX_VENUE_DISTANCE_KM = 50;

/** `place=*` subtypes that are structures, not populated places. */
const NON_CITY_PLACE_TYPES = new Set([
  "house",
  "building",
  "yes",
  "hut",
  "shed",
  "garage",
  "apartment",
  "farm",
  "house_number",
]);

// ─── Shared helpers ───────────────────────────────────────────────────────────

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  class: string;
  type: string;
  importance?: number;
  address?: Record<string, string>;
}

/** Case/diacritic-insensitive text for comparisons ("Musée d'Orsay" → "musee dorsay"). */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Clean up user/AI text before it goes to the geocoder. */
function sanitizeQuery(value: string): string {
  return value
    // Strip double quotes/backticks only — apostrophes are meaningful
    // ("Musée d'Orsay" breaks in Nominatim when the apostrophe is removed).
    .replace(/["`“”]/g, "")
    .replace(/[()\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/^,+|,+$/g, "")
    .trim();
}

/** "primary segment" — first meaningful clause of a compound venue label. */
function primarySegment(value: string): string {
  // Split arrows first ("CDG Airport → Hotel"), then list separators.
  // Hyphens stay: they're intra-word ("Saint-Germain", "Bateaux-Mouches").
  const arrow = value.split(/\s*[→⇒➜>]\s*/)[0];
  const first = arrow.split(/[,/&–—]/)[0];
  return sanitizeQuery(first.split(",")[0]);
}

// ─── Throttled, cached Nominatim search ───────────────────────────────────────

const searchCache = new Map<string, NominatimResult[]>();
let lastRequestAt = 0;

async function search(
  query: string,
  options: { viewbox?: number[] } = {},
): Promise<NominatimResult[]> {
  const cleaned = sanitizeQuery(query);
  if (cleaned.length < 2) return [];

  const key = `${cleaned}|${options.viewbox ? options.viewbox.join(",") : ""}`;
  const cached = searchCache.get(key);
  if (cached) return cached;

  // Global throttle: never exceed ~1 request/second.
  const wait = lastRequestAt + LOCATION_API.requestDelayMs - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();

  let results: NominatimResult[] = [];
  try {
    const params = new URLSearchParams({
      q: cleaned,
      format: "json",
      limit: "5",
      addressdetails: "1",
      "accept-language": "en",
    });
    if (options.viewbox) {
      // viewbox = [left, top, right, bottom]; biased but not bounded, so a
      // venue just outside the box can still win on relevance.
      params.set("viewbox", options.viewbox.map((n) => n.toFixed(4)).join(","));
      params.set("bounded", "0");
    }
    const response = await fetch(`${LOCATION_API.baseUrl}/search?${params}`, {
      headers: { "User-Agent": LOCATION_API.userAgent },
      signal: AbortSignal.timeout(LOCATION_API.timeoutMs),
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) results = data as NominatimResult[];
    }
  } catch {
    results = [];
  }
  // Cache negatives too — a query that fails once will fail again.
  searchCache.set(key, results);
  return results;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * A candidate matches a venue only when:
 *  - its class isn't nonsense (AED boxes, parking, roads…), AND
 *  - the significant tokens of the venue name appear in the result text, AND
 *  - it sits within MAX_VENUE_DISTANCE_KM of the city centre (when known).
 */
function isVenueMatch(
  candidate: NominatimResult,
  venue: string,
  cityCenter?: { lat: number; lng: number },
): boolean {
  if (BAD_CLASSES.has(candidate.class)) return false;

  const tokens = significantTokens(venue);
  const haystack = normalizeText(
    `${candidate.name || ""} ${candidate.display_name || ""}`,
  );
  if (tokens.length > 0) {
    const matched = tokens.filter((token) => haystack.includes(token));
    // No token matched at all → definitely a different place.
    if (matched.length === 0) return false;
    // Compound names may lose a word or two, but most must match.
    if (matched.length / tokens.length < 0.6) return false;
  }

  if (cityCenter) {
    const distance = haversineKm(
      cityCenter.lat,
      cityCenter.lng,
      Number(candidate.lat),
      Number(candidate.lon),
    );
    if (distance > MAX_VENUE_DISTANCE_KM) return false;
  }
  return true;
}

function toLocationData(
  candidate: NominatimResult,
  name: string,
  precision: "venue" | "city",
): LocationData {
  return {
    name,
    displayName: candidate.display_name,
    lat: Number.parseFloat(candidate.lat),
    lng: Number.parseFloat(candidate.lon),
    country: candidate.address?.country || "",
    state: candidate.address?.state || "",
    precision,
  };
}

/** Viewbox around a known centre, ~1° wide — biases venue searches home. */
function viewboxAround(lat: number, lng: number): number[] {
  const span = 1;
  return [lng - span, lat + span, lng + span, lat - span];
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Geocode a single place name (origin field, "city, country", …).
 * Tries the full string first, then the first clause, and prefers real
 * populated places over incidental POIs (houses, shops) that share the name.
 */
export async function geocodeLocation(
  placeName: string,
): Promise<LocationData | null> {
  const cleaned = sanitizeQuery(placeName);
  if (!cleaned) return null;

  const variants = [cleaned];
  const primary = primarySegment(cleaned);
  if (primary && primary !== cleaned) variants.push(primary);

  for (const variant of variants) {
    const results = await search(variant);
    const usable = results.filter((r) => !BAD_CLASSES.has(r.class));
    if (usable.length === 0) continue;

    // City queries: the query text must match real results, otherwise a
    // random POI (airport box, parking lot...) is a phantom — reject it.
    const tokens = significantTokens(variant);
    if (tokens.length > 0) {
      const match = usable.filter((r) => {
        const haystack =
          normalizeText(r.display_name) + " " + normalizeText(r.name || "");
        const matched = tokens.filter((t) => haystack.includes(t));
        const long = tokens.filter((t) => t.length >= 4);
        return (
          matched.length / tokens.length >= 0.5 ||
          (matched.length === 0 && long.some((t) => haystack.includes(t)))
        );
      });
      if (!match.length) continue;
      const placeLike = match.filter(
        (r) =>
          r.class === "boundary" ||
          (r.class === "place" && !NON_CITY_PLACE_TYPES.has(r.type)),
      );
      if (!placeLike.length) continue;
      const best = [...placeLike].sort(
        (a, b) => (b.importance || 0) - (a.importance || 0),
      )[0];
      if (best) return toLocationData(best, placeName, "city");
    } else {
      // No significant tokens (e.g. pure numbers / punctuation) → fall back
      // to the normal place-like preference.
      const placeLike = usable.filter(
        (r) =>
          r.class === "boundary" ||
          (r.class === "place" && !NON_CITY_PLACE_TYPES.has(r.type)),
      );
      const best = [...(placeLike.length > 0 ? placeLike : usable)].sort(
        (a, b) => (b.importance || 0) - (a.importance || 0),
      )[0];
      if (best) return toLocationData(best, placeName, "city");
    }
  }
  return null;
}

/**
 * Geocode a city (with country when known) for use as a fallback centre
 * and as the bias anchor for venue searches.
 */
export async function geocodeCity(
  city: string,
  country?: string,
): Promise<LocationData | null> {
  const query = country ? `${city}, ${country}` : city;
  const result = await geocodeLocation(query);
  if (!result) return null;
  return { ...result, name: city, precision: "city" };
}

/**
 * Geocode a venue inside a known city.
 *
 * Strategy: progressively shorter query forms ("Bateaux Mouches departure
 * pier, Paris" → "Bateaux Mouches, Paris"), each validated against the venue
 * tokens AND the city centre, with a viewbox-biased retry. Falls back to the
 * city centre when nothing valid is found — never a phantom POI.
 */
export async function geocodeVenue(
  venue: string,
  city: string,
  country: string | undefined,
  cityCenter: { lat: number; lng: number } | undefined,
): Promise<LocationData | null> {
  const cleaned = sanitizeQuery(venue);
  if (!cleaned) return null;

  // Progressively shorter forms of the venue text to query & match against.
  const parts: string[] = [];
  const addPart = (value?: string) => {
    const part = sanitizeQuery(value || "");
    if (part.length >= 2 && !parts.includes(part)) parts.push(part);
  };
  addPart(cleaned);
  const primary = primarySegment(cleaned);
  addPart(primary);
  const words = primary.split(" ");
  if (words.length > 3) addPart(words.slice(0, 3).join(" "));
  if (words.length > 2) addPart(words.slice(0, 2).join(" "));

  const viewbox = cityCenter
    ? viewboxAround(cityCenter.lat, cityCenter.lng)
    : undefined;

  const tryResults = (
    results: NominatimResult[],
    tokens: string,
  ): LocationData | null => {
    const match = results.find((r) => isVenueMatch(r, tokens, cityCenter));
    return match ? toLocationData(match, venue, "venue") : null;
  };

  for (const part of parts) {
    const query = city ? `${part}, ${city}` : part;
    const results = await search(query);
    if (results.length > 0) {
      const hit = tryResults(results, part);
      if (hit) return hit;
      // Candidates existed but failed validation — bias toward the city and
      // try once more before shortening the query.
      if (viewbox) {
        const biased = await search(query, { viewbox });
        const biasedHit = tryResults(biased, part);
        if (biasedHit) return biasedHit;
      }
    } else if (city) {
      // Compound query returned nothing → bare venue name (country bias is
      // implied by the city viewbox when we retry with a centre).
      const bare = await search(part);
      const bareHit = tryResults(bare, part);
      if (bareHit) return bareHit;
      if (viewbox && bare.length > 0) {
        const biased = await search(part, { viewbox });
        const biasedHit = tryResults(biased, part);
        if (biasedHit) return biasedHit;
      }
    }
  }

  // No valid venue match → honest city-level coordinates.
  if (cityCenter) {
    return {
      name: venue,
      displayName: `${city || country || "City"} (approximate location)`,
      lat: cityCenter.lat,
      lng: cityCenter.lng,
      country: country || "",
      precision: "city",
    };
  }
  return null;
}

/** Geocode several plain place names sequentially (kept for compatibility). */
export async function geocodeMultipleLocations(
  placeNames: string[],
): Promise<Map<string, LocationData>> {
  const results = new Map<string, LocationData>();
  for (const name of placeNames) {
    const location = await geocodeLocation(name);
    if (location) results.set(name, location);
  }
  return results;
}


