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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-5 shadow-2xl sm:p-6">
        {/* Generation lottie */}
        <div className="flex justify-center">
          <Lottie
            src="/assets/json-gifs/generation.json"
            autoplay
            loop
            className="size-20 sm:size-24"
          />
        </div>

        <div className="mt-3 text-center">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            Crafting your itinerary…
          </h2>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {duration ? `A personalized ${duration}-day plan` : "Your plan"}
            {destinations.length > 0 ? ` for ${destinations.join(", ")}` : ""}.
            This usually takes under a minute.
          </p>
        </div>

        {/* Brand-gradient progress */}
        <div className="mt-4">
          <BrandProgress value={pct} />
          <p className="mt-1.5 text-right text-[11px] font-medium text-muted-foreground">
            Step {Math.min(activeStep + 1, total)} of {total}
          </p>
        </div>

        {/* Steps — compact spacing */}
        <ul className="mt-3 space-y-2">
          {GENERATION_STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <li key={step} className="flex items-center gap-2.5">
                <span className="flex size-4.5 shrink-0 items-center justify-center">
                  {isDone ? (
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-brand-gradient">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </span>
                  ) : isActive ? (
                    <Spinner
                      size="small"
                      className="size-3.5 border-[var(--brand-coral)]/25 border-t-[var(--brand-coral)]"
                    />
                  ) : (
                    <span className="size-4 rounded-full border-2 border-border" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs sm:text-sm",
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
