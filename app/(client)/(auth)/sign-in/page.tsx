"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Image from "next/image";
import SignInBanner from "@/public/assets/signin-banner.png";
import { useRouter } from "next/navigation";
import Logo from "@/public/assets/logo.png";

// zod schemas for sign in form
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Signin() {
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
    <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full h-screen">
      {/* left  */}
      <div className="w-[50%] h-full hidden lg:block">
        <Image
          className="w-full h-full object-cover"
          src={SignInBanner}
          alt="Sign In Banner"
        />
      </div>

      {/* right  */}
      <div className="w-full h-full flex flex-col justify-center items-center   lg:w-[50%]    ">
        <div className="flex items-center">
          <Image className="w-70  h-30 mr-8" src={Logo} alt="Logo" />{" "}
        </div>
        <h3 className="text-3xl text-dark mb-3">Sign in to your account</h3>
        <p className=" text-submit ">
          Welcome back! Please enter your details.
        </p>

        <form className=" flex flex-col w-full items-center gap-4 mt-4">
          <input
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
            className="w-[80%] sm:w-[70%] lg:w-[80%] p-4  border border-gray-300 rounded-md  focus:outline-submit"
            type="email"
            placeholder="Please enter your email"
          />
          <input
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-[80%] sm:w-[70%] lg:w-[80%] p-4  border border-gray-300 rounded-md  focus:outline-submit"
            type="password"
            placeholder="Please enter your Password"
          />
          <p className="w-[80%] sm:w-[70%] lg:w-[80%] text-right text-sm hover:underline">
            <Link href="/forgot-password" className="text-submit">
              forgot password?{" "}
            </Link>
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.password}
            className="w-[80%] sm:w-[70%] lg:w-[80%] p-4  border border-gray-300 rounded-md bg-submit text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
          {/* Google Sign-in Button */}
          <button
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
            Continue with Google
          </button>
        </form>
        <p className="mt-4 ">
          Don't have an account?{" "}
          <Link href="/register" className="text-submit  hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
