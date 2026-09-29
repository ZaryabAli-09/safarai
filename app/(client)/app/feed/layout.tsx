import type { Metadata } from "next";

import { buildMetadata } from "@/seo.config";

/** Client-rendered page, so its SEO metadata lives in this server layout. */
export const metadata: Metadata = buildMetadata("feed");

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
