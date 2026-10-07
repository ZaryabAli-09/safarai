// Diagnostic: call OpenRouter with the EXACT params used by config/ai.ts and
// report finish_reason, reasoning token usage, and content shape.
const fs = require("fs");
const env = fs.readFileSync("d:/Development/safarai/.env", "utf8");
const key = (env.match(/^OPENROUTER_API_KEY=(.*)$/m) || [])[1]?.trim();
if (!key) {
  console.error("no key");
  process.exit(1);
}

const params = {
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  messages: [
    {
      role: "system",
      content:
        'You are a JSON-only travel planner. Return only valid JSON. Do not use markdown or explanatory text.\n\nReturn this shape:\n{"itinerary": [{"dayNumber": 1, "date": "YYYY-MM-DD", "title": "Day title", "location": "City/Area", "activities": [{"id": "act1", "timeOfDay": "morning", "title": "Activity name", "description": "2-3 sentence description", "venue": "Specific real place", "city": "City name", "country": "Country name", "estimatedCost": "20-30 EUR", "duration": "2 hours", "category": "sightseeing"}]}], "summary": {"totalDays": 0}, "budgetBreakdown": {"accommodation": 0, "food": 0, "transport": 0, "activities": 0, "miscellaneous": 0, "total": 0, "currency": "EUR"}, "packingList": ["item1"], "travelTips": ["tip1"], "aiNotes": "Brief notes"}\n\nRules: create three activities per full day for a 4-day trip to Paris from Karachi.',
    },
  ],
  temperature: 0.4,
  max_tokens: 8000,
  reasoning: { exclude: true },
  response_format: { type: "json_object" },
};

(async () => {
  const res = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Safar AI",
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(120000),
    },
  );
  console.log("HTTP", res.status);
  const data = await res.json();
  if (data.error) {
    console.log("ERROR:", JSON.stringify(data.error).slice(0, 600));
    process.exit(0);
  }
  const choice = data.choices?.[0];
  const msg = choice?.message || {};
  console.log("finish_reason:", choice?.finish_reason);
  console.log("message keys:", Object.keys(msg));
  console.log(
    "usage:",
    JSON.stringify(data.usage?.completion_tokens_details || {}),
  );
  console.log("completion_tokens:", data.usage?.completion_tokens);
  const content = msg.content || "";
  console.log("content length:", content.length);
  console.log("content HEAD:", JSON.stringify(content.slice(0, 300)));
  console.log("content TAIL:", JSON.stringify(content.slice(-300)));
  let ok = false;
  try {
    const parsed = JSON.parse(
      content.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, ""),
    );
    ok = Array.isArray(parsed?.itinerary);
  } catch (e) {
    console.log("JSON.parse error:", e.message);
  }
  console.log("parses with extractJSON-lite:", ok);
})();
