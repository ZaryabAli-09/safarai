"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TripFilters } from "@/app/_components/common/TripCard";

interface MobileTripFiltersProps {
  filters: TripFilters;
  onApply: (filters: TripFilters) => void;
  onReset: () => void;
  isLoading: boolean;
}

export function MobileTripFilters({
  filters,
  onApply,
  onReset,
  isLoading,
}: MobileTripFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<TripFilters>(filters);

  // Sync temp filters with actual filters when the sheet opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
    }
  }, [isOpen, filters]);

  const handleApply = () => {
    onApply(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  const toggleSort = (sortBy: TripFilters["sortBy"]) => {
    setTempFilters((prev) => ({ ...prev, sortBy }));
  };

  const toggleStatus = (status: TripFilters["statusFilter"]) => {
    setTempFilters((prev) => ({ ...prev, statusFilter: status }));
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
              {filters.searchTerm || "Search trips..."}
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-white shadow-md active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full bg-white rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto pb-safe"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-border rounded-t-3xl">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:bg-brand-gradient hover:text-white rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-muted-foreground">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search trips..."
                      value={tempFilters.searchTerm}
                      onChange={(e) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-full text-base focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-muted-foreground">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    {(["latest", "oldest"] as const).map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          tempFilters.sortBy === opt
                            ? "bg-brand-gradient text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobile-trip-sort"
                          checked={tempFilters.sortBy === opt}
                          onChange={() => toggleSort(opt)}
                          className="accent-primary"
                        />
                        {opt === "latest" && "Latest"}
                        {opt === "oldest" && "Oldest"}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Trip Status */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-muted-foreground">
                    Trip Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "ready", label: "Ready" },
                      { value: "draft", label: "Draft" },
                      { value: "in-progress", label: "In Progress" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        onClick={() =>
                          toggleStatus(opt.value as TripFilters["statusFilter"])
                        }
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                          tempFilters.statusFilter === opt.value
                            ? "bg-brand-gradient text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobile-trip-status"
                          checked={tempFilters.statusFilter === opt.value}
                          onChange={() =>
                            toggleStatus(
                              opt.value as TripFilters["statusFilter"],
                            )
                          }
                          className="accent-primary"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration Range */}
                <div>
                  <label className="text-sm text-muted-foreground font-semibold mb-2 block">
                    Duration
                  </label>
                  <div className="space-y-3">
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={tempFilters.durationRange}
                      onValueChange={(value) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          durationRange: value as [number, number],
                        }))
                      }
                      className="brand-slider w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      {tempFilters.durationRange[0]} -{" "}
                      {tempFilters.durationRange[1]} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white p-4 border-t border-border pb-safe">
                <Button
                  onClick={handleApply}
                  disabled={isLoading}
                  className="w-full h-12 text-white font-semibold  bg-brand-gradient hover:brightness-110 cursor-pointer rounded-full"
                >
                  {isLoading ? "Applying..." : "Apply Filters"}
                </Button>
                <div className="w-full flex justify-center mt-3">
                  {" "}
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
