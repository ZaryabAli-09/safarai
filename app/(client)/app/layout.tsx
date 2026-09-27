import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/config/authOptions";
import { AppNav } from "@/app/_components/navigation/AppNav";
import { SITE_NAME } from "@/seo.config";

/**
 * Baseline metadata for the signed-in area. Everything below `/app` is private,
 * so the section is kept out of search results; individual routes refine their
 * own title in their own `layout.tsx`.
 */
export const metadata: Metadata = {
  title: "App",
  description: `Your private ${SITE_NAME} workspace for planning and managing trips.`,
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in"); // redirect unauthenticated users
  }

  return (
    <div className="relative pb-24 md:pb-0">
      <AppNav />

      <div>{children}</div>
    </div>
  );
}
