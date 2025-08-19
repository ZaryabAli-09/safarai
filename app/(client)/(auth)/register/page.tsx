"use client";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Image from "next/image";

import SignInBanner from "@/public/assets/signin-banner.png"; // Assuming you have a logo image
import Logo from "@/public/assets/logo.png";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.string().trim().min(6, "Otp must be 6 numbers");

export default function Register() {
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
          <Image
            className="w-70  h-30 mr-8
          "
            src={Logo}
            alt="Logo"
          />{" "}
        </div>
        <h3 className="text-3xl text-dark  mb-3">Create Account</h3>
        <p className=" text-submit ">Welcome! Please enter your details.</p>

        <form className=" flex flex-col w-full items-center gap-4 mt-4">
          <input
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            value={formData.username}
            className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
            type="text"
            placeholder="Please enter your name"
            disabled={loading || confirmRegistration}
          />
          <input
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
            className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
            type="email"
            placeholder="Please enter your email"
            disabled={loading || confirmRegistration}
          />
          <input
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-[80%] sm:w-[70%] lg:w-[80%] p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
            type="password"
            placeholder="Please enter your Password"
            disabled={loading || confirmRegistration}
          />

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
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-3 w-[80%] sm:w-[70%] lg:w-[80%] p-3 border border-gray-300 rounded-md bg-white text-gray-700 font-medium text-base shadow-sm cursor-pointer   hover:bg-gray-200 "
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
          Already have an account?{" "}
          <Link href="/sign-in" className="text-submit hover:underline ">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
