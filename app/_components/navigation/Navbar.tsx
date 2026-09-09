"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "@/public/assets/logo.png";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-4 z-50 px-4">
      <header className="max-w-6xl mx-auto rounded-2xl border border-border bg-white/90 backdrop-blur-md shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-5 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image className="w-auto h-7" src={Logo} alt="SafarAI" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/60 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button
              asChild
              className="rounded-full font-semibold px-6 bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href="/app">Get started</Link>
            </Button>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border px-5 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm text-foreground/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full rounded-full font-semibold mt-3 bg-foreground text-background">
              <Link href="/app">Get started</Link>
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}