// OpenRouter AI Configuration
// Uses verified free models with automatic fallback

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
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

/**
 * Free models on OpenRouter, verified available with JSON output (tested
 * 2026-10). Ordered by quality/reliability for JSON generation tasks.
 * Free models rate-limit often — the fallback chain + retries are essential.
 */
const FREE_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free", // 550B, 1M ctx — verified JSON
  "nvidia/nemotron-3-super-120b-a12b:free", // 120B, 1M ctx — verified JSON
  "nvidia/nemotron-3.5-lightning:free", // 1M ctx, fast — may need JSON extraction
  "google/gemma-4-31b-it:free", // strong instruct fallback (transient 429s)
  "poolside/laguna-s-2.1:free", // 262K ctx fallback
  "openrouter/free", // auto-router: whatever free model is up right now
];

async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string,
  maxTokens = 8000,
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

    const res = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        "X-Title": "Safar AI",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4, // Lower temp = more consistent JSON output
        max_tokens: maxTokens,
        // Nemotron is a reasoning model. Keep its chain-of-thought out of the
        // returned content so the route receives only the requested JSON.
        reasoning: { exclude: true },
        // Ask compatible models for an object so itinerary responses cannot
        // degrade into a valid but unrelated JSON array.
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`OpenRouter error (${model}): ${res.status} - ${errText}`);
      return null;
    }

    const data: OpenRouterResponse = await res.json();

    // Check for API-level errors
    if (data.error) {
      console.error(`OpenRouter API error (${model}):`, data.error.message);
      return null;
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content || content.trim() === "") {
      console.error(`OpenRouter returned empty content (${model})`);
      return null;
    }

    const finishReason = data.choices?.[0]?.finish_reason;
    if (finishReason && finishReason !== "stop") {
      console.warn(
        `OpenRouter returned ${finishReason} completion (${model}); JSON may be incomplete`,
      );
    }

    return content;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(`OpenRouter timeout (${model}) after 90s`);
      } else {
        console.error(`OpenRouter call failed (${model}):`, error.message);
      }
    }
    return null;
  }
}

/**
 * Generate AI completion with automatic fallback through multiple models.
 * Tries each model in order until one succeeds.
 * Includes retry logic with delay between attempts.
 */
export async function generateAICompletion(
  messages: OpenRouterMessage[],
  maxTokens = 8000,
  options: { skipModels?: readonly string[] } = {},
): Promise<string> {
  const errors: string[] = [];
  const skippedModels = new Set(options.skipModels ?? []);

  for (const model of FREE_MODELS) {
    if (skippedModels.has(model)) continue;
    console.log(`[AI] Trying model: ${model}`);

    const result = await callOpenRouter(messages, model, maxTokens);

    if (result && result.trim().length > 10) {
      console.log(`[AI] Success with model: ${model} (${result.length} chars)`);
      return result;
    }

    const reason = result === null ? "API error/timeout" : "empty response";
    console.warn(`[AI] Model ${model} failed (${reason}), trying next...`);
    errors.push(`${model}: ${reason}`);

    // Small delay between model attempts — free models rate-limit in
    // per-minute windows, so give the window a chance to recover.
    await new Promise((r) => setTimeout(r, 2500));
  }

  throw new Error(
    `All AI models failed. Errors: ${errors.join("; ")}. Please try again in a moment.`,
  );
}

export type { OpenRouterMessage };
