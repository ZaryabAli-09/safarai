"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Slider } from "@/components/ui/slider";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wallet,
  Heart,
  Zap,
  Check,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TRIP_TYPES = [
  "adventure",
  "cultural",
  "relaxation",
  "family",
  "honeymoon",
  "solo",
  "trekking",
  "wildlife",
];

const TRANSPORTATION_OPTIONS = ["car", "buses", "flights", "mix"];
const ACCOMMODATION_OPTIONS = ["luxury", "mid-range", "budget", "backpacker"];
const TRIP_PACE = ["relaxed", "moderate", "fast"];
const INTERESTS = [
  "hiking",
  "photography",
  "food",
  "history",
  "culture",
  "nature",
  "adventure",
  "relaxation",
  "shopping",
  "nightlife",
];

export default function NewTrip() {
  const router = useRouter();
  const { data: session } = useSession();
  const userid = session?.user?._id;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    destinations: [] as string[],
    startDate: "",
    endDate: "",
    budget: 50000,
    duration: 0,
    tripType: "",
    transportation: "",
    accommodation: "",
    tripPace: "",
    specialOccasion: "",
    interests: [] as string[],
    diningPreferences: [] as string[],
  });

  const [destinationInput, setDestinationInput] = useState("");

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      setFormData((prev) => ({ ...prev, duration: Math.max(1, days) }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayValue = (field: string, value: string) => {
    setFormData((prev: any) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const addDestination = () => {
    if (destinationInput.trim() && formData.destinations.length < 10) {
      setFormData((prev) => ({
        ...prev,
        destinations: [...prev.destinations, destinationInput.trim()],
      }));
      setDestinationInput("");
    }
  };

  const removeDestination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index),
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.name) {
          toast.error("Trip name is required");
          return false;
        }
        if (formData.destinations.length === 0) {
          toast.error("Add at least one destination");
          return false;
        }
        return true;
      case 2:
        if (!formData.startDate || !formData.endDate) {
          toast.error("Select start and end dates");
          return false;
        }
        return true;
      case 3:
        if (!formData.tripType || !formData.transportation) {
          toast.error("Select trip type and transportation");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!userid) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trip/generate/${userid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to generate trip");
        return;
      }

      toast.success("Trip created successfully!");
      router.push("/app/trips");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Basics", icon: MapPin },
    { number: 2, title: "Dates", icon: Calendar },
    { number: 3, title: "Preferences", icon: Heart },
    { number: 4, title: "Review", icon: Check },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Plan Your Trip
          </h1>
          <p className="text-gray-600">
            Create an amazing itinerary with AI assistance
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.number === step;
              const isCompleted = s.number < step;

              return (
                <div
                  key={s.number}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-lg scale-125"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700">{s.title}</p>

                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-[calc(12.5%+24px)] top-6 w-[calc(25% - 48px)] h-1 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Basics */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-lg font-semibold mb-2 block">
                    Trip Name
                  </Label>
                  <Input
                    placeholder="e.g., Northern Pakistan Adventure"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-2 block">
                    Destinations ({formData.destinations.length}/10)
                  </Label>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter destination"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addDestination()}
                      className="h-12 text-base flex-1"
                    />
                    <Button
                      onClick={addDestination}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {formData.destinations.map((dest, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          {idx + 1}. {dest}
                        </span>
                        <button
                          onClick={() => removeDestination(idx)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-lg font-semibold mb-2 block">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-lg font-semibold mb-2 block">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="h-12 text-base"
                    />
                  </div>
                </div>

                {formData.duration > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Trip Duration</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formData.duration} days
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-lg font-semibold mb-2 block flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Budget (PKR)
                  </Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", parseInt(e.target.value))
                    }
                    className="h-12 text-base mb-4"
                  />
                  <Slider
                    value={[formData.budget]}
                    onValueChange={(val) => handleInputChange("budget", val[0])}
                    min={1000}
                    max={500000}
                    step={5000}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    ₨{formData.budget?.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Trip Type
                  </Label>
                  <Select
                    value={formData.tripType}
                    onValueChange={(val) => handleInputChange("tripType", val)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIP_TYPES.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="capitalize"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Transportation
                  </Label>
                  <Select
                    value={formData.transportation}
                    onValueChange={(val) =>
                      handleInputChange("transportation", val)
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORTATION_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="capitalize"
                        >
                          {opt.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Accommodation
                  </Label>
                  <Select
                    value={formData.accommodation}
                    onValueChange={(val) =>
                      handleInputChange("accommodation", val)
                    }
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOMMODATION_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="capitalize"
                        >
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block">
                    Trip Pace
                  </Label>
                  <Select
                    value={formData.tripPace}
                    onValueChange={(val) => handleInputChange("tripPace", val)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select pace" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIP_PACE.map((opt) => (
                        <SelectItem
                          key={opt}
                          value={opt}
                          className="capitalize"
                        >
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-3 block flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Interests
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        onClick={() => toggleArrayValue("interests", interest)}
                        className={`p-3 rounded-lg font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-indigo-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">
                      Trip Name:
                    </span>
                    <span className="font-bold text-lg text-indigo-600">
                      {formData.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="font-bold text-indigo-600">
                      {formData.duration} days
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Budget:</span>
                    <span className="font-bold text-green-600">
                      ₨{formData.budget?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">
                      Destinations:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.destinations.map((dest) => (
                        <span
                          key={dest}
                          className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">
                      Interests:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-center">
                  Ready to generate your personalized itinerary? Click "Generate
                  Trip" and our AI will create an amazing plan for you!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex-1 h-12 text-base"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white text-base"
            >
              {loading ? "Generating..." : "Generate Trip"}
              <Zap className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
