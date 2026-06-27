// OpenRouter AI Configuration
// Uses free models: NVIDIA Nemotron (primary) + Meta Llama (fallback)

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
  }[];
}

const PRIMARY_MODEL = "nvidia/llama-3.1-nemotron-ultra-253b:free";
const FALLBACK_MODEL = "meta-llama/llama-4-maverick:free";

async function callOpenRouter(
  messages: OpenRouterMessage[],
  model: string,
): Promise<string | null> {
  try {
    const res = await fetch(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Safar AI",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!res.ok) {
      console.error(`OpenRouter error (${model}):`, res.status, await res.text());
      return null;
    }

    const data: OpenRouterResponse = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error(`OpenRouter call failed (${model}):`, error);
    return null;
  }
}

/**
 * Generate AI completion with automatic fallback.
 * Tries primary model first, then falls back to secondary model.
 */
export async function generateAICompletion(
  messages: OpenRouterMessage[],
): Promise<string> {
  // Try primary model
  const primaryResult = await callOpenRouter(messages, PRIMARY_MODEL);
  if (primaryResult) return primaryResult;

  // Try fallback model
  const fallbackResult = await callOpenRouter(messages, FALLBACK_MODEL);
  if (fallbackResult) return fallbackResult;

  throw new Error("All AI models failed to generate a response");
}

export { PRIMARY_MODEL, FALLBACK_MODEL };
export type { OpenRouterMessage };
