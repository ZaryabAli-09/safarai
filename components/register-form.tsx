"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

// zod schemas for sign in form
const formSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const otpSchema = z.string().trim().min(6, "Otp must be 6 numbers");

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [confirmRegistration, setConfirmRegistration] = useState(false);

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);

  const router = useRouter();

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    const validation = otpSchema.safeParse(otp);
    if (!validation.success) {
      return toast.error(validation.error.issues[0].message);
    }

    try {
      setLoading(true);
      const result = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await result.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success(data.message || "OTP verified successfully");
      setConfirmRegistration(false);
      setLoading(false);
      router.push("/sign-in");
    } catch (error: any) {
      toast.error(error);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = formSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    try {
      setLoading(true);
      const result = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await result.json();

      if (!data.success) {
        toast.error(data.message || "Something went wrong");
        setLoading(false);
        return;
      }
      toast.success(data.message, data.data || "Successfully registered");
      setConfirmRegistration(true);
      setUserId(data.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error);
      setLoading(false);
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Welcome! Please enter your details.{" "}
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="text">Name</FieldLabel>
          <Input
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            value={formData.username}
            id="name"
            type="text"
            placeholder="zaryab ali"
            disabled={loading || confirmRegistration}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={loading || confirmRegistration}
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            id="password"
            type="password"
            disabled={loading || confirmRegistration}
            required
          />
        </Field>
        {!confirmRegistration ? (
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.email ||
              !formData.password ||
              !formData.username
            }
            className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md bg-submit text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Loading..." : "Create Account"}
          </button>
        ) : (
          <>
            <input
              onChange={
                (e) => setOtp(e.target.value) // Assuming you have a state for OTP
              }
              className="w-[80%] sm:w-[70%] lg:w-[80%] p-4 bg-gray-50 placeholder:text-black text-black border border-gray-300 rounded-md  focus:outline-dark"
              placeholder="Enter you OTP here "
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading || !otp}
              className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md bg-submit text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Loading..." : "Verify OTP"}
            </button>
          </>
        )}
        <Field>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.password}
            className="disabled:opacity-50 disabled:cursor-not-allowed "
          >
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-3 w-[80%] sm:w-[70%] lg:w-[80%] p-3 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-base shadow-sm cursor-pointer hover:bg-gray-200"
          >
            <Image
              src="/assets/google.png"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign In
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
