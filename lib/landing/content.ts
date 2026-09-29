/**
 * Landing page content — the single place to edit everything a visitor reads
 * on the homepage.
 *
 * `app/_components/landing/LandingPage.tsx` and
 * `app/_components/navigation/Navbar.tsx` import from this file and render the
 * data, so changing copy, FAQs, feature cards or legal text never means
 * touching component code.
 *
 * Icons are referenced by key (e.g. "budget") and mapped to lucide components
 * inside LandingPage.tsx, which keeps this file plain, grep-friendly data.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  href: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** Tint palette shared by icon chips (matches the app's brand-muted colors). */
export type Tint = "coral" | "orange" | "yellow" | "purple" | "pink";

export interface FeatureCard {
  icon: string;
  tint: Tint;
  title: string;
  description: string;
}

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/** Footer links are either plain hrefs or actions handled inside the page. */
export interface FooterLink {
  label: string;
  href?: string;
  action?: "email" | "privacy" | "terms";
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                    */
/* -------------------------------------------------------------------------- */

export const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export const NAV_AUTH_LINK: NavLink = { label: "Sign in", href: "/sign-in" };

export const NAV_CTA_LINK: NavLink = {
  label: "Start planning free",
  href: "/app",
};

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export const HERO = {
  badge: "Now live. Free AI trip planner.",
  titleLine1: "Plan your next trip",
  titleAccent: "in under a minute.",
  subtitle:
    "Tell SafarAI where you are going, when, and how you like to travel. You get back a day by day itinerary with estimated costs, weather, map links, a packing list and practical tips.",
  primaryCta: { label: "Start planning free", href: "/app" },
  secondaryCta: { label: "See how it works", href: "#how-it-works" },
  trustPoints: [
    "Free to start",
    "No credit card needed",
    "Works on desktop and phone",
  ],
};

/** Slow scrolling strip shown right under the hero. */
export const CAPABILITY_STRIP: string[] = [
  "Day by day itinerary",
  "Budget breakdown",
  "Packing list",
  "Weather outlook",
  "Map links",
  "Travel tips",
  "Multi destination trips",
  "Community feed",
];

/* -------------------------------------------------------------------------- */
/*  Comparison (old way vs SafarAI way)                                       */
/* -------------------------------------------------------------------------- */

export const COMPARISON = {
  eyebrow: "Why SafarAI",
  title: "Trip planning, without the pile of tabs.",
  subtitle:
    "Most trips get planned across five tools that were never meant to work together. SafarAI keeps the whole plan in one place.",
  oldWay: {
    tag: "The usual mess",
    title: "Notes here, bookings there, plans nowhere.",
    description:
      "Research lives in one app, confirmations sit in your inbox, and the itinerary is a spreadsheet you stopped updating last week.",
    tools: [
      "Notes app",
      "Calendar",
      "Inbox",
      "Map pins",
      "A spreadsheet",
      "Twenty browser tabs",
    ],
  },
  newWay: {
    tag: "The SafarAI way",
    title: "One plan, from first idea to packing list.",
    description:
      "Answer a few questions and everything lands in a single trip: your days, costs, weather, maps, packing list and tips.",
    points: [
      "Every day planned with times and stops",
      "Costs estimated before you spend anything",
      "Packing list and tips generated for your trip",
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Features                                                                  */
/* -------------------------------------------------------------------------- */

export const FEATURES = {
  eyebrow: "Features",
  title: "Everything a good trip plan needs.",
  subtitle:
    "One generated trip covers the details you would otherwise piece together yourself.",
  highlight: {
    tag: "Generated for your answers",
    title: "A full itinerary built around your trip.",
    description:
      "Destination, dates, budget, pace and interests go in. A day by day plan comes out, with a description, timing, cost estimate, weather and a map link for every stop.",
    bullets: [
      "Activities scheduled across the whole trip",
      "Cost estimates per stop and per day",
      "Weather, maps and travel tips included",
    ],
    /** Small summary cards shown next to the highlight copy. */
    miniCards: [
      {
        icon: "itinerary",
        tint: "coral" as Tint,
        label: "Itinerary",
        meta: "5 days, 14 stops",
      },
      {
        icon: "budget",
        tint: "orange" as Tint,
        label: "Budget",
        meta: "$1,240 estimate",
      },
      {
        icon: "packing",
        tint: "purple" as Tint,
        label: "Packing list",
        meta: "22 items",
      },
    ],
  },
  cards: [
    {
      icon: "budget",
      tint: "coral" as Tint,
      title: "Budget breakdown",
      description:
        "See how your money spreads across stays, food, transport and activities before you book anything.",
    },
    {
      icon: "packing",
      tint: "orange" as Tint,
      title: "Packing list",
      description:
        "A checklist built for your destination, the season and the activities actually in your plan.",
    },
    {
      icon: "tips",
      tint: "yellow" as Tint,
      title: "Travel tips",
      description:
        "Practical notes on visas, currency, safety and getting around, saved next to your trip.",
    },
    {
      icon: "weather",
      tint: "purple" as Tint,
      title: "Weather outlook",
      description:
        "Expected conditions for your travel dates, shown right next to the days you planned.",
    },
    {
      icon: "maps",
      tint: "pink" as Tint,
      title: "Map links",
      description:
        "Every stop links straight to Google Maps, so getting there is one tap away.",
    },
    {
      icon: "trips",
      tint: "coral" as Tint,
      title: "Trips in one place",
      description:
        "All your trips in a single dashboard, with search and filters for duration, status and destination.",
    },
    {
      icon: "feed",
      tint: "orange" as Tint,
      title: "Community feed",
      description:
        "Share your finished trips and take ideas from plans other travelers generated.",
    },
    {
      icon: "phone",
      tint: "purple" as Tint,
      title: "Installs on your phone",
      description:
        "SafarAI is a progressive web app, so you can add it to your home screen and open it like any other app.",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  How it works                                                              */
/* -------------------------------------------------------------------------- */

export const HOW_IT_WORKS = {
  eyebrow: "How it works",
  title: "Three steps between an idea and an itinerary.",
  subtitle:
    "You already know most of the answers. The rest takes a couple of minutes.",
  steps: [
    {
      n: "01",
      icon: "form",
      preview: "form" as const,
      title: "Describe your trip",
      description:
        "Destination, dates, budget, travelers and travel style. A short form, nothing you have to research first.",
    },
    {
      n: "02",
      icon: "generating",
      preview: "generating" as const,
      title: "SafarAI builds the plan",
      description:
        "Your answers turn into a complete day by day itinerary, usually in under a minute.",
    },
    {
      n: "03",
      icon: "review",
      preview: "review" as const,
      title: "Read it, save it, go",
      description:
        "Open each day for stops, costs, weather and maps, then keep the trip in your dashboard for whenever you need it.",
    },
  ],
};

/** Mini UI snippets rendered inside the how-it-works cards. */
export const STEP_PREVIEWS = {
  form: {
    chips: ["Ubud, Bali", "May 12 to 17", "$1,200 budget", "Relaxed pace"],
    summary: "5 days, 2 travelers, culture and food",
  },
  generating: {
    label: "Building your itinerary",
    steps: [
      "Laying out your days",
      "Adding costs and weather",
      "Writing travel tips",
    ],
    progress: 64,
  },
  review: {
    date: "Tuesday, May 13",
    rows: [
      { time: "09:00", label: "Tegallalang Rice Terraces", active: false },
      { time: "13:00", label: "Lunch at Locavore", active: true },
      { time: "16:30", label: "Sacred Monkey Forest", active: false },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const FAQ = {
  eyebrow: "Questions",
  title: "Frequently asked questions",
  items: [
    {
      q: "Is SafarAI free to use?",
      a: "Yes, you can plan trips for free. Create an account, generate your itinerary and use the whole app without entering a card.",
    },
    {
      q: "How does SafarAI plan my trip?",
      a: "You fill in a short form about your destination, dates, budget and travel style. SafarAI turns those answers into a day by day plan with activities, costs and practical details for each day.",
    },
    {
      q: "What comes with a generated trip?",
      a: "Every day of your trip with scheduled stops, descriptions, locations, cost estimates and weather, plus a budget breakdown, a packing list and travel tips.",
    },
    {
      q: "Can I plan a trip with more than one destination?",
      a: "Yes. Add as many destinations as you need during setup and the plan will cover all of them in the order you set.",
    },
    {
      q: "Does SafarAI book flights or hotels?",
      a: "No. SafarAI is a planning tool. It gives you the plan and the details, and you book flights and stays wherever you prefer.",
    },
    {
      q: "How accurate are the cost estimates?",
      a: "They are realistic estimates, not quotes. Use them to set a budget, then confirm actual prices with the providers you book with.",
    },
    {
      q: "Does it work on my phone?",
      a: "Yes. SafarAI runs in any modern browser, and you can install it on your phone from the browser menu so it opens like a normal app.",
    },
    {
      q: "Do I need an account?",
      a: "A free account keeps your trips saved so you can reopen them later. Creating one takes about a minute.",
    },
  ] as FaqItem[],
  stillHaveAQuestion: "Still have a question?",
  reachOutLabel: "Reach out",
  replyNote: "and we will reply within a day.",
};

/* -------------------------------------------------------------------------- */
/*  Contact                                                                   */
/* -------------------------------------------------------------------------- */

export const CONTACT = {
  eyebrow: "Contact",
  title: "Talk to the people building it.",
  body: "Questions, bug reports, feature ideas, or a plan that got something wrong. Write to us and a human will read it. We usually reply within a day.",
  buttonLabel: "Email us",
  /** Appended to the mailto link so the message arrives pre titled. */
  mailSubject: "Question about SafarAI",
  addressLabel: "You can reach us directly at",
};

/* -------------------------------------------------------------------------- */
/*  Legal (shown in the footer popup)                                         */
/* -------------------------------------------------------------------------- */

export type LegalKind = "privacy" | "terms";

export const LEGAL: Record<LegalKind, LegalDoc> = {
  privacy: {
    title: "Privacy policy",
    updated: "Last updated September 2026",
    intro:
      "This policy covers what we collect on SafarAI and why. It is written in plain language on purpose.",
    sections: [
      {
        heading: "What we collect",
        body: "When you create an account we store your name, email address and a hashed version of your password. The trips you create, including the destinations, dates and preferences you enter, are stored so you can reopen and edit them later.",
      },
      {
        heading: "What we do not do",
        body: "We do not sell your data and we do not share your trip details with advertisers.",
      },
      {
        heading: "Analytics",
        body: "We use Vercel Web Analytics to see which pages people visit and how the site performs. It collects anonymous, aggregate pageview statistics and does not build advertising profiles.",
      },
      {
        heading: "AI processing",
        body: "Trip plans are generated by an AI provider. Your trip inputs are sent to that provider so it can produce the itinerary, and the result is stored with your account.",
      },
      {
        heading: "Your data",
        body: "You can ask us to delete your account and everything attached to it at any time. Just email us at the address on this page and we will take care of it.",
      },
      {
        heading: "Changes to this policy",
        body: "If the way we handle data changes, we will update this page and note the date above.",
      },
    ],
  },
  terms: {
    title: "Terms of service",
    updated: "Last updated September 2026",
    intro:
      "A short, readable version of the terms for using SafarAI. By creating an account you agree to these.",
    sections: [
      {
        heading: "The service",
        body: "SafarAI is a trip planning tool. It generates itineraries, budgets and packing lists to help you prepare for a trip. It is not a travel agency and does not sell flights, hotels, tickets or any other travel product.",
      },
      {
        heading: "AI generated content",
        body: "Plans, costs, weather summaries and tips are generated automatically and can be wrong or out of date. Treat them as a starting point and confirm prices, opening hours, visa rules and safety advice with official sources before you travel.",
      },
      {
        heading: "Accounts",
        body: "You are responsible for the account you create and for keeping your login details to yourself. Tell us right away if you notice any misuse.",
      },
      {
        heading: "Acceptable use",
        body: "Use SafarAI for your own trip planning. Do not try to break the service, scrape it at scale, or post unlawful or harmful content through shared features like the feed.",
      },
      {
        heading: "Your content",
        body: "The trips you create stay yours. You give us permission to store them so the product can work as intended.",
      },
      {
        heading: "Availability",
        body: "The service may change or go down while we improve it. We work to keep it reliable, but for now it is provided as is without guarantees.",
      },
      {
        heading: "Contact",
        body: "Questions about these terms? Email us using the address on this page and we will get back to you.",
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/*  Final CTA                                                                 */
/* -------------------------------------------------------------------------- */

export const FINAL_CTA = {
  eyebrow: "Ready when you are",
  title: "Your next trip is a few answers away.",
  subtitle:
    "Generate a full day by day plan with costs, weather, maps and a packing list, then read it over until it feels like yours.",
  buttonLabel: "Start planning free",
  notes: ["Free to start", "No credit card needed"],
};

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

export const FOOTER = {
  tagline: "A calmer way to plan trips, powered by AI.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it works", href: "#how-it-works" },
        { label: "FAQ", href: "#faq" },
        { label: "Sign in", href: "/sign-in" },
      ] as FooterLink[],
    },
    {
      title: "Contact",
      links: [
        { label: "Email us", action: "email" },
        { label: "Contact section", href: "#contact" },
      ] as FooterLink[],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy policy", action: "privacy" },
        { label: "Terms of service", action: "terms" },
      ] as FooterLink[],
    },
  ],
  engineeredBy: "Engineered by Zaryab Ali",
};

/* -------------------------------------------------------------------------- */
/*  Hero product preview                                                      */
/*                                                                           */
/*  Mirrors the real trip screen (app/(client)/app/trips/[tripid]): sticky   */
/*  top bar, "Day by day" rail, trip tools, and a day panel with activity    */
/*  meta rows. Keep this data in sync with how the app actually looks.       */
/* -------------------------------------------------------------------------- */

export const TRIP_PREVIEW = {
  url: "safarai.app/app/trips/bali-slow-days",
  name: "Bali, slow days",
  status: "Ready",
  route: "Jakarta to Ubud, Seminyak",
  dates: "May 12 to 17",
  summary: { days: "5 days", stops: "14 stops" },
  days: [
    { n: 1, title: "Arrival and Seminyak", meta: "3 stops, May 12" },
    { n: 2, title: "Ubud in a day", meta: "4 stops, May 13", active: true },
    { n: 3, title: "Temples and the coast", meta: "3 stops, May 14" },
    { n: 4, title: "A slow day in Canggu", meta: "2 stops, May 15" },
    { n: 5, title: "Flying home", meta: "2 stops, May 16" },
  ],
  tools: [
    { icon: "budget", tint: "coral" as Tint, label: "Budget breakdown", meta: "$1,240 total" },
    { icon: "packing", tint: "orange" as Tint, label: "Packing list", meta: "8 of 22 packed" },
    { icon: "tips", tint: "yellow" as Tint, label: "Travel tips", meta: "12 saved" },
  ],
  day: {
    heading: "Day 2 of 5",
    title: "Ubud in a day",
    date: "Tuesday, May 13",
    activities: [
      {
        time: "08:30",
        title: "Tegallalang Rice Terraces",
        place: "Tegallalang",
        cost: "$5 entry",
        weather: "Clear, 27°C",
        tone: "morning",
        active: false,
      },
      {
        time: "13:00",
        title: "Lunch at Locavore",
        place: "Central Ubud",
        cost: "$18",
        weather: "Partly cloudy, 29°C",
        tone: "afternoon",
        active: true,
      },
      {
        time: "16:30",
        title: "Sacred Monkey Forest",
        place: "Padangtegal",
        cost: "$4 entry",
        weather: "Clear, 26°C",
        tone: "evening",
        active: false,
      },
    ],
  },
};
