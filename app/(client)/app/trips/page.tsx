"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import { Plane, MapPin, Plus, ChevronRight, Trash2, Calendar, Wallet, Clock } from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/_components/common/CardSkeleton";

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
                      {/* Quick Stats - Enhanced */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200/50 transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500/10 rounded">
                              <GiDuration className="text-indigo-600 h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600 font-medium">
                                Duration
                              </span>
                              <span className="font-bold text-gray-900">
                                {trip?.duration}d
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-100 border border-gray-200 hover:bg-gray-200/50 transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500/10 rounded">
                              <HiOutlineCash className="text-indigo-600 h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-600 font-medium">
                                Budget
                              </span>
                              <span className="font-bold text-gray-900 text-sm line-clamp-1">
                                ₨
                                {(trip?.budget / 1000)?.toLocaleString(
                                  undefined,
                                  {
                                    maximumFractionDigits: 0,
                                  },
                                )}
                                k
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Trip Type Badge - Enhanced */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="p-1.5 bg-indigo-100 rounded">
                          <IoMdAirplane className="text-indigo-600 h-4 w-4" />
                        </div>
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                          {trip?.tripType}
                        </Badge>
                      </div>

                      {/* Destinations - Enhanced */}
                      <div className="space-y-2 pt-2 border-t border-gray-200 group-hover:border-gray-300 transition-colors duration-300">
                        <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide">
                          <MapPin className="h-3.5 w-3.5 text-indigo-600" />{" "}
                          Destinations
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {trip.destinations?.slice(0, 2).map((d: any) => (
                            <Badge
                              key={d}
                              variant="outline"
                              className="text-xs font-medium bg-white text-indigo-600 border-indigo-300 hover:border-indigo-400 transition-colors duration-300"
                            >
                              {d}
                            </Badge>
                          ))}
                          {trip.destinations?.length > 2 && (
                            <Badge
                              variant="outline"
                              className="text-xs font-medium bg-white text-indigo-600 border-indigo-300 hover:border-indigo-400 transition-colors duration-300"
                            >
                              +{trip.destinations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    {/* Footer - Enhanced */}
                    <CardFooter className="p-4 border-t border-gray-200 mt-auto transition-colors duration-300 bg-gray-50">
                      <Link href={`/app/trips/${trip._id}`} className="w-full">
                        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold group/btn flex items-center justify-center gap-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                          View Itinerary
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
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
          /* Empty State - Enhanced */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 p-8 bg-indigo-100 rounded-full animate-bounce relative shadow-xl">
              <Plane className="h-16 w-16 text-indigo-600 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No trips planned yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md text-lg leading-relaxed">
              Start your adventure by planning your first trip. Our AI will help
              you create an amazing itinerary tailored to your preferences!
            </p>
            <Link href="/app/new-trip">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 h-12 px-8 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <Plus className="h-5 w-5" />
                Plan Your First Trip
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
