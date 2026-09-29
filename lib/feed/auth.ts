import { getServerSession } from "next-auth";
import type { NextResponse } from "next/server";

import { authOptions } from "@/config/authOptions";
import { response } from "@/lib/helperFunctions";

/**
 * Reuses the app's existing NextAuth session for every feed endpoint — the
 * same `getServerSession(authOptions)` pattern the other API routes use, so
 * there is no second auth mechanism to keep in sync.
 */
export type FeedAuthResult =
  | { ok: true; userId: string }
  | { ok: false; unauthorized: NextResponse };

export async function requireFeedUser(): Promise<FeedAuthResult> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;

  if (!userId) {
    return { ok: false, unauthorized: response(false, 401, "Please sign in") };
  }

  return { ok: true, userId };
}
