import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { AppNav } from "@/app/components/AppNav";

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
    <div className="">
      <AppNav />
      <div className=" p-10 bg-gray-50">{children}</div>
    </div>
  );
}
