import type { Metadata } from "next";

import { buildMetadata } from "@/seo.config";

/** Client-rendered page, so its SEO metadata lives in this server layout. */
export const metadata: Metadata = buildMetadata("profile");

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
