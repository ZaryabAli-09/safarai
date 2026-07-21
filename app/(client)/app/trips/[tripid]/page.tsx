"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Plane,
  ChevronDown,
  ChevronUp,
  Sun,
  Sunset,
  Moon,
  Package,
  Lightbulb,
  ArrowLeft,
  Wallet,
  Home,
  Car,
  Utensils,
  Camera,
  Star,
  CheckCircle2,
  AlertCircle,
  Share2,
  Download,
  MapIcon,
} from "lucide-react";
import { Spinner, OverlayLoader } from "@/components/ui/loader";
import toast from "react-hot-toast";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  title: string;
  description: string;
  location?: string;
  venue?: string;
  city?: string;
  country?: string;
  estimatedCost: string;
  duration?: string;
  category?: string;
  weather?: { temp?: string; condition?: string; icon?: string };
  coordinates?: { lat: number; lng: number };
  image?: { url: string; attribution?: string };
}

interface DayItinerary {
  dayNumber: number;
  date?: string;
  title: string;
  location: string;
  activities: Activity[];
}

interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

interface TripSummary {
  totalDays: number;
  destinations: string[];
  estimatedBudget: string;
  bestSeason?: string;
  travelStyle?: string;
  familyFriendly?: boolean;
}

interface Trip {
  _id: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  currency: string;
  tripType: string;
  tripPace: string;
  accommodation: string;
  travelers: number;
  itinerary: DayItinerary[];
  summary: TripSummary;
  budgetBreakdown: BudgetBreakdown;
  packingList: string[];
  travelTips: string[];
  aiNotes: string;
  status: "generating" | "completed" | "draft";
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_OF_DAY_CONFIG = {
  morning: {
    label: "Morning",
    icon: Sun,
  },
  afternoon: {
    label: "Afternoon",
    icon: Sunset,
  },
  evening: {
    label: "Evening",
    icon: Moon,
  },
};

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single activity card — matches trip_detail_redesign mockup */
function ActivityCard({
  activity,
  index,
  dayIndex,
}: {
  activity: Activity;
  index: number;
  dayIndex: number;
}) {
  const timeConfig =
    TIME_OF_DAY_CONFIG[activity.timeOfDay] || TIME_OF_DAY_CONFIG.morning;
  const TimeIcon = timeConfig.icon;
  const CategoryIcon = CATEGORY_ICONS[activity.category || ""] || Camera;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 + dayIndex * 0.05 }}
      className="bg-white rounded-xl border border-border overflow-hidden shadow-sm"
    >
      {/* Image on top with rounded corners */}
      {activity.image?.url ? (
        <div className="relative w-full h-44 overflow-hidden">
          <img
            src={activity.image.url}
            alt={activity.location || activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Attribution as subtle bottom-corner tag — never overlaps readable content */}
          {activity.image.attribution && (
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
              {activity.image.attribution}
            </span>
          )}
        </div>
      ) : (
        <div className="w-full h-32 bg-muted flex items-center justify-center">
          <CategoryIcon className="w-10 h-10 text-muted-foreground/40" />
        </div>
      )}

      {/* Card content */}
      <div className="p-4 space-y-2">
        {/* Title + time-of-day tag on one line */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground text-sm leading-tight flex-1">
            {activity.title}
          </h4>
          {/* Neutral time-of-day pill with icon */}
          <span className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            <TimeIcon className="w-3 h-3" />
            {timeConfig.label}
          </span>
        </div>

        {/* Description in muted text */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {activity.description}
        </p>

        {/* Single compact meta row: location, duration, price, weather */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
          {activity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {activity.location}
            </span>
          )}
          {activity.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              {activity.duration}
            </span>
          )}
          {activity.estimatedCost && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 flex-shrink-0" />
              {activity.estimatedCost}
            </span>
          )}
          {activity.weather?.condition && (
            <span className="flex items-center gap-1">
              <span>{activity.weather.icon}</span>
              {activity.weather.condition}
              {activity.weather.temp && (
                <span className="font-medium">{activity.weather.temp}</span>
              )}
            </span>
          )}
        </div>

        {/* Outline-style "View on map" button */}
        {(activity.venue || activity.coordinates) && (
          <div className="pt-1">
            {(() => {
              if (activity.venue && activity.city && activity.country) {
                const query = `${activity.venue}, ${activity.city}, ${activity.country}`;
                return (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs border border-border text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    View on map
                  </a>
                );
              }
              if (activity.coordinates) {
                return (
                  <a
                    href={`https://www.google.com/maps?q=${activity.coordinates.lat},${activity.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs border border-border text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    View on map
                  </a>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Single day accordion card */
function DayCard({
  day,
  index,
  isOpen,
  onToggle,
  isVisible,
}: {
  day: DayItinerary;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isVisible: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Day header — clickable */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
      >
        {/* Small pill badge — primary-tinted */}
        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-primary text-xs font-semibold border border-primary/20">
          Day {day.dayNumber}
        </span>

        {/* Day info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
            {day.title}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {day.location}
            </span>
            {day.date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatShortDate(day.date)}
              </span>
            )}
          </div>
        </div>

        {/* Activity count + toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {day.activities?.length || 0} activities
          </span>
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      {/* Activities — animated expand/collapse */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {day.activities && day.activities.length > 0 ? (
                day.activities.map((activity, actIdx) => (
                  <ActivityCard
                    key={activity.id || actIdx}
                    activity={activity}
                    index={actIdx}
                    dayIndex={index}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No activities planned for this day.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Budget breakdown bar chart */
function BudgetBar({
  label,
  amount,
  total,
  color,
  icon: Icon,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
  icon: React.ElementType;
}) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span className="text-foreground font-semibold">
          ${amount.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripDetailPage() {
  const { tripid } = useParams<{ tripid: string }>();
  const { data: session } = useSession();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([0]));
  const [visibleDays, setVisibleDays] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<
    "itinerary" | "budget" | "packing" | "tips"
  >("itinerary");

  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ── Fetch trip ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session?.user?._id || !tripid) return;

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

        setTrip(result.data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load trip";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [session?.user?._id, tripid]);

  // ── Intersection observer for scroll animations ────────────────────────────

  useEffect(() => {
    if (!trip?.itinerary) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(
              entry.target.getAttribute("data-day-index") || "0",
            );
            setVisibleDays((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    dayRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [trip?.itinerary]);

  // ── Toggle day ─────────────────────────────────────────────────────────────

  const toggleDay = (index: number) => {
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!trip?.itinerary) return;
    setOpenDays(new Set(trip.itinerary.map((_, i) => i)));
  };

  const collapseAll = () => setOpenDays(new Set());

  // ── Loading state — overlay spinner ───────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="large" />
          <div>
            <p className="font-semibold text-foreground">
              Loading your trip...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Fetching your personalized itinerary
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Trip not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error || "This trip could not be loaded."}
            </p>
          </div>
          <Link
            href="/app/trips"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  // ── Draft/generating state ─────────────────────────────────────────────────

  if (trip.status === "generating") {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <Spinner size="large" />
          <div>
            <p className="font-semibold text-foreground">
              Generating your itinerary...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Our AI is crafting your personalized trip plan. This may take a
              moment.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            Refresh to check status
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "itinerary", label: "Itinerary", icon: Calendar },
    { id: "budget", label: "Budget", icon: Wallet },
    { id: "packing", label: "Packing", icon: Package },
    { id: "tips", label: "Tips", icon: Lightbulb },
  ] as const;

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary">
      {/* ── Plain white/surface header — no gradient ── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-5">
          {/* Back link */}
          <Link
            href="/app/trips"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My trips
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Title row with status pill */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {trip.name}
              </h1>
              {/* Semantic status pill */}
              {trip.status === "completed" ? (
                <span className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-[#dcfce7] text-[color:var(--success)] border border-[#bbf7d0]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready
                </span>
              ) : (
                <span className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium bg-white text-muted-foreground border border-border">
                  Draft
                </span>
              )}
            </div>

            {/* Destination + date in muted text */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {trip.destinations.join(" · ")}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </span>
            </div>

            {/* 4-column stat row — flat muted chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: Clock,
                  label: "Duration",
                  value: `${trip.duration} days`,
                },
                {
                  icon: DollarSign,
                  label: "Budget",
                  value: `$${trip.budget.toLocaleString()}`,
                },
                {
                  icon: Users,
                  label: "Travelers",
                  value: `${trip.travelers}`,
                },
                {
                  icon: Plane,
                  label: "Style",
                  value: trip.tripType,
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-muted rounded-xl p-3 border border-border"
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className="font-semibold text-foreground capitalize text-sm">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Underline tab navigation ── */}
      <div className="bg-white border-b border-border sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* ── ITINERARY TAB ── */}
          {activeTab === "itinerary" && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Controls */}
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">
                  {trip.itinerary?.length || 0}-Day Itinerary
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Expand all
                  </button>
                  <span className="text-border">|</span>
                  <button
                    onClick={collapseAll}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Collapse all
                  </button>
                </div>
              </div>

              {/* Day cards */}
              {trip.itinerary && trip.itinerary.length > 0 ? (
                trip.itinerary.map((day, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      dayRefs.current[idx] = el;
                    }}
                    data-day-index={idx}
                  >
                    <DayCard
                      day={day}
                      index={idx}
                      isOpen={openDays.has(idx)}
                      onToggle={() => toggleDay(idx)}
                      isVisible={visibleDays.has(idx) || idx < 3}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No itinerary available for this trip.</p>
                </div>
              )}

              {/* AI Notes */}
              {trip.aiNotes && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-accent border border-primary/20 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2 text-primary font-medium text-sm">
                    <Lightbulb className="w-4 h-4" />
                    AI Notes
                  </div>
                  <p className="text-sm text-accent-foreground leading-relaxed">
                    {trip.aiNotes}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── BUDGET TAB ── */}
          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Total budget card */}
              <div className="bg-white border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground font-medium">
                    Total Budget
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {trip.budgetBreakdown?.currency || "USD"}
                  </span>
                </div>
                <div className="text-3xl font-bold text-foreground">
                  $
                  {(
                    trip.budgetBreakdown?.total || trip.budget
                  ).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ $
                  {Math.round(
                    (trip.budgetBreakdown?.total || trip.budget) /
                      trip.duration,
                  ).toLocaleString()}{" "}
                  per day · $
                  {Math.round(
                    (trip.budgetBreakdown?.total || trip.budget) /
                      trip.travelers,
                  ).toLocaleString()}{" "}
                  per person
                </div>
              </div>

              {/* Breakdown bars */}
              {trip.budgetBreakdown && (
                <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">
                    Budget Breakdown
                  </h3>
                  <BudgetBar
                    label="Accommodation"
                    amount={trip.budgetBreakdown.accommodation}
                    total={trip.budgetBreakdown.total}
                    color="bg-primary"
                    icon={Home}
                  />
                  <BudgetBar
                    label="Food & Dining"
                    amount={trip.budgetBreakdown.food}
                    total={trip.budgetBreakdown.total}
                    color="bg-warning"
                    icon={Utensils}
                  />
                  <BudgetBar
                    label="Transport"
                    amount={trip.budgetBreakdown.transport}
                    total={trip.budgetBreakdown.total}
                    color="bg-accent-foreground"
                    icon={Car}
                  />
                  <BudgetBar
                    label="Activities"
                    amount={trip.budgetBreakdown.activities}
                    total={trip.budgetBreakdown.total}
                    color="bg-success"
                    icon={Camera}
                  />
                  <BudgetBar
                    label="Miscellaneous"
                    amount={trip.budgetBreakdown.miscellaneous}
                    total={trip.budgetBreakdown.total}
                    color="bg-muted-foreground"
                    icon={Package}
                  />
                </div>
              )}

              {/* Summary info */}
              {trip.summary && (
                <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
                  <h3 className="font-semibold text-foreground text-sm">
                    Trip Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {trip.summary.bestSeason && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Best Season
                        </p>
                        <p className="font-medium text-foreground">
                          {trip.summary.bestSeason}
                        </p>
                      </div>
                    )}
                    {trip.summary.travelStyle && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Travel Style
                        </p>
                        <p className="font-medium text-foreground capitalize">
                          {trip.summary.travelStyle}
                        </p>
                      </div>
                    )}
                    {trip.summary.familyFriendly !== undefined && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Family Friendly
                        </p>
                        <p className="font-medium text-foreground">
                          {trip.summary.familyFriendly ? "✅ Yes" : "❌ No"}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Estimated Budget
                      </p>
                      <p className="font-medium text-foreground">
                        {trip.summary.estimatedBudget}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── PACKING TAB ── */}
          {activeTab === "packing" && (
            <motion.div
              key="packing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Packing List
                </h3>
                {trip.packingList && trip.packingList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trip.packingList.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="w-5 h-5 rounded border-2 border-border group-hover:border-primary flex-shrink-0 transition-colors" />
                        <span className="text-sm text-foreground">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No packing list available.
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TIPS TAB ── */}
          {activeTab === "tips" && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  Travel Tips
                </h3>
                {trip.travelTips && trip.travelTips.length > 0 ? (
                  <div className="space-y-3">
                    {trip.travelTips.map((tip, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="flex gap-3 p-3 bg-muted border border-border rounded-xl"
                      >
                        <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {tip}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No travel tips available.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
