import type { FeedSort, IPost } from "@/types/app-types";

/**
 * Query/projection builders for the feed list.
 *
 * Everything lives here so the list endpoint stays readable and the indexes
 * declared on `models/Post.ts` are visibly matched by the queries that use
 * them.
 */

/**
 * Only the fields a card needs. `likes` and `comments` (potentially long
 * arrays) are never shipped to the client: the denormalised counts cover the
 * UI and "did I like this?" is answered by one extra indexed query.
 */
export const FEED_POST_LIST_PROJECTION =
  "description images likeCount commentCount authorId createdAt";

/**
 * Author fields embedded in every feed payload. `avatar` is the same filename
 * the profile page stores, so the feed shows the user's chosen picture.
 */
export const FEED_POST_AUTHOR_FIELDS = "username avatar";

/** Escapes user input so it is safe inside a regex literal. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** "Recent" sorts on the `createdAt` index, "Most Liked" on `likeCount`. */
export function buildFeedSort(sort: FeedSort): Record<string, 1 | -1> {
  return sort === "most-liked"
    ? { likeCount: -1, createdAt: -1 }
    : { createdAt: -1 };
}

export interface FeedQueryPair {
  /** Uses the `{ description: "text" }` index. */
  primary: Record<string, unknown>;
  /**
   * Regex equivalent, only used if the text index has not finished building
   * yet (fresh database / first query after deploy).
   */
  fallback: Record<string, unknown> | null;
}

export function buildFeedQueries(searchTerm: string): FeedQueryPair {
  if (!searchTerm) return { primary: {}, fallback: null };

  return {
    primary: { $text: { $search: searchTerm } },
    fallback: { description: { $regex: escapeRegex(searchTerm), $options: "i" } },
  };
}

/** True for MongoDB's "text index required for $text query" error. */
export function isMissingTextIndexError(error: unknown): boolean {
  const mongoError = error as { code?: number; message?: string } | null;
  return (
    mongoError?.code === 27 || // IndexNotFound
    /text index required/i.test(mongoError?.message ?? "")
  );
}

/** The persisted projection of a post used by the list/detail endpoints. */
export type FeedPostProjection = Pick<
  IPost,
  | "description"
  | "images"
  | "likeCount"
  | "commentCount"
  | "authorId"
  | "createdAt"
> & { _id: unknown };

export function extractPublicIds(images?: { publicId?: string }[]): string[] {
  return (images ?? [])
    .map((image) => image.publicId)
    .filter((id): id is string => Boolean(id));
}
