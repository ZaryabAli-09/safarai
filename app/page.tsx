"use client";
import { signOut, useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  console.log("Session Data:", session);

  if (status === "loading") return <p>Loading...</p>;
  if (!session)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="mb-4">You must be signed in to view this page.</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          <a href="/sign-in">Sign In</a>
        </button>
      </div>
    );

  return (
    <div>
      <h1>Welcome {session.user?.email}</h1>
      <p>Role: {session.user?.role}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>{" "}
    </div>
  );
}
