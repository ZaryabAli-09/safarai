import { PROFILE_AVATARS_DIR } from "@/lib/feed/config";
import type {
  FeedAuthor,
  FeedCommentItem,
  FeedPost,
  IPostImage,
} from "@/types/app-types";

/**
 * Turns lean Mongoose documents into the exact payloads the feed UI expects.
 *
 * Mongoose's `lean()` + `populate()` typings cannot express "this ObjectId has
 * been replaced by a user document", so callers cast to the `*Input` types
 * below — that keeps every shape decision in one place instead of sprinkling
 * `as any` through the route handlers.
 */

/** A user document as embedded on a post/comment. */
export interface PopulatedAuthorInput {
  _id: unknown;
  username?: string | null;
  avatar?: string | null;
}

export interface PopulatedPostInput {
  _id: unknown;
  description?: string | null;
  images?: IPostImage[] | null;
  likeCount?: number | null;
  commentCount?: number | null;
  likes?: unknown[] | null;
  comments?: unknown[] | null;
  authorId: PopulatedAuthorInput | string | null;
  createdAt?: Date | string | null;
}

export interface PopulatedCommentInput {
  _id: unknown;
  postId: unknown;
  text?: string | null;
  authorId: PopulatedAuthorInput | string | null;
  createdAt?: Date | string | null;
}

const UNKNOWN_AUTHOR: FeedAuthor = {
  _id: "",
  username: "SafarAI traveller",
  avatarUrl: "",
};

/**
 * The feed never uploads or stores avatars — it renders the same `user.avatar`
 * filename the profile page uses, so both screens always show the same picture.
 * An empty result means "no avatar chosen": components show initials instead.
 */
function resolveAvatarUrl(avatar?: string | null): string {
  const value = avatar?.trim();
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("/")) return value;
  return `${PROFILE_AVATARS_DIR}/${value}`;
}

/** ObjectId (or populated document) → string id. */
function toId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const withToString = value as { toString?: () => string };
  return typeof withToString.toString === "function"
    ? withToString.toString()
    : "";
}

function toIso(value?: Date | string | null): string {
  const date = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

export function toFeedAuthor(
  author?: PopulatedAuthorInput | string | null,
): FeedAuthor {
  if (!author || typeof author === "string") {
    return { ...UNKNOWN_AUTHOR, _id: toId(author) };
  }

  return {
    _id: toId(author._id),
    username: author.username?.trim() || UNKNOWN_AUTHOR.username,
    avatarUrl: resolveAvatarUrl(author.avatar),
  };
}

/**
 * @param likedPostIds ids the current user liked, resolved once per page with
 *        a single indexed query instead of shipping every post's `likes` array.
 */
export function toFeedPost(
  post: PopulatedPostInput,
  currentUserId: string,
  likedPostIds: Set<string> = new Set(),
): FeedPost {
  const postId = toId(post._id);

  return {
    _id: postId,
    description: post.description ?? "",
    images: post.images ?? [],
    // `likes`/`comments` stay the source of truth; the counters are the fast
    // path and the array length is the self-healing fallback.
    likeCount: Math.max(0, post.likeCount ?? post.likes?.length ?? 0),
    commentCount: Math.max(0, post.commentCount ?? post.comments?.length ?? 0),
    likedByMe: likedPostIds.has(postId),
    isOwner: toId(post.authorId) === currentUserId,
    createdAt: toIso(post.createdAt),
    author: toFeedAuthor(post.authorId),
  };
}

export function toFeedCommentItem(
  comment: PopulatedCommentInput,
  currentUserId: string,
): FeedCommentItem {
  return {
    _id: toId(comment._id),
    postId: toId(comment.postId),
    text: comment.text ?? "",
    createdAt: toIso(comment.createdAt),
    isOwner: toId(comment.authorId) === currentUserId,
    author: toFeedAuthor(comment.authorId),
  };
}
