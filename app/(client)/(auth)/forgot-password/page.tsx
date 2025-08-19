"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import Logo from "@/public/assets/logo.png";

const emailSchema = z.string().email("Invalid email address");

export default function ForgotPassword() {
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
    <div className="w-full flex flex-col items-center justify-center  gap-2 mt-20">
      <div className="flex items-center">
        <Image className=" w-70 h-30 mr-8" src={Logo} alt="Logo" />{" "}
      </div>
      <h3 className="text-3xl text-dark ">Reset Password</h3>
      <p className=" text-submit mb-6">
        Type your registered email to reset your password
      </p>

      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        className="w-[90%] sm:w-[70%] lg:w-[45%]  p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
        type="email"
        placeholder="Please enter your email"
      />
      <button
        onClick={handleSubmit}
        disabled={!email || loading}
        className="w-[90%] sm:w-[70%] lg:w-[45%]  p-4  border border-gray-300 rounded-md bg-submit text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Loading..." : " Reset Password"}
      </button>
      <p className="text-dark mt-4">
        Remembered your password?{" "}
        <Link
          className="text-submit cursor-pointer hover:underline"
          href={"/sign-in"}
        >
          Login
        </Link>
      </p>
    </div>
  );
}
