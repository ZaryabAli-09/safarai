import { DEFAULT_AVATAR_PATH, LEGACY_AVATAR_DIR } from "@/config/feed";

/**
 * Avatar URL resolution rules for the feed.
 *
 * Three sources exist in the wild and all of them must render:
 *  1. `avatarUrl` — a Cloudinary URL uploaded through the feed (new field),
 *  2. `avatar`    — the legacy filename of a static image in `/public`,
 *  3. nothing     — the app default, which is also a `/public` asset.
 */
export interface AvatarSource {
  avatarUrl?: string | null;
  avatar?: string | null;
}

const CLOUDINARY_URL = /^https?:\/\/res\.cloudinary\.com\//i;

/** True only for assets this app owns in Cloudinary (never `/public` files). */
export function isCloudinaryManagedAvatar(url?: string | null): boolean {
  return typeof url === "string" && CLOUDINARY_URL.test(url);
}

/**
 * Resolves the best available avatar for a user. Never returns an empty
 * string, so components can render the result directly.
 */
export function resolveAvatarUrl(source?: AvatarSource | null): string {
  const cloudinaryUrl = source?.avatarUrl?.trim();
  if (cloudinaryUrl) return cloudinaryUrl;

  const legacyAvatar = source?.avatar?.trim();
  if (legacyAvatar) {
    if (legacyAvatar.startsWith("http")) return legacyAvatar;
    if (legacyAvatar.startsWith("/")) return legacyAvatar;
    return `${LEGACY_AVATAR_DIR}/${legacyAvatar}`;
  }

  return DEFAULT_AVATAR_PATH;
}
