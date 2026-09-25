"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Lottie } from "lottie-react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudSun,
  DollarSign,
  Home,
  Layers,
  Lightbulb,
  MapIcon,
  MapPin,
  Moon,
  Package,
  Plane,
  Plus,
  Sparkles,
  Star,
  Sun,
  Sunset,
  Trash2,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Spinner } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Activity, DayItinerary, TripDetail } from "@/types/app-types";

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Time-of-day presentation.
 *
 * Chips sit on the pastel "muted" brand tokens so a day stacked with activities
 * still reads light — solid brand colours are kept for small accents only.
 */
const TIME_OF_DAY_CONFIG = {
  morning: {
    label: "Morning",
    icon: Sun,
    chipCls: "bg-brand-gradient-muted text-[#8a6a05]",
    dotCls: "bg-[var(--brand-yellow)]",
  },
  afternoon: {
    label: "Afternoon",
    icon: Sunset,
    chipCls: "bg-[var(--brand-orange-muted)] text-[#b45f12]",
    dotCls: "bg-[var(--brand-orange)]",
  },
  evening: {
    label: "Evening",
    icon: Moon,
    chipCls: "bg-[var(--brand-purple-muted)] text-[var(--brand-purple)]",
    dotCls: "bg-[var(--brand-purple)]",
  },
} as const;

/** Small icon shown for each activity category. */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  sightseeing: Camera,
  food: Utensils,
  adventure: Star,
  culture: Star,
  shopping: Package,
  nature: MapPin,
  accommodation: Home,
  transport: Car,
};

/**
 * The three beats of a day, in the order they are lived: this is the sequence
 * the journey strip, the rail markers and the plan itself all follow.
 */
const JOURNEY_PHASES = ["morning", "afternoon", "evening"] as const;
type JourneyPhase = (typeof JOURNEY_PHASES)[number];

/** The four views this page can show. Desktop pins the itinerary to one day. */
type ViewSection = "itinerary" | "budget" | "packing" | "tips";

/** Mobile tab bar — four equal tabs, so it never scrolls sideways. */
const MOBILE_TABS: {
  id: ViewSection;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "itinerary", label: "Itinerary", icon: Calendar },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "packing", label: "Packing", icon: Package },
  { id: "tips", label: "Tips", icon: Lightbulb },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

/** Precise place for an activity, falling back to the day's location. */
function activityPlace(activity: Activity, fallback: string) {
  return (
    activity.location ||
    [activity.venue, activity.city].filter(Boolean).join(", ") ||
    fallback
  );
}

/** One-line weather summary, always shown so the card never looks empty. */
function weatherSummary(activity: Activity) {
  const { condition, temp } = activity.weather || {};
  if (!condition && !temp) return "Not available";
  return [condition, temp].filter(Boolean).join(" · ");
}

/** Which beat of the day an activity belongs to, defaulting to the morning. */
function phaseOf(activity: Activity): JourneyPhase {
  const timeOfDay = activity.timeOfDay as JourneyPhase;
  return JOURNEY_PHASES.includes(timeOfDay) ? timeOfDay : "morning";
}

/**
 * Groups a day into its beats so the plan reads morning → afternoon → evening.
 * Within a beat the planner's own order is kept, so nothing gets shuffled.
 */
function groupByPhase(activities: Activity[]) {
  return JOURNEY_PHASES.map((phase) => ({
    phase,
    items: activities.filter((activity) => phaseOf(activity) === phase),
  })).filter((group) => group.items.length > 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Label/value row shared by activity cards and the quick-facts panel. */
function MetaRow({
  icon: Icon,
  iconCls,
  label,
  value,
}: {
  icon: React.ElementType;
  iconCls?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className={cn("size-3.5", iconCls)} />
        {label}
      </dt>
      <dd className="truncate text-xs font-semibold text-foreground">
        {value}
      </dd>
    </div>
  );
}

/** Single activity card — cover, category chip and the facts travellers care about. */
function ActivityCard({
  activity,
  dayLocation,
  timeline = false,
}: {
  activity: Activity;
  dayLocation: string;
  timeline?: boolean;
}) {
  const timeConfig = TIME_OF_DAY_CONFIG[phaseOf(activity)];
  const CategoryIcon = CATEGORY_ICONS[activity.category || ""] || Camera;

  const place = activityPlace(activity, dayLocation);
  const mapsUrl = activity.coordinates
    ? `https://www.google.com/maps?q=${activity.coordinates.lat},${activity.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-md",
        timeline ? "flex-col sm:flex-row" : "flex-col",
      )}
    >
      {/* Cover */}
      <div
        className={cn(
          "relative h-60 w-full shrink-0 overflow-hidden bg-secondary sm:h-70",
          timeline && "sm:h-auto sm:w-48 lg:w-56",
        )}
      >
        {activity.image?.url ? (
          <img
            src={activity.image.url}
            alt={place}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient-muted">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <CategoryIcon className="size-5 text-[var(--brand-purple)]" />
            </span>
          </div>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold capitalize text-foreground shadow-sm backdrop-blur-sm">
          <CategoryIcon className="size-3 text-[var(--brand-coral)]" />
          {activity.category || "sightseeing"}
        </span>

        {activity.image?.attribution && (
          <span className="absolute bottom-2 right-2 max-w-[80%] truncate rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
            {activity.image.attribution}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <span className={cn("h-1 w-8 rounded-full", timeConfig.dotCls)} />

        <h3 className="text-sm font-bold leading-snug text-foreground sm:text-base">
          {activity.title}
        </h3>

        {activity.description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {activity.description}
          </p>
        )}

        {/* Location · budget · weather stay legible at a glance */}
        <dl className="mt-auto divide-y divide-border/70 rounded-xl bg-secondary/70 px-3 py-1.5">
          <MetaRow
            icon={MapPin}
            iconCls="text-[var(--brand-coral)]"
            label="Location"
            value={place}
          />
          <MetaRow
            icon={DollarSign}
            iconCls="text-[var(--brand-orange)]"
            label="Budget"
            value={activity.estimatedCost || "Included"}
          />
          <MetaRow
            icon={CloudSun}
            iconCls="text-[var(--brand-purple)]"
            label="Weather"
            value={weatherSummary(activity)}
          />
          {activity.duration && (
            <MetaRow
              icon={Clock}
              iconCls="text-muted-foreground"
              label="Duration"
              value={activity.duration}
            />
          )}
        </dl>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-[var(--brand-coral)]/40 hover:bg-[var(--brand-coral-muted)]/40 hover:text-[var(--brand-coral)]"
        >
          <MapIcon className="size-3.5" />
          View on Google Maps
        </a>
      </div>
    </article>
  );
}

// ─── Day journey ──────────────────────────────────────────────────────────────

/**
 * Vertical-rail geometry for a day. Two variants share every journey piece:
 * `full` is the desktop day panel (wider gutter, horizontal cards at sm+) and
 * `compact` is the mobile accordion (tighter gutter, stacked cards).
 */
interface JourneyLayout {
  /** x-position of the rail, and of everything hanging off it. */
  railCls: string;
  /** Left padding of every row, so the rail always has its own column. */
  indentCls: string;
  /** Short line that ties a card back to its rail marker. */
  connectorCls: string;
  /** Card orientation: horizontal cover + body once there is room for it. */
  timeline: boolean;
  compact: boolean;
}

const JOURNEY_LAYOUT: Record<"full" | "compact", JourneyLayout> = {
  full: {
    railCls: "left-3 sm:left-4",
    indentCls: "pl-8 sm:pl-11",
    connectorCls: "left-6 w-2 sm:left-7 sm:w-4",
    timeline: true,
    compact: false,
  },
  compact: {
    railCls: "left-3",
    indentCls: "pl-8",
    connectorCls: "left-6 w-2",
    timeline: false,
    compact: true,
  },
};

/** Beat separator in the rail: "Morning ────── 2 stops". */
function JourneyPhaseHeading({
  phase,
  count,
  layout,
}: {
  phase: JourneyPhase;
  count: number;
  layout: JourneyLayout;
}) {
  const config = TIME_OF_DAY_CONFIG[phase];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("relative flex h-6 items-center", layout.indentCls)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 z-10 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-sm",
          layout.railCls,
          config.dotCls,
        )}
      >
        <Icon className="size-2.5 text-white" />
      </span>

      <p className="flex flex-1 items-center gap-2">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            config.chipCls,
          )}
        >
          {config.label}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
          {count} {count === 1 ? "stop" : "stops"}
        </span>
      </p>
    </motion.div>
  );
}

/**
 * A stop on the route: the rail marker for its beat, a connector line and the
 * card itself. Cards slide in from the rail as they are scrolled into view, so
 * the day builds up instead of arriving as one static block.
 */
function ActivityStop({
  activity,
  index,
  dayLocation,
  layout,
}: {
  activity: Activity;
  index: number;
  dayLocation: string;
  layout: JourneyLayout;
}) {
  const timeConfig = TIME_OF_DAY_CONFIG[phaseOf(activity)];
  const TimeIcon = timeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
        delay: Math.min(index, 4) * 0.05,
      }}
      className={cn("relative", layout.indentCls)}
    >
      {/* Connector: ties the card back to the rail. */}
      <span
        aria-hidden="true"
        className={cn("absolute top-5 h-px bg-border", layout.connectorCls)}
      />

      {/* Marker: which beat of the day this stop belongs to. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-5 z-10 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white shadow-sm",
          layout.railCls,
          timeConfig.dotCls,
        )}
      >
        <TimeIcon className="size-3 text-white" />
      </span>

      <ActivityCard
        activity={activity}
        dayLocation={dayLocation}
        timeline={layout.timeline}
      />
    </motion.div>
  );
}

/** Closing beat, so a day always ends on purpose. */
function JourneyDayEnd({ layout }: { layout: JourneyLayout }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("relative flex h-7 items-center", layout.indentCls)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 z-10 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand-gradient shadow-sm",
          layout.railCls,
        )}
      >
        <Check className="size-2.5 text-white" />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        That wraps up the day
      </span>
    </motion.div>
  );
}

/**
 * A whole day as one route: a phase strip on top, then a rail the traveller
 * scrolls down, with a labelled beat for every part of the day and a marker for
 * each stop. The rail fills as you scroll, so progress through the day is
 * always visible.
 */
function ActivityJourney({
  activities,
  dayLocation,
  variant = "full",
}: {
  activities: Activity[];
  dayLocation: string;
  variant?: "full" | "compact";
}) {
  const layout = JOURNEY_LAYOUT[variant];
  const grouped = useMemo(() => groupByPhase(activities), [activities]);
  const trackRef = useRef<HTMLDivElement>(null);

  // How far the traveller has scrolled through the day: filling starts as the
  // day's first beat appears near the bottom of the screen and completes once
  // the last card has been scrolled past, so the rail always fills up with the
  // journey instead of jumping to the end.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 90%", "end 100%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.4,
  });

  return (
    <div className={cn(layout.compact ? "space-y-3" : "space-y-4")}>
      <div ref={trackRef} className="relative">
        {/* Static rail… */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 top-3 w-px bg-border",
            layout.railCls,
          )}
        />
        {/* …and the stretch already travelled. */}
        <motion.span
          aria-hidden="true"
          style={{ scaleY: progress }}
          className={cn(
            "absolute bottom-0 top-3 w-px origin-top bg-brand-gradient",
            layout.railCls,
          )}
        />

        <div className={cn(layout.compact ? "space-y-6" : "space-y-7")}>
          {grouped.map((group) => (
            <div
              key={group.phase}
              className={cn(layout.compact ? "space-y-2.5" : "space-y-3.5")}
            >
              <JourneyPhaseHeading
                phase={group.phase}
                count={group.items.length}
                layout={layout}
              />
              {group.items.map((activity, index) => (
                <ActivityStop
                  key={activity.id || index}
                  activity={activity}
                  index={index}
                  dayLocation={dayLocation}
                  layout={layout}
                />
              ))}
            </div>
          ))}

          <JourneyDayEnd layout={layout} />
        </div>
      </div>
    </div>
  );
}

/** Budget category bar with an animated brand-coloured fill. */
function BudgetBar({
  label,
  amount,
  total,
  currency,
  barCls,
  icon: Icon,
}: {
  label: string;
  amount: number;
  total: number;
  currency: string;
  barCls: string;
  icon: React.ElementType;
}) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <Icon className="size-3.5" />
          </span>
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-semibold text-foreground">
          {formatCurrency(amount, currency)}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({pct}%)
          </span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", barCls)}
        />
      </div>
    </div>
  );
}

/**
 * One collapsible day for the mobile itinerary: a rich, image-led header that
 * stays closed until the traveller taps the day they want to read.
 */
function DayAccordion({
  day,
  isOpen,
  onToggle,
}: {
  day: DayItinerary;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const activities = day.activities || [];
  const thumbs = activities
    .map((activity) => activity.image?.url)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors",
        isOpen ? "border-[var(--brand-coral)]/30" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 p-3.5 text-left"
      >
        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-sm">
          <span className="text-[8px] font-semibold uppercase leading-none opacity-90">
            Day
          </span>
          <span className="text-sm md:text-sm font-extrabold leading-tight">
            {day.dayNumber}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="truncate text-sm font-bold text-foreground">
              {day.title}
            </span>
            <ChevronDown
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </span>

          <span className="mt-1 flex flex-wrap flex-col items-start gap-x-3 gap-y-1  text-[11px] text-muted-foreground">
            {day.date && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3 text-[var(--brand-orange)]" />
                  {formatShortDate(day.date)}
                </span>
                <span className="rounded-full bg-brand-gradient-muted px-2 py-0.5 text-[9px] font-bold text-[var(--brand-coral)]">
                  {activities.length}{" "}
                  {activities.length === 1 ? "stop" : "stops"}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="size-3 shrink-0 text-[var(--brand-coral)]" />
                <span className="max-w-[140px]  truncate">{day.location}</span>
              </span>
              <span className="flex items-center gap-2">
                {thumbs.length > 0 && (
                  <span className="flex items-center">
                    {thumbs.map((url, thumbIdx) => (
                      <img
                        key={`${url}-${thumbIdx}`}
                        src={url}
                        alt=""
                        className={cn(
                          "size-7 rounded-lg object-cover ring-2 ring-white",
                          thumbIdx > 0 && "-ml-2.5",
                        )}
                        loading="lazy"
                      />
                    ))}
                  </span>
                )}
              </span>
            </div>
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/70 bg-secondary/50 p-3">
              {activities.length > 0 ? (
                <ActivityJourney
                  activities={activities}
                  dayLocation={day.location}
                  variant="compact"
                />
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  No activities planned for day {day.dayNumber} yet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Desktop day view — the itinerary is read one day at a time, with a pager so a
 * long trip never turns into one endless scroll.
 */
function DayPanel({
  day,
  dayIndex,
  dayCount,
  onPrev,
  onNext,
}: {
  day: DayItinerary;
  dayIndex: number;
  dayCount: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const activities = day.activities || [];
  const pagerBtnCls =
    "flex size-9 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition-colors hover:border-[var(--brand-coral)]/40 hover:text-[var(--brand-coral)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground";

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Day header */}
      <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
        <div className="h-1.5 w-full bg-brand-gradient-muted" />
        <div className="flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient-muted px-2.5 py-1 text-[11px] font-semibold ">
              <Calendar className="size-3.5" />
              Day {day.dayNumber} of {dayCount}
            </span>
            <h2 className="mt-2.5 text-xl font-extrabold  tracking-tight  sm:text-2xl">
              {day.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-[var(--brand-coral)]" />
                {day.location}
              </span>
              {day.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-[var(--brand-orange)]" />
                  {formatDate(day.date)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Layers className="size-3.5 text-[var(--brand-purple)]" />
                {activities.length}{" "}
                {activities.length === 1 ? "activity" : "activities"}
              </span>
            </div>
          </div>

          {/* Day pager */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={dayIndex === 0}
              aria-label="Previous day"
              className={pagerBtnCls}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={dayIndex >= dayCount - 1}
              aria-label="Next day"
              className={pagerBtnCls}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Activities — a scroll-driven route from the day's morning to its evening */}
      {activities.length > 0 ? (
        <ActivityJourney activities={activities} dayLocation={day.location} />
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-white py-12 text-center">
          <Calendar className="mx-auto size-9 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-foreground">
            Nothing planned for this day yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pick another day from the list to keep exploring.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripDetailPage() {
  const { tripid } = useParams<{ tripid: string }>();
  const { data: session } = useSession();

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Which panel is showing. On mobile this drives the sticky tab bar, on
  // desktop it switches between the day view, budget, packing and tips.
  const [activeView, setActiveView] = useState<ViewSection>("itinerary");
  // Which day the desktop itinerary panel shows.
  const [activeDay, setActiveDay] = useState(0);
  // Days expanded in the mobile itinerary list — every day starts collapsed.
  const [openDays, setOpenDays] = useState<Set<number>>(new Set());

  // Packing checklist state (checked marks are local only).
  const [newPackingItem, setNewPackingItem] = useState("");
  const [addingPacking, setAddingPacking] = useState(false);
  const [checkedPacking, setCheckedPacking] = useState<Set<number>>(new Set());

  // Travel tips state.
  const [newTipText, setNewTipText] = useState("");
  const [addingTip, setAddingTip] = useState(false);

  // ── Fetch trip ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session?.user?._id || !tripid) return;

    let isMounted = true;

    const fetchTrip = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trip/get-trip/${tripid}`, {
          headers: { "Content-Type": "application/json" },
        });
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || "Failed to load trip");
        }

        if (!isMounted) return;
        setTrip(result.data as TripDetail);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load trip";
        if (!isMounted) return;
        setError(msg);
        toast.error(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTrip();

    return () => {
      isMounted = false;
    };
  }, [session?.user?._id, tripid]);

  // ── Day navigation ─────────────────────────────────────────────────────────

  const toggleDay = (index: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  /** The desktop day list and the day pager both land in the itinerary view. */
  const showDay = (index: number) => {
    setActiveDay(index);
    setActiveView("itinerary");
  };

  // ── Packing list mutations ─────────────────────────────────────────────────

  const handleAddPackingItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const item = newPackingItem.trim();
    if (!item || !trip) return;

    try {
      setAddingPacking(true);
      const res = await fetch(`/api/trip/update/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-packing-item", item }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add item");
      }

      setTrip(data.data as TripDetail);
      setNewPackingItem("");
      toast.success("Item added to packing list");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add item");
    } finally {
      setAddingPacking(false);
    }
  };

  const handleRemovePackingItem = async (index: number) => {
    if (!trip) return;

    try {
      const res = await fetch(`/api/trip/update/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-packing-item", index }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove item");
      }

      setTrip(data.data as TripDetail);
      // Re-map checked marks so they still point at the right items.
      setCheckedPacking((prev) => {
        const next = new Set<number>();
        prev.forEach((i) => {
          if (i < index) next.add(i);
          else if (i > index) next.add(i - 1);
        });
        return next;
      });
      toast.success("Item removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove item");
    }
  };

  const togglePackingCheck = (index: number) => {
    setCheckedPacking((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // ── Travel tip mutations ───────────────────────────────────────────────────

  const handleAddTip = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tip = newTipText.trim();
    if (!tip || !trip) return;

    try {
      setAddingTip(true);
      const res = await fetch(`/api/trip/update/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-tip", tip }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add tip");
      }

      setTrip(data.data as TripDetail);
      setNewTipText("");
      toast.success("Tip added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add tip");
    } finally {
      setAddingTip(false);
    }
  };

  const handleRemoveTip = async (index: number) => {
    if (!trip) return;

    try {
      const res = await fetch(`/api/trip/update/${trip._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove-tip", index }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to remove tip");
      }

      setTrip(data.data as TripDetail);
      toast.success("Tip removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove tip");
    }
  };

  // ── Loading state — brand animation, one heading, one line of context ──────

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pb-16 text-center">
        <Lottie
          src="/json-gifs/Empty.json"
          autoplay
          loop
          className="h-40 w-52 sm:h-44 sm:w-56"
        />
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Loading your trip…
        </h2>
        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
          Fetching your personalised itinerary, budget and packing list.
        </p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (error || !trip) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pb-16 text-center">
        <Lottie
          src="/json-gifs/Empty.json"
          autoplay
          loop
          className="h-40 w-52 sm:h-44 sm:w-56"
        />
        <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-foreground sm:text-lg">
          <AlertCircle className="size-4 text-destructive" />
          Trip not found
        </h2>
        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
          {error || "This trip could not be loaded."}
        </p>
        <Link
          href="/app/trips"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <ArrowLeft className="size-4" />
          Back to Trips
        </Link>
      </div>
    );
  }

  // ── Generating state ───────────────────────────────────────────────────────

  if (trip.status === "generating") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pb-16 text-center">
        <Lottie
          src="/json-gifs/generation.json"
          autoplay
          loop
          className="h-40 w-52 sm:h-44 sm:w-56"
        />
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Crafting your itinerary…
        </h2>
        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
          Our AI is still building your plan. This usually takes under a minute.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-5 h-10 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Sparkles className="size-4" />
          Refresh status
        </Button>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const currency = trip.currency || "USD";
  const itinerary = trip.itinerary || [];
  const daysCount = itinerary.length || trip.duration || 0;
  const travelers = (trip.adults || 0) + (trip.children || 0);
  const totalBudget = trip.budgetBreakdown?.total || trip.budget || 0;
  const perDayBudget = daysCount > 0 ? Math.round(totalBudget / daysCount) : 0;
  const packingList = trip.packingList || [];
  const travelTips = trip.travelTips || [];
  const packedCount = checkedPacking.size;
  const packingProgress = packingList.length
    ? Math.round((packedCount / packingList.length) * 100)
    : 0;
  const destinations =
    trip.destinations?.join(" · ") || "Multiple destinations";
  const startLocation = trip?.origin?.name;
  const totalActivities = itinerary.reduce(
    (sum, day) => sum + (day.activities?.length || 0),
    0,
  );
  const dateRange = `${formatShortDate(trip.startDate)} → ${formatShortDate(
    trip.endDate,
  )}`;
  const safeDayIndex = Math.min(activeDay, Math.max(itinerary.length - 1, 0));
  const currentDay = itinerary[safeDayIndex];

  /** Shared entrance animation for every panel. */
  const panelMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25 },
  };

  /** Trip-level notes — end of the mobile plan, and the desktop sidebar. */
  const aiNotesCard = trip.aiNotes ? (
    <div className="rounded-2xl border border-[var(--brand-purple)]/15  p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Sparkles className="size-4 text-[var(--brand-purple)]" />
        AI notes
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-foreground/80">
        {trip.aiNotes}
      </p>
    </div>
  ) : null;

  // ── Section renderer ───────────────────────────────────────────────────────

  const renderSection = () => {
    // ── BUDGET ──
    if (activeView === "budget") {
      const breakdown = trip.budgetBreakdown;
      const categories = [
        {
          label: "Accommodation",
          amount: breakdown?.accommodation || 0,
          icon: Home,
          barCls: "bg-[var(--brand-purple)]",
        },
        {
          label: "Food & dining",
          amount: breakdown?.food || 0,
          icon: Utensils,
          barCls: "bg-[var(--brand-coral)]",
        },
        {
          label: "Transport",
          amount: breakdown?.transport || 0,
          icon: Car,
          barCls: "bg-[var(--brand-orange)]",
        },
        {
          label: "Activities",
          amount: breakdown?.activities || 0,
          icon: Camera,
          barCls: "bg-[var(--brand-pink)]",
        },
        {
          label: "Miscellaneous",
          amount: breakdown?.miscellaneous || 0,
          icon: Package,
          barCls: "bg-[var(--brand-yellow)]",
        },
      ];
      const breakdownTotal = breakdown?.total || totalBudget;

      return (
        <motion.div key="budget" {...panelMotion} className="space-y-5">
          {/* Total — light card with a brand rule instead of a dark block */}
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="h-1.5 w-full bg-brand-gradient-muted" />
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total trip budget
              </p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                {formatCurrency(totalBudget, currency)}
              </p>
              <div className="hidden  mt-4 md:grid grid-cols-3 gap-2 rounded-2xl  p-3 border border-border text-center text-xs sm:text-sm ">
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Per day Estimated
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                    {formatCurrency(perDayBudget, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Per traveler
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                    {formatCurrency(
                      travelers > 0
                        ? Math.round(totalBudget / travelers)
                        : totalBudget,
                      currency,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Travelers</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                    {travelers || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--brand-coral-muted)]/60">
                <Wallet className="size-4 text-[var(--brand-coral)]" />
              </span>
              Where the money goes
            </h3>
            <div className="mt-5 space-y-4">
              {categories.map((category) => (
                <BudgetBar
                  key={category.label}
                  label={category.label}
                  amount={category.amount}
                  total={breakdownTotal}
                  currency={currency}
                  barCls={category.barCls}
                  icon={category.icon}
                />
              ))}
            </div>
          </div>

          {/* Trip snapshot */}
          {trip.summary && (
            <div className="rounded-3xl border border-[var(--brand-purple)]/15  p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Sparkles className="size-4 text-[var(--brand-purple)]" />
                Trip snapshot
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Best season</dt>
                  <dd className="text-xs text-foreground">
                    {trip.summary.bestSeason || "Year round"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Travel style
                  </dt>
                  <dd className="text-xs text-foreground">
                    {trip.summary.travelStyle || trip.styles?.[0] || "General"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Stay level</dt>
                  <dd className="text-xs capitalize text-foreground">
                    {trip.stayLevel || "Standard"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Family friendly
                  </dt>
                  <dd className="text-xs text-foreground">
                    {trip.summary.familyFriendly ? "Yes" : "Not specified"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </motion.div>
      );
    }

    // ── PACKING ──
    if (activeView === "packing") {
      return (
        <motion.div key="packing" {...panelMotion} className="space-y-5">
          {/* Header, progress and the add form */}
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="h-1.5 w-full bg-brand-gradient-muted" />
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 relative">
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--brand-orange-muted)]/70">
                      <Package className="size-4 text-[var(--brand-orange)]" />
                    </span>
                    Packing list
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Tick items off as you pack add or remove anything you like.
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-foreground absolute right-0 top-0 sm:static">
                  {packedCount}/{packingList.length} packed
                </span>
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${packingProgress}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full bg-brand-gradient"
                />
              </div>

              <form onSubmit={handleAddPackingItem} className="mt-4 flex gap-2">
                <Input
                  value={newPackingItem}
                  onChange={(e) => setNewPackingItem(e.target.value)}
                  placeholder="Add an item (e.g. sunscreen)"
                  aria-label="New packing item"
                  className="h-11 flex-1 text-base md:text-sm"
                />
                <Button
                  type="submit"
                  disabled={addingPacking || !newPackingItem.trim()}
                  className="h-11 shrink-0 bg-brand-gradient px-4 text-white hover:opacity-90"
                >
                  {addingPacking ? (
                    <Spinner size="small" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-3xl border border-border bg-white p-3 shadow-sm sm:p-5">
            {packingList.length > 0 ? (
              <ul className="divide-y divide-border/70">
                {packingList.map((item, idx) => {
                  const isPacked = checkedPacking.has(idx);
                  return (
                    <li
                      key={`${item}-${idx}`}
                      className="flex items-center gap-3 px-1 py-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => togglePackingCheck(idx)}
                        aria-pressed={isPacked}
                        aria-label={
                          isPacked
                            ? `Mark ${item} as unpacked`
                            : `Mark ${item} as packed`
                        }
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                          isPacked
                            ? "border-transparent bg-brand-gradient text-white"
                            : "border-border bg-white text-transparent hover:border-[var(--brand-coral)]",
                        )}
                      >
                        <Check className="size-3.5" />
                      </button>
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          isPacked
                            ? "text-muted-foreground line-through"
                            : "text-foreground",
                        )}
                      >
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePackingItem(idx)}
                        aria-label={`Remove ${item}`}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-10 text-center">
                <Package className="mx-auto size-9 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Your packing list is empty
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add your first item above to get started.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // ── TRAVEL TIPS ──
    if (activeView === "tips") {
      return (
        <motion.div key="tips" {...panelMotion} className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="h-1.5 w-full bg-brand-gradient-muted" />
            <div className="p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
                <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--brand-yellow-muted)]/70">
                  <Lightbulb className="size-4 text-[#8a6a05]" />
                </span>
                Travel tips
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Keep the advice that matters to you and note down your own.
              </p>

              <form onSubmit={handleAddTip} className="mt-5 flex gap-2">
                <Input
                  value={newTipText}
                  onChange={(e) => setNewTipText(e.target.value)}
                  placeholder="Add a tip (e.g. carry cash for markets)"
                  aria-label="New travel tip"
                  className="h-11 flex-1 text-base md:text-sm"
                />
                <Button
                  type="submit"
                  disabled={addingTip || !newTipText.trim()}
                  className="h-11 shrink-0 bg-brand-gradient px-4 text-white hover:opacity-90"
                >
                  {addingTip ? (
                    <Spinner size="small" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </form>
            </div>
          </div>

          {travelTips.length > 0 ? (
            <div className="space-y-3">
              {travelTips.map((tip, idx) => (
                <motion.div
                  key={`${idx}-${tip.slice(0, 12)}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-foreground">
                    {tip}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleRemoveTip(idx)}
                    aria-label={`Remove tip ${idx + 1}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-white py-10 text-center shadow-sm">
              <Lightbulb className="mx-auto size-9 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No travel tips yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your own tip above and it will be saved to this trip.
              </p>
            </div>
          )}
        </motion.div>
      );
    }

    // ── ITINERARY ──
    // Mobile: every day in a collapsed accordion list.
    // Desktop: one day at a time, driven by the sidebar day list and pager.
    return (
      <motion.div key="itinerary" {...panelMotion} className="space-y-4">
        <div className="md:hidden">
          {itinerary.length > 0 ? (
            <div className="space-y-3">
              {itinerary.map((day, idx) => (
                <DayAccordion
                  key={`${day.dayNumber}-${idx}`}
                  day={day}
                  isOpen={openDays.has(idx)}
                  onToggle={() => toggleDay(idx)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-white py-12 text-center">
              <Calendar className="mx-auto size-9 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No itinerary yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This trip is still being planned — check back in a moment.
              </p>
            </div>
          )}

          {aiNotesCard && <div className="mt-4">{aiNotesCard}</div>}
        </div>

        <div className="hidden md:block">
          {currentDay ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`day-${safeDayIndex}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                <DayPanel
                  day={currentDay}
                  dayIndex={safeDayIndex}
                  dayCount={itinerary.length}
                  onPrev={() => showDay(Math.max(safeDayIndex - 1, 0))}
                  onNext={() =>
                    showDay(Math.min(safeDayIndex + 1, itinerary.length - 1))
                  }
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-white py-16 text-center">
              <Calendar className="mx-auto size-9 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-medium text-foreground">
                No itinerary yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This trip is still being planned — check back in a moment.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary pb-20 md:pb-8">
      {/* ── Top bar — deliberately bare: back, trip name, status ── */}
      <header className="sticky top-0 z-40 border-b border-border/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/app/trips"
            aria-label="Back to trips"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-[var(--brand-coral)]/40 hover:text-[var(--brand-coral)]"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xs  text-foreground md:text-sm">
                {trip.name}
              </h1>
              {trip.status === "completed" ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[8px] font-semibold text-[#15803d]">
                  <CheckCircle2 className="size-2.5" />
                  Ready
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[8px] font-semibold text-muted-foreground">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* Desktop keeps the same bar, just with one compact meta line */}
          <div className="flex items-center gap-1 md:gap-4 text-[9px] md:text-xs text-muted-foreground ">
            <span className="hidden md:flex  items-center gap-1.5">
              <MapPin className=" size-3.5 text-[var(--brand-coral)]" />
              <span className="max-w-[220px] truncate">
                {startLocation} → {destinations}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className=" size-3.5 text-[var(--brand-orange)]" />
              {dateRange}
            </span>
          </div>
        </div>
      </header>

      {/* ── Mobile: summary strip, then the sticky tab bar ── */}
      <div className="md:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2.5 px-4 pt-3 sm:px-6">
          {[
            {
              icon: Clock,
              label: "Days",
              value: `${daysCount}`,
              iconCls:
                "bg-[var(--brand-purple-muted)] text-[var(--brand-purple)]",
            },
            {
              icon: DollarSign,
              label: "Budget",
              value: formatCurrency(totalBudget, currency),
              iconCls:
                "bg-[var(--brand-coral-muted)] text-[var(--brand-coral)]",
            },
            {
              icon: Users,
              label: "Travelers",
              value: `${travelers || "—"}`,
              iconCls:
                "bg-[var(--brand-orange-muted)] text-[var(--brand-orange)]",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative flex min-w-0 flex-col items-center gap-1 overflow-hidden rounded-2xl border border-white/80 bg-white px-2.5 py-2.5 shadow-sm ring-1 ring-black/5"
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  stat.iconCls,
                )}
              >
                <stat.icon className="size-3.5" />
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </span>
              <p className="max-w-full truncate text-[9px] font-bold leading-none text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <nav
        aria-label="Trip sections"
        className="sticky top-14 z-30 mt-3 border-y border-border/70 bg-white/95 shadow-sm backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-4">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 border-b-2 px-1 py-2 text-[10px] font-semibold transition-colors",
                  isActive
                    ? "border-[var(--brand-pink)] text-[var(--brand-coral)]"
                    : "border-transparent text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                <span className="w-full truncate text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Desktop sidebar */}
          <aside className="sticky top-20 hidden w-72 shrink-0 self-start md:block lg:w-80">
            <div className="space-y-3">
              {/* 1 — Day navigator: fixed width, scrolls inside its own box */}
              <div className="rounded-3xl border border-border bg-white p-3 shadow-sm">
                <div className="flex items-center gap-2.5 px-1 pb-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
                    <Layers className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      Day by day
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {daysCount} {daysCount === 1 ? "day" : "days"} ·{" "}
                      {totalActivities} activities
                    </p>
                  </div>
                </div>

                <nav className="max-h-[38vh] space-y-1 overflow-y-auto overflow-x-hidden pr-1">
                  {itinerary.length > 0 ? (
                    itinerary.map((day, idx) => {
                      const isActive =
                        activeView === "itinerary" && safeDayIndex === idx;
                      return (
                        <button
                          key={`${day.dayNumber}-${idx}`}
                          type="button"
                          onClick={() => showDay(idx)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                            isActive
                              ? "bg-brand-gradient-muted"
                              : "hover:bg-secondary",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                              isActive
                                ? "bg-brand-gradient text-white"
                                : "bg-brand-gradient-muted text-muted-foreground",
                            )}
                          >
                            {day.dayNumber}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "block truncate text-xs font-semibold",
                                isActive
                                  ? "text-[var(--brand-coral)]"
                                  : "text-foreground",
                              )}
                            >
                              {day.title}
                            </span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {day.activities?.length || 0} stops
                              {day.date
                                ? ` · ${formatShortDate(day.date)}`
                                : ""}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-2 py-3 text-xs text-muted-foreground">
                      No days planned yet.
                    </p>
                  )}
                </nav>
              </div>

              {/* 2 — Trip tools sit in their own box, right above quick facts */}
              <div className="rounded-3xl border border-border bg-white p-3 shadow-sm">
                <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Trip tools
                </p>
                <div className="space-y-1">
                  {[
                    {
                      id: "budget" as ViewSection,
                      label: "Budget breakdown",
                      icon: Wallet,
                      meta: formatCurrency(totalBudget, currency),
                      iconCls:
                        "bg-[var(--brand-coral-muted)]/70 text-[var(--brand-coral)]",
                    },
                    {
                      id: "packing" as ViewSection,
                      label: "Packing list",
                      icon: Package,
                      meta: `${packedCount}/${packingList.length} packed`,
                      iconCls:
                        "bg-[var(--brand-orange-muted)]/70 text-[var(--brand-orange)]",
                    },
                    {
                      id: "tips" as ViewSection,
                      label: "Travel tips",
                      icon: Lightbulb,
                      meta: `${travelTips.length} saved`,
                      iconCls:
                        "bg-[var(--brand-yellow-muted)]/70 text-[#8a6a05]",
                    },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeView === tool.id;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveView(tool.id)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
                          isActive ? "bg-secondary" : "hover:bg-secondary/70",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg",
                            tool.iconCls,
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-foreground">
                            {tool.label}
                          </span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {tool.meta}
                          </span>
                        </span>
                        <ChevronRight
                          className={cn(
                            "size-3.5 shrink-0",
                            isActive
                              ? "text-[var(--brand-coral)]"
                              : "text-muted-foreground/60",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3 — Quick facts */}
              <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
                <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Quick facts
                </p>
                <dl className="divide-y divide-border/70">
                  <MetaRow
                    icon={Wallet}
                    iconCls="text-[var(--brand-coral)]"
                    label="Per day"
                    value={formatCurrency(perDayBudget, currency)}
                  />
                  <MetaRow
                    icon={Calendar}
                    iconCls="text-[var(--brand-orange)]"
                    label="Dates"
                    value={dateRange}
                  />
                  <MetaRow
                    icon={Users}
                    iconCls="text-[var(--brand-purple)]"
                    label="Travelers"
                    value={`${travelers || "—"}`}
                  />
                  <MetaRow
                    icon={Package}
                    iconCls="text-[var(--brand-orange)]"
                    label="Packing items"
                    value={`${packingList.length}`}
                  />
                  <MetaRow
                    icon={Lightbulb}
                    iconCls="text-[#8a6a05]"
                    label="Travel tips"
                    value={`${travelTips.length}`}
                  />
                  <MetaRow
                    icon={Plane}
                    iconCls="text-[var(--brand-purple)]"
                    label="Stay level"
                    value={trip.stayLevel || "Standard"}
                  />
                </dl>
              </div>

              {aiNotesCard}
            </div>
          </aside>

          {/* Content panel */}
          <main className="min-w-0 flex-1">
            <AnimatePresence mode="wait">{renderSection()}</AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
