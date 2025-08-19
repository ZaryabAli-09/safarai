"use client";
import { signOut, useSession } from "next-auth/react";
import { Navbar } from "./components/Navbar";
import LandingPage from "./components/LandingPage";

export default function Dashboard() {
  const { data: session, status } = useSession();
  console.log("Session Data:", session);

  // if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      <Navbar />
      <LandingPage />
      {/* <h1>Welcome {session?.user?.email}</h1>
      <p>Role: {session?.user?.role}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>{" "} */}
    </div>
  );
}
