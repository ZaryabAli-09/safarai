"use client";

/**
 * SafarAI landing page.
 *
 * Every piece of copy, card, FAQ and legal text comes from
 * `@/lib/landing/content.ts`, so content edits happen there and this file only
 * handles structure, motion and styling. The product preview mirrors the real
 * trip screen in `app/(client)/app/trips/[tripid]` (day rail, trip tools,
 * activity meta rows): keep the two in sync when the app UI changes.
 */

import { useEffect, useState, type ElementType, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CloudSun,
  LayoutDashboard,
  Layers,
  Lightbulb,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Plus,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/public/assets/logo/logo.png";
import {
  CAPABILITY_STRIP,
  COMPARISON,
  CONTACT,
  FAQ,
  FEATURES,
  FINAL_CTA,
  FOOTER,
  HERO,
  HOW_IT_WORKS,
  LEGAL,
  STEP_PREVIEWS,
  TRIP_PREVIEW,
  type LegalKind,
  type Tint,
} from "@/lib/landing/content";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Lightweight reveal: only opacity + transform. No layout thrashing. */
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

/** Icon keys used in content.ts, mapped to lucide components. */
const ICONS: Record<string, ElementType> = {
  itinerary: Calendar,
  budget: Wallet,
  weather: CloudSun,
  maps: MapPin,
  packing: Package,
  tips: Lightbulb,
  trips: LayoutDashboard,
  feed: MessageCircle,
  phone: Smartphone,
  form: ClipboardList,
  generating: Sparkles,
  review: CheckCircle2,
};

/** Brand tint per icon chip, matching the muted palette used inside the app. */
const TINTS: Record<Tint, { chip: string; text: string }> = {
  coral: {
    chip: "bg-[var(--brand-coral-muted)]/70",
    text: "text-[var(--brand-coral)]",
  },
  orange: {
    chip: "bg-[var(--brand-orange-muted)]/70",
    text: "text-[var(--brand-orange)]",
  },
  yellow: { chip: "bg-[var(--brand-yellow-muted)]/70", text: "text-[#8a6a05]" },
  purple: {
    chip: "bg-[var(--brand-purple-muted)]/70",
    text: "text-[var(--brand-purple)]",
  },
  pink: {
    chip: "bg-[var(--brand-pink-muted)]/70",
    text: "text-[var(--brand-pink)]",
  },
};

/** Time of day dots, same three beats the trip screen uses. */
const TONE_DOT: Record<string, string> = {
  morning: "bg-[var(--brand-yellow)]",
  afternoon: "bg-[var(--brand-orange)]",
  evening: "bg-[var(--brand-purple)]",
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function LandingPage({
  companyEmail = "",
}: {
  companyEmail?: string;
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [legal, setLegal] = useState<LegalKind | null>(null);

  const email = companyEmail.trim();
  const mailHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(CONTACT.mailSubject)}`
    : "#contact";

  /* Lock scrolling and allow Escape while the legal popup is open. */
  useEffect(() => {
    if (!legal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLegal(null);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [legal]);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background">
        {/* Layered background: faint grid, coral glow, purple depth */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 75% 60% at 50% 0%, #000 55%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 60% at 50% 0%, #000 55%, transparent 100%)",
            }}
          />
          <div className="absolute -top-48 left-1/2 h-[680px] w-[1040px] -translate-x-1/2 rounded-full bg-[var(--brand-coral)]/12 blur-[140px]" />
          <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-[var(--brand-purple)]/10 blur-[120px]" />
          <div className="absolute top-40 left-[-8%] h-[380px] w-[380px] rounded-full bg-[var(--brand-orange)]/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl px-6 pt-16 text-center md:pt-24">
          {/* Announcement badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-7 flex justify-center"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--brand-coral)]/25 bg-brand-gradient-muted px-3.5 py-1.5 text-xs shadow-sm backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-gradient opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 text-2xl bg-brand-gradient rounded-full" />
              </span>
              <span className="font-semibold text-accent-foreground">
                {HERO.badge}
              </span>
            </div>
          </motion.div>

          {/* Headline: one emphasis system, the brand gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-5xl lg:text-7xl"
          >
            <span className="block">{HERO.titleLine1}</span>
            <span className="block text-brand-gradient">
              {HERO.titleAccent}
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-lg"
          >
            {HERO.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-12 w-full rounded-full px-7 text-base font-semibold shadow-lg shadow-[var(--brand-coral)]/25 transition-all hover:shadow-[var(--brand-coral)]/30 sm:w-auto"
            >
              <Link href={HERO.primaryCta.href}>
                {HERO.primaryCta.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-border bg-background px-7 text-base font-semibold hover:bg-secondary sm:w-auto"
            >
              <Link href={HERO.secondaryCta.href}>
                {HERO.secondaryCta.label}
              </Link>
            </Button>
          </motion.div>

          {/* Trust points */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {HERO.trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <Check className="size-3.5 text-[var(--brand-coral)]" />
                {point}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* ===== PRODUCT PREVIEW: mirrors the real trip screen ===== */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mt-14 max-w-5xl px-6 md:mt-16"
        >
          {/* Glow behind the card */}
          <div className="pointer-events-none absolute inset-x-16 -top-6 bottom-4 rounded-[3rem] bg-gradient-to-b from-[var(--brand-coral)]/20 via-[var(--brand-pink)]/8 to-transparent blur-3xl -z-10" />

          <div className="overflow-hidden rounded-3xl border border-border bg-white ">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#f87171]" />
                <span className="size-2.5 rounded-full bg-[#fbbf24]" />
                <span className="size-2.5 rounded-full bg-[#4ade80]" />
              </div>
              <div className="flex flex-1 justify-center">
                <span className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  <svg
                    className="size-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  {TRIP_PREVIEW.url}
                </span>
              </div>
              <div className="w-12" />
            </div>

            {/* App top bar, same shape as the trip header */}
            <div className="flex h-12 items-center gap-3 border-b border-border/70 bg-white px-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
                <ArrowLeft className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-medium text-foreground sm:text-sm">
                    {TRIP_PREVIEW.name}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[9px] font-semibold text-[#15803d]">
                    <CheckCircle2 className="size-2.5" />
                    {TRIP_PREVIEW.status}
                  </span>
                </div>
              </div>
              <div className="hidden items-center gap-3 text-[10px] text-muted-foreground sm:flex">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3 text-[var(--brand-coral)]" />
                  <span className="max-w-[160px] truncate">
                    {TRIP_PREVIEW.route}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-[var(--brand-orange)]" />
                  {TRIP_PREVIEW.dates}
                </span>
              </div>
            </div>

            {/* Body: sidebar + day panel, like the real layout */}
            <div className="grid gap-3.5 bg-secondary p-3.5 sm:p-4 md:grid-cols-[236px_1fr]">
              <aside className="hidden flex-col gap-3.5 md:flex">
                {/* Day by day rail */}
                <div className="rounded-3xl border border-border bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2.5 px-1 pb-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
                      <Layers className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        Day by day
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {TRIP_PREVIEW.summary.days} ·{" "}
                        {TRIP_PREVIEW.summary.stops}
                      </p>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    {TRIP_PREVIEW.days.map((day) => (
                      <div
                        key={day.n}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                          day.active ? "bg-brand-gradient-muted" : ""
                        }`}
                      >
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                            day.active
                              ? "bg-brand-gradient text-white"
                              : "bg-brand-gradient-muted text-muted-foreground"
                          }`}
                        >
                          {day.n}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-xs font-semibold ${
                              day.active
                                ? "text-[var(--brand-coral)]"
                                : "text-foreground"
                            }`}
                          >
                            {day.title}
                          </span>
                          <span className="block truncate text-[10px] text-muted-foreground">
                            {day.meta}
                          </span>
                        </span>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Trip tools */}
                <div className="rounded-3xl border border-border bg-white p-3 shadow-sm">
                  <p className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Trip tools
                  </p>
                  <div className="space-y-1">
                    {TRIP_PREVIEW.tools.map((tool) => {
                      const Icon = ICONS[tool.icon];
                      const tint = TINTS[tool.tint];
                      return (
                        <div
                          key={tool.label}
                          className="flex items-center gap-2.5 rounded-xl px-2.5 py-2"
                        >
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tint.chip}`}
                          >
                            <Icon className={`size-3.5 ${tint.text}`} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-foreground">
                              {tool.label}
                            </span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {tool.meta}
                            </span>
                          </span>
                          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Day panel */}
              <div className="min-w-0 rounded-3xl border border-border bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {TRIP_PREVIEW.day.heading}
                    </p>
                    <h3 className="mt-0.5 truncate text-sm font-bold text-foreground sm:text-base">
                      {TRIP_PREVIEW.day.title}
                    </h3>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                    {TRIP_PREVIEW.day.date}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {TRIP_PREVIEW.day.activities.map((activity) => (
                    <div
                      key={activity.title}
                      className={`rounded-2xl border px-3.5 py-3 transition-colors ${
                        activity.active
                          ? "border-[var(--brand-coral)]/30 bg-[var(--brand-coral)]/5"
                          : "border-border bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-1 w-9 shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground">
                          {activity.time}
                        </span>
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${TONE_DOT[activity.tone]}`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                            {activity.title}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                            {activity.place} · {activity.weather}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-border bg-white px-2 py-0.5 text-[10px] font-semibold text-foreground">
                          {activity.cost}
                        </span>
                      </div>
                      {activity.active && (
                        <div className="mt-2.5 flex justify-end">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[10px] font-medium text-foreground">
                            <MapPin className="size-3 text-[var(--brand-coral)]" />
                            View on Google Maps
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade into the next section */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 h-20 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </motion.div>

        <div className="h-14 md:h-16" />
      </section>

      {/* ===== CAPABILITY STRIP ===== */}
      <section
        aria-label="What every trip includes"
        className="border-y border-border bg-card/50 py-5"
      >
        <div className="relative">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee flex w-max shrink-0 items-center gap-10 pr-10 will-change-transform">
              {[...CAPABILITY_STRIP, ...CAPABILITY_STRIP].map((item, i) => (
                <span
                  key={`${item}-${i}`}
                  className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-sm font-medium text-muted-foreground"
                >
                  <span className="size-1.5 rounded-full bg-brand-gradient" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== OLD WAY vs SAFARAI WAY ===== */}
      <section className="scroll-mt-20 bg-secondary py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="mb-14 text-center md:mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-coral)]">
              {COMPARISON.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {COMPARISON.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {COMPARISON.subtitle}
            </p>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            {/* The old way */}
            <FadeIn>
              <div className="h-full rounded-3xl border border-border bg-background p-7 shadow-sm md:p-8">
                <span className="inline-block rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
                  {COMPARISON.oldWay.tag}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {COMPARISON.oldWay.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {COMPARISON.oldWay.description}
                </p>
                <div className="mt-7 flex flex-wrap gap-2 rounded-2xl bg-secondary/60 p-4">
                  {COMPARISON.oldWay.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* The SafarAI way, wrapped in a thin brand gradient frame */}
            <FadeIn delay={0.1}>
              <div className="h-full rounded-3xl bg-brand-gradient p-px shadow-xl shadow-[var(--brand-coral)]/10">
                <div className="flex h-full flex-col rounded-[calc(1.875rem-1px)] bg-background p-7 md:p-8">
                  <span className="inline-block w-fit rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    {COMPARISON.newWay.tag}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {COMPARISON.newWay.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {COMPARISON.newWay.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {COMPARISON.newWay.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-sm text-foreground/85"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--brand-coral)]/12">
                          <Check className="size-3 text-[var(--brand-coral)]" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        id="features"
        className="scroll-mt-20 bg-background py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="mb-14 text-center md:mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-coral)]">
              {FEATURES.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {FEATURES.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {FEATURES.subtitle}
            </p>
          </FadeIn>

          {/* Highlight card */}
          <FadeIn>
            <div className="mb-6 grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:mb-8 md:grid-cols-2">
              <div className="flex flex-col justify-center p-7 md:p-10">
                <span className="w-fit rounded-full border border-[var(--brand-coral)]/25 bg-[var(--brand-coral)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--brand-coral)]">
                  {FEATURES.highlight.tag}
                </span>
                <h3 className="mt-5 text-2xl font-semibold text-foreground">
                  {FEATURES.highlight.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {FEATURES.highlight.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {FEATURES.highlight.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-3 text-sm text-foreground/85"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--brand-coral)]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-center gap-3 bg-secondary/60 p-6 md:p-8">
                {FEATURES.highlight.miniCards.map((card) => {
                  const Icon = ICONS[card.icon];
                  const tint = TINTS[card.tint];
                  return (
                    <div
                      key={card.label}
                      className="flex items-center gap-3.5 rounded-2xl border border-border bg-white px-4 py-3.5 shadow-sm"
                    >
                      <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tint.chip}`}
                      >
                        <Icon className={`size-4 ${tint.text}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {card.label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {card.meta}
                        </p>
                      </div>
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Feature grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.cards.map((card, i) => {
              const Icon = ICONS[card.icon];
              const tint = TINTS[card.tint];
              return (
                <FadeIn key={card.title} delay={(i % 4) * 0.05}>
                  <div className="h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-coral)]/40 hover:shadow-md">
                    <span
                      className={`flex size-10 items-center justify-center rounded-xl ${tint.chip}`}
                    >
                      <Icon className={`size-4 ${tint.text}`} />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        className="scroll-mt-20 bg-secondary py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn className="mb-14 text-center md:mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-coral)]">
              {HOW_IT_WORKS.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {HOW_IT_WORKS.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {HOW_IT_WORKS.subtitle}
            </p>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.steps.map((step, i) => {
              const Icon = ICONS[step.icon];
              return (
                <FadeIn key={step.n} delay={i * 0.08}>
                  <div className="flex h-full flex-col rounded-3xl border border-border bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient-muted">
                        <Icon className="size-4 text-[var(--brand-coral)]" />
                      </span>
                      <span className="text-2xl font-bold text-brand-gradient">
                        {step.n}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    {/* Mini preview of the real screen for this step */}
                    <div className="mt-auto rounded-2xl border border-border bg-card p-4 pt-4">
                      <p className="sr-only">Preview of step {step.n}</p>
                      {step.preview === "form" && (
                        <div>
                          <div className="flex flex-wrap gap-2">
                            {STEP_PREVIEWS.form.chips.map((chip) => (
                              <span
                                key={chip}
                                className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] font-medium text-foreground/80"
                              >
                                {chip}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
                            {STEP_PREVIEWS.form.summary}
                          </p>
                        </div>
                      )}

                      {step.preview === "generating" && (
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand-coral)]/12">
                              <Sparkles className="size-3 animate-pulse text-[var(--brand-coral)]" />
                            </span>
                            <p className="text-xs font-semibold text-foreground">
                              {STEP_PREVIEWS.generating.label}
                            </p>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-brand-gradient"
                              style={{
                                width: `${STEP_PREVIEWS.generating.progress}%`,
                              }}
                            />
                          </div>
                          <ul className="mt-3 space-y-1.5">
                            {STEP_PREVIEWS.generating.steps.map((line) => (
                              <li
                                key={line}
                                className="flex items-center gap-2 text-[11px] text-muted-foreground"
                              >
                                <Check className="size-3 text-green-500" />
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.preview === "review" && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {STEP_PREVIEWS.review.date}
                          </p>
                          <div className="mt-2 space-y-2">
                            {STEP_PREVIEWS.review.rows.map((row) => (
                              <div
                                key={row.label}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                                  row.active
                                    ? "border border-[var(--brand-coral)]/30 bg-[var(--brand-coral)]/5"
                                    : "bg-secondary/60"
                                }`}
                              >
                                <span className="w-8 shrink-0 text-[10px] tabular-nums text-muted-foreground">
                                  {row.time}
                                </span>
                                <span className="truncate text-[11px] text-foreground/85">
                                  {row.label}
                                </span>
                                {row.active && (
                                  <span className="ml-auto shrink-0 rounded-full bg-[var(--brand-coral)] px-2 py-0.5 text-[9px] font-semibold text-white">
                                    Next
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="scroll-mt-20 bg-background py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FadeIn className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-coral)]">
              {FAQ.eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {FAQ.title}
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-3xl  bg-card px-5 sm:px-7">
              {FAQ.items.map((faq, i) => (
                <div
                  key={faq.q}
                  className={i === 0 ? "" : "border-t border-border"}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="group flex w-full items-center justify-between gap-4 py-5 text-left"
                  >
                    <span className="text-[15px] font-medium text-foreground transition-colors group-hover:text-[var(--brand-coral)]">
                      {faq.q}
                    </span>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-[var(--brand-coral)]/10">
                      {openFaq === i ? (
                        <Minus className="size-3.5 text-[var(--brand-coral)]" />
                      ) : (
                        <Plus className="size-3.5 text-muted-foreground transition-colors group-hover:text-[var(--brand-coral)]" />
                      )}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pr-10 text-sm leading-relaxed text-muted-foreground">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {FAQ.stillHaveAQuestion} {FAQ.replyNote}
              {email ? (
                <a
                  href={mailHref}
                  className="font-semibold text-[var(--brand-coral)] underline underline-offset-4 hover:text-[var(--brand-pink)]"
                >
                  {FAQ.reachOutLabel}
                </a>
              ) : (
                <span className="font-semibold text-foreground">
                  {FAQ.reachOutLabel}
                </span>
              )}{" "}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="relative overflow-hidden bg-foreground py-24 md:py-28">
        <div className="pointer-events-none absolute -left-32 -top-32 h-[460px] w-[460px] rounded-full bg-[var(--brand-coral)] opacity-15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-16 h-[420px] w-[420px] rounded-full bg-[var(--brand-purple)] opacity-20 blur-[120px]" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <FadeIn>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)]">
              {FINAL_CTA.eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              {FINAL_CTA.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
              {FINAL_CTA.subtitle}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-8 text-base font-semibold text-white shadow-xl shadow-black/20"
              >
                <Link href={HERO.primaryCta.href}>
                  {FINAL_CTA.buttonLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                {FINAL_CTA.notes.map((note) => (
                  <li
                    key={note}
                    className="flex items-center gap-1.5 text-xs text-white/50"
                  >
                    <Check className="size-3 text-green-400" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center">
                <Image
                  className="h-10 w-auto"
                  src={Logo}
                  alt="SafarAI"
                  priority
                />
                <span className="font-bold text-foreground">SAFAR AI.</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                {FOOTER.tagline}
              </p>
            </div>

            {FOOTER.columns.map((column) => (
              <div key={column.title}>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {column.title}
                </p>
                <div className="space-y-2.5">
                  {column.links.map((link) => {
                    const action = link.action;
                    if (action === "privacy" || action === "terms") {
                      return (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => setLegal(action)}
                          className="block cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </button>
                      );
                    }
                    if (action === "email") {
                      if (!email) return null;
                      return (
                        <a
                          key={link.label}
                          href={mailHref}
                          className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={link.label}
                        href={link.href ?? "#"}
                        className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SafarAI. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              {FOOTER.engineeredBy}
            </p>
          </div>
        </div>
      </footer>

      {/* ===== LEGAL POPUP (privacy / terms) ===== */}
      <AnimatePresence>
        {legal && (
          <motion.div
            key="legal-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
          >
            <div
              className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
              onClick={() => setLegal(null)}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-modal-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2
                    id="legal-modal-title"
                    className="text-xl font-semibold text-foreground"
                  >
                    {LEGAL[legal].title}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {LEGAL[legal].updated}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLegal(null)}
                  aria-label="Close"
                  className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {LEGAL[legal].intro}
              </p>

              <div className="mt-6 space-y-5">
                {LEGAL[legal].sections.map((section) => (
                  <section key={section.heading}>
                    <h3 className="text-sm font-semibold text-foreground">
                      {section.heading}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>

              {email && (
                <p className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
                  Questions about this?{" "}
                  <a
                    href={mailHref}
                    className="font-semibold text-[var(--brand-coral)] underline underline-offset-4"
                  >
                    Email us
                  </a>
                  .
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
