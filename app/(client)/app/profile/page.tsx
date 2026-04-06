"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import toast from "react-hot-toast";
import { ChevronDownIcon, User, Mail, Calendar, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  username: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  gender: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
});

type FormDataType = z.infer<typeof formSchema>;

const initialFormState: FormDataType = {
  username: "",
  email: "",
  gender: "",
  dob: "",
};

export default function Profile() {
  const { data: session } = useSession();
  const userId = session?.user?._id;

  const [formData, setFormData] = useState<FormDataType>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [openDatePicker, setOpenDatePicker] = useState(false);

  const formatDate = (date: Date) => date.toISOString().split("T")[0]; // YYYY-MM-DD

  /* -------------------- Fetch Profile -------------------- */

  const fetchUser = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await fetch(`/api/profile/get-profile/${userId}`);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      setFormData({
        username: result?.data?.username ?? "",
        email: result?.data?.email ?? "",
        gender: result?.data?.gender ?? "",
        dob: result?.data?.dob ?? "",
      });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setInitialLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* -------------------- Handlers -------------------- */

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) return;

    const validation = formSchema.safeParse(formData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/profile/update-profile/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      await fetchUser();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        {initialLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Avatar and Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 shadow-lg">
                    {formData.username
                      ? formData.username.slice(0, 2).toUpperCase()
                      : "U"}
                  </div>
                  <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-400 border-4 border-white rounded-full" />
                </div>
                <div className="text-center text-white">
                  <h2 className="text-2xl font-bold">{formData.username || "User"}</h2>
                  <p className="text-indigo-100 text-sm">Update your details below</p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="text-indigo-600 h-5 w-5" />
                  <FieldLabel className="text-gray-700 font-semibold">Full Name</FieldLabel>
                </div>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter your full name"
                  className="h-12 text-base"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="text-indigo-600 h-5 w-5" />
                  <FieldLabel className="text-gray-700 font-semibold">Email Address</FieldLabel>
                </div>
                <Input
                  name="email"
                  value={formData.email}
                  disabled
                  className="h-12 text-base bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Gender and DOB Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-indigo-600 h-5 w-5" />
                    <Label className="text-gray-700 font-semibold">Date of Birth</Label>
                  </div>
                  <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-between text-base"
                      >
                        {formData.dob ? new Date(formData.dob).toLocaleDateString() : "Select date"}
                        <ChevronDownIcon className="h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <CalendarComponent
                        mode="single"
                        selected={formData.dob ? new Date(formData.dob) : undefined}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (!date) return;
                          setFormData((prev) => ({
                            ...prev,
                            dob: formatDate(date),
                          }));
                          setOpenDatePicker(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="text-indigo-600 h-5 w-5" />
                    <FieldLabel className="text-gray-700 font-semibold">Gender</FieldLabel>
                  </div>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: value,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base"
                >
                  {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base"
                  onClick={() => fetchUser()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="e.g. Zaryab"
            />
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input name="email" value={formData.email} disabled />
          </Field>

          {/* DOB + Gender */}
          <div className="flex items-center justify-center gap-10">
            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <Label>Date of Birth</Label>
              <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {formData.dob || "Select date"}
                    <ChevronDownIcon className="h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={formData.dob ? new Date(formData.dob) : undefined}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (!date) return;
                      setFormData((prev) => ({
                        ...prev,
                        dob: formatDate(date),
                      }));
                      setOpenDatePicker(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <Field>
              <FieldLabel>Gender</FieldLabel>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
