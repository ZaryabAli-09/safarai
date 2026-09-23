"use client";

import { type ReactNode } from "react";
import { Lottie } from "lottie-react";
import { MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  gifjson,
  icon: Icon = MapPinned,
  heading,
  description,
  action,
}: {
  gifjson?: string;
  icon?: LucideIcon;
  heading?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="relative mb-5">
          {gifjson ? (
            <Lottie src={gifjson} autoplay loop className="h-40 w-52" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient-muted">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background">
                <Icon className="h-5 w-5 text-[var(--brand-purple)]" />
              </div>
            </div>
          )}
        </div>

        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          {heading}
        </h2>

        <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm">
          {description}
        </p>

        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  );
}
