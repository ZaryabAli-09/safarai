import {
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  MAX_IMAGES_PER_POST,
} from "@/config/feed";

/**
 * Image rules shared by the client (instant feedback) and the API (the check
 * that actually matters). Pure functions — safe in the browser bundle.
 */

const IMAGE_EXTENSION = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;
const PDF_EXTENSION = /\.pdf$/i;

/** A PDF (by MIME type or by name) is always rejected. */
export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || PDF_EXTENSION.test(file.name);
}

/** Trusts the MIME type, falling back to the extension when browsers omit it. */
export function isImageFile(file: File): boolean {
  if (file.type) return file.type.startsWith("image/");
  return IMAGE_EXTENSION.test(file.name);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates a single file and returns a user-facing message, or `null` when
 * the file is acceptable.
 */
export function validateImageFile(file: File): string | null {
  if (isPdfFile(file)) {
    return `"${file.name}" is a PDF. Only image files can be uploaded.`;
  }

  if (!isImageFile(file)) {
    return `"${file.name}" is not an image. Please choose a JPG, PNG, WEBP or GIF.`;
  }

  if (file.size === 0) {
    return `"${file.name}" is empty and cannot be uploaded.`;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `"${file.name}" is ${formatFileSize(file.size)}. Each image must be ${MAX_IMAGE_SIZE_LABEL} or smaller.`;
  }

  return null;
}

/** Validates the whole selection: at least one image, none rejected, none extra. */
export function validateImageFiles(files: File[]): string | null {
  if (files.length === 0) {
    return "Please add at least one image to your post.";
  }

  if (files.length > MAX_IMAGES_PER_POST) {
    return `You can upload up to ${MAX_IMAGES_PER_POST} images per post.`;
  }

  for (const file of files) {
    const error = validateImageFile(file);
    if (error) return error;
  }

  return null;
}
