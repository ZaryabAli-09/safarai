"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { ImagePlus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_POST,
  MAX_IMAGE_SIZE_LABEL,
} from "@/config/feed";
import {
  formatFileSize,
  validateImageFile,
  validateImageFiles,
} from "@/lib/feed/image-validation";
import type { FeedPost } from "@/types/feed-types";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (post: FeedPost) => void;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

/**
 * "New post" composer: a description plus one or more images.
 *
 * Validation runs twice on purpose — here for instant feedback and again in the
 * API, which is the check that actually protects the data (no PDFs, no file
 * above 10 MB, at least one image, non-empty description).
 */
export function CreatePostModal({
  open,
  onClose,
  onCreated,
}: CreatePostModalProps) {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<SelectedImage[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Release every object URL when the modal unmounts.
  useEffect(
    () => () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const incoming = Array.from(fileList);

    if (images.length + incoming.length > MAX_IMAGES_PER_POST) {
      setError(`You can upload up to ${MAX_IMAGES_PER_POST} images per post.`);
      return;
    }

    // Checked per file so one rejected image cannot hide an acceptable one.
    for (const file of incoming) {
      const message = validateImageFile(file);
      if (message) {
        setError(message);
        return;
      }
    }

    setError(null);
    setImages((prev) => [
      ...prev,
      ...incoming.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const releaseImages = () => {
    setImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      return [];
    });
  };

  const handleClose = () => {
    releaseImages();
    setDescription("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDescription = description.trim();
    const validationMessage = !trimmedDescription
      ? "Please write a description for your post."
      : validateImageFiles(images.map((image) => image.file));

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const formData = new FormData();
    formData.append("description", trimmedDescription);
    images.forEach((image) => formData.append("images", image.file));

    setIsSubmitting(true);
    try {
      // No Content-Type header: the browser adds the multipart boundary.
      const res = await fetch("/api/feed/posts", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.message ?? "Could not create your post.");
        return;
      }

      toast.success("Your post is live");
      onCreated(result.data as FeedPost);
      handleClose();
    } catch (submitError) {
      setError((submitError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => {
              if (!isSubmitting) handleClose();
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Create a new post"
            className="relative my-8 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                New Post
              </h2>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted transition-transform active:scale-95 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={description}
                maxLength={MAX_DESCRIPTION_LENGTH}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What did you discover on this trip? Emoji are welcome ✈️"
                aria-label="Post description"
                className="min-h-28 text-sm"
              />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {images.length}/{MAX_IMAGES_PER_POST} images
                </span>
                <span>
                  {description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  addFiles(event.target.files);
                  // Reset so picking the same file again still fires onChange.
                  event.target.value = "";
                }}
              />

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  addFiles(event.dataTransfer.files);
                }}
                className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                  isDragging
                    ? "border-[var(--brand-coral)] bg-accent"
                    : "border-border bg-secondary/60"
                }`}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full"
                >
                  <ImagePlus className="h-4 w-4" />
                  Add photos
                </Button>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  JPG, PNG, WEBP or GIF · up to {MAX_IMAGE_SIZE_LABEL} each ·
                  drag &amp; drop works too
                </p>
              </div>


              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div
                      key={image.previewUrl}
                      className="group relative overflow-hidden rounded-lg border border-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        className="h-24 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove ${image.file.name}`}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>

                      <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                        {formatFileSize(image.file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
                >
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-brand-gradient text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="small" />
                      Posting...
                    </>
                  ) : (
                    "Share Post"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

