/**
 * Single source of truth for the marketing FAQ.
 *
 * The landing page renders these items and `seo.config.ts` turns the very same
 * list into FAQPage structured data, so the visible copy and the markup Google
 * reads can never drift apart.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How does SafarAI plan trips?",
    a: "SafarAI guides you through your destination, dates, budget, travelers, transport, travel style, pace, accommodation, and interests. It then generates a day-by-day itinerary tailored to your answers.",
  },
  {
    q: "What does a generated trip include?",
    a: "Your trip includes daily activities with descriptions, locations, timing, duration, estimated costs, images, weather details, and map links, along with a budget breakdown, packing list, and travel tips.",
  },
  {
    q: "Can I plan more than one destination?",
    a: "Yes. Add multiple destinations during trip setup and SafarAI will use them when building your itinerary.",
  },
  {
    q: "Does SafarAI show estimated trip costs?",
    a: "Yes. Set your currency and budget during setup. The generated trip includes estimated costs for activities plus a breakdown for accommodation, food, transport, activities, and miscellaneous expenses.",
  },
  {
    q: "What devices does SafarAI support?",
    a: "SafarAI runs in any modern browser on desktop or mobile. Nothing to install.",
  },
];
