import type { MetadataRoute } from "next";

import { buildSitemapEntries } from "@/seo.config";

/**
 * Served at `/sitemap.xml`. The entries come from the central SEO table, so a
 * page only has to be flagged with `sitemap: true` in `seo.config.ts`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
