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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const passwordScehma = z.string().min(6, "Password must be 6 characters");

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const resetToken = searchParams.get("resetToken");

  async function handleSubmit() {
    const result = passwordScehma.safeParse(newPassword);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    try {
      setLoading(true);

      const res = await fetch(
        `/api/auth/reset-password?resetToken=${resetToken}&newPassword=${newPassword}`
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success(data.message || "Password update successfully");
      setNewPassword("");
      setLoading(false);
      router.push("/sign-in");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.message);
      setLoading(false);
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
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
            onClick={handleSubmit}
            disabled={newPassword.trim().length < 1 || loading}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed "
          >
            {loading ? "Loading..." : "Create Password"}
          </Button>
          <p className="text-dark text-sm mt-4">
            Remembered your password?{" "}
            <Link
              className="text-submit cursor-pointer hover:underline"
              href={"/sign-in"}
            >
              Login
            </Link>
          </p>
        </Field>
      </FieldGroup>
    </form>
  );
}
