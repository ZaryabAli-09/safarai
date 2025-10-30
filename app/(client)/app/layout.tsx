import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { AppNav } from "@/app/custom components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin"); // redirect unauthenticated users
  }

  return (
    <div className="relative">
      <AppNav />

      <div>{children}</div>
    </div>
  );
}
