"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_COMMENTS_PER_POST, MAX_COMMENT_LENGTH } from "@/config/feed";
import { formatTimeAgo } from "@/lib/feed/time-ago";
import type { FeedCommentItem } from "@/types/feed-types";

interface CommentsPanelProps {
  postId: string;
  /** Comments load lazily the first time the panel is opened. */
  open: boolean;
  onCountChange: (postId: string, count: number) => void;
}

// Flat comment thread: no replies, no nesting. A comment can only be deleted by
// the user who wrote it — the API enforces that and `isOwner` drives the UI.
export function CommentsPanel({
  postId,
  open,
  onCountChange,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<FeedCommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/feed/posts/${postId}/comments`);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message ?? "Could not load comments");
        return;
      }

      const list = (result?.data ?? []) as FeedCommentItem[];
      setComments(list);
      onCountChange(postId, list.length);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [postId, onCountChange]);

  useEffect(() => {
    if (open && !hasLoaded) loadComments();
  }, [open, hasLoaded, loadComments]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = text.trim();
    if (!value) {
      toast.error("Please write a comment first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message ?? "Could not add your comment");
        return;
      }

      const created = result.data as FeedCommentItem;
      setComments((prev) => {
        const next = [...prev, created];
        onCountChange(postId, next.length);
        return next;
      });
      setText("");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/feed/comments/${commentId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message ?? "Could not delete the comment");
        return;
      }

      const serverCount = result?.data?.commentCount as number | undefined;
      setComments((prev) => {
        const next = prev.filter((comment) => comment._id !== commentId);
        onCountChange(
          postId,
          typeof serverCount === "number" ? serverCount : next.length,
        );
        return next;
      });
      toast.success("Comment deleted");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="space-y-3 border-t border-border px-4 py-3">
      {isLoading ? (
        <div className="space-y-2">
          {Array(2)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No comments yet. Be the first to comment — emoji are welcome.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment._id} className="flex gap-2.5">
              <span className="shrink-0 self-start rounded-full bg-brand-gradient p-[1.5px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comment.author.avatarUrl}
                  alt={comment.author.username}
                  className="h-7 w-7 rounded-full bg-white object-cover"
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm leading-5 text-foreground">
                  <span className="font-semibold">
                    {comment.author.username}
                  </span>{" "}
                  {comment.text}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatTimeAgo(comment.createdAt)}
                </p>
              </div>

              {comment.isOwner && (
                <button
                  type="button"
                  onClick={() => handleDelete(comment._id)}
                  disabled={deletingId === comment._id}
                  aria-label="Delete your comment"
                  className="shrink-0 self-start text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                >
                  {deletingId === comment._id ? (
                    <Spinner size="small" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          value={text}
          maxLength={MAX_COMMENT_LENGTH}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a comment..."
          aria-label="Add a comment"
          className="h-9 text-sm"
        />

        <Button
          type="submit"
          size="icon"
          disabled={isSubmitting || text.trim().length === 0}
          aria-label="Post comment"
          className="h-9 w-9 shrink-0 rounded-full bg-brand-gradient text-white"
        >
          {isSubmitting ? <Spinner size="small" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {comments.length >= MAX_COMMENTS_PER_POST && (
        <p className="text-[11px] text-muted-foreground">
          Showing the most recent {MAX_COMMENTS_PER_POST} comments.
        </p>
      )}
    </div>
  );
}

