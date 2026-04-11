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
  Plane,
  Home,
  Gauge,
  Sparkles,
  X,
  Plus,
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                Plan Your Trip
              </h1>
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-purple-300 text-lg">
              Create an amazing itinerary with AI assistance
            </p>
          </motion.div>
        </div>

        {/* Progress Indicator - Enhanced */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between relative">
            {/* Progress line background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-purple-900/30 z-0" />
            
            {/* Animated progress line */}
            <motion.div
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-0"
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />

            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = s.number === step;
              const isCompleted = s.number < step;

              return (
                <motion.div
                  key={s.number}
                  className="flex flex-col items-center flex-1 relative z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <motion.div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all shadow-lg ${
                      isActive
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-500/50"
                        : isCompleted
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                          : "bg-purple-900/40 text-purple-300 border-2 border-purple-700/50"
                    }`}
                    whileScale={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                  >
                    {isCompleted ? (
                      <Check className="h-7 w-7" />
                    ) : (
                      <Icon className="h-7 w-7" />
                    )}
                  </motion.div>
                  <p className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-purple-200"
                      : isCompleted
                        ? "text-emerald-300"
                        : "text-purple-400"
                  }`}>
                    {s.title}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Card - Enhanced */}
        <motion.div
          className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-purple-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basics */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20">
                  <Label className="text-lg font-bold text-purple-200 mb-3 block">
                    🏷️ Trip Name
                  </Label>
                  <Input
                    placeholder="e.g., Northern Pakistan Adventure"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-14 text-base bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                  />
                  <p className="text-sm text-purple-300 mt-2">Give your trip a memorable name</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20">
                  <Label className="text-lg font-bold text-purple-200 mb-4 block flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    Destinations ({formData.destinations.length}/10)
                  </Label>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter destination (e.g., Hunza, Swat)"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addDestination()}
                      className="h-12 text-base bg-slate-700/50 border-purple-500/30 text-white placeholder-purple-300/50 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl flex-1"
                    />
                    <motion.button
                      onClick={addDestination}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {formData.destinations.length === 0 ? (
                      <p className="text-purple-300 text-sm text-center py-4">No destinations added yet</p>
                    ) : (
                      formData.destinations.map((dest, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between bg-gradient-to-r from-purple-700/40 to-pink-700/20 p-4 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                            <span className="font-medium text-purple-100">
                              {dest}
                            </span>
                          </div>
                          <motion.button
                            onClick={() => removeDestination(idx)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 rounded-2xl p-6 border border-blue-500/20">
                    <Label className="text-lg font-bold text-blue-200 mb-3 block flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      className="h-12 text-base bg-slate-700/50 border-blue-500/30 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                    />
                  </div>
                  <div className="bg-gradient-to-br from-red-900/40 to-orange-900/20 rounded-2xl p-6 border border-red-500/20">
                    <Label className="text-lg font-bold text-red-200 mb-3 block flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                      className="h-12 text-base bg-slate-700/50 border-red-500/30 text-white focus:border-red-500 focus:ring-red-500/20 rounded-xl"
                    />
                  </div>
                </div>

                {formData.duration > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-emerald-900/40 to-green-900/20 border border-emerald-500/40 rounded-2xl p-6"
                  >
                    <p className="text-sm text-emerald-300 mb-2">Trip Duration</p>
                    <div className="flex items-center gap-3">
                      <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        {formData.duration}
                      </div>
                      <p className="text-emerald-300 text-xl font-semibold">days</p>
                    </div>
                  </motion.div>
                )}

                <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/20 rounded-2xl p-6 border border-yellow-500/20">
                  <Label className="text-lg font-bold text-yellow-200 mb-4 block flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Budget (PKR)
                  </Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", parseInt(e.target.value))
                    }
                    className="h-12 text-base bg-slate-700/50 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl mb-4"
                  />
                  <Slider
                    value={[formData.budget]}
                    onValueChange={(val) => handleInputChange("budget", val[0])}
                    min={1000}
                    max={500000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2 mt-4 text-yellow-300">
                    <span className="text-3xl font-bold">₨{formData.budget?.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20">
                  <Label className="text-lg font-bold text-purple-200 mb-4 block flex items-center gap-2">
                    ✈️ Trip Type
                  </Label>
                  <Select
                    value={formData.tripType}
                    onValueChange={(val) => handleInputChange("tripType", val)}
                  >
                    <SelectTrigger className="h-12 text-base bg-slate-700/50 border-purple-500/30 text-white focus:border-purple-500 focus:ring-purple-500/20 rounded-xl">
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/30">
                      {TRIP_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 rounded-2xl p-6 border border-blue-500/20">
                  <Label className="text-lg font-bold text-blue-200 mb-4 block flex items-center gap-2">
                    <Plane className="h-5 w-5" /> Transportation
                  </Label>
                  <Select
                    value={formData.transportation}
                    onValueChange={(val) =>
                      handleInputChange("transportation", val)
                    }
                  >
                    <SelectTrigger className="h-12 text-base bg-slate-700/50 border-blue-500/30 text-white focus:border-blue-500 focus:ring-blue-500/20 rounded-xl">
                      <SelectValue placeholder="Select transportation" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-blue-500/30">
                      {TRANSPORTATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/20 rounded-2xl p-6 border border-pink-500/20">
                  <Label className="text-lg font-bold text-pink-200 mb-4 block flex items-center gap-2">
                    <Home className="h-5 w-5" /> Accommodation
                  </Label>
                  <Select
                    value={formData.accommodation}
                    onValueChange={(val) =>
                      handleInputChange("accommodation", val)
                    }
                  >
                    <SelectTrigger className="h-12 text-base bg-slate-700/50 border-pink-500/30 text-white focus:border-pink-500 focus:ring-pink-500/20 rounded-xl">
                      <SelectValue placeholder="Select accommodation" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-pink-500/30">
                      {ACCOMMODATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-br from-violet-900/40 to-indigo-900/20 rounded-2xl p-6 border border-violet-500/20">
                  <Label className="text-lg font-bold text-violet-200 mb-4 block flex items-center gap-2">
                    <Gauge className="h-5 w-5" /> Trip Pace
                  </Label>
                  <Select
                    value={formData.tripPace}
                    onValueChange={(val) => handleInputChange("tripPace", val)}
                  >
                    <SelectTrigger className="h-12 text-base bg-slate-700/50 border-violet-500/30 text-white focus:border-violet-500 focus:ring-violet-500/20 rounded-xl">
                      <SelectValue placeholder="Select pace" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-violet-500/30">
                      {TRIP_PACE.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-gradient-to-br from-red-900/40 to-orange-900/20 rounded-2xl p-6 border border-red-500/20">
                  <Label className="text-lg font-bold text-red-200 mb-4 block flex items-center gap-2">
                    <Heart className="h-5 w-5" /> Interests
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INTERESTS.map((interest) => (
                      <motion.button
                        key={interest}
                        onClick={() => toggleArrayValue("interests", interest)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-3 rounded-xl font-semibold transition-all border-2 ${
                          formData.interests.includes(interest)
                            ? "bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-400"
                            : "bg-slate-700/40 text-red-300 border-red-500/20 hover:border-red-500/40"
                        }`}
                      >
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-purple-900/60 to-pink-900/40 border-2 border-purple-500/40 rounded-2xl p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20"
                    >
                      <p className="text-sm text-purple-300 mb-1">Trip Name</p>
                      <p className="text-2xl font-bold text-purple-100">
                        {formData.name || "Not set"}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/20"
                    >
                      <p className="text-sm text-emerald-300 mb-1">Duration</p>
                      <p className="text-2xl font-bold text-emerald-100">
                        {formData.duration} days
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-slate-800/50 rounded-xl p-4 border border-yellow-500/20"
                    >
                      <p className="text-sm text-yellow-300 mb-1">Budget</p>
                      <p className="text-2xl font-bold text-yellow-100">
                        ₨{formData.budget?.toLocaleString()}
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20"
                    >
                      <p className="text-sm text-blue-300 mb-1">Trip Type</p>
                      <p className="text-2xl font-bold text-blue-100 capitalize">
                        {formData.tripType || "Not set"}
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20"
                  >
                    <p className="text-sm text-cyan-300 mb-3">Destinations</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.destinations.map((dest) => (
                        <span
                          key={dest}
                          className="bg-gradient-to-r from-cyan-600/40 to-blue-600/40 text-cyan-200 px-4 py-2 rounded-lg text-sm font-semibold border border-cyan-500/30"
                        >
                          📍 {dest}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-slate-800/50 rounded-xl p-4 border border-pink-500/20"
                  >
                    <p className="text-sm text-pink-300 mb-3">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <span
                          key={interest}
                          className="bg-gradient-to-r from-pink-600/40 to-rose-600/40 text-pink-200 px-4 py-2 rounded-lg text-sm font-semibold border border-pink-500/30"
                        >
                          ❤️ {interest}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/40 rounded-2xl p-6 text-center"
                >
                  <Sparkles className="h-6 w-6 text-purple-400 mx-auto mb-3" />
                  <p className="text-purple-200">
                    Ready to generate your personalized itinerary? Click "Generate Trip" and our AI will create an amazing plan for you!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons - Enhanced */}
        <motion.div
          className="flex gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="w-full h-12 text-base border-purple-500/30 text-purple-300 hover:bg-purple-900/30 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          </motion.div>

          <motion.div
            className="flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {step < 4 ? (
              <Button
                onClick={handleNext}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-base font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Zap className="h-4 w-4" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Trip
                    <Zap className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
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
