/* eslint-disable @typescript-eslint/no-explicit-any */
// Generic input validation utilities — no trip-specific logic.

/**
 * Trim whitespace and cap a string to `maxLen` characters.
 * Returns `""` for non-string values.
 * @example sanitizeString("  hello world  ", 10) → "hello worl"
 * @example sanitizeString(null, 10) → ""
 * @example sanitizeString(42, 10) → ""
 */
export function sanitizeString(v: unknown, maxLen: number = 200): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, maxLen);
}

/**
 * Filter an array to unique, trimmed, length-capped strings.
 * Skips non-string items, deduplicates case-insensitively, stops after `maxItems`.
 * Returns `[]` for non-arrays.
 * @example sanitizeStringArray(["  A ", "a", "B", 42], 20, 3) → ["A", "B"]
 * @example sanitizeStringArray(null) → []
 */
export function sanitizeStringArray(
  v: unknown,
  maxLen: number = 60,
  maxItems: number = 10,
): string[] {
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
    if (out.length >= maxItems) break;
  }
  return out;
}

/**
 * Return `v` parsed as a finite integer, or `fallback` if invalid.
 * @example toInt("42", 0) → 42
 * @example toInt(3.7, 0) → 3
 * @example toInt(null, 0) → 0
 * @example toInt("abc", 5) → 5
 */
export function toInt(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/**
 * Return `v` parsed as a number constrained to [min, max], or `undefined` if invalid.
 * @example toCoord(45.5, -90, 90) → 45.5
 * @example toCoord(200, -90, 90) → undefined
 * @example toCoord("10.5", -180, 180) → 10.5
 * @example toCoord(null, 0, 100) → undefined
 */
export function toCoord(
  v: unknown,
  min: number,
  max: number,
): number | undefined {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : undefined;
}

/**
 * Return `v` if it is a valid member of `allowed`, otherwise return `fallback`.
 * @example pickEnum("flight", ["flight", "road"], "bus") → "flight"
 * @example pickEnum("boat", ["flight", "road"], "bus") → "bus"
 * @example pickEnum(42, ["flight", "road"], "bus") → "bus"
 */
export function pickEnum<T extends string>(
  v: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof v === "string" && allowed.includes(v as T)
    ? (v as T)
    : fallback;
}

/**
 * Parse a date value into a Date object, or null if invalid.
 * Accepts ISO `YYYY-MM-DD` strings (treated as UTC) or standard date strings.
 * @example parseISODate("2026-09-21") → Date(2026-09-21T00:00:00Z)
 * @example parseISODate("2026-09-21T00:00:00Z") → Date(2026-09-21T00:00:00Z)
 * @example parseISODate("invalid") → null
 * @example parseISODate(null) → null
 */
export function parseISODate(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  const d = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? new Date(`${s}T00:00:00.000Z`)
    : new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
