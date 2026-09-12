"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaBell,
  FaCheck,
  FaPlus,
  FaMinus,
  FaPlane,
  FaRegClock,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaCompass,
  FaBrain,
  FaMagic,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const destinationPills = ["Bali", "Lisbon", "Tokyo", "Marrakech"];

const inactiveTabs = [
  { n: "01", label: "PLAN", desc: "draft a trip from a prompt" },
  { n: "02", label: "STRUCTURE", desc: "your itinerary, visual" },
  { n: "03", label: "ASSIST", desc: "real-time suggestions" },
];

const faqs = [
  {
    q: "How does SafarAI plan trips?",
    a: "We ask a few simple questions about your pace, vibe, and constraints — calm vs intense, food-focused vs sights, days off in between. SafarAI drafts an itinerary based on your answers, and you can edit anything: drag to reorder days, swap activities, or rewrite from scratch.",
  },
  {
    q: "Can I edit AI-generated itineraries?",
    a: "Yes — every stop, time, and day can be moved, swapped, or removed. The AI re-adjusts the rest of the trip automatically as you make changes.",
  },
  {
    q: "Does SafarAI work offline during my trip?",
    a: "Your itinerary is cached to your device, so you can access it without a signal.",
  },
  {
    q: "What devices does SafarAI support?",
    a: "SafarAI works in any modern browser on desktop or mobile, with no app install required.",
  },
  {
    q: "Is there a free trial available?",
    a: "Yes — you can plan your first trip free, no credit card required.",
  },
];

const aiFeatures = [
  {
    icon: FaBrain,
    title: "Understands context",
    desc: "Tells SafarAI your pace, budget, and vibe — it plans around what matters to you.",
  },
  {
    icon: FaMagic,
    title: "Generates in seconds",
    desc: "A full day-by-day itinerary appears in seconds, not days of manual work.",
  },
  {
    icon: FaCompass,
    title: "Re-optimizes as you edit",
    desc: "Move one stop and the AI re-sequences the rest so your day still flows.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, duration: 0.5 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          {[220, 340, 460, 580].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-dashed border-foreground/10"
              style={{ width: size * 2, height: size * 2 }}
            />
          ))}
          {[
            { top: "14%", left: "10%" },
            { top: "40%", left: "4%" },
            { top: "18%", left: "88%" },
            { top: "46%", left: "93%" },
            { top: "62%", left: "8%" },
            { top: "68%", left: "90%" },
          ].map((pos, i) => (
            <FaMapMarkerAlt
              key={i}
              className="absolute text-lg text-primary/55"
              style={pos}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-5 pt-20 md:pt-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            AI travel companion · Available now
          </div>

          <h1 className="text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-extrabold tracking-tight leading-[1.04] text-foreground">
            Your trips,
            <br />
            finally organized.
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Plan your trips with clarity. Generate a complete itinerary in
            seconds, and travel without the chaos.
          </p>

          <p className="mt-4 text-base font-medium text-foreground max-w-xl mx-auto leading-relaxed">
            SafarAI is an AI-powered trip planner that turns your interests,
            budget, and travel dates into a full day-by-day itinerary — edit,
            reorder, and share it in one place.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="text-base px-8 py-6 rounded-full font-semibold">
              <Link href="/app">Start planning — it's free</Link>
            </Button>
          </div>

<p className="mt-4 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Used by 12,400+ travelers worldwide
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-muted-foreground mr-1">Plan trips to</span>
            {destinationPills.map((d, i) => (
              <span
                key={d}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium border ${
                  i === 0
                    ? "bg-card border-primary text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {i === 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {d}
              </span>
            ))}
            <span className="text-muted-foreground">+120 more</span>
          </div>
        </div>

        {/* Card stack — all three cards share the exact same size */}
        <div className="relative h-[420px] sm:h-[440px] max-w-4xl mx-auto mt-14 px-5">
          {/* Left: plan form */}
          <div className="hidden sm:flex flex-col absolute left-4 top-8 w-[270px] h-[380px] -rotate-6 rounded-3xl border border-border bg-card shadow-xl p-5 overflow-hidden">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mb-1">
              NEW TRIP
            </p>
            <p className="text-sm font-semibold text-foreground mb-4">
              Plan your next journey
            </p>
            <label className="text-[10px] font-medium text-muted-foreground">
              Destination
            </label>
            <div className="mt-1 mb-3 flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground">
              <FaMapMarkerAlt className="text-[10px] text-primary" />
              Bali, Indonesia
            </div>
            <label className="text-[10px] font-medium text-muted-foreground">
              Travel style
            </label>
            <div className="mt-1.5 mb-4 flex gap-1.5">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-secondary-foreground">
                Relax
              </span>
              <span className="rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-medium">
                Cultural
              </span>
            </div>
            <div className="rounded-lg px-3 py-2 text-[10px] font-medium bg-primary/10 text-primary">
              Unhurried mornings · 2–3 stops/day
            </div>
            <div className="flex-1" />
            <div className="rounded-full bg-primary text-primary-foreground text-center py-2.5 text-xs font-semibold">
              Generate itinerary
            </div>
          </div>

          {/* Right: AI planning state */}
          <div className="hidden sm:flex flex-col items-center justify-center text-center absolute right-4 top-8 w-[270px] h-[380px] rotate-6 rounded-3xl border border-border bg-card shadow-xl p-6 overflow-hidden">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center animate-pulse bg-primary/10">
              <span className="w-6 h-6 rounded-full bg-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Planning your trip
            </p>
            <div className="space-y-1.5">
              {[
                "Understanding your preferences",
                "Matching destinations & pace",
                "Structuring daily plan",
              ].map((t) => (
                <p key={t} className="text-[10px] text-muted-foreground">
                  {t}
                </p>
              ))}
            </div>
          </div>

          {/* Center: main card */}
          <div className="flex flex-col absolute left-1/2 -translate-x-1/2 top-8 z-10 w-[270px] h-[380px] rounded-3xl border border-border bg-card shadow-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80"
                  alt=""
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    Ellise
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Slow traveler · 4 countries
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <FaBell className="text-[11px] text-secondary-foreground" />
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden mb-3 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=500&q=80"
                alt="Bali"
                className="w-full h-24 object-cover"
              />
              <span className="absolute top-2 left-2 text-[9px] font-semibold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
                ONGOING TRIP
              </span>
              <span className="absolute top-2 right-2 text-[9px] font-semibold text-foreground bg-card px-2 py-0.5 rounded-full">
                20 days to go
              </span>
            </div>

            <p className="text-sm font-semibold text-foreground shrink-0">
              Bali, Indonesia
            </p>
            <p className="text-xs text-muted-foreground mb-3 shrink-0">
              May 12 – 17 · 5 days · 12 places
            </p>

            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-xs font-semibold text-foreground">
                Your trips
              </p>
              <p className="text-[11px] font-medium text-primary">See all →</p>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
              {[
                {
                  name: "Kyoto",
                  date: "Jun 3 – 10",
                  img: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=300&q=80",
                },
                {
                  name: "Lisbon",
                  date: "Aug 15 – 22",
                  img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=300&q=80",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl overflow-hidden border border-border flex flex-col"
                >
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full h-14 object-cover shrink-0"
                  />
                  <div className="px-2 py-1.5 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground truncate">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two ways */}
      <section className="py-24 md:py-28 bg-card">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              The old way · The new way
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Trip planning, two ways.
            </h2>
            <p className="mt-3 text-muted-foreground">
              One feels like work. The other feels like the trip already
              started.
            </p>
            <p className="mt-3 text-sm text-muted-foreground/80 max-w-lg mx-auto">
              SafarAI is a pure AI trip planner: describe your trip, get a
              complete day-by-day itinerary, then tweak it until it feels like
              yours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-card p-8">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-destructive/10 text-destructive rounded-full px-3 py-1 mb-5">
                The old way
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Planning a trip shouldn't feel like managing a project.
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Tabs everywhere. Notes in different apps. Your itinerary
                scattered across tools that were never meant to work together.
              </p>
              <div className="rounded-2xl border border-border p-5 flex flex-wrap gap-2">
                {[
                  "Notion · Trip plan",
                  "Google Calendar",
                  'Email · "Re: hotel"',
                  "Maps · saved pins",
                  "TripAdvisor",
                  "Spreadsheet",
                ].map((tag, i) => (
                  <span
                    key={tag}
                    className="text-[11px] rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground"
                    style={{
                      transform: i % 2 === 0 ? "rotate(-2deg)" : "rotate(2deg)",
                    }}
                  >
                    {tag} <span className="text-muted-foreground/60">×</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-8">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-success/10 text-success rounded-full px-3 py-1 mb-5">
                The new way
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                One place for your entire itinerary.
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                SafarAI brings your whole trip into a single, structured
                itinerary — so you always know what's next, without the chaos.
              </p>
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                    S
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    SafarAI
                  </span>
                  <span className="ml-auto text-[10px] flex items-center gap-1 text-success font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" /> All
                    in sync
                  </span>
                </div>
                {[
                  "Itinerary · AI-generated",
                  "Day-by-day plan · visual",
                  "Notes · in one place",
                ].map((line) => (
                  <p
                    key={line}
                    className="flex items-center gap-2 text-xs text-muted-foreground py-1"
                  >
                    <FaCheck className="text-success text-[10px]" /> {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI capabilities */}
      <section className="py-24 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-5">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              How the AI works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Three capabilities, one calm planner.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              SafarAI is an AI trip planner that reads your preferences and turns
              them into a complete, editable itinerary.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
            className="grid md:grid-cols-3 gap-6"
          >
            {aiFeatures.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-border bg-card p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature showcase */}
      <section id="features" className="py-24 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              Features
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Everything you need to travel with clarity.
            </h2>
            <p className="mt-3 text-muted-foreground">
              From the first idea to the last flight home — all powered by AI.
            </p>
            <p className="mt-3 text-sm text-muted-foreground/80 max-w-lg mx-auto">
              SafarAI is an AI trip planner that generates full itineraries from
              your preferences, then lets you edit every stop in real time.
            </p>
          </div>

          <div>
            {inactiveTabs.map((t) => (
              <div
                key={t.n}
                className="rounded-t-2xl border border-b-0 border-border bg-background px-8 py-3.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground">
                  {t.n} · {t.label}
                </span>
                <span className="text-[11px] text-muted-foreground/70">
                  — {t.desc}
                </span>
              </div>
            ))}

            <div className="rounded-b-2xl border border-border bg-card shadow-xl overflow-hidden grid md:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[11px] font-bold tracking-widest text-muted-foreground mb-4">
                  04 · ASSIST — AI trip companion
                </span>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Your itinerary, always one tap away.
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Every stop, time, and note lives in a single, structured plan
                  — always current, always offline-ready, always counting down
                  to what's next.
                </p>
                {[
                  "Day-by-day itineraries, generated in seconds",
                  "Works with no signal, no panic",
                  "Always one tap from what's next",
                ].map((line) => (
                  <p
                    key={line}
                    className="flex items-center gap-2.5 text-sm text-foreground/80 py-1"
                  >
                    <FaCheck className="text-success text-xs" /> {line}
                  </p>
                ))}
              </div>

              <div className="bg-background p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] font-semibold text-background bg-foreground rounded-full px-3 py-1.5">
                    Next up · lunch in 30 min
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
                    5 stops today
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      icon: FaPlane,
                      color: "bg-primary/10 text-primary",
                      title: "Morning flight",
                      sub: "GA 408 · 08:40 · Seat 14A",
                      tag: "Today",
                    },
                    {
                      icon: FaHotel,
                      color: "bg-secondary text-secondary-foreground",
                      title: "Lunch at Locavore",
                      sub: "Seminyak · 13:00",
                    },
                    {
                      icon: FaMapMarkerAlt,
                      color: "bg-secondary text-secondary-foreground",
                      title: "Sacred Monkey Forest",
                      sub: "Padangtegal · 15:30",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 bg-card border border-border rounded-xl px-3.5 py-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
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
                        <span className="ml-auto text-[10px] font-semibold text-primary-foreground bg-primary rounded-full px-2.5 py-1 shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 md:py-28 bg-card">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              How it works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              From idea to itinerary in minutes.
            </h2>
            <p className="mt-3 text-muted-foreground">
              No spreadsheets. No switching apps. Just tell us where you want to
              go.
            </p>
            <p className="mt-3 text-sm text-muted-foreground/80 max-w-lg mx-auto">
              SafarAI is an AI trip planner: answer a few questions, get a full
              day-by-day itinerary, then edit anything in real time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="text-2xl font-bold text-primary">01</span>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Where, when, how you travel.
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                A few lines about where, when, and how — we'll take care of the
                rest.
              </p>
              <div className="mt-5 rounded-xl border border-border p-4">
                <div className="flex gap-1.5 mb-3">
                  {["Bali", "Tokyo", "Lisbon"].map((d) => (
                    <span
                      key={d}
                      className="text-[10px] rounded-full border border-border px-2 py-1 text-muted-foreground"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="rounded-lg bg-background px-3 py-2 text-[11px] text-foreground/80">
                  5 days in Bali, relaxed pace
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="text-2xl font-bold text-primary">02</span>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Draft ready in 30 seconds.
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                A complete itinerary — routes and stops — structured by day.
              </p>
              <div className="mt-5 rounded-xl border border-border p-4 flex flex-col items-center justify-center h-[110px]">
                <div className="w-11 h-11 rounded-full flex items-center justify-center animate-pulse bg-primary/10">
                  <span className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <span className="mt-3 text-[10px] font-semibold text-primary-foreground bg-primary rounded-full px-2.5 py-1">
                  Generating itinerary
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <span className="text-2xl font-bold text-primary">03</span>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Everything in your pocket.
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Your full timeline, always one tap away, online or off.
              </p>
              <div className="mt-5 rounded-xl border border-border p-4 space-y-2">
                {[
                  {
                    time: "09:30",
                    label: "Sacred Monkey Forest",
                    active: false,
                  },
                  { time: "13:00", label: "Lunch at Locavore", active: true },
                  { time: "16:30", label: "Sunset at Uluwatu", active: false },
                ].map((row) => (
                  <div
                    key={row.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 ${row.active ? "border border-primary/40 bg-primary/5" : ""}`}
                  >
                    <span className="text-[10px] text-muted-foreground w-9 shrink-0">
                      {row.time}
                    </span>
                    <span className="text-[11px] text-foreground/80 truncate">
                      {row.label}
                    </span>
                    {row.active && (
                      <span className="ml-auto text-[9px] font-semibold text-primary-foreground bg-primary rounded-full px-1.5 py-0.5">
                        NOW
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="py-24 md:py-28 bg-background">
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
              alt="Paris"
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Paris,
                May 2026
              </p>
              <p className="text-xs text-muted-foreground italic mt-0.5">
                Where the idea started.
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              A note from the team
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground leading-tight">
              We're not finished — but here's what we've built so far.
            </h2>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              We started SafarAI after wasting three weeks planning a five-day
              trip across notes apps and a dozen browser tabs that never talked
              to each other. None of them cared about the trip — only the next
              click.
            </p>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              We're building the calmer version we wished existed: one place,
              structured by day, that respects the pace of how people actually
              travel.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              SafarAI is an AI trip planner — not a booking aggregator. It
              generates, structures, and rewrites your itinerary so you spend
              less time planning and more time going.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=64&q=80"
                alt=""
                className="w-9 h-9 rounded-full object-cover"
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
            <p className="mt-6 pl-4 border-l-2 border-primary text-sm text-muted-foreground italic leading-relaxed">
              P.S. If you've ever lost your plans because a tab crashed before
              you could save them — we built this for you.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-28 bg-card">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              Find answers here
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-8">
            <div className="rounded-2xl border border-border bg-background p-5 h-fit">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> General
                questions
              </p>
              <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
                Don't see the answer you're looking for?{" "}
                <a
                  href="mailto:hello@safarai.app"
                  className="font-semibold text-foreground underline"
                >
                  Reach out
                </a>{" "}
                and we'll reply within a day.
              </p>
            </div>

            <div>
              {faqs.map((faq, i) => (
                <div key={faq.q} className="border-b border-border py-5">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left gap-4"
                  >
                    <span className="text-base font-medium text-foreground">
                      {faq.q}
                    </span>
                    {openFaq === i ? (
                      <FaMinus className="text-xs text-muted-foreground shrink-0" />
                    ) : (
                      <FaPlus className="text-xs text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-foreground">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full blur-3xl opacity-20 bg-primary" />
        <div className="absolute -bottom-40 -right-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-15 bg-primary" />
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              Ready when you are
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
              Travel planning, without the chaos.
            </h2>
            <p className="mt-4 text-white/60 text-sm max-w-md">
              SafarAI is an AI trip planner that generates your full day-by-day
              itinerary from a few quick questions — edit and share it in one
              place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center md:justify-start gap-3">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-full font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/app">Get started free</Link>
              </Button>
              <p className="text-xs text-white/40">
                Free to start. No credit card required.
              </p>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="w-[280px] rounded-[2rem] border-4 border-white/10 bg-card p-3 shadow-2xl">
              <div className="rounded-[1.5rem] bg-card overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Bali, Indonesia
                    </p>
                    <p className="text-[10px] text-muted-foreground">5 days</p>
                  </div>
                </div>
                <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto">
                  {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
                    <span
                      key={d}
                      className={`text-[10px] rounded-full px-2.5 py-1 shrink-0 font-medium ${
                        i === 1
                          ? "bg-primary text-primary-foreground"
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
                      title: "Breakfast at Café Lumia",
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
                      className={`rounded-xl px-3 py-2.5 ${row.active ? "border border-primary/40 bg-primary/5" : "bg-secondary"}`}
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-14">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-border">
            <div>
              <p className="text-base font-semibold text-foreground">SafarAI</p>
              <p className="mt-2 text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                Travel planning, without the chaos. A calmer way to plan,
                organize, and go.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {[FaTwitter, FaLinkedin, FaInstagram].map((Icon, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground"
                  >
                    <Icon className="text-xs" />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground mb-3">
                PRODUCT
              </p>
              {["Features", "How it works", "FAQ"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                  className="block text-sm text-muted-foreground hover:text-foreground py-1"
                >
                  {l}
                </a>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground mb-3">
                COMPANY
              </p>
              {["About", "Contact"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground py-1"
                >
                  {l}
                </a>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground mb-3">
                LEGAL
              </p>
              {["Privacy Policy", "Terms"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground py-1"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SafarAI. All rights reserved.
            </p>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> All
              systems normal
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
