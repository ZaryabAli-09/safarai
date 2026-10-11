// AI configuration — Groq models first (each model has its OWN free quota),
// OpenRouter last.
//
//  1. Groq openai/gpt-oss-120b   primary (best quality)
//  2. Groq openai/gpt-oss-20b    own quota bucket, very fast
//  3. Groq qwen/qwen3.8-27b      own quota bucket
//  4. OpenRouter Nemotron Ultra  last resort (free, slow, often busy)
//
// One attempt per entry, no retries, no sleeping.
//  - `limits` mirror your Groq org limits (per model). Before each call we
//    check (in memory, per server instance) whether the model still has room
//    in its minute / day token budget and skip it if not.
//  - A real 429 also puts that model on a cooldown (Retry-After).
// Output is capped at 5000 tokens so input (~2.3k) + output stays under the
// 8K tokens/min limit of each Groq model.

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: { message: { content: string }; finish_reason?: string }[];
  usage?: { total_tokens?: number };
  error?: { message: string; code?: number };
}

/** Free-plan limits of one model (from the Groq console). */
interface ModelLimits {
  rpm: number;
  rpd: number;
  tpm: number;
  tpd: number;
}

interface Provider {
  name: string;
  baseUrl: string;
  apiKeyEnv: string;
  model: string;
  extraBody?: Record<string, unknown>;
  extraHeaders?: Record<string, string>;
  responseFormat?: Record<string, unknown>;
  /** Groq uses max_completion_tokens; OpenRouter uses max_tokens. */
  maxCompletionTokens?: number;
  /** Per-attempt timeout. */
  timeoutMs: number;
  /** Known rate limits — enables the local pre-check. */
  limits?: ModelLimits;
}

/** Same free-plan numbers for all three Groq models in your org. */
const GROQ_FREE_LIMITS: ModelLimits = {
  rpm: 30,
  rpd: 1000,
  tpm: 8000,
  tpd: 200000,
};
/** Max output tokens per request (keeps input + output < 8K TPM). */
const MAX_OUTPUT_TOKENS = 5000;

const ITINERARY_RESPONSE_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "travel_itinerary",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "itinerary",
        "summary",
        "budgetBreakdown",
        "packingList",
        "travelTips",
        "aiNotes",
      ],
      properties: {
        itinerary: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["dayNumber", "date", "title", "location", "activities"],
            properties: {
              dayNumber: { type: "integer" },
              date: { type: "string" },
              title: { type: "string" },
              location: { type: "string" },
              activities: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "id",
                    "timeOfDay",
                    "title",
                    "description",
                    "venue",
                    "city",
                    "country",
                    "estimatedCost",
                    "duration",
                    "category",
                  ],
                  properties: {
                    id: { type: "string" },
                    timeOfDay: {
                      type: "string",
                      enum: ["morning", "afternoon", "evening", "night"],
                    },
                    title: { type: "string" },
                    description: { type: "string" },
                    venue: { type: "string" },
                    city: { type: "string" },
                    country: { type: "string" },
                    estimatedCost: { type: "string" },
                    duration: { type: "string" },
                    category: { type: "string" },
                  },
                },
              },
            },
          },
        },
        summary: {
          type: "object",
          additionalProperties: false,
          required: [
            "totalDays",
            "destinations",
            "estimatedBudget",
            "bestSeason",
            "travelStyle",
            "familyFriendly",
          ],
          properties: {
            totalDays: { type: "integer" },
            destinations: { type: "array", items: { type: "string" } },
            estimatedBudget: { type: "string" },
            bestSeason: { type: "string" },
            travelStyle: { type: "string" },
            familyFriendly: { type: "boolean" },
          },
        },
        budgetBreakdown: {
          type: "object",
          additionalProperties: false,
          required: [
            "accommodation",
            "food",
            "transport",
            "activities",
            "miscellaneous",
            "total",
            "currency",
          ],
          properties: {
            accommodation: { type: "number" },
            food: { type: "number" },
            transport: { type: "number" },
            activities: { type: "number" },
            miscellaneous: { type: "number" },
            total: { type: "number" },
            currency: { type: "string" },
          },
        },
        packingList: { type: "array", items: { type: "string" } },
        travelTips: { type: "array", items: { type: "string" } },
        aiNotes: { type: "string" },
      },
    },
  },
} as const;

const PROVIDER_CHAIN: Provider[] = [
  {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKeyEnv: "GROK_API_KEY",
    model: "openai/gpt-oss-120b", // primary — best quality
    responseFormat: ITINERARY_RESPONSE_SCHEMA,
    maxCompletionTokens: MAX_OUTPUT_TOKENS,
    extraBody: { reasoning_effort: "low" },
    timeoutMs: 40_000,
    limits: GROQ_FREE_LIMITS,
  },
  {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKeyEnv: "GROK_API_KEY",
    model: "openai/gpt-oss-20b", // own quota bucket, ~1000 tok/s
    responseFormat: ITINERARY_RESPONSE_SCHEMA,
    maxCompletionTokens: MAX_OUTPUT_TOKENS,
    extraBody: { reasoning_effort: "low" },
    timeoutMs: 30_000,
    limits: GROQ_FREE_LIMITS,
  },
  {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    apiKeyEnv: "GROK_API_KEY",
    model: "qwen/qwen3.8-27b", // own quota bucket. Plain JSON mode: strict
    // json_schema is not guaranteed on every Groq model.
    responseFormat: { type: "json_object" },
    maxCompletionTokens: MAX_OUTPUT_TOKENS,
    timeoutMs: 40_000,
    limits: GROQ_FREE_LIMITS,
  },
  // Meta Llama chat models are not in your org's limits list (only the
  // prompt-guard classifiers). If llama-3.3-70b-versatile gets enabled, add it
  // here as another Groq entry with json_object + its own `limits`.
  {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKeyEnv: "OPENROUTER_API_KEY",
    model: "nvidia/nemotron-3-ultra-550b-a55b:free", // last resort
    extraBody: { reasoning: { effort: "low", exclude: true } },
    extraHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      "X-Title": "Safar AI",
    },
    timeoutMs: 60_000,
  },
];

/** Rough token estimate (≈3.5 chars/token, slightly pessimistic). */
function estimateTokens(messages: OpenRouterMessage[]): number {
  return Math.ceil(messages.reduce((n, m) => n + m.content.length, 0) / 3.5);
}

/** Local usage tracking per model: resets per instance / UTC day. */
const usageByModel = new Map<
  string,
  {
    events: { t: number; tokens: number }[];
    day: string;
    dayTokens: number;
    dayRequests: number;
  }
>();

function usageFor(model: string) {
  const day = new Date().toISOString().slice(0, 10);
  let u = usageByModel.get(model);
  if (!u || u.day !== day) {
    u = { events: [], day, dayTokens: 0, dayRequests: 0 };
    usageByModel.set(model, u);
  }
  u.events = u.events.filter((e) => Date.now() - e.t < 60_000);
  return u;
}

function recordUsage(model: string, tokens: number) {
  const u = usageFor(model);
  u.events.push({ t: Date.now(), tokens });
  u.dayTokens += tokens;
  u.dayRequests += 1;
}

/** Returns why the model should be skipped, or null if there is room. */
function limitReason(provider: Provider, requestTokens: number): string | null {
  const l = provider.limits;
  if (!l) return null;
  const u = usageFor(provider.model);
  const minuteTokens = u.events.reduce((n, e) => n + e.tokens, 0);
  // 10% safety margin because our counters only see this server instance.
  if (u.events.length >= l.rpm * 0.9) return "requests/min";
  if (minuteTokens + requestTokens > l.tpm * 1.25) return "tokens/min";
  if (u.dayRequests >= l.rpd * 0.9) return "requests/day";
  if (u.dayTokens + requestTokens > l.tpd * 0.9) return "tokens/day";
  return null;
}

/** model -> epoch ms until which it is skipped (set after a 429). */
const cooldownUntil = new Map<string, number>();
const MAX_COOLDOWN_MS = 6 * 60 * 60 * 1000;

function noteRateLimit(provider: Provider, res: Response) {
  const retryAfterSec = Number(res.headers.get("retry-after"));
  const ms = Math.min(
    Number.isFinite(retryAfterSec) && retryAfterSec > 0
      ? retryAfterSec * 1000
      : 30_000,
    MAX_COOLDOWN_MS,
  );
  cooldownUntil.set(provider.model, Date.now() + ms);
  console.warn(
    `[AI] ${provider.model} rate limited — skipping it for ${Math.round(ms / 1000)}s`,
  );
}

async function callModel(
  provider: Provider,
  messages: OpenRouterMessage[],
  maxTokens: number,
): Promise<string | null> {
  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) {
    console.warn(
      `[AI] ${provider.name}: ${provider.apiKeyEnv} not set — skipping`,
    );
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), provider.timeoutMs);

  try {
    const res = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...provider.extraHeaders,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: 0.4,
        ...(provider.maxCompletionTokens
          ? { max_completion_tokens: provider.maxCompletionTokens }
          : { max_tokens: Math.min(maxTokens, MAX_OUTPUT_TOKENS) }),
        response_format: provider.responseFormat || { type: "json_object" },
        ...provider.extraBody,
      }),
      signal: controller.signal,
    });

    // Even failed calls consume quota (e.g. truncated output) — count them.
    recordUsage(
      provider.model,
      estimateTokens(messages) +
        (provider.maxCompletionTokens ??
          Math.min(maxTokens, MAX_OUTPUT_TOKENS)),
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `${provider.name} error (${provider.model}): ${res.status} - ${errText.slice(0, 400)}`,
      );
      if (res.status === 429) noteRateLimit(provider, res);

      // Groq rejects a cut-off structured answer, but the itinerary inside
      // `failed_generation` is usually complete — only the extras are missing,
      // and the pipeline fills those with defaults.
      try {
        const err = JSON.parse(errText)?.error;
        if (
          err?.code === "json_validate_failed" &&
          typeof err.failed_generation === "string" &&
          err.failed_generation.length > 200
        ) {
          console.warn(
            `[AI] ${provider.model}: salvaging partial answer (${err.failed_generation.length} chars)`,
          );
          return err.failed_generation;
        }
      } catch {}
      return null;
    }

    const data: ChatCompletionResponse = await res.json();
    if (data.error) {
      console.error(
        `${provider.name} API error (${provider.model}):`,
        data.error.message,
      );
      return null;
    }

    if (data.usage?.total_tokens) {
      // Replace the pessimistic estimate with the real number.
      const u = usageFor(provider.model);
      const last = u.events[u.events.length - 1];
      if (last) {
        u.dayTokens += data.usage.total_tokens - last.tokens;
        last.tokens = data.usage.total_tokens;
      }
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content || content.trim() === "") {
      console.error(
        `${provider.name} returned empty content (${provider.model})`,
      );
      return null;
    }

    // A truncated answer is unusable JSON — move on to the next model.
    if (data.choices?.[0]?.finish_reason === "length") {
      console.warn(
        `${provider.name} output truncated (${provider.model}) — discarding`,
      );
      return null;
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error(
        `${provider.name} timeout (${provider.model}) after ${provider.timeoutMs / 1000}s`,
      );
    } else if (error instanceof Error) {
      console.error(
        `${provider.name} call failed (${provider.model}):`,
        error.message,
      );
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Walk the provider chain once, in order. Each entry gets one attempt; the
 * first answer that passes `options.accept` (if given) is returned.
 */
export async function generateAICompletion(
  messages: OpenRouterMessage[],
  maxTokens = 8000,
  options: {
    skipModels?: readonly string[];
    accept?: (text: string) => boolean;
  } = {},
): Promise<string> {
  const errors: string[] = [];
  const skipped = new Set(options.skipModels ?? []);

  for (const provider of PROVIDER_CHAIN) {
    if (skipped.has(provider.model)) continue;

    const waitUntil = cooldownUntil.get(provider.model) ?? 0;
    if (Date.now() < waitUntil) {
      errors.push(`${provider.model}: cooling down after rate limit`);
      continue;
    }

    const full = limitReason(
      provider,
      estimateTokens(messages) +
        (provider.maxCompletionTokens ?? MAX_OUTPUT_TOKENS),
    );
    if (full) {
      console.warn(
        `[AI] ${provider.model} skipped — local ${full} budget used up`,
      );
      errors.push(`${provider.model}: ${full} budget used`);
      continue;
    }

    console.log(`[AI] Trying ${provider.name}: ${provider.model}`);
    const started = Date.now();
    const result = await callModel(provider, messages, maxTokens);
    const secs = ((Date.now() - started) / 1000).toFixed(1);

    if (result && result.trim().length > 10) {
      if (options.accept && !options.accept(result)) {
        console.warn(
          `[AI] ${provider.model} answer rejected by validator (${secs}s), trying next...`,
        );
        errors.push(`${provider.model}: rejected by validator`);
        continue;
      }
      console.log(
        `[AI] Success with ${provider.name} (${provider.model}, ${result.length} chars, ${secs}s)`,
      );
      return result;
    }

    console.warn(
      `[AI] ${provider.model} failed after ${secs}s, trying next...`,
    );
    errors.push(
      `${provider.model}: ${result === null ? "API error/timeout" : "empty response"}`,
    );
  }

  throw new Error(
    `All AI models failed — we're currently experiencing heavy load. Please try again later. Errors: ${errors.join("; ")}`,
  );
}

export type { OpenRouterMessage };
