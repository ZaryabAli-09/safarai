"use client";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

// shadcn imports
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const emailSchema = z.string().email("Invalid email address");

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const result = emailSchema.safeParse(email);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    try {
      setLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success(data.message || "Password reset link sent to your email");
      setEmail("");
      setLoading(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit the form. Please try again.");
      setLoading(false);
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Type your registered email to reset your password.{" "}
          </p>
        </div>

        <Field>
          <Input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Please enter your email"
            id="email"
            type="email"
            required
          />
        </Field>
        <Field>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!email || loading}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed "
          >
            {loading ? "Loading..." : " Reset Password"}
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
