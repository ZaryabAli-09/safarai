"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Trip, TripFilters } from "./TripCard";

const STATUS_OPTIONS: { value: TripFilters["statusFilter"]; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "ready", label: "Ready" },
  { value: "draft", label: "Draft" },
  { value: "in-progress", label: "In Progress" },
];

const SORT_OPTIONS: { value: TripFilters["sortBy"]; label: string }[] = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "a-z", label: "Name A – Z" },
  { value: "z-a", label: "Name Z – A" },
];

interface TripSidebarProps {
  trips: Trip[];
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
}

function TripSidebarInner({
  trips,
  filters,
  onFiltersChange,
}: TripSidebarProps) {
  const { state } = useSidebar();

  const availableStyles = useMemo(() => {
    const styles = Array.from(
      new Set(trips.map((t) => t.styles?.[0]).filter(Boolean) as string[]),
    );
    return styles.slice(0, 5);
  }, [trips]);

  const budgetRange = useMemo(() => {
    if (trips.length === 0) return [0, 100000];
    const budgets = trips.map((t) => t.budget);
    return [Math.min(...budgets), Math.max(...budgets)];
  }, [trips]);

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

  const toggleStyle = (style: string) => {
    const has = filters.styleFilter.includes(style);
    const next = has
      ? filters.styleFilter.filter((s) => s !== style)
      : [...filters.styleFilter, style];
    update("styleFilter", next);
  };

  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel>Filters</SidebarGroupLabel>
            <SidebarGroupContent>
              <Input
                type="text"
                placeholder="Search trips or destinations..."
                value={filters.searchTerm}
                onChange={(e) => update("searchTerm", e.target.value)}
                className="h-9"
              />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Sort By</SidebarGroupLabel>
            <SidebarGroupContent>
              <Select
                value={filters.sortBy}
                onValueChange={(v) =>
                  update("sortBy", v as TripFilters["sortBy"])
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort trips" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Trip Status</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Trip status">
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
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {availableStyles.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Trip Style</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="flex flex-wrap gap-1.5">
                  {availableStyles.map((style) => {
                    const active = filters.styleFilter.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                          active
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted-foreground border-border hover:border-primary/40"
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Duration</SidebarGroupLabel>
            <SidebarGroupContent>
              <Slider
                min={1}
                max={durationRange[1]}
                step={1}
                value={filters.durationRange}
                onValueChange={(v) =>
                  update("durationRange", v as [number, number])
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {filters.durationRange[0]} – {filters.durationRange[1]} days
              </p>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Budget</SidebarGroupLabel>
            <SidebarGroupContent>
              <Slider
                min={budgetRange[0]}
                max={budgetRange[1]}
                step={100}
                value={filters.budgetRange}
                onValueChange={(v) =>
                  update("budgetRange", v as [number, number])
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {filters.budgetRange[0].toLocaleString()} –{" "}
                {filters.budgetRange[1].toLocaleString()}
              </p>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

export default function TripSidebar({
  trips,
  filters,
  onFiltersChange,
}: TripSidebarProps) {
  return <TripSidebarInner trips={trips} filters={filters} onFiltersChange={onFiltersChange} />;
}