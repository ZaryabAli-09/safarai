"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ImagePlus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FEED_SORT_OPTIONS } from "@/lib/feed/config";
import type { FeedFilters, FeedSort } from "@/types/app-types";

interface MobileFeedControlsProps {
  filters: FeedFilters;
  onApply: (filters: FeedFilters) => void;
  onReset: () => void;
  onCreatePost: () => void;
  isLoading: boolean;
}

// Mobile counterpart of FeedSidebar: a compact search/filter bar plus a bottom
// sheet, following the same pattern (and offsets) as MobileTripFilters.
export function MobileFeedControls({
  filters,
  onApply,
  onReset,
  onCreatePost,
  isLoading,
}: MobileFeedControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FeedFilters>(filters);

  // Sync the sheet's draft state with the applied filters when it opens.
  useEffect(() => {
    if (isOpen) setTempFilters(filters);
  }, [isOpen, filters]);

  const toggleSort = (sort: FeedSort) => {
    setTempFilters((prev) => ({ ...prev, sort }));
  };

  const handleApply = () => {
    onApply(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-12 left-0 right-0 z-40 bg-white border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          {/* Fake Search Input */}
          <div
            onClick={() => setIsOpen(true)}
            className="flex-1 relative cursor-pointer"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <div className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg text-sm text-muted-foreground">
              {filters.searchTerm || "Search posts..."}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open feed filters"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-gradient text-white shadow-md active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* New Post Button */}
          <button
            onClick={onCreatePost}
            aria-label="Create a new post"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-border shadow-md active:scale-95 transition-transform"
          >
            <ImagePlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
            <div
              className="absolute inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full bg-white rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-border rounded-t-3xl">
                <h2 className="text-lg font-semibold">Search &amp; Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close filters"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-semibold block">
                    Search
                  </label>
                  <Input
                    type="text"
                    placeholder="Search posts..."
                    value={tempFilters.searchTerm}
                    onChange={(e) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        searchTerm: e.target.value,
                      }))
                    }
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-semibold block">
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FEED_SORT_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                          tempFilters.sort === opt.value
                            ? "bg-brand-gradient text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobile-feed-sort"
                          checked={tempFilters.sort === opt.value}
                          onChange={() => toggleSort(opt.value)}
                          className="accent-primary"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white p-4 border-t border-border">
                <Button
                  onClick={handleApply}
                  disabled={isLoading}
                  className="w-full h-12 text-white font-semibold bg-brand-gradient hover:brightness-110 cursor-pointer rounded-full"
                >
                  {isLoading ? "Applying..." : "Apply Filters"}
                </Button>
                <div className="w-full flex justify-center mt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-12 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground w-full rounded-full cursor-pointer"
                    aria-label="Clear all filters"
                    title="Clear all filters"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Clear
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
