"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
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
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { ChevronDownIcon } from "lucide-react";

const formSchema = z.object({
  username: z.string().trim().min(3, "Name must be atleast 3 characters"),
  email: z.string().email("Invalid email address"),
  gender: z.string(),
  dob: z.string(),
});

export default function Profile() {
  const { data: session } = useSession();

  const userid = session?.user?._id;

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    gender: "",
    dob: "",
  });
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const formatDate = (date: Date) => date.toISOString().split("T")[0]; // YYYY-MM-DD

  const [loading, setLoading] = useState(false);

  console.log(formData);

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
        dob: result?.data?.dob,
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
      if (formData.dob === undefined) {
        setFormData((prev) => ({
          ...prev,
          dob: "",
        }));
      }
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
    <div className="w-full  max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
      <form>
        <div className="flex flex-col items-center space-y-3">
          <div className="flex flex-col items-center gap-3 text-center mb-4">
            <div className="relative">
              <div className="h-[80px] w-[80px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-semibold shadow-md">
                {formData?.username
                  ? formData.username.slice(0, 2).toUpperCase()
                  : "U"}
              </div>
              <div className="absolute bottom-0 right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {formData?.username || "User"}
              </h2>
              <p className="text-sm text-gray-500">Edit your profile details</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 ">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input
              type="text"
              name="username"
              disabled={loading}
              value={formData.username}
              onChange={handleInputChanges}
              placeholder="e.g. Zaryab"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              name="email"
              disabled
              value={formData.email}
              placeholder="zaryab@me.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="text"
              name="password"
              disabled
              placeholder="******"
              required
            />
          </Field>

          <div className="flex items-center justify-center gap-10">
            {/* Date of Birth */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="date"
                className="text-sm font-medium text-gray-700"
              >
                Date of Birth
              </Label>
              <Popover open={openDatePicker} onOpenChange={setOpenDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal border-gray-300 text-gray-700"
                  >
                    {formData.dob ? formData.dob : "Select date"}
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
                      if (date) {
                        const formatted = formatDate(date);
                        setFormData((prev) => ({ ...prev, dob: formatted }));
                        setOpenDatePicker(false);
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender Select */}
            <Field>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Select
                value={formData.gender || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger className="border-gray-300 text-gray-700">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="pt-2">
            <Button
              disabled={loading}
              type="submit"
              onClick={onSaveChangesButton}
              className="w-full"
            >
              {loading ? "Loading..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
