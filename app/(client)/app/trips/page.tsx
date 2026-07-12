"use client";

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
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plane,
  MapPin,
  Plus,
  ChevronRight,
  Trash2,
  Calendar,
  Wallet,
  Clock,
  Users,
  Search,
  Loader2,
  Globe,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  travelers: number;
  status: "generating" | "completed" | "draft";
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Trip type emoji */
const TRIP_TYPE_EMOJI: Record<string, string> = {
  adventure: "🏔️",
  cultural: "🏛️",
  relaxation: "🏖️",
  family: "👨‍👩‍👧‍👦",
  honeymoon: "💑",
  solo: "🎒",
};

// ─── Skeleton card ────────────────────────────────────────────────────────────

function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="h-36 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-muted rounded-xl" />
          <div className="h-12 bg-muted rounded-xl" />
        </div>
        <div className="h-9 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ─── Trip card ────────────────────────────────────────────────────────────────

function TripCard({
  trip,
  index,
  onDelete,
}: {
  trip: Trip;
  index: number;
  onDelete: (id: string) => void;
}) {
  const emoji = TRIP_TYPE_EMOJI[trip.tripType] || "✈️";
  const [deleting, setDeleting] = useState(false);

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
      {/* Card header — flat primary */}
      <div className="relative h-36 bg-primary overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-4 border-white" />
          <div className="absolute bottom-2 left-6 w-16 h-16 rounded-full border-4 border-white" />
          <div className="absolute top-12 left-2 w-8 h-8 rounded-full border-2 border-white" />
        </div>

        {/* Trip emoji */}
        <div className="absolute top-4 left-4 text-4xl">{emoji}</div>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
              trip.status === "completed"
                ? "bg-white/20 text-white border-white/40"
                : trip.status === "generating"
                  ? "bg-white/10 text-white/80 border-white/20"
                  : "bg-white/10 text-white/70 border-white/20"
            }`}
          >
            {trip.status === "completed"
              ? "✓ Ready"
              : trip.status === "generating"
                ? "⏳ Generating"
                : "Draft"}
          </span>
        </div>

        {/* Delete button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="absolute bottom-3 right-3 w-8 h-8 bg-black/20 hover:bg-destructive/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              title="Delete trip"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
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

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Destination on image */}
        <div className="absolute bottom-3 left-4 right-12">
          <p className="text-white text-xs font-medium opacity-90 truncate">
            {trip.destinations.join(" → ")}
          </p>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title */}
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
          <div className="flex items-center gap-2 p-2.5 bg-muted rounded-xl">
            <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                Duration
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {trip.duration} days
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted rounded-xl">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                Budget
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                ${trip.budget.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted rounded-xl">
            <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                Travelers
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5">
                {trip.travelers} {trip.travelers === 1 ? "person" : "people"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-muted rounded-xl">
            <Plane className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">
                Style
              </p>
              <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">
                {trip.tripType}
              </p>
            </div>
          </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripsPage() {
  const { data: session } = useSession();
  const userid = session?.user?._id;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  // ── Fetch trips ────────────────────────────────────────────────────────────

  async function getTrips(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trip/get-trips/${userid}?page=${page}&limit=9`,
      );
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message);
        return;
      }
      setTrips(result?.data?.trips || []);
      setPaginationData(result?.data?.pagination);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userid) {
      getTrips(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid, currentPage]);

  // ── Delete handler ─────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    setTrips((prev) => prev.filter((t) => t._id !== id));
    if (paginationData) {
      setPaginationData((prev: any) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destinations.some((d) =>
        d.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesType = filterType === "all" || trip.tripType === filterType;
    return matchesSearch && matchesType;
  });

  const tripTypes = [
    "all",
    ...Array.from(new Set(trips.map((t) => t.tripType))),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero banner — flat primary, no gradient */}
      <div className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                  My Trips ✈️
                </h1>
                <p className="text-white/70 text-sm">
                  {paginationData?.total || 0} trip
                  {(paginationData?.total || 0) !== 1 ? "s" : ""} planned
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="mt-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search trips or destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter chips */}
        {trips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {tripTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize ${
                  filterType === type
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {type === "all"
                  ? `All (${trips.length})`
                  : `${TRIP_TYPE_EMOJI[type] || "✈️"} ${type}`}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <TripCardSkeleton key={i} />
              ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <>
            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTrips.map((trip, idx) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    index={idx}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* Pagination */}
            {paginationData && paginationData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-4 rounded-xl"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: paginationData.totalPages },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 p-0 rounded-xl ${
                        currentPage === page
                          ? "bg-primary hover:bg-primary/90"
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(paginationData.totalPages, currentPage + 1),
                    )
                  }
                  disabled={currentPage === paginationData.totalPages}
                  className="h-9 px-4 rounded-xl"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center">
                <Globe className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              {searchTerm || filterType !== "all"
                ? "No trips match your search"
                : "No trips yet"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters to find your trips."
                : "Let our AI plan your perfect trip! Just tell us where you want to go and we'll handle the rest."}
            </p>

            {!searchTerm && filterType === "all" && (
              <Link href="/app/new-trip">
                <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 rounded-xl px-6">
                  <Plus className="w-4 h-4" />
                  Plan Your First Trip
                </Button>
              </Link>
            )}

            {(searchTerm || filterType !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
