// FX service — units of each currency per 1 USD.
// Live rates from open.er-api.com (keyless), cached in memory for 12h, with a
// static fallback so budgets never break if the API is down.
// TODO: check open.er-api.com's current terms/attribution before launch.

import { CURRENCY_CODES, FALLBACK_RATES } from "@/lib/trip-creation-input";

const FALLBACK = FALLBACK_RATES;

const TTL_MS = 12 * 60 * 60 * 1000;
let cache: { rates: Record<string, number>; live: boolean; at: number } | null =
  null;

export async function getRates(): Promise<{
  rates: Record<string, number>;
  live: boolean;
}> {
  if (cache && Date.now() - cache.at < TTL_MS) {
    return { rates: cache.rates, live: cache.live };
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.result === "success" && data.rates) {
        const rates: Record<string, number> = {};
        for (const code of CURRENCY_CODES) {
          const r = Number(data.rates[code]);
          rates[code] = Number.isFinite(r) && r > 0 ? r : FALLBACK[code];
        }
        cache = { rates, live: true, at: Date.now() };
        return { rates, live: true };
      }
    }
  } catch {
    // fall through to fallback
  }

  // Cache the fallback briefly so we don't hammer a failing API.
  cache = {
    rates: { ...FALLBACK },
    live: false,
    at: Date.now() - TTL_MS + 5 * 60 * 1000,
  };
  return { rates: cache.rates, live: false };
}

/** Convert an amount in `currency` to USD. */
export async function toUSD(amount: number, currency: string): Promise<number> {
  const { rates } = await getRates();
  const perUSD = rates[currency] ?? FALLBACK[currency] ?? 1;
  return Math.round((amount / perUSD) * 100) / 100;
}
