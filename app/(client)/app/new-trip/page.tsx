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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  X,
} from "lucide-react";

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
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
          toast.error("End date must be the same or after start date");
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

  const perDay = formData.duration
    ? Math.round(formData.budget / formData.duration)
    : 0;

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <CardTitle>Plan Your Trip</CardTitle>
          <CardDescription>
            Create an amazing itinerary with AI assistance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = s.number === step;
            const isCompleted = s.number < step;

            return (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{s.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card>
            {/* Step 1: Basics */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Trip Name</Label>
                  <Input
                    placeholder="e.g., Northern Pakistan Adventure"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destinations ({formData.destinations.length}/10)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter destination"
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addDestination()}
                    />
                    <Button onClick={addDestination}>
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.destinations.map((dest, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        {dest}
                        <button
                          onClick={() => removeDestination(idx)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                {formData.duration > 0 && (
                  <div className="rounded-lg border bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Trip Duration</p>
                    <p className="text-2xl font-semibold">
                      {formData.duration} days
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Budget (PKR)</Label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      handleInputChange("budget", parseInt(e.target.value))
                    }
                  />
                  <Slider
                    value={[formData.budget]}
                    onValueChange={(val) => handleInputChange("budget", val[0])}
                    min={1000}
                    max={500000}
                    step={5000}
                  />
                  <p className="text-sm text-muted-foreground">
                    ₨{formData.budget?.toLocaleString()}
                  </p>
                  {formData.duration > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ≈ ₨{perDay.toLocaleString()} per day
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Trip Type</Label>
                  <Select
                    value={formData.tripType}
                    onValueChange={(val) => handleInputChange("tripType", val)}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Transportation</Label>
                  <Select
                    value={formData.transportation}
                    onValueChange={(val) =>
                      handleInputChange("transportation", val)
                    }
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Accommodation</Label>
                  <Select
                    value={formData.accommodation}
                    onValueChange={(val) =>
                      handleInputChange("accommodation", val)
                    }
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Trip Pace</Label>
                  <Select
                    value={formData.tripPace}
                    onValueChange={(val) => handleInputChange("tripPace", val)}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleArrayValue("interests", interest)}
                      >
                        {interest.charAt(0).toUpperCase() + interest.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trip Name</span>
                    <span className="font-semibold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{formData.duration} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-semibold">₨{formData.budget?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-2">Destinations</span>
                    <div className="flex flex-wrap gap-2">
                      {formData.destinations.map((dest) => (
                        <Badge key={dest} variant="secondary">{dest}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-2">Interests</span>
                    <div className="flex flex-wrap gap-2">
                      {formData.interests.map((interest) => (
                        <Badge key={interest} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-center text-sm">
                  Ready to generate your personalized itinerary? Click "Generate
                  Trip" and our AI will create an amazing plan for you!
                </p>

                {/* Map placeholder */}
                <div className="mt-4 p-4 border border-dashed rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Map preview</p>
                      <p className="text-sm text-muted-foreground">
                        Map preview coming soon — will show destinations and
                        route.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
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
