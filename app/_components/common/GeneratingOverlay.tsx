"use client";

import { Check } from "lucide-react";
import { Lottie } from "lottie-react";
import { Spinner } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/** Brand-gradient progress bar — matches the planner sidebar style. */
function BrandProgress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <Progress
      value={value}
      className={cn(
        "h-1.5 bg-[var(--brand-coral)]/15 [&_[data-slot=progress-indicator]]:bg-brand-gradient",
        className,
      )}
    />
  );
}

export default function GeneratingOverlay({
  GENERATION_STEPS,
  visible,
  destinations,
  duration,
  activeStep,
}: {
  GENERATION_STEPS: string[];
  visible: boolean;
  destinations: string[];
  duration: number;
  activeStep: number;
}) {
  if (!visible) return null;

  const total = GENERATION_STEPS.length;
  const pct = Math.round(((activeStep + 1) / total) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 px-5 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh_-_2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-white p-6 shadow-xl sm:p-7">
        {/* Generation lottie (replaces the old ring + plane spinner) */}
        <div className="flex justify-center">
          <Lottie
            src="/json-gifs/generation.json"
            autoplay
            loop
            className="size-36 sm:size-44"
          />
        </div>

        <div className="mt-5 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Crafting your itinerary…
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {duration ? `A personalized ${duration}-day plan` : "Your plan"}
            {destinations.length > 0 ? ` for ${destinations.join(", ")}` : ""}.
            This usually takes under a minute.
          </p>
        </div>

        {/* Brand-gradient progress */}
        <div className="mt-5">
          <BrandProgress value={pct} />
          <p className="mt-2 text-right text-[11px] font-medium text-muted-foreground">
            Step {Math.min(activeStep + 1, total)} of {total}
          </p>
        </div>

        {/* Steps — one aligned icon column, matching the sidebar list */}
        <ul className="mt-4 space-y-2.5">
          {GENERATION_STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <li key={step} className="flex items-center gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {isDone ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-brand-gradient">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  ) : isActive ? (
                    <Spinner
                      size="small"
                      className="border-[var(--brand-coral)]/25 border-t-[var(--brand-coral)]"
                    />
                  ) : (
                    <span className="size-5 rounded-full border-2 border-border" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isDone
                      ? "text-muted-foreground"
                      : isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground/50",
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
