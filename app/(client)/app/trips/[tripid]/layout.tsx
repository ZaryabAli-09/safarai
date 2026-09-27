import type { Metadata } from "next";

import { buildMetadata } from "@/seo.config";

/**
 * Trips (including their itinerary) are private to the signed-in user, so this
 * layout only supplies the per-trip title/canonical and keeps the section
 * out of the index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tripid: string }>;
}): Promise<Metadata> {
  const { tripid } = await params;

  return buildMetadata("tripDetail", {
    alternates: { canonical: `/app/trips/${tripid}` },
  });
}

export default function TripDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
