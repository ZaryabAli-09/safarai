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
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = formSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: "/app/trips",
        redirect: false,
      });

      if (!result?.ok) {
        toast.error(result?.error || "Something went wrong");
        setLoading(false);
        return;
      } else {
        toast.success("Successfully logged in");
        setLoading(false);
        router.push("/app/trips");
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  }
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Welcome back! Please enter your details.{" "}
          </p>
        </div>
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
            required
          />
        </Field>
        <Field>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.password}
            className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed "
          >
            {loading ? "Loading..." : "Sign In"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              signIn("google", {
                callbackUrl: `${window.location.origin}/app/trips`,
              })
            }
            className="flex items-center justify-center gap-3 w-[80%] sm:w-[70%] lg:w-[80%] p-3 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-base shadow-sm cursor-pointer hover:bg-gray-200"
          >
            <Image
              src="/assets/google.png"
              alt="Google"
              width={20}
              height={20}
            />
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
