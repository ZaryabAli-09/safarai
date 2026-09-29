import type { FeedFilters, FeedSort } from "@/types/feed-types";

/**
 * Single source of truth for every limit, folder and label used by the feed
 * feature (API routes, validation and UI all import from here).
 *
 * This file must stay free of server-only imports — it is imported by client
 * components too, so the Cloudinary SDK lives in `config/cloudinary.ts`
 * instead.
 */

/** Posts fetched per feed page (infinite scroll loads one page at a time). */
export const FEED_PAGE_SIZE = 10;

/** Hard ceiling so a hand-crafted `?limit=` cannot request the whole table. */
export const FEED_MAX_PAGE_SIZE = 50;

/** Multi-image posts work like Instagram's carousel, capped at 10 images. */
export const MAX_IMAGES_PER_POST = 10;

/** Rejected above this size (per file). */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_SIZE_LABEL = "10MB";

export const MAX_DESCRIPTION_LENGTH = 2200;
export const MAX_COMMENT_LENGTH = 1000;

/** Captions longer than this collapse behind a "more..." control. */
export const CAPTION_TRUNCATE_LENGTH = 140;

/** Comments are a flat list; older threads are paged by this window. */
export const MAX_COMMENTS_PER_POST = 200;

/**
 * Static, never-uploaded fallback avatar. Anything served from `/public` is
 * never deleted from Cloudinary because it does not exist there.
 */
export const DEFAULT_AVATAR_PATH = "/assets/pwa-icons/browser-tab-96x96.png";

/** Where the pre-feed profile avatars live (legacy `user.avatar` filenames). */
export const LEGACY_AVATAR_DIR = "/assets/profile-avatars";

/** Cloudinary folders. */
export const POST_IMAGES_FOLDER = "safarai/posts-img";
export const PROFILE_IMAGES_FOLDER = "safarai/profile-img";

/** Feed filters exposed in the sidebar and the mobile filter sheet. */
export const FEED_SORT_OPTIONS: { value: FeedSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "most-liked", label: "Most Liked" },
];

/** Reset target for the sidebar's "Clear" action and the feed's initial state. */
export const DEFAULT_FEED_FILTERS: FeedFilters = {
  searchTerm: "",
  sort: "recent",
};

/** Number of placeholder cards rendered while the feed loads. */
export const FEED_SKELETON_COUNT = 3;
