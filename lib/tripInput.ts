/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared between the new-trip form (client) and the generate route (server).
// Keep this file free of server-only imports so both sides can use it.

// ─── Options ──────────────────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
] as const;

export const CURRENCY_CODES: string[] = CURRENCIES.map((c) => c.code);

export type TripPace = "slow" | "moderate" | "fast";
export type Accommodation = "budget" | "mid-range" | "luxury";
export type Outbound = "flight" | "road" | "train" | "bus";
export type LocalTransport =
  | "taxi"
  | "rental"
  | "own-car"
  | "public"
  | "walking";
export type TimeSlot = "morning" | "afternoon" | "evening" | "night";

const PACES: TripPace[] = ["slow", "moderate", "fast"];
const STAYS: Accommodation[] = ["budget", "mid-range", "luxury"];
const OUTBOUNDS: Outbound[] = ["flight", "road", "train", "bus"];
const LOCALS: LocalTransport[] = [
  "taxi",
  "rental",
  "own-car",
  "public",
  "walking",
];
const SLOTS: TimeSlot[] = ["morning", "afternoon", "evening", "night"];

// Trip vibe options.
export const STYLE_OPTIONS = [
  { value: "Adventure", emoji: "🏔️" },
  { value: "Cultural & Heritage", emoji: "🏛️" },
  { value: "Relaxation", emoji: "🏖️" },
  { value: "Spiritual", emoji: "🕌" },
  { value: "Nature & Scenery", emoji: "🌄" },
  { value: "Food-focused", emoji: "🍽️" },
  { value: "Vlogging & Photography", emoji: "📹" },
  { value: "Road trip", emoji: "🚗" },
];

export const INTEREST_OPTIONS = [
  "Photography",
  "Food & Cuisine",
  "History",
  "Nature",
  "Nightlife",
  "Shopping",
  "Sports",
  "Art",
  "Music",
  "Architecture",
  "Wildlife",
  "Beaches",
  "Spiritual",
  "Hiking",
  "Museums",
  "Local Culture",
  "Cafes",
];

export const FOOD_OPTIONS = ["Halal", "Vegetarian", "Vegan", "Gluten-free"];

export const OUTBOUND_OPTIONS: {
  value: Outbound;
  label: string;
  emoji: string;
}[] = [
  { value: "flight", label: "Flight", emoji: "✈️" },
  { value: "road", label: "Car / Road", emoji: "🚗" },
  { value: "train", label: "Train", emoji: "🚂" },
  { value: "bus", label: "Bus", emoji: "🚌" },
];

export const LOCAL_TRANSPORT_OPTIONS: {
  value: LocalTransport;
  label: string;
  emoji: string;
}[] = [
  { value: "taxi", label: "Taxi / Ride-hailing", emoji: "🚕" },
  { value: "rental", label: "Rental car", emoji: "🚙" },
  { value: "own-car", label: "Own car", emoji: "🚘" },
  { value: "public", label: "Public transport", emoji: "🚇" },
  { value: "walking", label: "Mostly walking", emoji: "🚶" },
];

export const TIME_SLOTS: { value: TimeSlot; label: string; hint: string }[] = [
  { value: "morning", label: "Morning", hint: "6am – 11am" },
  { value: "afternoon", label: "Afternoon", hint: "12pm – 4pm" },
  { value: "evening", label: "Evening", hint: "5pm – 9pm" },
  { value: "night", label: "Night", hint: "after 10pm" },
];

// Approximate units per 1 USD, used only when the live FX API is unreachable.
// PKR is from 20 Sep 2026; EUR/GBP/INR are derived from a March 2026 snapshot;
// AED/SAR are pegged; TRY is Feb 2026.
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.87,
  GBP: 0.76,
  PKR: 277.65,
  INR: 95,
  AED: 3.6725,
  SAR: 3.75,
  TRY: 43.8,
};

export const LIMITS = {
  maxDays: 30,
  maxDestinations: 10,
  maxStyles: 3,
  maxInterests: 15,
  maxFood: 6,
  maxMust: 5,
  maxAvoid: 5,
  maxAdults: 20,
  maxChildren: 10,
  maxPets: 10,
  maxTravelers: 20,
  maxBudgetUSD: 1_000_000,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Origin {
  name: string;
  lat?: number;
  lng?: number;
  country?: string;
}

export interface Prebooked {
  type: "flight";
  amount?: number; // in the trip currency; optional = "booked, amount unknown"
}

export interface DestinationDays {
  name: string;
  days: number;
}

export interface SanitizedTrip {
  name: string;
  destinations: string[];
  destinationDays: DestinationDays[]; // [] = "let the AI decide"
  origin: Origin;
  outbound: Outbound;
  startDate: Date;
  endDate: Date;
  duration: number; // always derived from the dates, never trusted from the client
  arrivalTime: TimeSlot;
  departureTime: TimeSlot;
  adults: number;
  children: number;
  pets: number;
  styles: string[];
  interests: string[];
  customTags: string[]; // labels the user typed themselves (subset of styles/interests/food)
  pace: TripPace;
  stayLevel: Accommodation;
  localTransport: LocalTransport;
  budget: number;
  currency: string;
  includesFlights: boolean;
  flightBudget?: number;
  prebooked: Prebooked[];
  comment: string;
  currentLocation: string;
  tripType: string;
  transportation: string;
  accommodation: string;
  tripPace: string;
  travelers: number;
  tripDescription: string;
}

export type SanitizeResult =
  | { ok: true; data: SanitizedTrip }
  | { ok: false; error: string };

// ─── Small helpers (safe on client and server) ────────────────────────────────

/** Round to a "nice" number: 83,295 → 85,000 ; 1,441 → 1,500 */
export function niceRound(n: number): number {
  if (!isFinite(n) || n <= 0) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  const step = magnitude / 2;
  return Math.max(step, Math.round(n / step) * step);
}

/** Slider/preset scale for a currency, given how many units equal 1 USD. */
export function budgetScale(unitsPerUSD: number) {
  const min = niceRound(200 * unitsPerUSD);
  const max = niceRound(20000 * unitsPerUSD);
  const step = Math.max(1, Math.pow(10, Math.floor(Math.log10(max)) - 2));
  const presets = [300, 600, 1000, 1500, 2500, 5000, 10000].map((usd) =>
    niceRound(usd * unitsPerUSD),
  );
  return { min, max, step, presets };
}

export function diffDaysInclusive(startISO: string, endISO: string): number {
  const s = parseISODate(startISO);
  const e = parseISODate(endISO);
  if (!s || !e) return 0;
  return Math.round((e.getTime() - s.getTime()) / 86_400_000) + 1;
}

function parseISODate(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? new Date(`${s}T00:00:00.000Z`)
    : new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Server-side sanitizer ────────────────────────────────────────────────────

function cleanStrings(v: unknown, max: number, maxLen = 60): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    if (typeof item !== "string") continue;
    const s = item.trim().slice(0, maxLen);
    const key = s.toLowerCase();
    if (!s || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function pick<T extends string>(v: unknown, allowed: T[], fallback: T): T {
  return typeof v === "string" && (allowed as string[]).includes(v)
    ? (v as T)
    : fallback;
}

function toInt(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toCoord(v: unknown, min: number, max: number): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
}

/**
 * Validates and normalizes the payload from the new-trip form.
 * Accepts the new field names and falls back to the legacy ones
 * (currentLocation, tripPace, accommodation, transportation, tripDescription).
 * Does NOT compute amountUSD — that needs an FX lookup (see lib/services/fx.ts).
 */
export function sanitizeTripInput(input: any): SanitizeResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid trip data" };
  }

  // Destinations
  const destinations = cleanStrings(
    input.destinations,
    LIMITS.maxDestinations,
    100,
  );
  if (destinations.length === 0) {
    return { ok: false, error: "Please enter at least one destination" };
  }

  // Origin (object from the new form, or legacy string)
  const rawOrigin =
    input.origin && typeof input.origin === "object" ? input.origin : {};
  const originName = String(rawOrigin.name || input.currentLocation || "")
    .trim()
    .slice(0, 200);
  if (!originName) {
    return { ok: false, error: "Please enter your starting location" };
  }
  const origin: Origin = {
    name: originName,
    lat: toCoord(rawOrigin.lat, -90, 90),
    lng: toCoord(rawOrigin.lng, -180, 180),
    country:
      typeof rawOrigin.country === "string"
        ? rawOrigin.country.slice(0, 80)
        : undefined,
  };
  if (origin.lat === undefined || origin.lng === undefined) {
    delete origin.lat;
    delete origin.lng;
  }

  // Dates — duration is derived here, never trusted from the client
  const start = parseISODate(input.startDate);
  const end = parseISODate(input.endDate);
  if (!start || !end) {
    return { ok: false, error: "Please select your travel dates" };
  }
  if (end.getTime() < start.getTime()) {
    return { ok: false, error: "End date can't be before the start date" };
  }
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  if (start.getTime() < todayUTC.getTime() - 86_400_000) {
    return { ok: false, error: "Start date is in the past" };
  }
  const duration =
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (duration > LIMITS.maxDays) {
    return {
      ok: false,
      error: `Trips can be at most ${LIMITS.maxDays} days`,
    };
  }

  // Days per destination — only kept if it is complete and adds up exactly
  let destinationDays: DestinationDays[] = [];
  if (Array.isArray(input.destinationDays) && destinations.length > 1) {
    const candidate: DestinationDays[] = [];
    for (const d of input.destinationDays) {
      const name = destinations.find(
        (x) =>
          x.toLowerCase() ===
          String(d?.name || "")
            .trim()
            .toLowerCase(),
      );
      const days = toInt(d?.days, 0);
      if (name && days >= 1) candidate.push({ name, days });
    }
    const sum = candidate.reduce((a, b) => a + b.days, 0);
    if (candidate.length === destinations.length && sum === duration) {
      destinationDays = candidate;
    }
  }

  // Travelers
  const adults = Math.max(
    1,
    Math.min(
      LIMITS.maxAdults,
      toInt(input.adults, 0) || toInt(input.travelers, 1),
    ),
  );
  const children = Math.max(
    0,
    Math.min(LIMITS.maxChildren, toInt(input.children, 0)),
  );
  const pets = Math.max(0, Math.min(LIMITS.maxPets, toInt(input.pets, 0)));
  if (adults + children > LIMITS.maxTravelers) {
    return {
      ok: false,
      error: `Groups are limited to ${LIMITS.maxTravelers} travelers`,
    };
  }
  // Vibe / interests / food (+ which labels the user typed themselves)
  const styles = cleanStrings(input.styles, LIMITS.maxStyles);
  const legacyType =
    typeof input.tripType === "string"
      ? input.tripType.trim().slice(0, 50)
      : "";
  const interests = cleanStrings(input.interests, LIMITS.maxInterests);
  const food = cleanStrings(input.food, LIMITS.maxFood);
  const known = new Set(
    [
      ...STYLE_OPTIONS.map((s) => s.value),
      ...INTEREST_OPTIONS,
      ...FOOD_OPTIONS,
    ].map((s) => s.toLowerCase()),
  );
  const customTags = [...styles, ...interests, ...food].filter(
    (t) => !known.has(t.toLowerCase()),
  );

  const outbound = pick(
    input.outbound ?? input.transportation,
    OUTBOUNDS,
    "flight",
  );

  // Budget
  const budget =
    typeof input.budget === "number" ? input.budget : parseFloat(input.budget);
  if (!Number.isFinite(budget) || budget <= 0) {
    return { ok: false, error: "Budget must be a positive number" };
  }
  const currency = CURRENCY_CODES.includes(String(input.currency))
    ? String(input.currency)
    : "USD";
  if (outbound === "flight" && typeof input.includesFlights !== "boolean") {
    return {
      ok: false,
      error: "Please choose whether your budget includes flights",
    };
  }
  const includesFlights = outbound === "flight" ? input.includesFlights : false;
  const flightBudget =
    includesFlights && input.flightBudget !== undefined
      ? Number(input.flightBudget)
      : undefined;
  if (
    includesFlights &&
    (flightBudget === undefined ||
      !Number.isFinite(flightBudget) ||
      flightBudget < 0)
  ) {
    return { ok: false, error: "Please enter a valid flight expense" };
  }
  if (flightBudget !== undefined && flightBudget > budget) {
    return {
      ok: false,
      error: "Flight expense can't be more than your budget",
    };
  }

  const prebooked: Prebooked[] = [];
  if (Array.isArray(input.prebooked)) {
    for (const p of input.prebooked.slice(0, 2)) {
      const type = p?.type === "flight" || p?.type === "hotel" ? p.type : null;
      if (!type || prebooked.some((x) => x.type === type)) continue;
      const amount =
        p.amount === undefined || p.amount === null || p.amount === ""
          ? undefined
          : Number(p.amount);
      if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
        return { ok: false, error: "Booked amounts must be positive numbers" };
      }
      if (amount !== undefined && amount > budget) {
        return {
          ok: false,
          error: "An already-booked amount can't be larger than your budget",
        };
      }
      prebooked.push({ type, amount });
    }
  }

  // Preferences
  const pace = pick(input.pace ?? input.tripPace, PACES, "moderate");
  const stayLevel = pick(
    input.stayLevel ?? input.accommodation,
    STAYS,
    "mid-range",
  );
  const localTransport = pick(input.localTransport, LOCALS, "taxi");
  const arrivalTime = pick(input.arrivalTime, SLOTS, "afternoon");
  const departureTime = pick(input.departureTime, SLOTS, "evening");

  const comment = String(input.comment ?? input.tripDescription ?? "")
    .trim()
    .slice(0, 2000);

  return {
    ok: true,
    data: {
      name: String(input.name || `Trip to ${destinations[0]}`).slice(0, 200),
      destinations,
      destinationDays,
      origin,
      outbound,
      startDate: start,
      endDate: end,
      duration,
      arrivalTime,
      departureTime,
      adults,
      children,
      pets,
      styles,
      interests,
      customTags,
      pace,
      stayLevel,
      localTransport,
      budget,
      currency,
      includesFlights,
      flightBudget,
      prebooked,
      comment,
      currentLocation: origin.name,
      tripType: styles[0] || legacyType || "adventure",
      transportation: outbound,
      accommodation: stayLevel,
      tripPace: pace,
      travelers: adults + children,
      tripDescription: comment,
    },
  };
}
