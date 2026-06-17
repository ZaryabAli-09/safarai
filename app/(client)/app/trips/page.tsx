"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/app/_components/common/CardSkeleton";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Trips() {
  const { data: session } = useSession();
  const userid = session?.user?._id;
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState<any>(null);

  async function getTrips(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/trip/get-trips/${userid}?page=${page}&limit=6`,
      );
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message);
        setLoading(false);
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
  }, [userid, currentPage]);

  const filteredTrips = trips.filter(
    (trip: any) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destinations.some((d: string) =>
        d.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
          <p className="text-gray-500 text-sm mt-1">
            {paginationData?.total || 0} trips • {filteredTrips.length} shown
          </p>
        </div>

        {/* Search - Desktop only (mobile has floating button) */}
        <div className="hidden md:block mb-6">
          <Input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 max-w-md bg-white"
          />
        </div>

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <CardSkeleton key={i} />
              ))}
          </div>
        ) : filteredTrips && filteredTrips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip: any) => (
                <div
                  key={trip?._id}
                  className="group h-full cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1"
                >
                  <Card className="w-full overflow-hidden h-full flex flex-col bg-white shadow-md hover:shadow-xl transition-all duration-300 relative">
                    {/* Image Section */}
                    <CardHeader className="p-0 relative h-48 overflow-hidden">
                      <Image
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        width={500}
                        height={300}
                        src="/assets/kumrat.jpg"
                        alt={trip.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-100 group-hover:from-black/80 group-hover:via-black/40 transition-all duration-300" />

                      {/* Menu Button - Enhanced */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2.5 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl">
                            <Trash2 className="text-white text-lg" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Your trip itinerary
                              will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                toast.success("Trip deleted successfully!")
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Title and Date Overlay - Enhanced */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wider">
                          {formatDate(trip.startDate)} —{" "}
                          {formatDate(trip.endDate)}
                        </p>
                        <h3 className="text-xl font-bold line-clamp-2 group-hover:line-clamp-none transition-all">
                          {trip.name}
                        </h3>
                      </div>
                    </CardHeader>

                    {/* Content Section */}
                    <CardContent className="p-5 space-y-4 flex-grow relative z-10">
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="flex items-center gap-2">
                            <Clock className="text-blue-600 h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Duration
                              </span>
                              <span className="font-semibold text-gray-900">
                                {trip?.duration} days
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="flex items-center gap-2">
                            <Wallet className="text-blue-600 h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Budget
                              </span>
                              <span className="font-semibold text-gray-900 text-sm">
                                ₨{(trip?.budget / 1000)?.toFixed(0)}k
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trip Type Badge */}
                      <div className="flex items-center gap-2 pt-1">
                        <Plane className="text-blue-600 h-4 w-4" />
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          {trip?.tripType}
                        </Badge>
                      </div>

                      {/* Destinations */}
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-blue-600" />
                          Destinations
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {trip.destinations?.slice(0, 2).map((d: any) => (
                            <Badge
                              key={d}
                              variant="outline"
                              className="text-xs font-medium bg-white text-gray-600 border-gray-200"
                            >
                              {d}
                            </Badge>
                          ))}
                          {trip.destinations?.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs font-medium bg-white text-gray-600 border-gray-200"
                            >
                              +{trip.destinations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    {/* Footer */}
                    <CardFooter className="p-4 border-t border-gray-100 mt-auto bg-gray-50">
                      <Link href={`/app/trips/${trip._id}`} className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2">
                          View Itinerary
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination Controls - Enhanced */}
            {paginationData && paginationData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg px-4 py-2 font-medium"
                >
                  ← Previous
                </Button>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {Array.from(
                    { length: paginationData.totalPages },
                    (_, i) => i + 1,
                  ).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        rounded-lg font-semibold transition-all duration-300 transform hover:scale-105
                        ${
                          currentPage === page
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl"
                            : "border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 hover:scale-105"
                        }
                      `}
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
                  className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-lg px-4 py-2 font-medium"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 p-6 bg-blue-100 rounded-full">
              <Plane className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No trips yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              Plan your first trip and let our AI create an amazing itinerary
              for you.
            </p>
            <Link href="/app/new-trip">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Plan a Trip
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
