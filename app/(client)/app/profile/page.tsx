"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import toast from "react-hot-toast";
import { ChevronDownIcon } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    <div className="w-full max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
      <form onSubmit={handleSubmit}>
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 text-center mb-4">
          <div className="relative">
            <div className="h-[80px] w-[80px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold shadow-md">
              {formData.username
                ? formData.username.slice(0, 2).toUpperCase()
                : "U"}
            </div>
            <div className="absolute bottom-0 right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.username || "User"}
            </h2>
            <p className="text-sm text-gray-500">Edit your profile details</p>
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
