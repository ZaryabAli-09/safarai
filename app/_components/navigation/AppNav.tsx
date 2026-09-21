"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import {
  User,
  LogOut,
  Plus,
  UserStarIcon,
  Send,
  MapPinPlusInsideIcon,
} from "lucide-react";
import Image from "next/image";
import Logo from "@/public/assets/logo.png";
import { Button } from "@/components/ui/button";
export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const userId = session?.user?._id;
    if (!userId) return;
    fetch(`/api/profile/get-profile/${userId}`)
      .then((res) => res.json())
      .then((result) => setAvatar(result?.data?.avatar || ""))
      .catch(() => undefined);
  }, [session?.user?._id]);

  const navItems = [
    { label: "Feed", href: "/app/feed", icon: UserStarIcon },
    { label: "Trips", href: "/app/trips", icon: Send },
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
    } catch {
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
          <Link href="/app/trips" className="flex items-center shrink-0">
            <Image className="w-auto h-10" src={Logo} alt="SafarAI" priority />
            <div className="font-bold text-black">SAFAR AI.</div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
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
                        ? "bg-accent text-black"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {item.label === "Profile" && avatar ? (
                      <Image
                        src={`/profile-avatars/${avatar}`}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {pathname !== "/app/new-trip" && (
              <Button className="bg-brand-gradient-diagonal transition-all duration-300 hover:brightness-110 cursor-pointer">
                <Link href="/app/new-trip" className="flex items-center gap-2">
                  <MapPinPlusInsideIcon className="w-5 h-5" />
                  New Trip
                </Link>
              </Button>
            )}
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 shadow-2xl shadow-black ">
        <div className="relative">
          {/* Bar with circular notch cut via CSS mask (width-independent, always round) */}
          <div
            className="bg-slate-100 rounded-t-2xl h-16 shadow-[0_-6px_16px_rgba(0,0,0,0.08)]"
            style={{
              WebkitMaskImage:
                "radial-gradient(circle 40px at 50% 8px, transparent 0%, transparent 94%, black 100%)",
              maskImage:
                "radial-gradient(circle 40px at 50% 8px, transparent 0%, transparent 94%, black 100%)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              transform: "translateZ(0)",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
          />

          {/* Nav content overlay */}
          <div className="absolute inset-0 flex items-center justify-between px-3">
            {/* Left items */}
            <div className="flex items-center justify-around w-[40%]">
              {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center gap-1 py-1 min-w-[56px] transition-transform active:scale-95"
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-colors",
                        active
                          ? "text-[var(--brand-coral)] stroke-[2.2]"
                          : "text-slate-700 stroke-[1.8]",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] leading-none transition-colors",
                        active
                          ? "font-bold text-[var(--brand-coral)]"
                          : "font-medium text-slate-700",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Center gap for the floating button */}
            <div className="w-[20%]" />

            {/* Right items */}
            <div className="flex items-center justify-around w-[40%]">
              {navItems.slice(2).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center gap-1 py-1 min-w-[56px] transition-transform active:scale-95"
                  >
                    {item.label === "Profile" && avatar ? (
                      <div
                        className={cn(
                          "p-[1.5px] rounded-full transition-all",
                          active ? "bg-[var(--brand-coral)]" : "bg-transparent",
                        )}
                      >
                        <Image
                          src={`/profile-avatars/${avatar}`}
                          alt=""
                          width={24}
                          height={24}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <Icon
                        className={cn(
                          "w-6 h-6 transition-colors",
                          active
                            ? "text-[var(--brand-coral)] stroke-[2.2]"
                            : "text-slate-700 stroke-[1.8]",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "text-[11px] leading-none transition-colors",
                        active
                          ? "font-bold text-[var(--brand-coral)]"
                          : "font-medium text-slate-700",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex flex-col items-center gap-1 py-1 min-w-[56px] text-slate-700 disabled:opacity-50 transition-transform active:scale-95"
              >
                <LogOut className="w-6 h-6 stroke-[1.8]" />
                <span className="text-[11px] leading-none font-medium">
                  Logout
                </span>
              </button>
            </div>
          </div>

          {/* Floating New Trip Button */}
          {pathname !== "/app/new-trip" && (
            <Link
              href="/app/new-trip"
              className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 w-18 h-18 rounded-full bg-brand-gradient-diagonal shadow-[0_10px_24px_-4px_rgba(239,69,99,0.5)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              aria-label="New Trip"
            >
              <Plus className="w-8 h-8 text-white stroke-[2.5]" />
            </Link>
          )}
        </div>
      </div>
      {/* Spacers */}
      <div className="hidden md:block h-16" />
      <div className="md:hidden h-16" />
    </>
  );
}
