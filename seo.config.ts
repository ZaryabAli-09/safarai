/**
 * Centralised SEO + PWA metadata for SafarAI.
 *
 * Every page reads its title/description/OG/Twitter/canonical data from here and
 * `app/sitemap.ts` / `app/robots.ts` derive their output from the same table, so
 * there is exactly one place to edit when copy or routes change.
 *
 * The file is intentionally framework-light: it only imports *types* from Next.js,
 * which means it is safe to import from client components too.
 */
import type { Metadata } from "next";

/* -------------------------------------------------------------------------- */
/*  Site + brand constants                                                    */
/* -------------------------------------------------------------------------- */

export const SITE_NAME = "SafarAI";
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
export const SITE_LOCALE = "en_US";
export const SITE_LANGUAGE = "en";

/** Mirrors `public/manifest.json` → `theme_color`. */
export const PWA_THEME_COLOR = "#654c9e";
/** Mirrors `public/manifest.json` → `background_color`. */
export const PWA_BACKGROUND_COLOR = "#ffffff";
/** Mirrors `public/manifest.json` → `name` / `short_name` / `start_url`. */
export const PWA_NAME = "SafarAI — AI Travel Planner";
export const PWA_SHORT_NAME = "SafarAI";
export const PWA_START_URL = "/app/trips";
export const PWA_DESCRIPTION = "Plan your perfect trip with AI";

export const OG_IMAGE = {
  url: "/assets/pwa-icons/social-share-og-1200x630.jpg",
  width: 1200,
  height: 630,
  alt: "SafarAI — plan your next trip in under a minute",
} as const;

export const ICONS = {
  ico: "/favicon.ico",
  png: "/assets/pwa-icons/browser-tab-96x96.png",
  apple: "/assets/pwa-icons/apple-homescreen-180x180.png",
  icon192: "/assets/pwa-icons/pwa-android-192x192.png",
  icon512: "/assets/pwa-icons/pwa-splash-512x512.png",
  maskable512: "/assets/pwa-icons/pwa-maskable-512x512.png",
} as const;

/** Routes that must never be crawled. Used by `app/robots.ts`. */

/* -------------------------------------------------------------------------- */
/*  Per-page metadata table                                                   */
/* -------------------------------------------------------------------------- */

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface PageSeo {
  /** Route path, used for the canonical URL and the sitemap. */
  path: string;
  /** Short title; the root layout template appends " | SafarAI". */
  title: string;
  /** Set when the page needs a fully custom <title> (no template). */
  absoluteTitle?: string;
  /** Overrides the OG/Twitter title when it should differ from the <title>. */
  socialTitle?: string;
  description: string;
  keywords: string[];
  /** Private or utility pages stay out of the index and out of the sitemap. */
  noindex?: boolean;
  /** Include this page in `app/sitemap.ts`. */
  sitemap?: boolean;
  changeFrequency?: SitemapChangeFrequency;
  priority?: number;
}

export const PAGE_SEO = {
  home: {
    path: "/",
    title: "Plan your next trip in under a minute",
    absoluteTitle: "SafarAI | Plan your next trip in under a minute",
    description:
      "SafarAI turns a few travel preferences into a complete, editable itinerary in seconds. Set your destination, dates, budget and interests — then get a day-by-day plan, budget breakdown and packing list.",
    keywords: [
      "AI trip planner",
      "travel itinerary planner",
      "AI itinerary generator",
      "vacation planning",
      "travel planning app",
      "trip budget planner",
    ],
    sitemap: true,
    changeFrequency: "weekly",
    priority: 1,
  },
  signIn: {
    path: "/sign-in",
    title: "Sign in",
    description:
      "Sign in to SafarAI to open your saved trips, keep editing your itineraries and generate new ones with AI.",
    keywords: [
      "SafarAI sign in",
      "AI trip planner login",
      "travel planner account",
    ],
    sitemap: true,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  register: {
    path: "/register",
    title: "Create your account",
    description:
      "Create a free SafarAI account to save every itinerary, plan unlimited trips with AI and keep your travel details in one place.",
    keywords: [
      "SafarAI sign up",
      "free AI trip planner account",
      "create travel planner account",
    ],
    sitemap: true,
    changeFrequency: "monthly",
    priority: 0.5,
  },
  forgotPassword: {
    path: "/forgot-password",
    title: "Reset your password",
    description:
      "Enter the email address linked to your SafarAI account and we will send you a secure password reset link.",
    keywords: ["SafarAI password reset", "forgot password"],
    noindex: true,
  },
  resetPassword: {
    path: "/reset-password",
    title: "Set a new password",
    description:
      "Choose a new password for your SafarAI account to regain access to your saved trips.",
    keywords: ["SafarAI new password"],
    noindex: true,
  },
  trips: {
    path: "/app/trips",
    title: "My Trips",
    description:
      "Browse, filter and continue planning every trip you have generated with SafarAI.",
    keywords: ["my trips", "AI itinerary library"],
    noindex: true,
  },
  newTrip: {
    path: "/app/new-trip",
    title: "Plan a new trip",
    description:
      "Tell SafarAI where you are going and what you enjoy, and get a personalised day-by-day itinerary in seconds.",
    keywords: ["plan a trip", "generate itinerary"],
    noindex: true,
  },
  profile: {
    path: "/app/profile",
    title: "Profile",
    description:
      "Manage your SafarAI profile, travel preferences and account details.",
    keywords: ["travel profile", "account settings"],
    noindex: true,
  },
  tripDetail: {
    path: "/app/trips",
    title: "Trip itinerary",
    description:
      "Your full day-by-day SafarAI itinerary with activities, costs and maps.",
    keywords: ["trip itinerary", "day by day travel plan"],
    noindex: true,
  },
  admin: {
    path: "/admin",
    title: "Admin dashboard",
    description: "SafarAI operational dashboard for administrators.",
    keywords: ["SafarAI admin"],
    noindex: true,
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof PAGE_SEO;

/* -------------------------------------------------------------------------- */
/*  Metadata builders                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Builds the complete `Metadata` object for a page defined in `PAGE_SEO`.
 * Pass `overrides` to extend or replace individual fields (e.g. a dynamic title).
 */
export function buildMetadata(
  key: PageKey,
  overrides: Metadata = {},
): Metadata {
  const page: PageSeo = PAGE_SEO[key];
  const socialTitle = page.socialTitle ?? page.absoluteTitle ?? page.title;

  return {
    title: page.absoluteTitle ? { absolute: page.absoluteTitle } : page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      url: absoluteUrl(page.path),
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title: socialTitle,
      description: page.description,
      images: [
        {
          url: OG_IMAGE.url,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: OG_IMAGE.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: [OG_IMAGE.url],
    },
    robots: page.noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    ...overrides,
  };
}

/** Sitemap entries for every page flagged with `sitemap: true`. */
export function buildSitemapEntries() {
  const lastModified = new Date();
  const pages: PageSeo[] = Object.values(PAGE_SEO);

  return pages
    .filter((page) => page.sitemap)
    .map((page) => ({
      url: absoluteUrl(page.path),
      lastModified,
      changeFrequency: page.changeFrequency ?? "monthly",
      priority: page.priority ?? 0.5,
    }));
}

/* -------------------------------------------------------------------------- */
/*  Structured data (JSON-LD)                                                 */
/* -------------------------------------------------------------------------- */

export type JsonLdObject = Record<string, unknown>;

export const organizationJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  logo: absoluteUrl(ICONS.icon512),
  description: PAGE_SEO.home.description,
});

export const webSiteJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: PWA_SHORT_NAME,
  url: absoluteUrl("/"),
  description: PAGE_SEO.home.description,
  inLanguage: SITE_LANGUAGE,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
  },
});

export const softwareApplicationJsonLd = (): JsonLdObject => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "TravelApplication",
  operatingSystem: "Web",
  url: absoluteUrl("/"),
  description: PAGE_SEO.home.description,
  image: absoluteUrl(OG_IMAGE.url),
  inLanguage: SITE_LANGUAGE,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "AI generated day-by-day itineraries",
    "Multi-destination trip planning",
    "Estimated activity and trip budget breakdown",
    "Weather, map links and packing lists per trip",
    "Editable itineraries with saved trips",
  ],
});

export const ROBOTS_DISALLOW = [
  "/api/",
  "/admin",
  "/app/",
  "/forgot-password",
  "/reset-password",
];

/**
 * Absolute URL helper — Next.js needs absolute values for metadata consumed
 * outside the rendered document (OG images, JSON-LD, sitemap entries).
 */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
