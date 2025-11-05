"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Trips() {
  const { data: session } = useSession();
  const userid = session?.user?._id;

  console.log(userid);
  const [trips, setTrips] = useState([]);
  async function getTrips() {
    try {
      const res = await fetch(`/api/trip/get-trips/${userid}`);

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message);
        return;
      }
      setTrips(result?.data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  console.log(trips);
  useEffect(() => {
    if (userid) {
      getTrips();
    }
  }, [session?.user]);
  return <div>hello</div>;
}
