"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";

import EmptyState from "@/app/_components/common/EmptyState";
import { CreatePostModal } from "@/app/_components/feed/CreatePostModal";
import FeedSidebar from "@/app/_components/feed/FeedSidebar";
import { MobileFeedControls } from "@/app/_components/feed/MobileFeedControls";
import PostCard, { PostCardSkeleton } from "@/app/_components/feed/PostCard";
import { MobileTopBar } from "@/app/_components/navigation/MobileTopBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import {
  DEFAULT_FEED_FILTERS,
  FEED_PAGE_SIZE,
  FEED_SKELETON_COUNT,
} from "@/config/feed";
import type { FeedFilters, FeedPagination, FeedPost } from "@/types/feed-types";

export default function FeedPage() {
  const { status } = useSession();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filters, setFilters] = useState<FeedFilters>(DEFAULT_FEED_FILTERS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<FeedPagination | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  // Mirror of `posts` so handlers can read the latest list without re-creating
  // their identity on every render.
  const postsRef = useRef<FeedPost[]>([]);

  const isLoadingPosts = initialLoading || loadingMore;

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const getPosts = useCallback(
    async (page = 1, append = false, activeFilters: FeedFilters) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setInitialLoading(true);
      }

      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(FEED_PAGE_SIZE),
          sort: activeFilters.sort,
          search: activeFilters.searchTerm,
        });

        const res = await fetch(`/api/feed/posts?${queryParams.toString()}`);
        const result = await res.json();

        if (!res.ok) {
          toast.error(result.message ?? "Could not load the feed");
          return;
        }

        const newPosts = (result?.data?.posts ?? []) as FeedPost[];
        setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));

        const meta = result?.data?.pagination as FeedPagination | undefined;
        setPagination(meta ?? null);
        setHasMore(Boolean(meta?.hasMore));
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        if (append) {
          setLoadingMore(false);
        } else {
          setInitialLoading(false);
        }
      }
    },
    [],
  );

  // Initial load and reload whenever the filters change.
  useEffect(() => {
    if (status !== "authenticated") return;

    setPosts([]);
    setCurrentPage(1);
    setPagination(null);
    setHasMore(false);
    setHasUserScrolled(false);
    getPosts(1, false, filters);
  }, [status, filters, getPosts]);

  // Only start auto-loading once the user actually scrolls.
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) setHasUserScrolled(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Infinite scroll: 10 posts at a time.
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || initialLoading || !hasUserScrolled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [hasMore, loadingMore, initialLoading, hasUserScrolled]);

  useEffect(() => {
    if (currentPage > 1) {
      getPosts(currentPage, true, filters);
    }
  }, [currentPage, getPosts, filters]);

  const handleToggleLike = useCallback((postId: string) => {
    const snapshot = postsRef.current.find((post) => post._id === postId);

    // Optimistic flip — reconciled with the server's answer below.
    setPosts((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likeCount: Math.max(
                0,
                post.likeCount + (post.likedByMe ? -1 : 1),
              ),
            }
          : post,
      ),
    );

    void (async () => {
      try {
        const res = await fetch(`/api/feed/posts/${postId}/like`, {
          method: "POST",
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result?.message ?? "Could not update your like");
        }

        const { liked, likeCount } = result.data as {
          liked: boolean;
          likeCount: number;
        };

        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likedByMe: liked, likeCount } : post,
          ),
        );
      } catch (error) {
        toast.error((error as Error).message);
        // Roll the optimistic flip back to the last known good state.
        if (snapshot) {
          const restored = snapshot;
          setPosts((prev) =>
            prev.map((post) => (post._id === postId ? restored : post)),
          );
        }
      }
    })();
  }, []);

  const handleDelete = useCallback(async (postId: string) => {
    try {
      const res = await fetch(`/api/feed/posts/${postId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message ?? "Could not delete the post");
        return;
      }

      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setPagination((prev) =>
        prev ? { ...prev, total: Math.max(0, prev.total - 1) } : prev,
      );
      toast.success("Post deleted");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, []);

  const handleCommentCountChange = useCallback(
    (postId: string, count: number) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, commentCount: count } : post,
        ),
      );
    },
    [],
  );

  const handlePostCreated = useCallback((post: FeedPost) => {
    setPosts((prev) => [post, ...prev]);
    setPagination((prev) =>
      prev ? { ...prev, total: prev.total + 1 } : prev,
    );
  }, []);

  const handleResetFilters = () => setFilters(DEFAULT_FEED_FILTERS);

  const hasActiveFilters =
    filters.searchTerm.trim() !== "" || filters.sort !== "recent";


  return (
    <div className="min-h-screen">
      <MobileTopBar pageName="Feed" />

      <MobileFeedControls
        filters={filters}
        onApply={setFilters}
        onReset={handleResetFilters}
        onCreatePost={() => setIsCreateOpen(true)}
        isLoading={isLoadingPosts}
      />

      {/* Desktop: 35% control panel / 65% feed (single column, like the app) */}
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-8 md:flex md:gap-6 md:pt-8">
        <div className="hidden md:block md:w-[35%] shrink-0">
          <FeedSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onCreatePost={() => setIsCreateOpen(true)}
            isLoading={isLoadingPosts}
          />
        </div>

        <div className="md:w-[65%]">
          <div className="mx-auto w-full max-w-xl space-y-5">
            <h1 className="hidden md:block text-lg font-semibold text-foreground">
              Feed
              {pagination ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {pagination.total}{" "}
                  {pagination.total === 1 ? "post" : "posts"}
                </span>
              ) : null}
            </h1>

            {initialLoading ? (
              <div className="space-y-5">
                {Array(FEED_SKELETON_COUNT)
                  .fill(null)
                  .map((_, i) => (
                    <PostCardSkeleton key={i} />
                  ))}
              </div>
            ) : posts.length > 0 ? (
              <>
                <div
                  className={`space-y-5 ${
                    loadingMore ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  {posts.map((post, index) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      index={index}
                      onToggleLike={handleToggleLike}
                      onDelete={handleDelete}
                      onCommentCountChange={handleCommentCountChange}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {loadingMore ? (
                      <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                        <Spinner size="small" />
                        <span>Loading more posts...</span>
                      </div>
                    ) : (
                      <div className="h-1 w-full" aria-hidden="true" />
                    )}
                  </div>
                )}

                {!hasMore && (
                  <p className="pb-2 text-center text-xs text-muted-foreground">
                    You have seen every post.
                  </p>
                )}
              </>
            ) : (
              <EmptyState
                gifjson="/assets/json-gifs/Empty.json"
                heading={
                  hasActiveFilters
                    ? "No posts match your filters"
                    : "No posts yet"
                }
                description={
                  hasActiveFilters
                    ? "Try a different search term or switch back to the Most Recent ordering."
                    : "Share your trip photos and stories with other travellers — add a description and up to 10 images."
                }
                action={
                  hasActiveFilters ? (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <Button
                      onClick={() => setIsCreateOpen(true)}
                      className="h-9 rounded-full bg-brand-gradient px-4 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-90 sm:h-10 sm:px-5 sm:text-sm"
                    >
                      <ImagePlus className="mr-1.5 h-4 w-4" />
                      Create your first post
                    </Button>
                  )
                }
              />
            )}
          </div>
        </div>
      </div>

      <CreatePostModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handlePostCreated}
      />
    </div>
  );
}

