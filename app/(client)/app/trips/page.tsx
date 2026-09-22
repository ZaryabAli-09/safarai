"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { MapPinned, Plus, Sparkles } from "lucide-react";
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
      const hasUnpaginatedFilters =
        currentFilters.searchTerm.trim() !== "" ||
        currentFilters.statusFilter !== "all" ||
        currentFilters.durationRange[0] !== DEFAULT_FILTERS.durationRange[0] ||
        currentFilters.durationRange[1] !== DEFAULT_FILTERS.durationRange[1];

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
          paginate: hasUnpaginatedFilters ? "false" : "true",
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
        setHasMore(
          !hasUnpaginatedFilters &&
            page < (result?.data?.pagination?.totalPages || 1),
        );
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
          <TripSidebar filters={filters} onFiltersChange={setFilters} />
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
            <div className="flex min-h-[420px] w-full items-center justify-center px-4">
              <div className="flex w-full max-w-md flex-col items-center text-center">
                {/* Icon */}
                <div className="relative mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient-muted">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background">
                      <MapPinned className="h-5 w-5 text-[var(--brand-purple)]" />
                    </div>
                  </div>

                  {/* Small sparkle accent */}
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                    <Sparkles className="h-3 w-3 text-[var(--brand-coral)]" />
                  </div>
                </div>

                {/* Heading */}
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  {hasActiveFilters
                    ? "No trips match your filters"
                    : "No trips yet"}
                </h2>

                {/* Description */}
                <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
                  {hasActiveFilters
                    ? "Try adjusting your search or filters to find your trips."
                    : "Start planning your next adventure. Tell us where you want to go and we'll help create the perfect trip."}
                </p>

                {/* Actions */}
                {!hasActiveFilters ? (
                  <Link href="/app/new-trip" className="mt-5">
                    <Button
                      className="
            h-9
            rounded-full
            bg-brand-gradient
            px-4
            text-xs
            font-medium
            text-white
            shadow-sm
            transition-opacity
            hover:opacity-90
            sm:h-10
            sm:px-5
            sm:text-sm
          "
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Plan Your First Trip
                    </Button>
                  </Link>
                ) : (
                  <button
                    onClick={handleResetFilters}
                    className="
          mt-5
          text-xs
          font-medium
          text-muted-foreground
          transition-colors
          hover:text-foreground
          sm:text-sm
        "
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
