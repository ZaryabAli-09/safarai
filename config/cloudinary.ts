import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

/**
 * Cloudinary integration for the feed's post images.
 *
 * Credentials come from `.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
 * `CLOUDINARY_API_SECRET`) — they are read lazily so importing this module
 * never throws during a build that runs without secrets configured.
 */

interface CloudinaryCredentials {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

/** Folder every feed post image is uploaded to. */
export const POST_IMAGES_FOLDER = "safarai/posts-img";

/** Image transformations applied on upload (never cropping, only limiting). */
export const POST_IMAGE_TRANSFORMATION = [
  { width: 1440, height: 1440, crop: "limit", quality: "auto" },
];

const ALLOWED_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "heic",
];

let isConfigured = false;

/** Configures the SDK on first use and fails loudly when secrets are missing. */
function getCloudinary() {
  if (!isConfigured) {
    const credentials: CloudinaryCredentials = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      api_key: process.env.CLOUDINARY_API_KEY ?? "",
      api_secret: process.env.CLOUDINARY_API_SECRET ?? "",
    };

    if (
      !credentials.cloud_name ||
      !credentials.api_key ||
      !credentials.api_secret
    ) {
      throw new Error(
        "Please define the CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables inside .env file",
      );
    }

    cloudinary.config({ ...credentials, secure: true });
    isConfigured = true;
  }

  return cloudinary;
}

/** Result of a successful upload, as persisted on the post/user document. */
export interface UploadedImage {
  url: string;
  publicId: string;
}

/**
 * Uploads a browser `File` straight to Cloudinary and returns the delivery URL
 * plus the `public_id` needed to delete it later.
 *
 * Keeping the public id on every record is what makes safe deletion possible —
 * Cloudinary assets can only be removed by id, never by URL.
 */
export async function uploadImageFile(file: File): Promise<UploadedImage> {
  const sdk = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = sdk.uploader.upload_stream(
      {
        folder: POST_IMAGES_FOLDER,
        resource_type: "image",
        allowed_formats: ALLOWED_IMAGE_FORMATS,
        transformation: POST_IMAGE_TRANSFORMATION,
        // Deterministic, human readable asset names (Cloudinary appends a
        // short random suffix, so collisions are impossible).
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, uploaded) => {
        if (error || !uploaded) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(uploaded);
      },
    );

    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/** Deletes a single asset. `not found` is treated as success (already gone). */
export async function deleteImage(publicId: string): Promise<void> {
  const sdk = getCloudinary();
  const result = await sdk.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(
      `Cloudinary rejected the deletion of ${publicId} (${result.result})`,
    );
  }
}

/**
 * Bulk-deletes every asset of a post in a single API call.
 *
 * Throws when Cloudinary reports anything other than `deleted` / `not_found`
 * so callers can abort (and therefore never delete the database record while
 * the images still exist in storage).
 */
export async function deleteImages(publicIds: string[]): Promise<void> {
  const ids = publicIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;

  const sdk = getCloudinary();
  const result = await sdk.api.delete_resources(ids, {
    resource_type: "image",
    invalidate: true,
  });

  const deleted = result.deleted ?? {};
  const failed = ids.filter((id) => {
    const status = deleted[id];
    return status !== "deleted" && status !== "not_found";
  });

  if (failed.length > 0) {
    throw new Error(
      `Cloudinary rejected the deletion of: ${failed.join(", ")}`,
    );
  }
}

/** Best-effort cleanup used to roll back half-finished uploads. */
export async function deleteImagesSafely(publicIds: string[]): Promise<void> {
  try {
    await deleteImages(publicIds);
  } catch (error) {
    console.error("Feed cleanup failed:", error);
  }
}
