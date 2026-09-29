import type { Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*  Database document shapes (mirrors `models/Post.ts` / `models/Comment.ts`)  */
/* -------------------------------------------------------------------------- */

/** A single uploaded asset — the URL for rendering, the id for deletion. */
export interface IPostImage {
  url: string;
  publicId: string;
}

/**
 * Feed post document.
 *
 * `videos` is declared but intentionally never written yet: the schema is
 * already shaped for video support, so enabling it later is a pure addition
 * (no migration, no restructuring).
 */
export interface IPost {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
  description: string;
  images: IPostImage[];
  /** Reserved for future video support — always empty for now. */
  videos: IPostImage[];
  /** Authoritative list of users who liked the post. */
  likes: Types.ObjectId[];
  /** Denormalised mirror of `likes.length`, indexed for the "Most Liked" feed. */
  likeCount: number;
  /** Ids of the post's flat comments (no nesting, no replies). */
  comments: Types.ObjectId[];
  /** Denormalised mirror of `comments.length` so cards need one query only. */
  commentCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Flat comment document — one level only, always attached to one post. */
export interface IComment {
  _id?: Types.ObjectId;
  postId: Types.ObjectId;
  authorId: Types.ObjectId;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* -------------------------------------------------------------------------- */
/*  API response shapes                                                        */
/* -------------------------------------------------------------------------- */

export type FeedSort = "recent" | "most-liked";

/** Filters shared by the desktop sidebar and the mobile filter sheet. */
export interface FeedFilters {
  searchTerm: string;
  sort: FeedSort;
}

/** Minimal author projection embedded in every feed payload. */
export interface FeedAuthor {
  _id: string;
  username: string;
  /** Cloudinary avatar URL, legacy static avatar or the app default. */
  avatarUrl: string;
}

/** A post exactly as the feed endpoints return it (dates as ISO strings). */
export interface FeedPost {
  _id: string;
  description: string;
  images: IPostImage[];
  likeCount: number;
  commentCount: number;
  /** True when the signed-in user is in the post's `likes` array. */
  likedByMe: boolean;
  /** True when the signed-in user authored the post (enables delete). */
  isOwner: boolean;
  createdAt: string;
  author: FeedAuthor;
}

/** A comment as returned by the comment endpoints. */
export interface FeedCommentItem {
  _id: string;
  postId: string;
  text: string;
  createdAt: string;
  isOwner: boolean;
  author: FeedAuthor;
}

/** Cursorless pagination metadata, same shape the trips list uses. */
export interface FeedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
