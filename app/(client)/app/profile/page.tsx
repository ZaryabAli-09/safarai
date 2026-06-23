"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="container mx-auto py-10 px-4 max-w-2xl border-none bg-transparent shadow-none">
      {initialLoading ? (
        <Card className="border-none bg-transparent shadow-none">
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      ) : (
        <Card className="border bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your personal information and account settings.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full border-2 border-muted flex items-center justify-center text-xl font-semibold bg-muted">
                  {formData.username
                    ? formData.username.slice(0, 2).toUpperCase()
                    : "U"}
                </div>
                <div>
                  <p className="font-medium">{formData.username || "User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.email}
                  </p>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="username">Full Name</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              {/* Gender and DOB Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover
                    open={openDatePicker}
                    onOpenChange={setOpenDatePicker}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {formData.dob
                          ? new Date(formData.dob).toLocaleDateString()
                          : "Select date"}
                        <Calendar className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          formData.dob ? new Date(formData.dob) : undefined
                        }
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
                  <Label>Gender</Label>
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
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fetchUser()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
