"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaBell,
  FaArrowRight,
  FaArrowLeft,
  FaStar,
  FaCheck,
  FaPlus,
  FaMinus,
  FaPlane,
  FaHotel,
  FaIdCard,
  FaShieldAlt,
  FaRegClock,
  FaCalendarAlt,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

const ORANGE = "#F2793A";

const destinationPills = ["Bali", "Lisbon", "Tokyo", "Marrakech"];

const inactiveTabs = [
  { n: "01", label: "PLAN", desc: "draft a trip from a prompt" },
  { n: "02", label: "STRUCTURE", desc: "your itinerary, visual" },
  { n: "03", label: "ASSIST", desc: "real-time suggestions" },
];

const walletItems = [
  {
    icon: FaPlane,
    color: "bg-orange-100 text-orange-600",
    title: "Flight to Denpasar",
    sub: "GA 408 · 08:40 · Seat 14A",
    tag: "Today",
  },
  {
    icon: FaHotel,
    color: "bg-emerald-100 text-emerald-600",
    title: "Hotel Locavore",
    sub: "Check-in May 12 · 2 nights",
  },
  {
    icon: FaIdCard,
    color: "bg-indigo-100 text-indigo-600",
    title: "Passport",
    sub: "Expires Nov 2028",
  },
  {
    icon: FaShieldAlt,
    color: "bg-purple-100 text-purple-600",
    title: "Travel insurance",
    sub: "Allianz · Policy 4421-AB",
  },
];

const testimonials = [
  {
    rating: "4.9/5",
    quote:
      "This replaced three apps I used for trip planning. The itinerary, bookings, and reminders all live in one place — and somehow it just feels calmer.",
    name: "Alex Turner",
    role: "Frequent traveler · 40+ countries",
  },
  {
    rating: "4.7/5",
    quote:
      "Working with SafarAI transformed how I plan trips. The AI drafts feel like they were made by someone who actually travels — not a generic itinerary template.",
    name: "Olivia Chen",
    role: "Product manager",
  },
  {
    rating: "4.8/5",
    quote:
      "SafarAI's day-by-day flow helped me redefine how I travel. Quiet mornings, light walks, unhurried evenings — it just gets the pace right.",
    name: "Mira Amalia",
    role: "Designer · Tokyo → Lisbon",
  },
  {
    rating: "5.0/5",
    quote:
      "The team behind SafarAI exceeded my expectations at every step. Planning feels effortless now — like it reads my mind.",
    name: "Bennedict Sam",
    role: "Remote worker · 12 countries/yr",
  },
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
    a: "Your itinerary, bookings, and documents are cached to your device, so you can access them without a signal.",
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

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#FAFAF8]">
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
              className="absolute text-lg"
              style={{ ...pos, color: ORANGE, opacity: 0.55 }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-5 pt-20 md:pt-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-4 py-1.5 text-xs font-semibold text-foreground/60 mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: ORANGE }}
            />
            AI travel companion · Available now
          </div>

          <h1 className="text-[2.6rem] sm:text-6xl lg:text-[4.2rem] font-extrabold tracking-tight leading-[1.04] text-foreground">
            Your trips,
            <br />
            finally organized.
          </h1>

          <p className="mt-6 text-lg text-foreground/55 max-w-lg mx-auto leading-relaxed">
            Plan your trips with clarity. Generate itineraries, keep everything
            in one place, and travel without the chaos.
          </p>

          <div className="mt-9 max-w-md mx-auto flex items-center gap-1.5 bg-white border border-border rounded-full h-14 pl-6 pr-1.5">
            <input
              type="email"
              placeholder="you@domain.com"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/35 focus:outline-none"
            />
            <Button className="h-11 rounded-full px-6 font-semibold bg-foreground text-background hover:bg-foreground/90 shrink-0">
              Try free
            </Button>
          </div>

          <p className="mt-4 text-xs text-foreground/45 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Used by 12,400+ travelers worldwide
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-foreground/40 mr-1">Plan trips to</span>
            {destinationPills.map((d, i) => (
              <span
                key={d}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${
                  i === 0
                    ? "bg-white border"
                    : "bg-white border border-border text-foreground/60"
                }`}
                style={
                  i === 0 ? { borderColor: ORANGE, color: ORANGE } : undefined
                }
              >
                {i === 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ORANGE }}
                  />
                )}
                {d}
              </span>
            ))}
            <span className="text-foreground/35">+120 more</span>
          </div>
        </div>

        {/* Card stack */}
        <div className="relative h-[440px] sm:h-[520px] max-w-4xl mx-auto mt-14 px-5">
          <div className="hidden sm:block absolute left-4 top-14 w-[290px] -rotate-6 rounded-3xl border border-border bg-white shadow-xl p-5">
            <p className="text-[10px] font-semibold text-foreground/35 tracking-wide mb-1">
              NEW TRIP
            </p>
            <p className="text-sm font-semibold text-foreground mb-4">
              Plan your next journey
            </p>
            <label className="text-[10px] font-medium text-foreground/40">
              Destination
            </label>
            <div className="mt-1 mb-3 flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground/70">
              <FaMapMarkerAlt
                className="text-[10px]"
                style={{ color: ORANGE }}
              />
              Bali, Indonesia
            </div>
            <label className="text-[10px] font-medium text-foreground/40">
              Travel style
            </label>
            <div className="mt-1.5 mb-4 flex gap-1.5">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] text-foreground/60">
                Relax
              </span>
              <span className="rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-medium">
                Cultural
              </span>
            </div>
            <div
              className="rounded-lg px-3 py-2 text-[10px] font-medium"
              style={{ background: `${ORANGE}1A`, color: ORANGE }}
            >
              Unhurried mornings · 2–3 stops/day
            </div>
            <div
              className="mt-4 rounded-full text-background text-center py-2.5 text-xs font-semibold"
              style={{ background: ORANGE }}
            >
              Generate itinerary
            </div>
          </div>

          <div className="hidden sm:block absolute right-4 top-8 w-[290px] rotate-6 rounded-3xl border border-border bg-white shadow-xl p-6 text-center">
            <div
              className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center animate-pulse"
              style={{ background: `${ORANGE}1A` }}
            >
              <span
                className="w-6 h-6 rounded-full"
                style={{ background: ORANGE }}
              />
            </div>
            <p className="text-sm font-semibold text-foreground mb-3">
              Planning your trip
            </p>
            <div className="space-y-1.5 text-left">
              {[
                "Understanding your preferences",
                "Matching destinations & pace",
                "Structuring daily plan",
              ].map((t) => (
                <p key={t} className="text-[10px] text-foreground/35">
                  {t}
                </p>
              ))}
            </div>
          </div>

          <div className="relative z-10 mx-auto w-[290px] sm:w-[290px] rounded-3xl border border-border bg-white shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80"
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ellise
                  </p>
                  <p className="text-[11px] text-foreground/45">
                    Slow traveler · 4 countries
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <FaBell className="text-[11px] text-foreground/50" />
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden mb-3">
              <img
                src="https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=500&q=80"
                alt="Bali"
                className="w-full h-32 object-cover"
              />
              <span className="absolute top-2 left-2 text-[9px] font-semibold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">
                ONGOING TRIP
              </span>
              <span className="absolute top-2 right-2 text-[9px] font-semibold text-foreground bg-white px-2 py-0.5 rounded-full">
                20 days to go
              </span>
            </div>

            <p className="text-base font-semibold text-foreground">
              Bali, Indonesia
            </p>
            <p className="text-xs text-foreground/45 mb-4">
              May 12 – 17 · 5 days · 12 places
            </p>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">
                Your trips
              </p>
              <p className="text-[11px] font-medium" style={{ color: ORANGE }}>
                See all →
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                  className="rounded-xl overflow-hidden border border-border"
                >
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full h-16 object-cover"
                  />
                  <div className="px-2 py-1.5">
                    <p className="text-[11px] font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-[10px] text-foreground/40">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capability strip */}
      <section className="border-y border-border bg-white py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col items-center gap-4">
          <p className="text-xs text-foreground/40">
            Built to work alongside the tools you already use
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-foreground/50">
            <span className="flex items-center gap-2">
              <FaPlane className="text-xs" /> Flights & stays
            </span>
            <span className="flex items-center gap-2">
              <FaCalendarAlt className="text-xs" /> Calendar sync
            </span>
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-xs" /> Maps & routing
            </span>
            <span className="flex items-center gap-2">
              <FaShieldAlt className="text-xs" /> Docs & insurance
            </span>
          </div>
        </div>
      </section>

      {/* Two ways */}
      <section className="py-24 md:py-28 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: ORANGE }}
            >
              The old way · The new way
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Trip planning, two ways.
            </h2>
            <p className="mt-3 text-foreground/50">
              One feels like work. The other feels like the trip already
              started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-white p-8">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-rose-50 text-rose-500 rounded-full px-3 py-1 mb-5">
                The old way
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Planning a trip shouldn't feel like managing a project.
              </h3>
              <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                Tabs everywhere. Bookings in emails. Notes in different apps.
                Your itinerary scattered across tools that were never meant to
                work together.
              </p>
              <div className="rounded-2xl border border-border p-5 flex flex-wrap gap-2">
                {[
                  "Booking.com",
                  "Notion · Trip plan",
                  "Google Calendar",
                  'Email · "Re: hotel"',
                  "Maps · saved pins",
                  "TripAdvisor",
                ].map((tag, i) => (
                  <span
                    key={tag}
                    className="text-[11px] rounded-full border border-border bg-white px-3 py-1.5 text-foreground/50"
                    style={{
                      transform: i % 2 === 0 ? "rotate(-2deg)" : "rotate(2deg)",
                    }}
                  >
                    {tag} <span className="text-foreground/30">×</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-8">
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-600 rounded-full px-3 py-1 mb-5">
                The new way
              </span>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                One place for everything your trip needs.
              </h3>
              <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                SafarAI brings your itinerary, bookings, and plans into a
                single, structured flow — so you always know what's next,
                without the chaos.
              </p>
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center text-[10px] font-bold">
                    S
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    SafarAI
                  </span>
                  <span className="ml-auto text-[10px] flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                    All in sync
                  </span>
                </div>
                {[
                  "Bookings · auto-pulled",
                  "Itinerary · day by day",
                  "Documents · in one wallet",
                ].map((line) => (
                  <p
                    key={line}
                    className="flex items-center gap-2 text-xs text-foreground/60 py-1"
                  >
                    <FaCheck className="text-emerald-500 text-[10px]" /> {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature showcase */}
      <section id="features" className="py-24 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: ORANGE }}
            >
              Features
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Everything you need to travel with clarity.
            </h2>
            <p className="mt-3 text-foreground/50">
              From the first idea to the last flight home — all powered by AI.
            </p>
          </div>

          <div>
            {inactiveTabs.map((t) => (
              <div
                key={t.n}
                className="rounded-t-2xl border border-b-0 border-border bg-[#FAFAF8] px-8 py-3.5 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-foreground/15" />
                <span className="text-[11px] font-bold tracking-widest text-foreground/30">
                  {t.n} · {t.label}
                </span>
                <span className="text-[11px] text-foreground/25">
                  — {t.desc}
                </span>
              </div>
            ))}

            <div className="rounded-b-2xl border border-border bg-white shadow-xl overflow-hidden grid md:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <span className="text-[11px] font-bold tracking-widest text-foreground/30 mb-4">
                  04 · ASSIST — AI trip companion
                </span>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  Your itinerary, always one tap away.
                </h3>
                <p className="text-sm text-foreground/50 mb-6 leading-relaxed">
                  Every stop, time, and note lives in a single, structured plan —
                  always current, always offline-ready, always counting down
                  to what's next.
                </p>
                {[
                  "Day-by-day itineraries, generated in seconds",
                  "Works with no signal, no panic",
                  "Always one tap from what's next",
                ].map((line) => (
                  <p
                    key={line}
                    className="flex items-center gap-2.5 text-sm text-foreground/70 py-1"
                  >
                    <FaCheck className="text-emerald-500 text-xs" /> {line}
                  </p>
                ))}
              </div>

              <div className="bg-[#FAFAF8] p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[10px] font-semibold text-background bg-foreground rounded-full px-3 py-1.5">
                    Next up · lunch in 30 min
                  </span>
                  <span className="text-[10px] font-semibold text-foreground/60 bg-white border border-border rounded-full px-3 py-1.5">
                    5 stops today · offline ready
                  </span>
                </div>
                <div className="space-y-2.5">
                  {[
                    {
                      icon: FaPlane,
                      color: "bg-orange-100 text-orange-600",
                      title: "Morning flight",
                      sub: "GA 408 · 08:40 · Seat 14A",
                      tag: "Today",
                    },
                    {
                      icon: FaHotel,
                      color: "bg-emerald-100 text-emerald-600",
                      title: "Lunch at Locavore",
                      sub: "Seminyak · 13:00",
                    },
                    {
                      icon: FaMapMarkerAlt,
                      color: "bg-indigo-100 text-indigo-600",
                      title: "Sacred Monkey Forest",
                      sub: "Padangtegal · 15:30",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 bg-white border border-border rounded-xl px-3.5 py-3"
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
                        <p className="text-xs text-foreground/45 truncate">
                          {item.sub}
                        </p>
                      </div>
                      {item.tag && (
                        <span
                          className="ml-auto text-[10px] font-semibold text-background rounded-full px-2.5 py-1 shrink-0"
                          style={{ background: ORANGE }}
                        >
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
      <section id="how-it-works" className="py-24 md:py-28 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-16">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: ORANGE }}
            >
              How it works
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              From idea to itinerary in minutes.
            </h2>
            <p className="mt-3 text-foreground/50">
              No spreadsheets. No switching apps. Just tell us where you want to
              go.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-border bg-white p-6">
              <span className="text-2xl font-bold" style={{ color: ORANGE }}>
                01
              </span>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Where, when, how you travel.
              </h3>
              <p className="mt-1.5 text-sm text-foreground/50 leading-relaxed">
                A few lines about where, when, and how — we'll take care of the
                rest.
              </p>
              <div className="mt-5 rounded-xl border border-border p-4">
                <div className="flex gap-1.5 mb-3">
                  {["Bali", "Tokyo", "Lisbon"].map((d) => (
                    <span
                      key={d}
                      className="text-[10px] rounded-full border border-border px-2 py-1 text-foreground/50"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="rounded-lg bg-[#FAFAF8] px-3 py-2 text-[11px] text-foreground/60">
                  5 days in Bali, relaxed pace
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <span className="text-2xl font-bold" style={{ color: ORANGE }}>
                02
              </span>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Draft ready in 30 seconds.
              </h3>
              <p className="mt-1.5 text-sm text-foreground/50 leading-relaxed">
                A complete itinerary — routes, stops, bookings — structured by
                day.
              </p>
              <div className="mt-5 rounded-xl border border-border p-4 flex flex-col items-center justify-center h-[110px]">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: `${ORANGE}1A` }}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ background: ORANGE }}
                  />
                </div>
                <span
                  className="mt-3 text-[10px] font-semibold text-background rounded-full px-2.5 py-1"
                  style={{ background: ORANGE }}
                >
                  Generating itinerary
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <span className="text-2xl font-bold" style={{ color: ORANGE }}>
                03
              </span>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Everything in your pocket.
              </h3>
              <p className="mt-1.5 text-sm text-foreground/50 leading-relaxed">
                Timeline, tickets, docs — always one tap away, online or off.
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
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 ${row.active ? "border" : ""}`}
                    style={
                      row.active
                        ? {
                            borderColor: `${ORANGE}55`,
                            background: `${ORANGE}0D`,
                          }
                        : undefined
                    }
                  >
                    <span className="text-[10px] text-foreground/40 w-9 shrink-0">
                      {row.time}
                    </span>
                    <span className="text-[11px] text-foreground/70 truncate">
                      {row.label}
                    </span>
                    {row.active && (
                      <span
                        className="ml-auto text-[9px] font-semibold text-background rounded-full px-1.5 py-0.5"
                        style={{ background: ORANGE }}
                      >
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

      {/* Testimonials */}
      <section className="py-24 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
            <div>
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: ORANGE }}
              >
                Loved by early travelers
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground max-w-md">
                What modern travel planning should feel like.
              </h2>
              <div className="mt-8 flex items-center gap-10">
                {[
                  {
                    value: "1,248",
                    label: "travelers joined in the last 2 weeks",
                  },
                  {
                    value: "4.8 ★",
                    label: "average rating from 312 beta users",
                  },
                  { value: "40+", label: "countries planned by early users" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-semibold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-xs text-foreground/45 max-w-[120px] mt-1 leading-snug">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground/40">
                <FaArrowLeft className="text-xs" />
              </button>
              <button className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center">
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`rounded-2xl border border-border bg-white p-6 ${i % 2 === 1 ? "md:mt-8" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-foreground/40">{t.rating}</span>
                  <div
                    className="flex text-[11px] gap-0.5"
                    style={{ color: ORANGE }}
                  >
                    {Array.from({ length: 5 }).map((_, s) => (
                      <FaStar key={s} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-foreground/40">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="py-24 md:py-28 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden border border-border bg-white">
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
              alt="Paris"
              className="w-full h-72 object-cover"
            />
            <div className="p-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ORANGE }}
                />{" "}
                Paris, May 2026
              </p>
              <p className="text-xs text-foreground/45 italic mt-0.5">
                Where the idea started.
              </p>
            </div>
          </div>

          <div>
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: ORANGE }}
            >
              A note from the team
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground leading-tight">
              We're not finished — but here's what we've built so far.
            </h2>
            <p className="mt-5 text-sm text-foreground/55 leading-relaxed">
              We started SafarAI after wasting three weeks planning a five-day
              trip across notes apps, booking emails, and a dozen browser tabs
              that never talked to each other. None of them cared about the trip
              — only the next click.
            </p>
            <p className="mt-4 text-sm text-foreground/55 leading-relaxed">
              We're building the calmer version we wished existed: one place,
              structured by day, that respects the pace of how people actually
              travel.
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
                <p className="text-xs text-foreground/45">
                  Currently drafting v1
                </p>
              </div>
            </div>
            <p
              className="mt-6 pl-4 border-l-2 text-sm text-foreground/50 italic leading-relaxed"
              style={{ borderColor: ORANGE }}
            >
              P.S. If you've ever lost your plans because a tab crashed before
              you could save them — we built this for you.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: ORANGE }}
            >
              Find answers here
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-[220px_1fr] gap-8">
            <div className="rounded-2xl border border-border bg-[#FAFAF8] p-5 h-fit">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-3">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: ORANGE }}
                />{" "}
                General questions
              </p>
              <p className="mt-6 text-xs text-foreground/45 leading-relaxed">
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
                      <FaMinus className="text-xs text-foreground/40 shrink-0" />
                    ) : (
                      <FaPlus className="text-xs text-foreground/40 shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <p className="mt-3 text-sm text-foreground/55 leading-relaxed max-w-2xl">
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
      <section className="relative overflow-hidden bg-[#12131A] py-20 md:py-0">
        <div
          className="absolute -bottom-32 -right-16 w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: ORANGE }}
        />
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="py-8 md:py-24">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: ORANGE }}
            >
              Ready when you are
            </span>
            <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
              Travel planning, without the chaos.
            </h2>
            <p className="mt-4 text-white/50 text-sm max-w-sm">
              Plan, organize, and experience trips with SafarAI — your AI travel
              companion, all in one place.
            </p>

            <div className="mt-8 max-w-sm flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full h-14 pl-6 pr-1.5">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
              />
              <Button
                asChild
                className="h-11 rounded-full px-6 font-semibold bg-white text-[#12131A] hover:bg-white/90 shrink-0"
              >
                <Link href="/app">Get started free</Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-white/35">
              Free 14-day trial. No credit card required.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {[
                  "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=64&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&q=80",
                ].map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-[#12131A] object-cover"
                  />
                ))}
              </div>
              <p className="text-xs text-white/50">
                Trusted by 12,400+ travelers
              </p>
            </div>
          </div>

          <div className="hidden md:flex justify-center py-10">
            <div className="w-[280px] rounded-[2rem] border-4 border-white/10 bg-[#0E0F14] p-3 shadow-2xl">
              <div className="rounded-[1.5rem] bg-white overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Bali, Indonesia
                    </p>
                    <p className="text-[10px] text-foreground/40">5 days</p>
                  </div>
                </div>
                <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto">
                  {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"].map((d, i) => (
                    <span
                      key={d}
                      className={`text-[10px] rounded-full px-2.5 py-1 shrink-0 font-medium ${
                        i === 1
                          ? "bg-foreground text-background"
                          : "bg-secondary text-foreground/50"
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="px-4 pb-4 space-y-2.5">
                  <p className="text-[10px] font-semibold text-foreground/40 flex items-center gap-1.5">
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
                      className={`rounded-xl px-3 py-2.5 ${row.active ? "border" : "bg-[#FAFAF8]"}`}
                      style={
                        row.active
                          ? {
                              borderColor: `${ORANGE}55`,
                              background: `${ORANGE}0D`,
                            }
                          : undefined
                      }
                    >
                      <p className="text-[10px] text-foreground/40">
                        {row.time}
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {row.title}
                      </p>
                      <p className="text-[10px] text-foreground/40">
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
      <footer className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-[1.3fr_1fr_1fr_1fr] gap-10 pb-10 border-b border-border">
            <div>
              <p className="text-base font-semibold text-foreground">SafarAI</p>
              <p className="mt-2 text-sm text-foreground/45 max-w-[220px] leading-relaxed">
                Travel planning, without the chaos. A calmer way to plan,
                organize, and go.
              </p>
              <div className="flex items-center gap-2 mt-5">
                {[FaTwitter, FaLinkedin, FaInstagram].map((Icon, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground/40"
                  >
                    <Icon className="text-xs" />
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-foreground/35 mb-3">
                PRODUCT
              </p>
              {["Features", "How it works", "FAQ"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                  className="block text-sm text-foreground/55 hover:text-foreground py-1"
                >
                  {l}
                </a>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-foreground/35 mb-3">
                COMPANY
              </p>
              {["About", "Contact"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="block text-sm text-foreground/55 hover:text-foreground py-1"
                >
                  {l}
                </a>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest text-foreground/35 mb-3">
                LEGAL
              </p>
              {["Privacy Policy", "Terms"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="block text-sm text-foreground/55 hover:text-foreground py-1"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-foreground/40">
              &copy; {new Date().getFullYear()} SafarAI. All rights reserved.
            </p>
            <span className="text-xs text-foreground/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> All
              systems normal
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
