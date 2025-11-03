"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

export default function NewTrip() {
  const [page, setPage] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    destinations: [] as string[],
    startDate: "",
    endDate: "",
    budget: "",
    tripType: "",
    transportation: "",
    accommodation: "",
    tripPace: "",
    specialAccessibility: "",
    specialOccasion: "",
    interests: [] as string[],
    diningPreferences: [] as string[],
    activityPreferences: [] as string[],
    dietaryRestrictions: [] as string[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: string, value: string) => {
    setFormData((prev) => {
      // get previous array of field like in interest array values
      const arr = prev[field] as string[];

      //   if value already include and person click that value will be popout/remove just like select unselect
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };

        // if value is not present we spread whole previous fields as same and the update the specific field array we spread the old array and add new value
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const handleNext = () => {
    // Simple validation for first steps
    if (page === 0 && !formData.name)
      return toast.error("Please enter a trip name");
    if (page === 1 && formData.destinations.length === 0)
      return toast.error("Please select at least one destination");
    if (page === 2 && (!formData.startDate || !formData.endDate))
      return toast.error("Please select start and end dates");
    setPage((page) => page + 1);
  };

  const handleBack = () => {
    if (page === 0) return toast.error("Already on first step");
    setPage((page) => page - 1);
  };

  const handleSubmit = async () => {
    console.log("Final Trip Data:", formData);
    toast.success("Generating AI Trip Plan...");
    // Example API call:
    // await fetch("/api/trips/generate", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData),
    // });
  };

  const destinationsList = [
    "Hunza",
    "Swat",
    "Kumrat",
    "Skardu",
    "Naran",
    "Kaghan",
  ];
  const tripTypes = ["Adventure", "Family", "Romantic", "Solo", "Relaxed"];
  const transportOptions = ["Car", "Bus", "Flight"];
  const accommodations = ["Hotel", "Guesthouse", "Camping", "Resort"];
  const tripPaces = ["Relaxed", "Moderate", "Busy"];
  const occasions = ["Honeymoon", "Birthday", "Friends Trip", "Business"];
  const interestOptions = [
    "Nature",
    "Hiking",
    "Photography",
    "Culture",
    "Food",
  ];
  const diningOptions = ["Local Cuisine", "Fine Dining", "Street Food"];
  const activityOptions = ["Sightseeing", "Trekking", "Boating", "Shopping"];
  const dietaryOptions = ["Vegan", "Vegetarian", "Halal", "Gluten-Free"];

  const steps = [
    {
      title: "Name Your Trip",
      content: (
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="e.g. 7 Days in Hunza & Swat"
        />
      ),
    },
    {
      title: "Select Destination(s)",
      content: (
        <div className="flex flex-wrap gap-3">
          {destinationsList.map((place) => (
            <Button
              key={place}
              variant={
                formData.destinations.includes(place) ? "default" : "outline"
              }
              onClick={() => toggleArrayValue("destinations", place)}
            >
              {place}
            </Button>
          ))}
        </div>
      ),
    },
    {
      title: "Whats your budget",
      content: (
        <Input
          value={formData.budget}
          onChange={(e) => handleChange("budget", e.target.value)}
          placeholder="e.g. 1000 Rs"
        />
      ),
    },
    {
      title: "Select Dates",
      content: (
        <div className="flex flex-col gap-4">
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
          />
        </div>
      ),
    },
    {
      title: "Trip Details",
      content: (
        <div className="space-y-4">
          <Select onValueChange={(val) => handleChange("tripType", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select trip type" />
            </SelectTrigger>
            <SelectContent>
              {tripTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => handleChange("transportation", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Transportation" />
            </SelectTrigger>
            <SelectContent>
              {transportOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => handleChange("accommodation", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Accommodation" />
            </SelectTrigger>
            <SelectContent>
              {accommodations.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => handleChange("tripPace", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Trip pace" />
            </SelectTrigger>
            <SelectContent>
              {tripPaces.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      title: "Special Preferences",
      content: (
        <div className="space-y-4">
          <Select onValueChange={(val) => handleChange("specialOccasion", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Special occasion (optional)" />
            </SelectTrigger>
            <SelectContent>
              {occasions.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Accessibility needs (optional)"
            value={formData.specialAccessibility}
            onChange={(e) =>
              handleChange("specialAccessibility", e.target.value)
            }
          />
        </div>
      ),
    },
    {
      title: "Interests & Preferences",
      content: (
        <div className="space-y-3">
          <div>
            <p className="font-medium mb-1">Interests</p>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={
                    formData.interests.includes(i) ? "default" : "outline"
                  }
                  onClick={() => toggleArrayValue("interests", i)}
                >
                  {i}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-1">Dining Preferences</p>
            <div className="flex flex-wrap gap-2">
              {diningOptions.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={
                    formData.diningPreferences.includes(i)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => toggleArrayValue("diningPreferences", i)}
                >
                  {i}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-1">Activities</p>
            <div className="flex flex-wrap gap-2">
              {activityOptions.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={
                    formData.activityPreferences.includes(i)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => toggleArrayValue("activityPreferences", i)}
                >
                  {i}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium mb-1">Dietary Restrictions</p>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={
                    formData.dietaryRestrictions.includes(i)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => toggleArrayValue("dietaryRestrictions", i)}
                >
                  {i}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {steps[page].title}
        </h2>
        <div className="space-y-4">{steps[page].content}</div>

        <div className="flex justify-between mt-10">
          <Button onClick={handleBack} variant="outline">
            Back
          </Button>
          {page < steps.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Generate Plan</Button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 mt-4">
        Step {page + 1} of {steps.length}
      </p>
    </div>
  );
}
