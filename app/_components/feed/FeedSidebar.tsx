"use client";

import { useEffect, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_FEED_FILTERS,
  FEED_SORT_OPTIONS as SORT_OPTIONS,
} from "@/lib/feed/config";
import type { FeedFilters, FeedSort } from "@/types/app-types";

interface FeedSidebarProps {
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
  onCreatePost: () => void;
  isLoading: boolean;
}

// Desktop-only control panel, built from the same shadcn primitives and layout
// as TripSidebar so both sections feel identical. The parent page owns the
// column width (35%); mobile uses MobileFeedControls instead.
export default function FeedSidebar({
  filters,
  onFiltersChange,
  onCreatePost,
  isLoading,
}: FeedSidebarProps) {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm);

  useEffect(() => {
    setSearchTerm(filters.searchTerm);
  }, [filters.searchTerm]);

  // Debounced search, identical to the trips sidebar.
  useEffect(() => {
    if (searchTerm === filters.searchTerm) return;
    const timeout = window.setTimeout(() => {
      onFiltersChange({ ...filters, searchTerm });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [filters, onFiltersChange, searchTerm]);

  const updateSort = (sort: FeedSort) => {
    onFiltersChange({ ...filters, sort });
  };

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FEED_FILTERS);
  };

  return (
    <div className="sticky top-24 h-[80vh] max-h-[calc(100vh-1rem)] overflow-y-auto rounded-xl border border-border bg-white p-5 shadow-sm space-y-7">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Clear all filters"
          title="Clear all filters"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground ">
          Search
        </label>
        <Input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 text-base focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort By
        </label>
        <div
          className="flex flex-col gap-1.5"
          role="radiogroup"
          aria-label="Sort posts"
        >
          {SORT_OPTIONS.map((opt) => {
            const isSelected = filters.sort === opt.value;

            return (
              <label
                key={opt.value}
                className={`relative isolate flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? "text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                {isSelected && (
                  <span className="absolute inset-0 z-0 rounded-lg bg-brand-gradient-muted opacity-30" />
                )}

                <input
                  type="radio"
                  name="feed-sort"
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => updateSort(opt.value)}
                  className="relative z-10 accent-primary"
                />

                <span className="relative z-10 text-sm">{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Button
        type="button"
        onClick={onCreatePost}
        disabled={isLoading}
        className="h-11 w-full rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      >
        <ImagePlus className="h-4 w-4" />
        New Post
      </Button>

      <p className="text-xs leading-5 text-muted-foreground">
        Share your travel moments — add up to 10 images per post.
      </p>
    </div>
  );
}
