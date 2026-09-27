import type { MetadataRoute } from "next";

import { ROBOTS_DISALLOW, SITE_URL, absoluteUrl } from "@/seo.config";

/**
 * Served at `/robots.txt`. Private areas (`/app`, `/admin`, `/api`) and the
 * password utility pages are disallowed; the public marketing and auth pages
 * stay crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ROBOTS_DISALLOW,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
