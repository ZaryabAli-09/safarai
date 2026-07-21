"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ─── Inline Spinner ───────────────────────────────────────────────────────────

type SpinnerSize = "small" | "default" | "large";

const sizeMap: Record<SpinnerSize, string> = {
  small: "w-4 h-4 border-2",
  default: "w-6 h-6 border-2",
  large: "w-10 h-10 border-[3px]",
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = "default", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-border border-t-primary animate-spin",
        sizeMap[size],
        className,
      )}
    />
  );
}

// ─── Overlay Loader ───────────────────────────────────────────────────────────

interface OverlayLoaderProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export function OverlayLoader({
  loading,
  message,
  children,
  className,
}: OverlayLoaderProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-inherit bg-background/80 backdrop-blur-[2px]">
          <Spinner size="large" />
          {message && (
            <p className="text-sm text-muted-foreground font-medium">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
