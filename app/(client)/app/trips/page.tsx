"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Search, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { MobileTopBar } from "@/app/_components/navigation/MobileTopBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/loader";
import TripSidebar from "@/app/_components/common/TripSidebar";
import TripCard, {
  Trip,
  TripCardSkeleton,
  TripFilters,
} from "@/app/_components/common/TripCard";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";

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
    async (page = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setInitialLoading(true);
      }
      try {
        const res = await fetch(
          `/api/trip/get-trips/${userid}?page=${page}&limit=6`,
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

  useEffect(() => {
    if (userid) {
      setTrips([]);
      setCurrentPage(1);
      setPaginationData(null as any);
      setHasMore(true);
      setHasUserScrolled(false);
      getTrips(1, false);
    } else {
      setInitialLoading(false);
    }
  }, [userid, getTrips]);

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
      getTrips(currentPage, true);
    }
  }, [currentPage, getTrips]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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

  const filteredTrips = trips
    .filter((trip) => {
      const matchesSearch =
        filters.searchTerm === "" ||
        trip.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        trip.destinations.some((d: string) =>
          d.toLowerCase().includes(filters.searchTerm.toLowerCase()),
        );

      const matchesStatus =
        filters.statusFilter === "all" ||
        (filters.statusFilter === "ready" && trip.status === "completed") ||
        (filters.statusFilter === "draft" && trip.status === "draft") ||
        (filters.statusFilter === "in-progress" &&
          trip.status === "generating");

      const matchesStyle =
        filters.styleFilter.length === 0 ||
        (trip.styles &&
          trip.styles.some((s: string) => filters.styleFilter.includes(s)));

      const matchesDuration =
        trip.duration >= filters.durationRange[0] &&
        trip.duration <= filters.durationRange[1];

      const matchesBudget =
        trip.budget >= filters.budgetRange[0] &&
        trip.budget <= filters.budgetRange[1];

      return (
        matchesSearch &&
        matchesStatus &&
        matchesStyle &&
        matchesDuration &&
        matchesBudget
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
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

  const [mobileSearchTerm, setMobileSearchTerm] = useState("");

  const handleMobileSearch = (value: string) => {
    setMobileSearchTerm(value);
    setFilters((prev: TripFilters) => ({ ...prev, searchTerm: value }));
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-secondary">
        <MobileTopBar pageName="My Trips" />

        <div className="md:hidden">
          <div className="fixed top-12 left-0 right-0 z-40 bg-white border-b border-border">
            <div className="px-4 py-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={mobileSearchTerm}
                  onChange={(e) => handleMobileSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {isLoadingTrips && (
                  <Spinner size="small" className="absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

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
                    {(["latest", "oldest", "a-z", "z-a"] as const).map((opt) => (
                      <DropdownMenuItem
                        key={opt}
                        onClick={() =>
                          setFilters((prev: TripFilters) => ({
                            ...prev,
                            sortBy: opt,
                          }))
                        }
                        className={filters.sortBy === opt ? "bg-accent" : ""}
                      >
                        {opt === "latest" && "Latest"}
                        {opt === "oldest" && "Oldest"}
                        {opt === "a-z" && "A - Z"}
                        {opt === "z-a" && "Z - A"}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-xs flex items-center justify-center gap-1"
                    >
                      <span>Status</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {[
                      { value: "all", label: "All Status" },
                      { value: "ready", label: "Ready" },
                      { value: "draft", label: "Draft" },
                      { value: "in-progress", label: "In Progress" },
                    ].map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() =>
                          setFilters((prev: TripFilters) => ({
                            ...prev,
                            statusFilter: opt.value as any,
                          }))
                        }
                        className={
                          filters.statusFilter === opt.value ? "bg-accent" : ""
                        }
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <Sidebar>
          <SidebarTrigger className="hidden md:flex" />
          <SidebarRail />
          <div className="w-64 shrink-0 hidden md:block">
            <TripSidebar
              trips={trips}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </Sidebar>

        <SidebarInset className="mt-32 md:mt-0">
          <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
            {initialLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <TripCardSkeleton key={i} />
                  ))}
              </div>
            ) : filteredTrips.length > 0 ? (
              <>
                <AnimatePresence mode="popLayout">
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${
                      isLoadingTrips ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-2">
                  {filters.searchTerm ||
                  filters.statusFilter !== "all" ||
                  filters.styleFilter.length > 0
                    ? "No trips match your filters"
                    : "No trips yet"}
                </h2>

                <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
                  {filters.searchTerm ||
                  filters.statusFilter !== "all" ||
                  filters.styleFilter.length > 0
                    ? "Try adjusting your search or filters to find your trips."
                    : "Let our AI plan your perfect trip! Just tell us where you want to go and we'll handle the rest."}
                </p>

                {!filters.searchTerm &&
                  filters.statusFilter === "all" &&
                  filters.styleFilter.length === 0 && (
                    <Link href="/app/new-trip">
                      <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 rounded-xl px-6">
                        <Plus className="w-4 h-4" />
                        Plan Your First Trip
                      </Button>
                    </Link>
                  )}

                {(filters.searchTerm ||
                  filters.statusFilter !== "all" ||
                  filters.styleFilter.length > 0) && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}