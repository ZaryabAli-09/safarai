import type { Metadata } from "next";

import { buildMetadata } from "@/seo.config";

/** Client-rendered page, so its SEO metadata lives in this server layout. */
export const metadata: Metadata = buildMetadata("trips");

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
