// Reproduce the app's EXACT system prompt from ai-pipeline.ts and call
// OpenRouter with config/ai.ts params to test the truncation hypothesis.
const fs = require("fs");
const env = fs.readFileSync("d:/Development/safarai/.env", "utf8");
const key = (env.match(/^OPENROUTER_API_KEY=(.*)$/m) || [])[1]?.trim();

// Extract the systemMessage template literal from the pipeline source.
const src = fs.readFileSync(
  "d:/Development/safarai/lib/services/ai-pipeline.ts",
  "utf8",
);
const startAnchor = "content: `You are a JSON-only travel planner.";
const start = src.indexOf(startAnchor);
const tick = start + "content: ".length; // position of the opening backtick
const end = src.indexOf("`", tick + 1); // first backtick AFTER it
if (start === -1 || end === -1) {
  console.error("template not found");
  process.exit(1);
}
const template = src.slice(tick + 1, end);
// Evaluate with a Proxy trip so every ${trip.x} resolves to a plausible value.
const trip = new Proxy(
  {
    currency: "EUR",
    origin: { name: "Karachi", country: "Pakistan" },
    outbound: "flight",
    arrivalTime: "morning",
    stayLevel: "mid-range",
    adults: 2,
    children: 0,
    duration: 7,
    interests: ["History", "Architecture", "Museums", "Food & Cuisine"],
  },
  { get: (t, p) => (p in t ? t[p] : "sample") },
);
const groundBudget = 1900;
const nights = 6;
const perDay = 271;
const fxRate = 1.08;
// eslint-disable-next-line no-new-func
const systemContent = new Function(
  "trip",
  "groundBudget",
  "nights",
  "perDay",
  "fxRate",
  `return \`${template}\`;`,
)(trip, groundBudget, nights, perDay, fxRate);

console.log("system prompt length:", systemContent.length);

// Realistic user brief of similar size to buildTripBrief output.
const userContent = [
  "- Starting location: Karachi (Pakistan)",
  "- Long-distance transport: flight",
  "- Destinations: Paris",
  "- Dates: 2026-11-20 to 2026-11-26 (7 days, 6 night(s))",
  "- Arrival time: morning (6am-11am)",
  "- Departure time: evening (5pm-9pm)",
  "- Travelers: 2 adult(s), 0 child(ren), 0 pet(s)",
  "- Styles: Cultural & Heritage",
  "- Interests: History, Architecture, Museums, Food & Cuisine",
  "- Pace: moderate",
  "- Stay level: mid-range",
  "- Local transport: public",
  "- Budget: 2500 EUR (approximately 2700 USD)",
  "- Ground-trip budget (everything except the flight): 1900 EUR — about 271 EUR per day",
  "- FX anchor: 1 USD ≈ 1.08 EUR",
  "- Flights included in budget: yes",
  "- Flight expense: 600 EUR",
  "- Additional notes: First time in Paris, love bakeries and museums.",
  "",
  "Generate the complete JSON itinerary now.",
].join("\n");

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
      body: JSON.stringify({
        model: "nvidia/nemotron-3-ultra-550b-a55b:free",
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
        temperature: 0.4,
        max_tokens: 8000,
        reasoning: { exclude: true },
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(150000),
    },
  );
  console.log("HTTP", res.status);
  const data = await res.json();
  if (data.error) {
    console.log("ERROR:", JSON.stringify(data.error).slice(0, 600));
    return;
  }
  const choice = data.choices?.[0];
  const content = choice?.message?.content || "";
  console.log("finish_reason:", choice?.finish_reason);
  console.log(
    "reasoning_tokens:",
    data.usage?.completion_tokens_details?.reasoning_tokens,
    "| completion_tokens:",
    data.usage?.completion_tokens,
  );
  console.log("content length:", content.length);
  console.log("content TAIL:", JSON.stringify(content.slice(-200)));
  try {
    const parsed = JSON.parse(
      content.replace(/^```(?:json)?\s*/im, "").replace(/\s*```\s*$/im, ""),
    );
    console.log(
      "parses OK, itinerary days:",
      Array.isArray(parsed?.itinerary) ? parsed.itinerary.length : "NOT ARRAY",
    );
  } catch (e) {
    console.log("JSON.parse FAILED:", e.message);
  }
})();
