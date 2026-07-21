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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/loader";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Plane,
  MapPin,
  Plus,
  ChevronRight,
  Trash2,
  Clock,
  Wallet,
  Users,
  Search,
  Globe,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { MobileTopBar } from "@/app/_components/navigation/MobileTopBar";

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
  itinerary?: Array<{
    activities?: Array<{
      image?: {
        url: string;
      };
    }>;
  }>;
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

// Get random activity image from trip
function getRandomActivityImage(trip: Trip): string | null {
  if (!trip.itinerary || trip.itinerary.length === 0) return null;

  const allActivities = trip.itinerary.flatMap((day) => day.activities || []);
  const activitiesWithImages = allActivities.filter((a) => a.image?.url);

  if (activitiesWithImages.length === 0) return null;

  const randomActivity =
    activitiesWithImages[
      Math.floor(Math.random() * activitiesWithImages.length)
    ];
  return randomActivity.image?.url || null;
}

// ─── Skeleton card replaced with Spinner-based loader ─────────────────────────

function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
      {/* Flat muted placeholder header */}
      <div className="h-36 bg-muted flex items-center justify-center">
        <Spinner size="default" />
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
          <div className="h-12 bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="h-9 bg-muted rounded-xl animate-pulse" />
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
  const activityImage = getRandomActivityImage(trip);
  const isDraft = trip.status === "draft";
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

        {/* Stats grid — all four chips use the same flat muted background */}
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
              value: `$${trip.budget.toLocaleString()}`,
            },
            {
              icon: Users,
              label: "Travelers",
              value: `${trip.travelers} ${trip.travelers === 1 ? "person" : "people"}`,
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TripsPage() {
  const { data: session } = useSession();
  const userid = session?.user?._id;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "a-z" | "z-a">(
    "latest",
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // ── Fetch trips ────────────────────────────────────────────────────────────

  async function getTrips(page = 1, append = false) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trip/get-trips/${userid}?page=${page}&limit=12`,
      );
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      const newTrips = result?.data?.trips || [];
      if (append) {
        setTrips((prev) => [...prev, ...newTrips]);
      } else {
        setTrips(newTrips);
      }

      setPaginationData(result?.data?.pagination);
      setHasMore(page < (result?.data?.pagination?.totalPages || 1));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userid) {
      getTrips(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  // ── Infinite scroll observer ────────────────────────────────────────────────

  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);

  // Fetch next page when currentPage changes
  useEffect(() => {
    if (currentPage > 1) {
      getTrips(currentPage, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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

  // ── Sort and filter ────────────────────────────────────────────────────────

  const filteredTrips = trips
    .filter((trip) => {
      const matchesSearch =
        trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destinations.some((d) =>
          d.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesType = filterType === "all" || trip.tripType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const tripTypes = [
    "all",
    ...Array.from(new Set(trips.map((t) => t.tripType))),
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary pb-24 md:pb-0">
      {/* Mobile Top Bar */}
      <MobileTopBar pageName="My Trips" />

      {/* Mobile Search & Filter */}
      <div className="md:hidden fixed top-12 left-0 right-0 z-40 bg-white border-b border-border">
        <div className="px-4 py-3 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Sort & Filter */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 h-9 text-xs flex items-center justify-center gap-1"
                >
                  <span>Sort</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem
                  onClick={() => setSortBy("latest")}
                  className={sortBy === "latest" ? "bg-accent" : ""}
                >
                  Latest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("oldest")}
                  className={sortBy === "oldest" ? "bg-accent" : ""}
                >
                  Oldest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("a-z")}
                  className={sortBy === "a-z" ? "bg-accent" : ""}
                >
                  A - Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("z-a")}
                  className={sortBy === "z-a" ? "bg-accent" : ""}
                >
                  Z - A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {trips.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs flex items-center justify-center gap-1"
                  >
                    <span>Filter</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {tripTypes.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={filterType === type ? "bg-accent" : ""}
                    >
                      {type === "all"
                        ? `All (${trips.length})`
                        : `${TRIP_TYPE_EMOJI[type] || "✈️"} ${type}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Search & Filter Bar */}
      <div className="hidden md:block bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            {/* Desktop Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search trips or destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Desktop Sort & Filter */}
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 text-sm flex items-center gap-2"
                  >
                    Sort: {sortBy}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuItem onClick={() => setSortBy("latest")}>
                    Latest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                    Oldest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("a-z")}>
                    A - Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("z-a")}>
                    Z - A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {trips.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
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
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 mt-32 md:mt-0">
        {/* Loading state — spinner-based, no skeleton */}
        {loading && trips.length === 0 ? (
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

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div
                ref={observerTarget}
                className="h-10 flex items-center justify-center mt-8"
              >
                {loading && <Spinner size="default" />}
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
