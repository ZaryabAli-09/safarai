"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { DatePicker } from "@/app/custom components/DatePicker/DatePicker";
import {
  CalendarDays,
  MapPin,
  Wallet,
  Settings2,
  Calendar,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function NewTrip() {
  const [page, setPage] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    destinations: [] as string[],
    startDate: "",
    endDate: "",
    budget: 10000,
    duration: 0,
    tripType: "",
    transportation: "",
    accommodation: "",
    tripPace: "",
    specialOccasion: "",
    interests: [] as string[],
    diningPreferences: [] as string[],
    dietaryRestrictions: [] as string[],
  });

  // Color theme constants
  const COLOR_THEME = {
    primary: {
      from: "from-indigo-500",
      to: "to-pink-500",
      light: "from-indigo-50 to-pink-50",
      border: "border-indigo-200",
      text: "text-indigo-600",
      bg: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
    },
    secondary: {
      from: "from-emerald-500",
      to: "to-cyan-500",
      light: "from-emerald-50 to-cyan-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
      bg: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
    },
  };

  // Persist progress in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tripFormData");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tripFormData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: string, value: string) => {
    setFormData((prev) => {
      const arr = prev[field] as string[];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  // Calculate duration and validate
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 7) {
        toast.error("Duration must not exceed 7 days!");
        handleChange("endDate", "");
        handleChange("duration", 0);
      } else if (diffDays > 0) {
        handleChange("duration", diffDays);
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleNext = () => {
    if (page === 0 && !formData.name)
      return toast.error("Please enter a trip name");
    if (page === 1 && formData.destinations.length === 0)
      return toast.error("Select at least one destination");
    if (page === 2 && formData.budget < 10000)
      return toast.error("Budget must be at least 10,000 PKR");
    if (page === 3 && (!formData.startDate || !formData.endDate))
      return toast.error("Please select start and end dates");

    setPage((p) => p + 1);
  };

  const handleBack = () => {
    if (page === 0) return toast.error("Already on first step");
    setPage((p) => p - 1);
  };

  const handleSubmit = async () => {
    console.log("Final Trip Data:", formData);
    toast.success("Generating AI Trip Plan...");
  };

  // Option lists
  const destinationsList = [
    "Hunza",
    "Swat",
    "Kumrat",
    "Skardu",
    "Naran",
    "Kaghan",
  ];
  const tripTypes = [
    "Solo Adventure",
    "Family Outing",
    "Group Trip",
    "Romantic Gateway",
  ];
  const transportOptions = ["Public", "We'll arrange on own"];
  const accommodations = [
    "Hotel",
    "Guesthouse",
    "Camping",
    "Budget Hotel",
    "Luxury Resort",
  ];
  const tripPaces = ["Relaxed", "Moderate", "Busy"];
  const occasions = ["Honeymoon", "Birthday", "Anniversary"];
  const interestOptions = [
    "Nature",
    "Hiking",
    "Photography",
    "Culture",
    "Food",
    "Shopping",
  ];
  const diningOptions = ["Local Cuisine", "Fine Dining", "Street Food"];

  const steps = [
    {
      title: "Name Your Trip",
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div
          className={`bg-gradient-to-r ${COLOR_THEME.primary.light} p-4 sm:p-6 rounded-2xl border ${COLOR_THEME.primary.border} shadow-sm`}
        >
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. 7 Days in Hunza"
            className="text-base sm:text-lg py-4 sm:py-5 border-indigo-300 focus:ring-2 focus:ring-indigo-400 rounded-xl"
          />
        </div>
      ),
    },
    {
      title: "Select Destinations",
      icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div
          className={`bg-gradient-to-r ${COLOR_THEME.secondary.light} p-4 sm:p-6 rounded-2xl border ${COLOR_THEME.secondary.border}`}
        >
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            {destinationsList.map((place) => (
              <Button
                key={place}
                variant={
                  formData.destinations.includes(place) ? "default" : "outline"
                }
                className={`transition-all flex-1 min-w-[120px] sm:min-w-0 text-sm sm:text-base ${
                  formData.destinations.includes(place)
                    ? `bg-gradient-to-r ${COLOR_THEME.secondary.from} ${COLOR_THEME.secondary.to} hover:opacity-90 text-white shadow-md`
                    : `border-${
                        COLOR_THEME.secondary.border.split("-")[1]
                      } hover:bg-${
                        COLOR_THEME.secondary.border.split("-")[1]
                      } text-${COLOR_THEME.secondary.text}`
                } rounded-xl`}
                onClick={() => toggleArrayValue("destinations", place)}
              >
                {place}
              </Button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Budget Range",
      icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 rounded-2xl border border-amber-200">
          <Slider
            value={[formData.budget]}
            min={10000}
            max={200000}
            step={5000}
            className="w-full mt-4"
            onValueChange={(val) => handleChange("budget", val[0])}
          />
          <div className="mt-4 text-center text-amber-700 font-semibold text-lg sm:text-xl bg-amber-100 rounded-xl py-3 border border-amber-200">
            {formData.budget.toLocaleString()} PKR
          </div>
        </div>
      ),
    },
    {
      title: "Trip Dates",
      icon: <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 sm:p-6 rounded-2xl border border-purple-200 space-y-4 sm:space-y-5">
          <DatePicker
            label="Start Date"
            field="startDate"
            formData={formData}
            handleChange={handleChange}
          />
          <DatePicker
            label="End Date"
            field="endDate"
            formData={formData}
            handleChange={handleChange}
          />
          {formData.duration > 0 && (
            <div className="text-center text-purple-700 font-medium text-base sm:text-lg mt-4 p-3 bg-purple-100 rounded-xl border border-purple-200">
              Trip Duration:{" "}
              <span className="font-semibold">
                {formData.duration} {formData.duration === 1 ? "day" : "days"}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trip Details",
      icon: <Settings2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-2xl border border-blue-200 space-y-4 sm:space-y-5 flex flex-wrap gap-3">
          <Select
            value={formData.tripType}
            onValueChange={(val) => handleChange("tripType", val)}
          >
            <SelectTrigger className="bg-white border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-xl py-6 text-base">
              <SelectValue placeholder="Select trip type" />
            </SelectTrigger>
            <SelectContent>
              {tripTypes.map((t) => (
                <SelectItem key={t} value={t} className="text-base">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.transportation}
            onValueChange={(val) => handleChange("transportation", val)}
          >
            <SelectTrigger className="bg-white border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-xl py-6 text-base">
              <SelectValue placeholder="Transportation" />
            </SelectTrigger>
            <SelectContent>
              {transportOptions.map((t) => (
                <SelectItem key={t} value={t} className="text-base">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.accommodation}
            onValueChange={(val) => handleChange("accommodation", val)}
          >
            <SelectTrigger className="bg-white border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-xl py-6 text-base">
              <SelectValue placeholder="Accommodation" />
            </SelectTrigger>
            <SelectContent>
              {accommodations.map((t) => (
                <SelectItem key={t} value={t} className="text-base">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.tripPace}
            onValueChange={(val) => handleChange("tripPace", val)}
          >
            <SelectTrigger className="bg-white border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-xl py-6 text-base">
              <SelectValue placeholder="Trip pace" />
            </SelectTrigger>
            <SelectContent>
              {tripPaces.map((p) => (
                <SelectItem key={p} value={p} className="text-base">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.specialOccasion}
            onValueChange={(val) => handleChange("specialOccasion", val)}
          >
            <SelectTrigger className="bg-white border-blue-300 focus:ring-2 focus:ring-blue-400 rounded-xl py-6 text-base">
              <SelectValue placeholder="Special occasion" />
            </SelectTrigger>
            <SelectContent>
              {occasions.map((o) => (
                <SelectItem key={o} value={o} className="text-base">
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      title: "Interests & Preferences",
      icon: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
      content: (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 sm:p-6 rounded-2xl border border-pink-200 space-y-5 sm:space-y-6">
          <div>
            <p className="font-semibold text-pink-700 mb-3 text-base sm:text-lg">
              Interests
            </p>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {interestOptions.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={
                    formData.interests.includes(i) ? "default" : "outline"
                  }
                  className={`transition-all flex-1 min-w-[100px] text-sm sm:text-base ${
                    formData.interests.includes(i)
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white shadow-md"
                      : "border-pink-300 hover:bg-pink-100 text-pink-600"
                  } rounded-xl`}
                  onClick={() => toggleArrayValue("interests", i)}
                >
                  {i}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-pink-700 mb-3 text-base sm:text-lg">
              Dining Preferences
            </p>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
              {diningOptions.map((i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={
                    formData.diningPreferences.includes(i)
                      ? "default"
                      : "outline"
                  }
                  className={`transition-all flex-1 min-w-[120px] text-sm sm:text-base ${
                    formData.diningPreferences.includes(i)
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90 text-white shadow-md"
                      : "border-rose-300 hover:bg-rose-100 text-rose-600"
                  } rounded-xl`}
                  onClick={() => toggleArrayValue("diningPreferences", i)}
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
    <div className=" flex items-center justify-center px-3 sm:px-4 py-6 ">
      <div className="w-full max-w-2xl rounded-3xl shadow-xl p-4 sm:p-8 md:p-10 relative overflow-hidden border border-gray-100 bg-gradient-to-b from-white to-gray-50/80">
        {/* Progress Header */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
          <div className="w-full relative">
            <Progress
              value={((page + 1) / steps.length) * 100}
              className="h-2 sm:h-3 rounded-full bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-pink-500"
            />
          </div>
        </div>

        {/* Title with Icon */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <motion.div
            key={page + "-icon"}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4 }}
            className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md"
          >
            {steps[page].icon}
          </motion.div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 tracking-tight text-center">
            {steps[page].title}
          </h2>
        </div>

        {/* Animated Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="space-y-4 sm:space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-inner border border-gray-100/80"
          >
            {steps[page].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 sm:mt-8 gap-3">
          <Button
            onClick={handleBack}
            variant="outline"
            className="rounded-xl border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-1 sm:gap-2 py-5 sm:py-6 text-sm sm:text-base flex-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {page < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-90 text-white shadow-md transition-all flex items-center gap-1 sm:gap-2 py-5 sm:py-6 text-sm sm:text-base flex-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-white shadow-md transition-all py-5 sm:py-6 text-sm sm:text-base flex-1"
            >
              Generate Plan
            </Button>
          )}
        </div>
        {/* Step Indicator */}
        <div className="flex items-center justify-center mt-4 sm:mt-6 space-x-1 sm:space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-300 ${
                i === page
                  ? "bg-indigo-500 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            ></div>
          ))}
        </div>
        {/* Step Info */}
        <motion.p
          key={page + "-step"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 tracking-wide text-center"
        >
          Step {page + 1} of {steps.length}
        </motion.p>
      </div>
    </div>
  );
}
