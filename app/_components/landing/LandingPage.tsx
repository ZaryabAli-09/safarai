"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaCheck,
  FaPlus,
  FaMinus,
  FaPlane,
  FaHotel,
  FaRegClock,
  FaArrowRight,
  FaCalendarAlt,
  FaGlobe,
  FaPencilAlt,
  FaStar,
  FaMap,
  FaBolt,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Logo from "@/public/assets/logo.png";

/* Lightweight reveal: only opacity + transform. No layout thrashing. */
function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const destinationPills = ["Bali", "Lisbon", "Tokyo", "Marrakech"];

const faqs = [
  {
    q: "How does SafarAI plan trips?",
    a: "SafarAI guides you through your destination, dates, budget, travelers, transport, travel style, pace, accommodation, and interests. It then generates a day-by-day itinerary tailored to your answers.",
  },
  {
    q: "What does a generated trip include?",
    a: "Your trip includes daily activities with descriptions, locations, timing, duration, estimated costs, images, weather details, and map links, along with a budget breakdown, packing list, and travel tips.",
  },
  {
    q: "Can I plan more than one destination?",
    a: "Yes. Add multiple destinations during trip setup and SafarAI will use them when building your itinerary.",
  },
  {
    q: "Does SafarAI show estimated trip costs?",
    a: "Yes. Set your currency and budget during setup. The generated trip includes estimated costs for activities plus a breakdown for accommodation, food, transport, activities, and miscellaneous expenses.",
  },
  {
    q: "What devices does SafarAI support?",
    a: "SafarAI runs in any modern browser on desktop or mobile. Nothing to install.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* ===== HERO ===== */}
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background">
        {/* Layered background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 70% 55% at 50% 0%, #000 55%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 55% at 50% 0%, #000 55%, transparent 100%)",
            }}
          />
          <div className="absolute -top-40 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[130px]" />
          <div className="absolute left-1/4 top-32 h-[420px] w-[420px] rounded-full bg-blue-400/10 blur-[110px]" />
          <div className="absolute right-1/4 top-32 h-[420px] w-[420px] rounded-full bg-blue-400/10 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 pt-20 text-center md:pt-28">
          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
              </span>
              <span className="font-medium text-muted-foreground">
                Your AI trip planner companion is here.
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04] text-foreground"
          >
            <span className="block font-extrabold">Plan your next trip</span>
            <span className="block  pb-1 font-extrabold">
              in under a minute.
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-7 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Answer a few quick questions about how you like to travel. SafarAI
            turns your destination, dates, budget, and travel preferences into a
            structured day-by-day itinerary with practical trip details.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="group text-base px-7 h-12 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all w-full sm:w-auto"
            >
              <Link href="/app">
                Start planning free
                <FaArrowRight className="ml-2 text-xs transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base px-7 h-12 rounded-full font-semibold border-border hover:bg-secondary w-full sm:w-auto"
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </motion.div>

          {/* Lightweight value strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-12 mx-auto grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              "Built around your pace",
              "Budget-aware planning",
              "Useful trip details",
            ].map((value) => (
              <div
                key={value}
                className="flex items-center justify-center gap-2 rounded-xl border border-primary-blue/15 bg-accent/60 px-3 py-3 text-xs font-medium "
              >
                <FaCheck className="text-[10px] text-primary-blue" />
                {value}
              </div>
            ))}
          </motion.div>

          {/* Destination pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs"
          >
            <span className="text-muted-foreground">Popular destinations:</span>
            {destinationPills.map((d, i) => (
              <span
                key={d}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium border transition-colors cursor-default ${
                  i === 0
                    ? "bg-accent border-primary-blue/20 "
                    : "bg-card border-border text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {d}
              </span>
            ))}
            <span className="text-muted-foreground">+120 more</span>
          </motion.div>
        </div>

        {/* ===== PRODUCT PREVIEW with layered depth ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto mt-20 px-6"
        >
          {/* Glow behind the card */}
          <div className="absolute inset-x-12 top-12 bottom-0 rounded-[2rem] bg-gradient-to-b from-blue-500/25 via-blue-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />

          <div className="relative">
            <div className="rounded-2xl border border-border bg-card shadow-[0_50px_120px_-30px_rgba(0,0,0,0.25)] overflow-hidden ring-1 ring-black/[0.02]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-[11px] text-muted-foreground font-medium bg-background px-3 py-1 rounded-md border border-border/60 flex items-center gap-1.5">
                    <svg
                      className="w-2.5 h-2.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    safarai.app/trip/bali
                  </span>
                </div>
                <div className="w-14" />
              </div>

              <div className="grid md:grid-cols-[220px_1fr]">
                {/* Sidebar */}
                <aside className="hidden md:flex flex-col border-r border-border bg-secondary/20 p-4">
                  <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-3">
                    Your trip
                  </p>
                  {[
                    { label: "Overview", active: false },
                    { label: "Itinerary", active: true },
                    { label: "Budget", active: false },
                    { label: "Packing list", active: false },
                    { label: "Travel tips", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition-colors ${
                        item.active
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.active ? "bg-blue-500" : "bg-muted-foreground/30"
                        }`}
                      />
                      {item.label}
                    </div>
                  ))}

                  <div className="mt-6 p-3 rounded-xl bg-card border border-border">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                      Trip progress
                    </p>
                    <p className="text-2xl font-bold text-foreground">40%</p>
                    <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full w-[40%] rounded-full bg-blue-600" />
                    </div>
                  </div>
                </aside>

                {/* Main content */}
                <div className="p-5 sm:p-6">
                  {/* Trip header */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          Bali, Indonesia itinerary
                        </h3>
                        <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        May 12 to 17 · 5 days · personalized plan
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-white bg-blue-600 rounded-full px-3 py-1.5 shadow-sm shrink-0">
                      AI-generated plan
                    </span>
                  </div>

                  {/* Day tabs */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
                    {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map(
                      (d, i) => (
                        <span
                          key={d}
                          className={`text-[11px] rounded-full px-3.5 py-1.5 shrink-0 font-medium transition-colors ${
                            i === 1
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                          }`}
                        >
                          {d}
                        </span>
                      ),
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    {[
                      {
                        time: "08:00",
                        title: "Breakfast at Cafe Lumia",
                        sub: "Seminyak",
                        active: false,
                      },
                      {
                        time: "13:00",
                        title: "Lunch at Locavore",
                        sub: "Happening now",
                        active: true,
                      },
                      {
                        time: "15:30",
                        title: "Sacred Monkey Forest",
                        sub: "Padangtegal",
                        active: false,
                      },
                      {
                        time: "18:30",
                        title: "Sunset at Uluwatu Temple",
                        sub: "Pecatu",
                        active: false,
                      },
                    ].map((row) => (
                      <div
                        key={row.title}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition-colors ${
                          row.active
                            ? "border border-blue-200 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-900"
                            : "bg-secondary/40 hover:bg-secondary/60"
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground w-10 shrink-0 font-medium tabular-nums">
                          {row.time}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {row.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {row.sub}
                          </p>
                        </div>
                        {row.active && (
                          <span className="text-[9px] font-semibold text-white bg-blue-600 rounded-full px-2 py-0.5 shrink-0 shadow-sm">
                            NOW
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom gradient fade into next section */}
            <div className="absolute inset-x-0 -bottom-1 h-24 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Extra spacing so the fade blends before next section */}
        <div className="h-16 md:h-20" />
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-14 border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10K+", label: "Trips planned" },
                { value: "120+", label: "Destinations" },
                { value: "4.9/5", label: "User rating" },
                { value: "<1 min", label: "Plan generation" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl md:text-3xl font-extrabold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== WHY SAFARAI ===== */}
      <section className="py-20 md:py-28 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              Why SafarAI
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Trip planning, two ways.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
              One feels like work. The other feels like the trip already
              started.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="h-full rounded-2xl border border-border bg-background p-8 hover:shadow-lg transition-shadow duration-300">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-red-50 text-red-600 rounded-full px-3 py-1 mb-6">
                  The old way
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Planning a trip should not feel like managing a project.
                </h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Notes in one app. Bookings in your inbox. A spreadsheet you
                  forgot to update. Your itinerary ends up scattered across
                  tools that were never built to work together.
                </p>
                <div className="rounded-xl bg-secondary/30 p-5 flex flex-wrap gap-2.5">
                  {[
                    "Notion",
                    "Google Calendar",
                    "Email threads",
                    "Saved map pins",
                    "TripAdvisor",
                    "A spreadsheet",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="h-full rounded-2xl border border-border bg-background p-8 hover:shadow-lg transition-shadow duration-300">
                <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-green-50 text-green-600 rounded-full px-3 py-1 mb-6">
                  The SafarAI way
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  One place for your entire itinerary.
                </h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  Your whole trip lives in a single, structured plan. You always
                  know what is next without digging through five different apps.
                </p>
                <div className="rounded-xl bg-secondary/30 p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      S
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      SafarAI
                    </span>
                    <span className="ml-auto text-[10px] flex items-center gap-1 text-green-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      All in sync
                    </span>
                  </div>
                  {[
                    "Itinerary, AI-generated",
                    "Day by day plan, visual",
                    "Budget, packing list, and tips",
                  ].map((line) => (
                    <p
                      key={line}
                      className="flex items-center gap-2.5 text-xs text-muted-foreground py-1.5"
                    >
                      <FaCheck className="text-green-500 text-[10px] shrink-0" />
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Loved by travelers.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
              See how people are using SafarAI to plan better trips.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Ayesha Khan",
                role: "Solo traveler",
                avatar:
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80",
                rating: 5,
                text: "I used to spend hours researching itineraries. SafarAI gave me a complete Bali plan in minutes — activities, costs, timing, everything. It felt like magic.",
              },
              {
                name: "Bilal Ahmed",
                role: "Family traveler",
                avatar:
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80",
                rating: 5,
                text: "Planning a family trip used to mean juggling five apps. Now the whole itinerary is in one place and my wife actually trusts it.",
              },
              {
                name: "Sara Malik",
                role: "Budget traveler",
                avatar:
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=80",
                rating: 5,
                text: "The budget breakdown was a game changer. I knew exactly how much I would spend before I even booked a flight. Highly recommend.",
              },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <FaStar key={s} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              Features
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Everything you need to travel with clarity.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
              SafarAI combines trip preferences, itinerary activities, costs,
              weather, packing, and travel tips in one generated plan.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden grid md:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[11px] font-bold tracking-widest text-blue-600 mb-4">
                  Assist · Your AI trip companion
                </span>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  A complete plan built around your trip.
                </h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  SafarAI turns your answers into a day-by-day itinerary with
                  useful details for each activity and a clear view of your
                  estimated trip costs.
                </p>
                {[
                  "Personalized activities by day and time",
                  "Estimated costs, weather, and locations",
                  "Packing list and practical travel tips",
                ].map((line) => (
                  <p
                    key={line}
                    className="flex items-center gap-3 text-sm text-foreground/80 py-1.5"
                  >
                    <FaCheck className="text-green-500 text-xs shrink-0" />
                    {line}
                  </p>
                ))}
              </div>

              <div className="bg-secondary/30 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-[10px] font-semibold text-white bg-blue-600 rounded-full px-3 py-1.5">
                    Personalized itinerary
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
                    Budget included
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      icon: FaPlane,
                      color: "bg-blue-50 text-blue-600",
                      title: "Morning flight",
                      sub: "GA 408, 08:40, Seat 14A",
                      tag: "Today",
                    },
                    {
                      icon: FaHotel,
                      color: "bg-secondary text-secondary-foreground",
                      title: "Lunch at Locavore",
                      sub: "Seminyak, 13:00",
                    },
                    {
                      icon: FaMapMarkerAlt,
                      color: "bg-secondary text-secondary-foreground",
                      title: "Sacred Monkey Forest",
                      sub: "Padangtegal, 15:30",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3.5 bg-card border border-border rounded-xl px-4 py-3.5 hover:border-blue-200 transition-colors group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                      >
                        <item.icon className="text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.sub}
                        </p>
                      </div>
                      {item.tag && (
                        <span className="ml-auto text-[10px] font-semibold text-white bg-blue-600 rounded-full px-2.5 py-1 shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="py-20 md:py-28 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              What&apos;s included
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Every trip comes with full details.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
              No guessing. Each generated plan includes everything you need
              before you go.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: FaMapMarkerAlt,
                  title: "Activities with descriptions",
                  desc: "Each stop includes what to expect, opening hours, and tips from locals.",
                },
                {
                  icon: FaRegClock,
                  title: "Day-by-day timing",
                  desc: "Activities are scheduled with realistic travel time between locations.",
                },
                {
                  icon: FaCheck,
                  title: "Estimated costs",
                  desc: "Per-activity and per-day cost estimates in your chosen currency.",
                },
                {
                  icon: FaHotel,
                  title: "Accommodation options",
                  desc: "Recommended stays matched to your budget and travel style.",
                },
                {
                  icon: FaPlane,
                  title: "Transport guidance",
                  desc: "Best ways to get between destinations with time and cost estimates.",
                },
                {
                  icon: FaBolt,
                  title: "Packing list",
                  desc: "A tailored checklist based on destination, season, and activities.",
                },
                {
                  icon: FaGlobe,
                  title: "Weather outlook",
                  desc: "Expected conditions during your travel dates for each destination.",
                },
                {
                  icon: FaMap,
                  title: "Map links",
                  desc: "Every location includes a direct link to view it on the map.",
                },
                {
                  icon: FaStar,
                  title: "Travel tips",
                  desc: "Practical advice for your destination — visa, currency, and more.",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <FadeIn key={item.title} delay={i * 0.04}>
                    <div className="flex items-start gap-4 p-5 rounded-xl border border-border bg-background hover:border-blue-200 hover:shadow-sm transition-all duration-300 h-full">
                      <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                        <Icon className="text-sm text-primary-blue" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              How it works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              From idea to itinerary in minutes.
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-lg mx-auto">
              No spreadsheets. No switching apps. Just tell us where you want to
              go.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                icon: FaGlobe,
                title: "Where, when, and how you travel.",
                desc: "A few lines about where, when, and how you like to travel. We take care of the rest.",
                preview: (
                  <div className="mt-6 rounded-xl border border-border bg-background p-4">
                    <div className="flex gap-2 mb-3">
                      {["Bali", "Tokyo", "Lisbon"].map((d) => (
                        <span
                          key={d}
                          className="text-[10px] rounded-full border border-border px-2.5 py-1 text-muted-foreground"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="rounded-lg bg-secondary px-3 py-2 text-[11px] text-foreground/80">
                      5 days in Bali, relaxed pace
                    </div>
                  </div>
                ),
              },
              {
                n: "02",
                icon: FaCalendarAlt,
                title: "SafarAI generates your plan.",
                desc: "The AI builds a day-by-day itinerary with activities, costs, locations, and practical travel context.",
                preview: (
                  <div className="mt-6 rounded-xl border border-border bg-background p-4 flex flex-col items-center justify-center h-[120px]">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center animate-pulse bg-blue-50">
                      <span className="w-5 h-5 rounded-full bg-blue-500" />
                    </div>
                    <span className="mt-3 text-[10px] font-semibold text-white bg-blue-600 rounded-full px-3 py-1">
                      Generating itinerary
                    </span>
                  </div>
                ),
              },
              {
                n: "03",
                icon: FaPencilAlt,
                title: "Review the details before you go.",
                desc: "Open each day to see activity descriptions, timing, estimated cost, weather, images, and map links.",
                preview: (
                  <div className="mt-6 rounded-xl border border-border bg-background p-4 space-y-2">
                    {[
                      {
                        time: "09:30",
                        label: "Sacred Monkey Forest",
                        active: false,
                      },
                      {
                        time: "13:00",
                        label: "Lunch at Locavore",
                        active: true,
                      },
                      {
                        time: "16:30",
                        label: "Sunset at Uluwatu",
                        active: false,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                          row.active
                            ? "border border-blue-200 bg-blue-50/50"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground w-9 shrink-0">
                          {row.time}
                        </span>
                        <span className="text-[11px] text-foreground/80 truncate">
                          {row.label}
                        </span>
                        {row.active && (
                          <span className="ml-auto text-[9px] font-semibold text-white bg-blue-600 rounded-full px-2 py-0.5">
                            NOW
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-background p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <step.icon className="text-sm text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                  {step.preview}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOUNDER NOTE ===== */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
                alt="Paris"
                className="w-full h-72 md:h-80 object-cover"
                loading="lazy"
              />
              <div className="p-5">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Paris, May 2026
                </p>
                <p className="text-xs text-muted-foreground italic mt-1">
                  Where the idea started.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              A note from the team
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
              We are not finished, but here is what we built so far.
            </h2>
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              We started SafarAI after wasting three weeks planning a five day
              trip across notes apps and a dozen browser tabs that never talked
              to each other. None of them cared about the trip. They only cared
              about the next click.
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              We are building the calmer version we wished existed: one place
              for a day-by-day plan shaped by your budget, pace, and interests.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              SafarAI is a pure AI trip planner, not a booking aggregator. It
              generates and structures your itinerary with the practical details
              you need before you go.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=64&q=80"
                alt=""
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  The SafarAI team
                </p>
                <p className="text-xs text-muted-foreground">
                  Currently drafting v1
                </p>
              </div>
            </div>
            <p className="mt-8 pl-5 border-l-2 border-blue-500 text-sm text-muted-foreground italic leading-relaxed">
              If you have ever lost your plans because a browser tab crashed
              before you could save them, we built this for you.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 md:py-28 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-600">
              Questions
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            {faqs.map((faq, i) => (
              <div key={faq.q} className="border-b border-border">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left gap-4 py-6 group"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-base font-medium text-foreground group-hover:text-blue-600 transition-colors">
                    {faq.q}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                    {openFaq === i ? (
                      <FaMinus className="text-xs text-blue-600" />
                    ) : (
                      <FaPlus className="text-xs text-muted-foreground group-hover:text-blue-600 transition-colors" />
                    )}
                  </div>
                </button>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="pb-6 text-sm text-muted-foreground leading-relaxed"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </div>
            ))}
            <p className="mt-8 text-sm text-muted-foreground text-center">
              Still have a question?{" "}
              <a
                href="mailto:zaryabkhan248@gmail.com"
                className="font-semibold text-primary-blue underline underline-offset-2 hover:"
              >
                Reach out
              </a>{" "}
              and we will reply within a day.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-foreground">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 bg-blue-500 pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[450px] h-[450px] rounded-full blur-3xl opacity-8 bg-blue-500 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 items-center relative">
          <FadeIn className="text-center md:text-left">
            <span className="text-xs font-bold tracking-widest uppercase text-blue-400">
              Ready when you are
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
              Travel planning, without the chaos.
            </h2>
            <p className="mt-5 text-white/60 text-sm max-w-md mx-auto md:mx-0 leading-relaxed">
              SafarAI turns a few quick questions into a full itinerary with
              activities, estimated costs, weather, maps, packing, and tips.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center md:justify-start justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-base px-8 py-6 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                <Link href="/app">Get started free</Link>
              </Button>
              <p className="text-xs text-white/40">
                Start with your destination and travel dates.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/40">
                <FaCheck className="text-[9px] text-green-400" />
                Free to start
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/40">
                <FaCheck className="text-[9px] text-green-400" />
                No credit card
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/40">
                <FaCheck className="text-[9px] text-green-400" />
                Cancel anytime
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="hidden md:flex justify-center">
            <div className="w-[280px] rounded-[2rem] border-4 border-white/10 bg-background p-3 shadow-2xl">
              <div className="rounded-[1.5rem] bg-card overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">
                    Bali, Indonesia
                  </p>
                  <p className="text-[10px] text-muted-foreground">5 days</p>
                </div>
                <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto">
                  {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
                    <span
                      key={d}
                      className={`text-[10px] rounded-full px-2.5 py-1 shrink-0 font-medium ${
                        i === 1
                          ? "bg-blue-600 text-white"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="px-4 pb-4 space-y-2.5">
                  <p className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <FaRegClock className="text-[9px]" /> Tuesday, May 13
                  </p>
                  {[
                    {
                      time: "08:00",
                      title: "Breakfast at Cafe Lumia",
                      sub: "Seminyak",
                      active: false,
                    },
                    {
                      time: "13:00",
                      title: "Lunch at Locavore To Go",
                      sub: "Happening now",
                      active: true,
                    },
                    {
                      time: "15:00",
                      title: "Sacred Monkey Forest",
                      sub: "Padangtegal",
                      active: false,
                    },
                  ].map((row) => (
                    <div
                      key={row.title}
                      className={`rounded-xl px-3 py-2.5 transition-colors ${
                        row.active
                          ? "border border-blue-200 bg-blue-50/50"
                          : "bg-secondary"
                      }`}
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {row.time}
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {row.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {row.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10">
            <div className="sm:col-span-2 md:col-span-1">
              <Image
                src={Logo}
                alt="SafarAI"
                width={180}
                height={46}
                className="h-12 w-auto"
              />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Travel planning, without the chaos.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
                Product
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how-it-works" },
                  { label: "Pricing", href: "#" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
                Company
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "About", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Contact", href: "mailto:zaryabkhan248@gmail.com" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">
                Legal
              </p>
              <div className="space-y-2.5">
                {["Privacy", "Terms"].map((label) => (
                  <Link
                    key={label}
                    href="#"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SafarAI. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Engineered by Zaryab Ali
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
