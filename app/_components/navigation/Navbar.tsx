"use client";

/**
 * Marketing site navigation. All link labels/hrefs come from
 * `@/lib/landing/content.ts` so nav copy lives with the rest of the content.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "@/public/assets/logo/logo.png";
import { Button } from "@/components/ui/button";
import { NAV_CTA_LINK, NAV_LINKS } from "@/lib/landing/content";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image className="h-10 w-auto" src={Logo} alt="SafarAI" priority />
            <span className="font-bold text-foreground">SAFAR AI.</span>
          </Link>

          {/* Centered nav: desktop */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm  text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA: desktop */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button
              asChild
              className="rounded-full px-5 font-semibold shadow-sm transition-all hover:shadow-md"
            >
              <Link href={NAV_CTA_LINK.href}>{NAV_CTA_LINK.label}</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? (
              <FaTimes className="h-4 w-4" />
            ) : (
              <FaBars className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm  text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <Button
                asChild
                className="mt-3 w-full rounded-full font-semibold"
                onClick={() => setOpen(false)}
              >
                <Link href={NAV_CTA_LINK.href}>{NAV_CTA_LINK.label}</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
