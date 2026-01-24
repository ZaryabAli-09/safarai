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
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  async function getTrips() {
    setLoading(true);
    try {
      const res = await fetch(`/api/trip/get-trips/${userid}`);
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message);
        setLoading(false);
        return;
      }
      setTrips(result?.data);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userid) {
      getTrips();
    }
  }, [session?.user]);

  const filteredTrips = trips.filter(
    (trip: any) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destinations.some((d: string) =>
        d.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="flex flex-col items-center justify-center w-full py-10">
      <div className="w-full max-w-md mb-6">
        <Input
          type="text"
          placeholder="Search trips by name or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {/* ✅ Loading state skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <SkeletonCard key={i} />
            ))}
        </div>
      ) : filteredTrips && filteredTrips.length > 0 ? (
        // ✅ Responsive grid layout (1 card on small, 2 on md, 3 on large)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full max-w-6xl ">
          {filteredTrips.map((trip: any) => (
            <Card key={trip?._id} className="w-full max-w-sm ">
              {/* --- Header Section --- */}
              <CardHeader className="relative ">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <BsThreeDots className="hover:cursor-pointer z-20 text-3xl text-white absolute top-3 right-8" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your trip and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          toast.success("Trip deleted successfully!")
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* ✅ Image with dark overlay */}
                <div className="relative">
                  <Image
                    className="w-full h-full object-cover rounded-md overflow-hidden"
                    width={1000}
                    height={1000}
                    src="/assets/kumrat.jpg"
                    alt="Trip Image"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-md" />
                </div>

                {/* ✅ Formatted Date and Title */}
                <div className="absolute bottom-12 left-8 text-white z-20">
                  <div className="text-sm md:text-base font-medium opacity-90">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-semibold">
                    {trip.name}
                  </CardTitle>
                </div>
              </CardHeader>

              {/* --- Card Content Section --- */}
              <CardContent className="space-y-3 px-5 ">
                {/* ✅ Duration */}
                <CardDescription className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                  <GiDuration className="text-lg" />
                  <span>{trip?.duration} Days Trip</span>
                </CardDescription>

                {/* ✅ Budget */}
                <CardDescription className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                  <HiOutlineCash className="text-lg" />
                  <span>
                    Budget:{""}
                    {trip?.budget} PKR
                  </span>
                </CardDescription>

                {/* ✅ Destinations */}
                <div className="flex flex-wrap gap-2 ">
                  {trip.destinations?.map((d: any) => (
                    <Badge
                      key={d}
                      className="bg-blue-500 text-white text-xs md:text-sm"
                      variant="secondary"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              {/* --- Footer Section --- */}
              <CardFooter className="flex items-center justify-between px-5">
                <CardDescription className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                  <IoMdAirplane className="text-lg" />
                  <span>{trip?.tripType}</span>
                </CardDescription>
                <Button className="cursor-pointer text-sm md:text-base px-4">
                  See Your Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // ✅ No trips message
        <div className="text-gray-600 text-lg font-medium mt-10 text-center">
          No trips yet. Start planning your next adventure!
        </div>
      )}
    </div>
  );
}
