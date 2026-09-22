"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/loader";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plane,
  Trash2,
  Clock,
  Wallet,
  Users,
  Globe,
  ExternalLink,
  CornerDownRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Trip {
  _id: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  currency: string;
  styles?: string[];
  adults?: number;
  children?: number;
  status: "generating" | "completed" | "draft";
  createdAt: string;
  itinerary?: Array<{
    activities?: Array<{
      image?: {
        url: string;
      };
    }>;
  }>;
}

export interface TripFilters {
  searchTerm: string;
  sortBy: "latest" | "oldest" | "a-z" | "z-a";
  statusFilter: "all" | "ready" | "draft" | "in-progress";
  styleFilter: string[];
  durationRange: [number, number];
  budgetRange: [number, number];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get first available activity image from trip.
 * Uses the first available image instead of a random image.
 */
function getFirstActivityImage(trip: Trip): string | null {
  if (!trip.itinerary || trip.itinerary.length === 0) {
    return null;
  }

  const allActivities = trip.itinerary.flatMap((day) => day.activities || []);

  const activitiesWithImages = allActivities.filter(
    (activity) => activity.image?.url,
  );

  if (activitiesWithImages.length === 0) {
    return null;
  }

  const firstActivity = activitiesWithImages[0];

  return firstActivity.image?.url || null;
}

// ─── Skeleton card ──────────────────────────────────────────────────────────

export function TripCardSkeleton() {
  return (
    <div
      className="
        relative
        min-w-0
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-border/70
        bg-background
        shadow-sm
      "
    >
      {/* Image */}
      <Skeleton className="aspect-[16/10] w-full rounded-none" />

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3.5 w-1/2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>

        {/* Actions */}
        <div className="mt-1 flex items-center justify-between">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Trip card ──────────────────────────────────────────────────────────────

export default function TripCard({
  trip,
  index,
  onDelete,
}: {
  trip: Trip;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const activityImage = getFirstActivityImage(trip);

  const travelerCount = (trip.adults || 0) + (trip.children || 0);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const res = await fetch(`/api/trip/delete/${trip._id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to delete trip");
      }

      toast.success("Trip deleted successfully");

      onDelete(trip._id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete trip");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
      }}
      className="
        group
        relative
        isolate
        min-w-0
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-border/70
        bg-background
        shadow-sm
      "
    >
      {/* Brand gradient bottom accent */}
      <div className="pointer-events-none absolute rounded-md opacity-20 inset-x-0 bottom-0 -z-10 h-full bg-brand-gradient-muted" />

      {/* ─── Image ─────────────────────────────────────────────────────── */}

      <div
        className={`
          relative
          aspect-[16/10]
          w-full
          overflow-hidden
          ${activityImage ? "" : "bg-muted"}
        `}
      >
        {activityImage ? (
          <img
            src={activityImage}
            alt={trip.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Globe className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Image bottom gradient */}
        {activityImage && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        )}

        {/* ─── Destination ────────────────────────────────────────────── */}

        {activityImage ? (
          <div className="absolute bottom-3 left-4 right-4">
            <p className="truncate text-xs font-medium text-white drop-shadow-sm">
              {trip.destinations.join(" → ")}
            </p>
          </div>
        ) : (
          <div className="absolute bottom-3 left-4 right-4">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {trip.destinations.join(" → ")}
            </p>
          </div>
        )}

        {/* ─── Delete button ──────────────────────────────────────────── */}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="
                absolute
                bottom-3
                right-3
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                bg-black/30
                backdrop-blur-sm
                hover:bg-destructive/80
              "
              title="Delete trip"
            >
              {deleting ? (
                <Spinner
                  size="small"
                  className="border-white border-t-white/60"
                />
              ) : (
                <Trash2 className="h-3 w-3 text-white" />
              )}
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete &quot;{trip.name}&quot;?
              </AlertDialogTitle>

              <AlertDialogDescription>
                This action cannot be undone. Your trip itinerary and all
                associated data will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete Trip
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ─── Card body ────────────────────────────────────────────────── */}

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        {/* Title + date */}

        <div className="min-w-0">
          <h3
            className="
              truncate
              text-base
              font-bold
              leading-tight
              text-foreground
              sm:text-lg
            "
          >
            {trip.name}
          </h3>

          <p className="flex items-center gap-2 **:mt-1 truncate text-xs text-muted-foreground sm:text-sm">
            {formatDate(trip.startDate)}{" "}
            <ArrowRight className="w-3 relative bottom-0.5" />{" "}
            {formatDate(trip.endDate)}
          </p>
        </div>

        {/* ─── Stats grid ─────────────────────────────────────────────── */}

        <div className="grid min-w-0 grid-cols-2 gap-2">
          {/* Duration */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--brand-yellow-muted)]
              bg-background
              px-2.5
              py-2.5
            "
          >
            <Clock
              className="
                h-5
                w-5
                shrink-0
                text-[var(--brand-yellow)]
              "
            />

            <div className="min-w-0">
              <p className="text-[10px] leading-none text-muted-foreground">
                Duration
              </p>

              <p className="mt-1 truncate text-xs font-semibold text-foreground sm:text-sm">
                {trip.duration} {trip.duration === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>

          {/* Budget */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--brand-coral-muted)]
              bg-background
              px-2.5
              py-2.5
            "
          >
            <Wallet
              className="
                h-5
                w-5
                shrink-0
                text-[var(--brand-coral)]
              "
            />

            <div className="min-w-0">
              <p className="text-[10px] leading-none text-muted-foreground">
                Budget
              </p>

              <p className="mt-1 truncate text-xs font-semibold text-foreground sm:text-sm">
                {trip.currency || "USD"} {trip.budget.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Travelers */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--brand-pink-muted)]
              bg-background
              px-2.5
              py-2.5
            "
          >
            <Users
              className="
                h-5
                w-5
                shrink-0
                text-[var(--brand-pink)]
              "
            />

            <div className="min-w-0">
              <p className="text-[10px] leading-none text-muted-foreground">
                Travelers
              </p>

              <p className="mt-1 truncate text-xs font-semibold text-foreground sm:text-sm">
                {travelerCount} {travelerCount === 1 ? "Person" : "People"}
              </p>
            </div>
          </div>

          {/* Style */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
              rounded-xl
              border
              border-[var(--brand-purple-muted)]
              bg-background
              px-2.5
              py-2.5
            "
          >
            <Plane
              className="
                h-5
                w-5
                shrink-0
                text-[var(--brand-purple)]
              "
            />

            <div className="min-w-0">
              <p className="text-[10px] leading-none text-muted-foreground">
                Style
              </p>

              <p className="mt-1 truncate text-xs font-semibold capitalize text-foreground sm:text-sm">
                {trip.styles?.[0] || "General"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Actions ────────────────────────────────────────────────── */}

        <div className="mt-1 flex justify-between gap-3 text-gray-500 ">
          {/* View Trip */}

          <div
            className="
            flex justify-between items-center
                h-9
                rounded-full
                px-3
                text-xs
                font-medium
              
              
              "
          >
            View Trip
            <CornerDownRight className="ml-2 mt-2 h-4.5 w-4.5" />
          </div>

          {/* Open Itinerary */}

          <Link href={`/app/trips/${trip._id}`} aria-label="Open itinerary">
            <Button
              size="icon"
              aria-label="Open itinerary"
              className="
                h-9
                w-9
                shrink-0
                rounded-full
                bg-brand-gradient
                opacity-90
                text-white
                shadow-sm
                hover:opacity-100
                hover:scale-110
                cursor-pointer
              "
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
