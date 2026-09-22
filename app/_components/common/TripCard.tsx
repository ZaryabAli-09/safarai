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
  ChevronRight,
  Trash2,
  Clock,
  Wallet,
  Users,
  Globe,
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

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Get first available activity image from trip (use first, not random) */
function getFirstActivityImage(trip: Trip): string | null {
  if (!trip.itinerary || trip.itinerary.length === 0) return null;

  const allActivities = trip.itinerary.flatMap((day) => day.activities || []);
  const activitiesWithImages = allActivities.filter((a) => a.image?.url);

  if (activitiesWithImages.length === 0) return null;

  const firstActivity = activitiesWithImages[0];
  return firstActivity.image?.url || null;
}

// ─── Skeleton card ────────────────────────────────────────────────────────

export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <Skeleton className="h-9 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Trip card ────────────────────────────────────────────────────────────

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
  const isReady = trip.status === "completed";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/trip/delete/${trip._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete trip");
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
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
    >
      {/* Card header — image or flat muted for drafts */}
      <div
        className={`relative h-36 overflow-hidden ${
          activityImage ? "" : "bg-muted"
        }`}
      >
        {activityImage ? (
          <img
            src={activityImage}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Draft / no-image: flat muted with single centered neutral icon */
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}

        {/* Status pill — positioned top-right, semantic colors */}
        <div className="absolute top-3 right-3">
          {isReady ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-[#dcfce7] text-[color:var(--success)] border border-[#bbf7d0]">
              ✓ Ready
            </span>
          ) : trip.status === "generating" ? (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-muted text-muted-foreground border border-border">
              ⏳ Generating
            </span>
          ) : (
            /* Draft — neutral bordered pill */
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white text-muted-foreground border border-border">
              Draft
            </span>
          )}
        </div>

        {/* Delete button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="absolute bottom-3 right-3 w-8 h-8 bg-black/20 hover:bg-destructive/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              title="Delete trip"
            >
              {deleting ? (
                <Spinner
                  size="small"
                  className="border-white border-t-white/60"
                />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-white" />
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
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                Delete Trip
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Destination label — only show when there's an image */}
        {activityImage && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-12">
              <p className="text-white text-xs font-medium opacity-90 truncate">
                {trip.destinations.join(" → ")}
              </p>
            </div>
          </>
        )}

        {/* Destination label for draft/no-image cards — below the icon area */}
        {!activityImage && (
          <div className="absolute bottom-3 left-4 right-12">
            <p className="text-muted-foreground text-xs font-medium truncate">
              {trip.destinations.join(" → ")}
            </p>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title + date */}
        <div>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
            {trip.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              icon: Clock,
              label: "Duration",
              value: `${trip.duration} days`,
            },
            {
              icon: Wallet,
              label: "Budget",
              value: `${trip.currency || "USD"} ${trip.budget.toLocaleString()}`,
            },
            {
              icon: Users,
              label: "Travelers",
              value: `${(trip.adults || 0) + (trip.children || 0)} ${
                (trip.adults || 0) + (trip.children || 0) === 1
                  ? "person"
                  : "people"
              }`,
            },
            {
              icon: Plane,
              label: "Style",
              value: trip.styles?.[0] || "General sightseeing",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-2 p-2.5 bg-muted rounded-xl"
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground leading-none">
                    {stat.label}
                  </p>
                  <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* View button */}
        <Link href={`/app/trips/${trip._id}`} className="mt-auto">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white text-sm font-medium flex items-center justify-center gap-2 rounded-xl h-9">
            View Itinerary
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
