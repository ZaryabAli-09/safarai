"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { useState } from "react";
import Image from "next/image";
import {
  IoPaperPlaneOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import { FiUsers, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/public/assets/logo.png";

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const activePathname = pathname.split("/")[2];
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "My Trips", href: "/app/trips", icon: IoPaperPlaneOutline },
    { label: "Profile", href: "/app/profile", icon: FiUsers },
  ];

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
      {/* ===== Desktop Navigation ===== */}
      <nav className="hidden md:flex sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/app/trips" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:inline">SafarAi</span>
            </div>
          </Link>

          {/* Middle: Navigation Links */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePathname === item.href.split("/")[2];

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-all duration-200 relative group",
                    isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>

                  {/* Animated underline */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/app/new-trip"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
            >
              <IoAddCircleOutline className="h-5 w-5" />
              <span>New Trip</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium text-sm disabled:opacity-50"
            >
              <IoLogOutOutline className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ===== Mobile Navigation ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <nav className="bg-white border-t border-gray-200 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Icons */}
            <div className="flex items-center gap-3">
              <Link href="/app/trips" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <IoPaperPlaneOutline className="h-6 w-6 text-indigo-600" />
              </Link>

              <Link href="/app/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FiUsers className="h-6 w-6 text-gray-600" />
              </Link>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <IoLogOutOutline className="h-6 w-6 text-red-600" />
              </button>
            </div>

            {/* Logo/Brand */}
            <Link href="/app/trips" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
            </Link>

            {/* Right: New Trip Button */}
            <Link
              href="/app/new-trip"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-110"
            >
              <IoAddCircleOutline className="h-6 w-6" />
            </Link>
          </div>
        </nav>
      </div>

      {/* Spacer for mobile */}
      <div className="md:hidden h-20" />
    </>
  );
}
