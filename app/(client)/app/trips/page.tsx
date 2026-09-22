"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { MobileTopBar } from "@/app/_components/navigation/MobileTopBar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loader";
import TripSidebar from "@/app/_components/common/TripSidebar";
import TripCard, {
  Trip,
  TripCardSkeleton,
  TripFilters,
} from "@/app/_components/common/TripCard";
import { MobileTripFilters } from "@/app/_components/common/MobileTripFilters"; // Import the new component

interface PaginationData {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

const DEFAULT_FILTERS: TripFilters = {
  searchTerm: "",
  sortBy: "latest",
  statusFilter: "all",
  styleFilter: [],
  durationRange: [1, 30],
  budgetRange: [0, 100000],
};

export default function TripsPage() {
  const { data: session } = useSession();
  const userid = session?.user?._id;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<PaginationData | null>(
    null,
  );
  const [hasMore, setHasMore] = useState(true);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [filters, setFilters] = useState<TripFilters>(DEFAULT_FILTERS);

  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingTrips = initialLoading || loadingMore;

  const getTrips = useCallback(
    async (page = 1, append = false, currentFilters: TripFilters) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setInitialLoading(true);
      }
      try {
        // Build query parameters based on filters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "6",
          searchTerm: currentFilters.searchTerm,
          sortBy: currentFilters.sortBy,
          statusFilter: currentFilters.statusFilter,
          durationMin: currentFilters.durationRange[0].toString(),
          durationMax: currentFilters.durationRange[1].toString(),
        });

        const res = await fetch(
          `/api/trip/get-trips/${userid}?${queryParams.toString()}`,
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
        if (append) {
          setLoadingMore(false);
        } else {
          setInitialLoading(false);
        }
      }
    },
    [userid],
  );

  // Initial load and re-fetch when filters change
  useEffect(() => {
    if (userid) {
      setTrips([]);
      setCurrentPage(1);
      setPaginationData(null);
      setHasMore(true);
      setHasUserScrolled(false);
      getTrips(1, false, filters);
    } else {
      setInitialLoading(false);
    }
  }, [userid, filters, getTrips]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 0) {
        setHasUserScrolled(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || initialLoading || !hasUserScrolled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setCurrentPage((prev: number) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.unobserve(target);
  }, [hasMore, loadingMore, initialLoading, hasUserScrolled]);

  useEffect(() => {
    if (currentPage > 1) {
      getTrips(currentPage, true, filters);
    }
  }, [currentPage, getTrips, filters]);

  const handleDelete = (id: string) => {
    setTrips((prev: Trip[]) => prev.filter((t: Trip) => t._id !== id));
    if (paginationData) {
      setPaginationData((prev: PaginationData | null) =>
        prev
          ? {
              ...prev,
              total: Math.max(0, prev.total - 1),
            }
          : prev,
      );
    }
  };

  const handleApplyFilters = (newFilters: TripFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.searchTerm !== "" ||
    filters.sortBy !== "latest" ||
    filters.statusFilter !== "all" ||
    filters.styleFilter.length > 0 ||
    filters.durationRange[0] !== DEFAULT_FILTERS.durationRange[0] ||
    filters.durationRange[1] !== DEFAULT_FILTERS.durationRange[1];

  return (
    <div className="min-h-screen ">
      <MobileTopBar pageName="My Trips" />

      {/* New Mobile Filter Component */}
      <MobileTripFilters
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isLoading={isLoadingTrips}
      />

      {/* Desktop: 35% sidebar / 65% content */}
      <div className="mx-auto max-w-7xl px-4 pt-32 pb-8 md:flex md:gap-6 md:pt-8">
        <div className="hidden md:block  md:w-[35%] shrink-0">
          <TripSidebar
            trips={trips}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="md:w-[65%]">
          <h1 className="hidden md:block text-lg font-semibold text-foreground mb-4">
            My Trips
          </h1>

          {initialLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <TripCardSkeleton key={i} />
                ))}
            </div>
          ) : trips.length > 0 ? ( // Changed from filteredTrips to trips since API handles filtering
            <>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${
                  isLoadingTrips ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {trips.map((trip, idx) => (
                  <TripCard
                    key={trip._id}
                    trip={trip}
                    index={idx}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {hasMore && (
                <div ref={observerTarget} className="mt-8 flex justify-center">
                  {loadingMore ? (
                    <div className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground shadow-sm">
                      <Spinner size="small" />
                      <span>Loading more trips...</span>
                    </div>
                  ) : (
                    <div className="h-1 w-full" aria-hidden="true" />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-2">
                {hasActiveFilters
                  ? "No trips match your filters"
                  : "No trips yet"}
              </h2>

              <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
                {hasActiveFilters
                  ? "Try adjusting your search or filters to find your trips."
                  : "Let our AI plan your perfect trip! Just tell us where you want to go and we'll handle the rest."}
              </p>

              {!hasActiveFilters && (
                <Link href="/app/new-trip">
                  <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 rounded-xl px-6">
                    <Plus className="w-4 h-4" />
                    Plan Your First Trip
                  </Button>
                </Link>
              )}

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
