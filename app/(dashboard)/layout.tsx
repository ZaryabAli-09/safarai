/**
 * Layout for dashboard/protected routes
 * Requires authentication - protected via middleware
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { AppNav } from "@/_components/navigation/AppNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="relative">
      <AppNav />
      <div>{children}</div>
    </div>
  );
}
