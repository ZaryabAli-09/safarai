import { redirect } from "next/navigation";

export default function AppPage() {
  // Redirect to trips page as the default app home
  redirect("/app/trips");
}
