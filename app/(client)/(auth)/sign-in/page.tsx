"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
// import { signIn } from "next-auth/react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Signin() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl: "/",
        redirect: false,
      });

      if (!result?.ok) {
        console.log(`result`, result);
        toast.error(result?.error || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success("Successfully logged in");
      setLoading(false);

      console.log("result", result);
    } catch (error: any) {
      toast.error(error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>

      <form className="flex flex-col">
        <label htmlFor="email">Email</label>
        <input
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          value={formData.email}
          className="border p-2 my-2"
          type="email"
          placeholder="Please enter your email"
        />
        <label htmlFor="email">Password</label>
        <input
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="border p-2 my-2"
          type="password"
          placeholder="Please enter your Password"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Loading..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4">
        Don't have an account?{" "}
        <Link href="/register" className="text-blue-500">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
