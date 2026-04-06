"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BsThreeDots } from "react-icons/bs";
import { Badge } from "@/components/ui/badge";
import { IoMdAirplane } from "react-icons/io";
import { HiOutlineCash } from "react-icons/hi";
import { GiDuration } from "react-icons/gi";
import { SkeletonCard } from "@/app/custom components/CardSkeleton/CardSkeleton";
import { Input } from "@/components/ui/input";
import { Plane, MapPin, Plus } from "lucide-react";
import Link from "next/link";

// ✅ Helper to format date as "4 Nov 2025"
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
      const res = await fetch(`/api/trip/get-trips/${userid}?page=${page}&limit=6`);
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
        d.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Trips</h1>
            <p className="text-gray-600">
              {paginationData?.total || 0} trips created • {" "}
              {filteredTrips.length} trips displayed
            </p>
          </div>
          <Link href="/app/new-trip">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 h-12 px-6">
              <Plus className="h-5 w-5" />
              Plan New Trip
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <Input
            type="text"
            placeholder="🔍 Search trips by name or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 text-base"
          />
        </div>
        {/* Trips Grid Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <SkeletonCard key={i} />
              ))}
          </div>
        ) : filteredTrips && filteredTrips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip: any) => (
                <Card key={trip?._id} className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Image Section */}
                  <CardHeader className="p-0 relative h-48">
                    <Image
                      className="w-full h-full object-cover"
                      width={500}
                      height={300}
                      src="/assets/kumrat.jpg"
                      alt={trip.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Menu Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all">
                          <BsThreeDots className="text-white text-xl" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your trip itinerary will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toast.success("Trip deleted successfully!")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Title and Date Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="text-sm opacity-90 mb-1">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </p>
                      <h3 className="text-xl font-bold line-clamp-2">{trip.name}</h3>
                    </div>
                  </CardHeader>

                  {/* Content Section */}
                  <CardContent className="p-4 space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <GiDuration className="text-indigo-600 h-5 w-5" />
                        <span className="font-medium">{trip?.duration} days</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <HiOutlineCash className="text-green-600 h-5 w-5" />
                        <span className="font-medium">₨{trip?.budget?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Trip Type Badge */}
                    <div className="flex items-center gap-2">
                      <IoMdAirplane className="text-indigo-600 h-4 w-4" />
                      <Badge className="bg-indigo-100 text-indigo-700">
                        {trip?.tripType}
                      </Badge>
                    </div>

                    {/* Destinations */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Destinations
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {trip.destinations?.slice(0, 2).map((d: any) => (
                          <Badge key={d} variant="outline" className="text-xs">
                            {d}
                          </Badge>
                        ))}
                        {trip.destinations?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{trip.destinations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer */}
                  <CardFooter className="p-4 border-t">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      View Itinerary
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {paginationData && paginationData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-indigo-600" : ""}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))}
                  disabled={currentPage === paginationData.totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
              <Plane className="h-16 w-16 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No trips planned yet</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Start your adventure by planning your first trip. Our AI will help you create an amazing itinerary!
            </p>
            <Link href="/app/new-trip">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 h-12 px-8 text-base">
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
