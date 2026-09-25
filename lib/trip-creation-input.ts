/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared between the new-trip form (client) and the generate route (server).
// Keep this file free of server-only imports so both sides can use it.

import {
  parseISODate,
  pickEnum,
  sanitizeString,
  sanitizeStringArray,
  toCoord,
  toInt,
} from "./input-validation";
import type {
  Accommodation,
  DestinationDays,
  LocalTransport,
  Origin,
  Outbound,
  Prebooked,
  SanitizeResult,
  TimeSlot,
  TripPace,
} from "@/types/app-types";

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
  maxAdults: 20,
  maxChildren: 10,
  maxPets: 10,
  maxTravelers: 20,
  maxBudgetUSD: 1_000_000,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function niceRound(n: number): number {
  if (!isFinite(n) || n <= 0) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  const step = magnitude / 2;
  return Math.max(step, Math.round(n / step) * step);
}

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

// ─── Trip input sanitizer ─────────────────────────────────────────────────────

/**
 * Validates and normalizes the trip payload from the new-trip form.
 *
 * @param input - Raw form data (any shape — fields may be missing or malformed)
 * @returns `{ ok: true, data }` with validated/typed fields, or `{ ok: false, error }`
 *
 * @example
 * ```ts
 * sanitizeTripInput({
 *   name: "Trip to Riyadh",
 *   destinations: ["riyadh", "jeddah"],
 *   origin: { name: "karachi", lat: 24.86, lng: 67.02, country: "PK" },
 *   startDate: "2026-09-21",
 *   endDate: "2026-09-29",
 *   budget: 400000,
 *   currency: "PKR",
 *   adults: 1,
 *   outbound: "flight",
 *   includesFlights: true,
 * });
 * // → { ok: true, data: { name: "Trip to Riyadh", destinations: [...], duration: 9, ... } }
 * ```
 *
 */
export function sanitizeTripInput(input: any): SanitizeResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid trip data" };
  }

  // ── Destinations: filter non-strings, trim, dedupe ──
  const destinations = sanitizeStringArray(
    input.destinations,
    100,
    LIMITS.maxDestinations,
  );
  if (destinations.length === 0) {
    return { ok: false, error: "Please enter at least one destination" };
  }

  // ── Origin: name, lat/lng range, optional country ──────────
  const rawOrigin =
    input.origin && typeof input.origin === "object" ? input.origin : {};
  const originName = sanitizeString(rawOrigin.name, 200);
  if (!originName) {
    return { ok: false, error: "Please enter your starting location" };
  }
  const origin: Origin = {
    name: originName,
    lat: toCoord(rawOrigin.lat, -90, 90),
    lng: toCoord(rawOrigin.lng, -180, 180),
    country: sanitizeString(rawOrigin.country, 80),
  };
  if (origin.lat === undefined || origin.lng === undefined) {
    delete origin.lat;
    delete origin.lng;
  }

  // ── Dates: parse, validate, derive duration ──────────
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
    return { ok: false, error: `Trips can be at most ${LIMITS.maxDays} days` };
  }

  // ── Destination days: only if all covered and sum = duration ──
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

  // ── Travelers: clamp to limits ──
  const adults = Math.max(
    1,
    Math.min(LIMITS.maxAdults, toInt(input.adults, 1)),
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

  // ── Styles, interests ──────────────────────────────────
  const styles = sanitizeStringArray(input.styles, 100, LIMITS.maxStyles);
  const interests = sanitizeStringArray(
    input.interests,
    100,
    LIMITS.maxInterests,
  );

  // ── Transport ──
  const outbound = pickEnum(input.outbound, OUTBOUNDS, "flight");

  // ── Budget: positive number, validate currency ──
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

  // ── Prebooked: max 2, positive amounts within budget ──
  const prebooked: Prebooked[] = [];
  if (Array.isArray(input.prebooked)) {
    for (const p of input.prebooked.slice(0, 2)) {
      const type = p?.type === "flight" ? p.type : null;
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

  // ── Preferences: pick from enums with fallbacks ──
  const pace = pickEnum(input.pace, PACES, "moderate");
  const stayLevel = pickEnum(input.stayLevel, STAYS, "mid-range");
  const localTransport = pickEnum(input.localTransport, LOCALS, "taxi");
  const arrivalTime = pickEnum(input.arrivalTime, SLOTS, "afternoon");
  const departureTime = pickEnum(input.departureTime, SLOTS, "evening");

  const comment = sanitizeString(input.comment, 2000);

  // ── Result: build sanitized trip object ──
  return {
    ok: true,
    data: {
      name: sanitizeString(input.name, 200) || `Trip to ${destinations[0]}`,
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
      pace,
      stayLevel,
      localTransport,
      budget,
      currency,
      includesFlights,
      flightBudget,
      prebooked,
      comment,
    },
  };
}
