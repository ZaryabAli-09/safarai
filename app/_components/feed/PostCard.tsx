"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
} from "lucide-react";

import { CommentsPanel } from "@/app/_components/feed/CommentsPanel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { CAPTION_TRUNCATE_LENGTH } from "@/config/feed";
import { formatTimeAgo } from "@/lib/feed/time-ago";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/types/feed-types";

interface PostCardProps {
  post: FeedPost;
  index: number;
  onToggleLike: (postId: string) => void;
  onDelete: (postId: string) => Promise<void>;
  onCommentCountChange: (postId: string, count: number) => void;
}

/** Placeholder card shown while the first page loads. */
export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}


// One feed post: author header, image carousel, action row, caption, timestamp
// and an expandable flat comment thread.
export default function PostCard({
  post,
  index,
  onToggleLike,
  onDelete,
  onCommentCountChange,
}: PostCardProps) {
  const images = post.images ?? [];
  const hasMultipleImages = images.length > 1;

  const [activeImage, setActiveImage] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastTapRef = useRef(0);

  const isLongCaption = post.description.length > CAPTION_TRUNCATE_LENGTH;
  const visibleCaption =
    isCaptionExpanded || !isLongCaption
      ? post.description
      : `${post.description.slice(0, CAPTION_TRUNCATE_LENGTH).trimEnd()}...`;

  const moveImage = (direction: 1 | -1) => {
    setActiveImage(
      (prev) => (prev + direction + images.length) % images.length,
    );
  };

  const showHeartBurst = () => {
    setShowHeart(true);
    window.setTimeout(() => setShowHeart(false), 900);
  };

  // Double click / double tap always toggles, exactly like the heart button.
  const toggleLikeWithBurst = () => {
    const willLike = !post.likedByMe;
    onToggleLike(post._id);
    if (willLike) showHeartBurst();
  };

  // Double-click does not fire reliably on touch screens, so taps are tracked.
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      toggleLikeWithBurst();
      return;
    }
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    // Icon only — a share is never recorded anywhere.
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/app/feed?post=${post._id}`,
      );
      toast.success("Post link copied");
    } catch {
      toast.error("Could not copy the post link");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(post._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 5) * 0.05 }}
      className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm"
    >
      {/* ─── Header: avatar + username (+ owner delete) ─────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="shrink-0 rounded-full bg-brand-gradient p-[2px]">
          {/* Plain <img>: Cloudinary URLs are not in next.config remotePatterns. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.author.avatarUrl}
            alt={post.author.username}
            className="h-9 w-9 rounded-full bg-white object-cover"
          />
        </span>

        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {post.author.username}
        </p>

        {post.isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete post"
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive"
              >
                {isDeleting ? (
                  <Spinner size="small" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                <AlertDialogDescription>
                  The post, its images and all of its comments will be
                  permanently removed. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>



      {/* ─── Image carousel (original aspect ratio, never cropped) ──── */}
      <div className="relative select-none bg-black/5">
        {images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[activeImage]?.url ?? images[0].url}
            alt={`${post.author.username}'s photo ${activeImage + 1}`}
            onDoubleClick={toggleLikeWithBurst}
            onTouchEnd={handleTouchEnd}
            draggable={false}
            className="h-auto max-h-[75vh] w-full object-contain"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Image unavailable
          </div>
        )}

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={() => moveImage(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => moveImage(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
              {activeImage + 1}/{images.length}
            </span>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {images.map((image, imageIndex) => (
                <button
                  key={image.publicId || imageIndex}
                  type="button"
                  onClick={() => setActiveImage(imageIndex)}
                  aria-label={`Go to image ${imageIndex + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    imageIndex === activeImage
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/60",
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Instagram-style heart burst shown when a like is placed */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: [0.4, 1.25, 1] }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <Heart className="h-24 w-24 fill-white text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ─── Actions: like / comment / share ───────────────────────── */}
      <div className="flex items-center gap-5 px-4 pt-3">
        <button
          type="button"
          onClick={toggleLikeWithBurst}
          aria-label={post.likedByMe ? "Unlike post" : "Like post"}
          className="flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Heart
            className={cn(
              "h-6 w-6 transition-colors",
              post.likedByMe
                ? "fill-[var(--brand-pink)] text-[var(--brand-pink)]"
                : "text-foreground hover:text-[var(--brand-coral)]",
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {post.likeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setShowComments((prev) => !prev)}
          aria-label={showComments ? "Hide comments" : "Show comments"}
          className="flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <MessageCircle
            className={cn(
              "h-6 w-6 transition-colors",
              showComments
                ? "text-[var(--brand-purple)]"
                : "text-foreground hover:text-[var(--brand-purple)]",
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {post.commentCount}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Copy post link"
          className="ml-auto text-foreground transition-colors hover:text-[var(--brand-coral)]"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* ─── Caption (truncated with "more..." when long) ──────────── */}
      <div className="px-4 pt-3">
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
          <span className="font-semibold">{post.author.username}</span>{" "}
          {visibleCaption}
        </p>

        {isLongCaption && (
          <button
            type="button"
            onClick={() => setIsCaptionExpanded((prev) => !prev)}
            className="mt-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {isCaptionExpanded ? "less" : "more..."}
          </button>
        )}
      </div>

      {/* ─── Timestamp ──────────────────────────────────────────────── */}
      <p className="px-4 pt-2 pb-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {formatTimeAgo(post.createdAt)}
      </p>

      {/* ─── Flat comments ──────────────────────────────────────────── */}
      <CommentsPanel
        postId={post._id}
        open={showComments}
        onCountChange={onCommentCountChange}
      />
    </motion.article>
  );
}
