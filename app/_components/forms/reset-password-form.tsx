"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

// shadcn imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// Password policy aligned with server schema
const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[@$!%*?&]/, "Password must contain a special character (@$!%*?&)");

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!resetToken) {
      toast.error("Invalid or missing reset token");
      return;
    }

    const result = passwordSchema.safeParse(newPassword);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success(data?.message || "Password updated successfully");
      setNewPassword("");
      setLoading(false);
      router.push("/sign-in");
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setLoading(false);
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Create new password.{" "}
          </p>
        </div>

        <Field>
          <Input
            onChange={(e) => setNewPassword(e.target.value)}
            value={newPassword}
            placeholder="Please enter your new Password"
            id="password"
            type="password"
            required
          />
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={newPassword.trim().length < 1 || loading}
            className="cursor-pointer"
          >
            {loading ? "Loading..." : "Create Password"}
          </Button>
          <FieldDescription className="text-center">
            Remembered your password?{" "}
            <Link href={"/sign-in"} className="text-sm">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
