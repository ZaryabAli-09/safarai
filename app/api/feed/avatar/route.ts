import { NextRequest } from "next/server";

import {
  AVATAR_TRANSFORMATION,
  deleteImage,
  uploadImageFile,
} from "@/config/cloudinary";
import { dbConnect } from "@/config/db";
import { DEFAULT_AVATAR_PATH, PROFILE_IMAGES_FOLDER } from "@/config/feed";
import { requireFeedUser } from "@/lib/feed/auth";
import { isCloudinaryManagedAvatar } from "@/lib/feed/avatar";
import { validateImageFile } from "@/lib/feed/image-validation";
import { response } from "@/lib/helperFunctions";
import { User } from "@/models/User";

/** The only user fields this endpoint reads/writes. */
interface AvatarRecord {
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
}

/** `lean()` on the shared User model widens to `Model<any>`, so narrow here. */
async function findAvatarRecord(userId: string): Promise<AvatarRecord | null> {
  const user = await User.findById(userId)
    .select("avatarUrl avatarPublicId")
    .lean();

  return (user ?? null) as unknown as AvatarRecord | null;
}

/**
 * POST /api/feed/avatar
 * Replaces the signed-in user's avatar (multipart field `avatar`).
 *
 * Order matters: the new asset is uploaded first so the user is never left
 * without a picture, then the previous Cloudinary asset is deleted, and only
 * then is the stored URL swapped. If the old asset cannot be deleted the new
 * upload is rolled back and the profile is left exactly as it was — no broken
 * avatar and no orphaned file.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireFeedUser();
    if (!auth.ok) return auth.unauthorized;

    const formData = await req.formData().catch(() => null);
    const file = formData?.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      return response(false, 400, "Please choose an image to upload.");
    }

    const fileError = validateImageFile(file);
    if (fileError) {
      return response(false, 400, fileError);
    }

    await dbConnect();

    const user = await findAvatarRecord(auth.userId);

    if (!user) {
      return response(false, 404, "User not found");
    }

    const uploaded = await uploadImageFile(
      file,
      PROFILE_IMAGES_FOLDER,
      AVATAR_TRANSFORMATION,
    );

    // Static `/public` avatars have no public id and are never touched.
    if (user.avatarPublicId && isCloudinaryManagedAvatar(user.avatarUrl)) {
      try {
        await deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error("Delete previous avatar error:", error);
        await deleteImage(uploaded.publicId).catch(() => undefined);
        return response(
          false,
          502,
          "Your previous avatar could not be replaced. Please try again.",
        );
      }
    }

    await User.updateOne(
      { _id: auth.userId },
      { $set: { avatarUrl: uploaded.url, avatarPublicId: uploaded.publicId } },
    );

    return response(true, 200, "Avatar updated successfully", {
      avatarUrl: uploaded.url,
      avatarPublicId: uploaded.publicId,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return response(false, 500, "Could not upload your avatar. Please try again.");
  }
}

/**
 * DELETE /api/feed/avatar
 * Removes the Cloudinary asset and falls back to the static default avatar.
 *
 * No request input is needed — the session identifies both the user and the
 * asset to remove.
 */
export async function DELETE() {
  try {
    const auth = await requireFeedUser();
    if (!auth.ok) return auth.unauthorized;

    await dbConnect();

    const user = await findAvatarRecord(auth.userId);

    if (!user) {
      return response(false, 404, "User not found");
    }

    if (user.avatarPublicId && isCloudinaryManagedAvatar(user.avatarUrl)) {
      try {
        await deleteImage(user.avatarPublicId);
      } catch (error) {
        console.error("Delete avatar error:", error);
        return response(
          false,
          502,
          "Your avatar could not be removed from storage. Please try again.",
        );
      }
    }

    await User.updateOne(
      { _id: auth.userId },
      { $set: { avatarUrl: "", avatarPublicId: "" } },
    );

    return response(true, 200, "Avatar removed successfully", {
      avatarUrl: DEFAULT_AVATAR_PATH,
      avatarPublicId: "",
    });
  } catch (error) {
    console.error("Remove avatar error:", error);
    return response(false, 500, "Internal server error");
  }
}
