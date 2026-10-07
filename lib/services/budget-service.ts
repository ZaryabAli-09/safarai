import type { IBudgetBreakdown } from "@/types/app-types";

/**
 * Budget reconciliation.
 *
 * The AI's numbers are treated as *suggestions*; this module guarantees the
 * invariants the UI relies on:
 *   flights + accommodation + food + transport + activities + miscellaneous
 *     === total === the user's entered budget
 *   activities ≥ the sum of the listed activity costs (every suggested
 *     activity is funded by the breakdown).
 */

/**
 * Parse an AI cost string like "20-30 USD", "1,500 PKR", "Free", "0".
 * Ranges average out; text without digits counts as 0.
 */
export function parseCostValue(cost?: string): number {
  if (!cost) return 0;
  const text = String(cost).replace(/,/g, "");
  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:-|–|to)\s*(\d+(?:\.\d+)?)/i);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;
  const single = text.match(/(\d+(?:\.\d+)?)/);
  return single ? Number(single[1]) : 0;
}

/** Sum of every activity's estimated cost (what the plan actually spends). */
export function totalActivityCosts(
  itinerary: Array<{
    activities?: Array<{ estimatedCost?: string; category?: string }>;
  }>,
): number {
  let sum = 0;
  for (const day of itinerary || []) {
    for (const activity of day.activities || []) {
      sum += parseCostValue(activity.estimatedCost);
    }
  }
  return Math.round(sum);
}

/** Fallback split when the AI returns nothing usable (percent of ground). */
const FALLBACK_RATIOS = {
  accommodation: 0.35,
  food: 0.25,
  transport: 0.1,
  activities: 0.2,
  miscellaneous: 0.1,
};

interface ReconcileInput {
  budget: number;
  currency: string;
  /** Flight expense reserved inside the budget (0 when not applicable). */
  flights: number;
  /** Raw AI budgetBreakdown (may be missing or nonsense). */
  ai?: Partial<IBudgetBreakdown> | null;
  /** Sum of the itinerary's listed activity costs. */
  activityCostTotal: number;
}

function readAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

/** Scale positive amounts so they sum exactly to `target` (remainder → misc). */
function scaleOthers(
  amounts: {
    accommodation: number;
    food: number;
    transport: number;
    miscellaneous: number;
  },
  target: number,
): {
  accommodation: number;
  food: number;
  transport: number;
  miscellaneous: number;
} {
  const sum =
    amounts.accommodation +
    amounts.food +
    amounts.transport +
    amounts.miscellaneous;
  if (target <= 0) {
    return { accommodation: 0, food: 0, transport: 0, miscellaneous: 0 };
  }
  if (sum <= 0) {
    const accommodation = Math.round(target * FALLBACK_RATIOS.accommodation);
    const food = Math.round(target * FALLBACK_RATIOS.food);
    const transport = Math.round(target * FALLBACK_RATIOS.transport);
    return {
      accommodation,
      food,
      transport,
      miscellaneous: Math.max(0, target - accommodation - food - transport),
    };
  }
  const k = target / sum;
  const accommodation = Math.round(amounts.accommodation * k);
  const food = Math.round(amounts.food * k);
  const transport = Math.round(amounts.transport * k);
  // Remainder absorbs rounding so the four always sum to `target`.
  return {
    accommodation,
    food,
    transport,
    miscellaneous: Math.max(0, target - accommodation - food - transport),
  };
}

export function reconcileBudget(input: ReconcileInput): IBudgetBreakdown {
  const { budget, currency, activityCostTotal } = input;
  const flights = Math.min(Math.max(input.flights, 0), budget);
  const ground = Math.max(budget - flights, 0);

  const aiAccommodation = readAmount(input.ai?.accommodation);
  const aiFood = readAmount(input.ai?.food);
  const aiTransport = readAmount(input.ai?.transport);
  const aiMiscellaneous = readAmount(input.ai?.miscellaneous);
  const aiActivities = readAmount(input.ai?.activities);
  const aiSum =
    aiAccommodation + aiFood + aiTransport + aiMiscellaneous + aiActivities;

  // ── 1. Activities line: cover the listed costs, cap at 80% of ground ──
  // so lodging/food can never be squeezed out by ticket prices.
  const coverageCap = Math.floor(ground * 0.8);
  const coverage = Math.min(Math.max(activityCostTotal, 0), coverageCap);
  let activities =
    aiSum > 0
      ? Math.min(Math.max(aiActivities, coverage), coverageCap)
      : Math.round(ground * FALLBACK_RATIOS.activities);
  activities = Math.min(activities, ground);

  // ── 2. Remaining categories fill exactly `ground - activities` ──
  const rest = Math.max(0, ground - activities);
  const others = scaleOthers(
    {
      accommodation: aiAccommodation,
      food: aiFood,
      transport: aiTransport,
      miscellaneous: aiMiscellaneous,
    },
    rest,
  );

  return {
    accommodation: others.accommodation,
    food: others.food,
    transport: others.transport,
    activities,
    miscellaneous: others.miscellaneous,
    flights,
    total: budget,
    currency,
  };
}
