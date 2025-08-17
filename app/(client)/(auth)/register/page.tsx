"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Image from "next/image";

import SignInBanner from "@/public/assets/signin-banner.png"; // Assuming you have a logo image
import { set } from "mongoose";
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [confirmRegistration, setConfirmRegistration] = useState(false);

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);

  console.log("User ID:", userId);
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    console.log(userId, otp);
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
    } catch (error: any) {
      toast.error(error);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and Password are required");
      return;
    }

    const result = formSchema.safeParse(formData);

    if (!result.success) {
      toast.error(result.error.issues[0].message);
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
        <div className="flex items-center gap-1.5 mb-8">
          <div className="rounded-full h-15 w-15 bg-black"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold  ">SAFAR AI</h1>
        </div>
        <h3 className="text-3xl text-gray-700 mb-3">Create Account</h3>
        <p className=" text-blue-800 ">Welcome! Please enter your details.</p>

        <form className=" flex flex-col w-full items-center gap-4 mt-4">
          <input
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
            className="w-[90%] sm:w-[70%] lg:w-[90%]  p-4  border border-gray-300 rounded-md  focus:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            type="email"
            placeholder="Please enter your email"
            disabled={loading || confirmRegistration}
          />
          <input
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-[90%] sm:w-[70%] lg:w-[90%] p-4  border border-gray-300 rounded-md  focus:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            type="password"
            placeholder="Please enter your Password"
            disabled={loading || confirmRegistration}
          />

          {!confirmRegistration ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-[90%] sm:w-[70%] lg:w-[90%]  p-4  border border-gray-300 rounded-md bg-blue-500 text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Loading..." : "Create Account"}
            </button>
          ) : (
            <>
              <input
                onChange={
                  (e) => setOtp(e.target.value) // Assuming you have a state for OTP
                }
                className="w-[90%] sm:w-[70%] lg:w-[90%] p-4 bg-gray-100 animate-pulse border border-gray-300 rounded-md  focus:outline-blue-500"
                placeholder="Enter you OTP "
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-[90%] sm:w-[70%] lg:w-[90%]  p-4  border border-gray-300 rounded-md bg-blue-500 text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Loading..." : "Verify OTP"}
              </button>
            </>
          )}
        </form>
        <p className="mt-4 ">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-500 ">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
