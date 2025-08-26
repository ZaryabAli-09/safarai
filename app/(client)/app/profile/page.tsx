"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().trim().min(3, "Name must be atleast 3 characters"),
  email: z.string().email("Invalid email address"),
  gender: z.string(),
});
const passwordSchema = z
  .string()
  .trim()
  .min(6, "Password must be atleast 6 characters");

export default function Profile() {
  const { data: session } = useSession();

  const userid = session?.user?._id;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "******",
    gender: null,
  });

  const [loading, setLoading] = useState(false);

  async function fetchUser() {
    try {
      const res = await fetch(`/api/profile/get-profile/${userid}`);

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        username: result?.data?.username,
        email: result?.data?.email,
        gender: result?.data?.gender,
      }));
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  useEffect(() => {
    if (userid) fetchUser();
  }, [session?.user]);

  async function handleInputChanges(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function onSaveChangesButton() {
    try {
      setLoading(true);
      const validation = formSchema.safeParse(formData);

      if (!validation.success) {
        toast.error(validation.error.issues[0].message);
        return;
      }

      const res = await fetch(`/api/profile/update-profile/${userid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);
      setLoading(false);
      fetchUser();
    } catch (error) {
      toast.error((error as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen ">
      <h2 className="font-bold text-grayed py-2">Profile</h2>
      <div className=" bg-white shadow-md border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-4 max-w-xl  py-10 md:py-10 mx-auto md:mt-10 ">
        <h2 className="text-center font-semibold text-grayed">
          Hi, {formData?.username}
        </h2>
        <div className="h-[40px] w-[40px] md:w-[80px]  md:h-[80px]  bg-grayed rounded-full text-white flex items-center justify-center">
          {formData?.username.slice(0, 2).toUpperCase()}
        </div>

        <input
          className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
          type="text"
          name="username"
          disabled={loading}
          value={formData.username}
          onChange={handleInputChanges}
        />
        <input
          className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
          type="email"
          name="email"
          disabled={true}
          value={formData.email}
          onChange={handleInputChanges}
        />
        <input
          className="w-[80%] sm:w-[70%] lg:w-[80%] p-4  border border-gray-300 rounded-md  focus:outline-submit disabled:opacity-50 disabled:cursor-not-allowed"
          type="text"
          name="password"
          disabled={true}
          value={formData.password}
          onChange={handleInputChanges}
        />
        <div className="flex flex-col w-[80%] sm:w-[70%] lg:w-[80%]">
          <label className="text-st">Gender</label>

          <select
            onChange={handleInputChanges}
            id="gender"
            name="gender"
            value={formData.gender || "Select Gender"}
            className=" p-4  border border-gray-300 rounded-md overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed focus:outline-0"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button
          disabled={loading}
          onClick={onSaveChangesButton}
          className="w-[80%] sm:w-[70%] lg:w-[80%]  p-4  border border-gray-300 rounded-md bg-submit text-white text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? "Loading..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
