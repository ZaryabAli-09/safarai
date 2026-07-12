"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useState } from "react";
import { User, LogOut, Plus, Plane } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/assets/logo.png";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: "Trips", href: "/app/trips", icon: Plane },
    { label: "Profile", href: "/app/profile", icon: User },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    const toastId = toast.loading("Signing out...");

    try {
      await signOut({ redirect: false });
      toast.success("Signed out successfully!", { id: toastId });
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out", { id: toastId });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo — actual image */}
          <Link href="/app/trips" className="flex items-center">
            <Image src={Logo} alt="SafarAI" className="h-10 w-auto" priority />
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/app/new-trip"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation — Bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 flex items-center justify-center transition-all",
                    active && "scale-110",
                  )}
                >
                  <Icon className={cn("w-5 h-5", active && "fill-current")} />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground disabled:opacity-50 transition-colors hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Floating New Trip Button — Mobile */}
      <Link
        href="/app/new-trip"
        className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden h-16" />
    </>
  );
}
