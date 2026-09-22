"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Trip, TripFilters } from "./TripCard";

const STATUS_OPTIONS: { value: TripFilters["statusFilter"]; label: string }[] =
  [
    { value: "all", label: "All Status" },
    { value: "ready", label: "Ready" },
    { value: "draft", label: "Draft" },
    { value: "in-progress", label: "In Progress" },
  ];

const SORT_OPTIONS: { value: TripFilters["sortBy"]; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
];

interface TripSidebarProps {
  trips: Trip[];
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
}

// Desktop-only filter panel, built from plain shadcn primitives (Input, Select,
// Slider, Separator) — not the shadcn Sidebar composite. The parent page controls
// its width (35%); this component just fills that column. Mobile uses its own
// separate filter bar in TripsPage.
export default function TripSidebar({
  trips,
  filters,
  onFiltersChange,
}: TripSidebarProps) {
  const durationRange = useMemo(() => {
    if (trips.length === 0) return [1, 30];
    const durations = trips.map((t) => t.duration);
    return [1, Math.max(...durations, 1)];
  }, [trips]);

  const update = <K extends keyof TripFilters>(
    key: K,
    value: TripFilters[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      sortBy: "latest",
      statusFilter: "all",
      styleFilter: [],
      durationRange: [1, durationRange[1]],
      budgetRange: [0, 100000],
    });
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
          placeholder="Search trips or destinations..."
          value={filters.searchTerm}
          onChange={(e) => update("searchTerm", e.target.value)}
          className="h-9  text-base focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Sort By
        </label>
        <div
          className="flex flex-col gap-1.5"
          role="radiogroup"
          aria-label="Sort trips"
        >
          {SORT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors  ${
                filters.sortBy === opt.value
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name="trip-sort"
                value={opt.value}
                checked={filters.sortBy === opt.value}
                onChange={() => update("sortBy", opt.value)}
                className=""
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trip Status
        </label>
        <div
          className="flex flex-col gap-1.5"
          role="radiogroup"
          aria-label="Trip status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                filters.statusFilter === opt.value
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <input
                type="radio"
                name="trip-status"
                value={opt.value}
                checked={filters.statusFilter === opt.value}
                onChange={() => update("statusFilter", opt.value)}
                className="accent-primary"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Duration
        </label>
        <Slider
          min={1}
          max={durationRange[1]}
          step={1}
          value={filters.durationRange}
          onValueChange={(v) => update("durationRange", v as [number, number])}
          className="brand-slider w-full"
        />
        <p className="text-xs text-muted-foreground">
          {filters.durationRange[0]} – {filters.durationRange[1]} days
        </p>
      </div>
    </div>
  );
}
