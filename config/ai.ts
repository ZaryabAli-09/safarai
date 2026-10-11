// AI configuration — a two-provider fallback chain.
//
// 1. Groq (own free quota, very fast)          — primary.
// 2. OpenRouter free Nemotron Ultra            — fallback on failure/429.
//
// One attempt per entry, no retries, no sleeping: when both fail, a single
// "heavy load" error is thrown so the route can tell the user to retry.

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
    finish_reason?: string;
  }[];
  error?: {
    message: string;
    code?: number;
  };
}

interface Provider {
  /** Human-readable name for logs. */
  name: string;
  /** OpenAI-compatible chat completions endpoint. */
  baseUrl: string;
  /** Env var holding this provider's key (entry is skipped when unset). */
  apiKeyEnv: string;
  model: string;
  /** Body fields only this provider understands. */
  extraBody?: Record<string, unknown>;
  /** Headers only this provider understands. */
  extraHeaders?: Record<string, string>;
  /** Provider-specific output constraint. */
  responseFormat?: Record<string, unknown>;
  /** Groq uses max_completion_tokens; OpenRouter uses max_tokens. */
  maxCompletionTokens?: number;
}

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
            required: [
              "dayNumber",
              "date",
              "title",
              "location",
              "activities",
            ],
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
    model: "openai/gpt-oss-120b", // strongest free chat model on Groq
    responseFormat: ITINERARY_RESPONSE_SCHEMA,
    maxCompletionTokens: 16000,
  },
  {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKeyEnv: "OPENROUTER_API_KEY",
    model: "nvidia/nemotron-3-ultra-550b-a55b:free", // 550B, 1M ctx — verified JSON
    // Nemotron is a reasoning model. Keep its chain-of-thought out of the
    // returned content so the route receives only the requested JSON.
    extraBody: { reasoning: { exclude: true } },
    extraHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      "X-Title": "Safar AI",
    },
  },
];

async function callModel(
  provider: Provider,
  messages: OpenRouterMessage[],
  maxTokens = 8000,
): Promise<string | null> {
  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) {
    console.warn(
      `[AI] ${provider.name}: ${provider.apiKeyEnv} not set — skipping`,
    );
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s safety net

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
        temperature: 0.4, // Lower temp = more consistent JSON output
        ...(provider.maxCompletionTokens
          ? { max_completion_tokens: provider.maxCompletionTokens }
          : { max_tokens: maxTokens }),
        // Ask compatible models for an object so itinerary responses cannot
        // degrade into a valid but unrelated JSON array.
        response_format:
          provider.responseFormat || { type: "json_object" },
        ...provider.extraBody,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error(
        `${provider.name} error (${provider.model}): ${res.status} - ${errText}`,
      );
      return null;
    }

    const data: ChatCompletionResponse = await res.json();

    // Check for API-level errors
    if (data.error) {
      console.error(
        `${provider.name} API error (${provider.model}):`,
        data.error.message,
      );
      return null;
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content || content.trim() === "") {
      console.error(
        `${provider.name} returned empty content (${provider.model})`,
      );
      return null;
    }

    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason && finishReason !== "stop") {
      console.warn(
        `${provider.name} returned ${finishReason} completion (${provider.model}); JSON may be incomplete`,
      );
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(
          `${provider.name} timeout (${provider.model}) after 90s`,
        );
      } else {
        console.error(
          `${provider.name} call failed (${provider.model}):`,
          error.message,
        );
      }
    }
    return null;
  }
}

/**
 * Generate an AI completion by walking the provider chain once, in order.
 *
 * Each provider gets exactly ONE attempt — a failure (rate limit, timeout,
 * empty body) immediately moves to the next provider. There are no retries
 * and no sleeping: once every provider has been consumed, a single "busy"
 * error is thrown so the caller can tell the user to try again later.
 */
export async function generateAICompletion(
  messages: OpenRouterMessage[],
  maxTokens = 8000,
  options: { skipModels?: readonly string[] } = {},
): Promise<string> {
  const errors: string[] = [];
  const skippedModels = new Set(options.skipModels ?? []);

  for (const provider of PROVIDER_CHAIN) {
    if (skippedModels.has(provider.model)) continue;
    console.log(`[AI] Trying ${provider.name}: ${provider.model}`);

    const result = await callModel(provider, messages, maxTokens);

    if (result && result.trim().length > 10) {
      console.log(
        `[AI] Success with ${provider.name} (${provider.model}, ${result.length} chars)`,
      );
      return result;
    }

    const reason = result === null ? "API error/timeout" : "empty response";
    console.warn(
      `[AI] ${provider.name} (${provider.model}) failed (${reason}), trying next...`,
    );
    errors.push(`${provider.name}/${provider.model}: ${reason}`);
  }

  throw new Error(
    `All AI models failed — we're currently experiencing heavy load. Please try again later. Errors: ${errors.join("; ")}`,
  );
}

export type { OpenRouterMessage };
