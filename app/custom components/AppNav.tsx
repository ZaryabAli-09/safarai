"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { RiLogoutCircleLine } from "react-icons/ri";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IoPaperPlaneOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { GoPlus } from "react-icons/go";
import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import Logo from "@/public/assets/logo.png";
import Favicon from "@/public/assets/favicon.png";

import Image from "next/image";

export function AppNav() {
  const pathname = usePathname();
  const activePathname = pathname.split("/")[2];
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: "My Trips", href: "/app/trips", icon: IoPaperPlaneOutline },
    { label: "Profile", href: "/app/profile", icon: FiUsers },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    const toastId = toast.loading("Signing out...");

    try {
      await signOut();
      toast.success("Signed out successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to sign out", { id: toastId });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Profile breadcrumb (Visible on all screens) */}
      <div className="md:hidden bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 text-sm font-medium tracking-wide mb-1 md:mb-4 pl-8">
        <span className="text-black font-semibold">Profile</span>
        <span className="text-black font-semibold">{">"}</span>
      </div>

      {/* ===== Desktop Navigation (Visible from md and up) ===== */}
      <nav className="hidden md:flex sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-28 py-3 items-center justify-between mb-2">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Image src={Logo} alt="Logo" className="w-30" />
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex items-center gap-6 text-gray-600">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium hover:text-black transition-colors duration-200",
                activePathname === item.href.split("/")[2] &&
                  "text-black font-semibold"
              )}
            >
              <item.icon className="text-lg" />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors duration-300 cursor-pointer"
          >
            <RiLogoutCircleLine className="text-lg" />
            <span>Logout</span>
          </button>
        </div>

        {/* Right: Create + Logout */}
        <div className="flex items-center gap-4 ">
          <Link
            href="/app/new-trip"
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-orange-500 hover:text-black transition-all duration-300 text-md"
          >
            <GoPlus className="text-xl" />
            <span>Plan New Trip</span>
          </Link>
        </div>
      </nav>

      {/* ===== Mobile Navigation (Visible below md only) ===== */}
      <nav className="fixed bottom-0 w-full z-50 p-2 px-5 flex justify-between items-center md:hidden">
        <div className="bg-black flex items-center justify-between w-[60%] rounded-full text-gray-400 p-2">
          <div
            onClick={handleLogout}
            className={cn(
              "rounded-full p-2 hover:bg-red-500 hover:text-black hover:cursor-pointer transition-colors duration-400 ease-in-out"
            )}
          >
            <RiLogoutCircleLine className="text-2xl" />
          </div>

          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-sm font-medium p-2 rounded-full hover:bg-white hover:text-black hover:cursor-pointer transition-colors duration-400 ease-in-out",
                activePathname === item.href.split("/")[2] &&
                  "bg-white text-black p-2"
              )}
            >
              <item.icon className="text-2xl" />
            </Link>
          ))}

          <div className={cn("bg-gray-100 rounded-full")}>
            <Image src={Favicon} className="w-10 overflow-hidden" alt="Logo" />
          </div>
        </div>

        <div
          className={cn(
            "bg-black flex items-center justify-between w-auto p-4 rounded-full transition-all duration-500 ease-in-out hover:bg-gradient-to-r hover:from-blue-500 hover:via-purple-500 hover:to-orange-500 hover:shadow-lg hover:shadow-purple-400/40 hover:text-black hover:cursor-pointer"
          )}
        >
          <Link
            href="/app/new-trip"
            className={cn(
              "flex flex-col items-center justify-center gap-2 text-sm font-medium text-white"
            )}
          >
            <GoPlus className="text-2xl" />
          </Link>
        </div>
      </nav>
    </>
  );
}
