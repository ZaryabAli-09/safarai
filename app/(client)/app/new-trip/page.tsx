"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import { format, differenceInDays, addDays } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/loader";
import toast from "react-hot-toast";
import {
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Zap,
  ChevronRight,
  Bot,
  User,
  CheckCircle2,
  Plus,
  X,
  Wallet,
  Globe,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TripType =
  | "adventure"
  | "cultural"
  | "relaxation"
  | "family"
  | "honeymoon"
  | "solo";
type TripPace = "slow" | "moderate" | "fast";
type Accommodation = "budget" | "mid-range" | "luxury";
type Transportation = "flight" | "road" | "train" | "mix";

interface TripFormData {
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  currency: string;
  customCurrencyAmount: string;
  tripType: TripType;
  tripPace: TripPace;
  accommodation: Accommodation;
  transportation: Transportation;
  travelers: number;
  interests: string[];
}

type ChatStep =
  | "welcome"
  | "destination"
  | "dates"
  | "budget"
  | "travelers"
  | "transportation"
  | "tripType"
  | "preferences"
  | "summary"
  | "generating";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: React.ReactNode;
  timestamp: Date;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIP_TYPES: { value: TripType; label: string; emoji: string }[] = [
  { value: "adventure", label: "Adventure", emoji: "🏔️" },
  { value: "cultural", label: "Cultural", emoji: "🏛️" },
  { value: "relaxation", label: "Relaxation", emoji: "🏖️" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  { value: "honeymoon", label: "Honeymoon", emoji: "💑" },
  { value: "solo", label: "Solo", emoji: "🎒" },
];

const INTERESTS = [
  "Photography",
  "Food & Cuisine",
  "History",
  "Nature",
  "Nightlife",
  "Shopping",
  "Sports",
  "Art",
  "Music",
  "Architecture",
  "Wildlife",
  "Beaches",
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira" },
];

const BUDGET_MIN = 500;
const BUDGET_MAX = 20000;

// Step order for progress tracking
const STEP_ORDER: ChatStep[] = [
  "welcome",
  "destination",
  "dates",
  "budget",
  "travelers",
  "transportation",
  "tripType",
  "preferences",
  "summary",
  "generating",
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function formatBudget(val: number) {
  if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  return `$${val}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated typing dots for bot "thinking" */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/40"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/** Single chat bubble — matches new_trip_wizard_redesign mockup */
function ChatBubble({
  message,
  isNew,
}: {
  message: ChatMessage;
  isNew?: boolean;
}) {
  const isBot = message.role === "bot";
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-accent border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-accent text-primary rounded-tr-sm border border-primary/20"
        }`}
      >
        {message.content}
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

/** "Trip so far" side panel — desktop only */
function TripSoFarPanel({
  formData,
  currentStep,
}: {
  formData: TripFormData;
  currentStep: ChatStep;
}) {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  // Steps that count toward progress (exclude welcome/generating)
  const totalSteps = 8; // destination→summary = 8 steps
  const completedSteps = Math.max(0, stepIndex - 1); // -1 for welcome
  const progressPct = Math.min(
    100,
    Math.round((completedSteps / totalSteps) * 100),
  );

  const rows: {
    icon: React.ElementType;
    label: string;
    value: string | null;
  }[] = [
    {
      icon: MapPin,
      label: "Destination",
      value:
        formData.destinations.length > 0
          ? formData.destinations.join(", ")
          : null,
    },
    {
      icon: Calendar,
      label: "Dates",
      value:
        formData.startDate && formData.endDate
          ? `${formData.duration} days`
          : currentStep === "dates"
            ? "In progress"
            : null,
    },
    {
      icon: DollarSign,
      label: "Budget",
      value:
        formData.budget && formData.budget !== 2000 && completedSteps >= 3
          ? `$${formData.budget.toLocaleString()}`
          : null,
    },
    {
      icon: Users,
      label: "Travelers",
      value: completedSteps >= 4 ? `${formData.travelers}` : null,
    },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
      {/* Trip so far card */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          Trip so far
        </h2>
        <div className="space-y-3">
          {rows.map((row) => {
            const Icon = row.icon;
            const isDone = row.value !== null && row.value !== "In progress";
            const isInProgress = row.value === "In progress";
            return (
              <div key={row.label} className="flex items-start gap-3">
                {/* Check icon when done, muted icon otherwise */}
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[color:var(--success)]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p
                    className={`text-xs ${isDone || isInProgress ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                  >
                    {row.label}
                  </p>
                  {row.value ? (
                    <p
                      className={`text-sm font-semibold ${isInProgress ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {row.value}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/40">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step progress */}
      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden mr-3">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Step {Math.min(completedSteps + 1, totalSteps)} of {totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewTripPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ── State ──────────────────────────────────────────────────────────────────

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  // Form data
  const [formData, setFormData] = useState<TripFormData>({
    name: "",
    destinations: [],
    startDate: "",
    endDate: "",
    duration: 0,
    budget: 2000,
    currency: "USD",
    customCurrencyAmount: "",
    tripType: "adventure",
    tripPace: "moderate",
    accommodation: "mid-range",
    transportation: "mix",
    travelers: 2,
    interests: [],
  });

  // Destination input
  const [destInput, setDestInput] = useState("");

  // Date range picker
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: addDays(new Date(), 6),
    key: "selection",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Budget
  const [budgetSlider, setBudgetSlider] = useState([2000]);
  const [showCurrencyInput, setShowCurrencyInput] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // ── Add message helper ─────────────────────────────────────────────────────

  const addMessage = useCallback(
    (role: "bot" | "user", content: React.ReactNode) => {
      const id = genId();
      setNewMessageIds((prev) => new Set(prev).add(id));
      setMessages((prev) => [
        ...prev,
        { id, role, content, timestamp: new Date() },
      ]);
      setTimeout(() => {
        setNewMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1000);
    },
    [],
  );

  const botSay = useCallback(
    async (content: React.ReactNode, delay = 600) => {
      setIsTyping(true);
      await new Promise((r) => setTimeout(r, delay));
      setIsTyping(false);
      addMessage("bot", content);
    },
    [addMessage],
  );

  // ── Initialize chat — mount guard prevents double-fire in StrictMode ──────

  const initRan = useRef(false);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;

    const init = async () => {
      await botSay(
        <span>
          Hey there, I am <strong>SafarAI</strong>. I will help you build a trip
          in a few quick steps.
        </span>,
        400,
      );
      await botSay(
        <span>
          Where would you like to go? You can add more than one destination.
        </span>,
        800,
      );
      setCurrentStep("destination");
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleAddDestination = () => {
    const trimmed = destInput.trim();
    if (!trimmed) return;
    if (formData.destinations.includes(trimmed)) {
      toast.error("Destination already added");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, trimmed],
    }));
    setDestInput("");
  };

  const handleRemoveDestination = (dest: string) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d !== dest),
    }));
  };

  const handleDestinationConfirm = async () => {
    if (formData.destinations.length === 0) {
      toast.error("Please add at least one destination");
      return;
    }
    const destList = formData.destinations.join(", ");
    addMessage("user", destList);

    // Auto-generate trip name
    const tripName = `Trip to ${formData.destinations[0]}`;
    setFormData((prev) => ({ ...prev, name: tripName }));

    await botSay(
      <span>Great choice. Now pick your travel dates below.</span>,
      700,
    );
    setCurrentStep("dates");
    setShowDatePicker(true);
  };

  const handleDateConfirm = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select travel dates");
      return;
    }
    const start = format(dateRange.startDate, "MMM d, yyyy");
    const end = format(dateRange.endDate, "MMM d, yyyy");
    const days = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;

    setFormData((prev) => ({
      ...prev,
      startDate: format(dateRange.startDate!, "yyyy-MM-dd"),
      endDate: format(dateRange.endDate!, "yyyy-MM-dd"),
      duration: days,
    }));

    setShowDatePicker(false);
    addMessage("user", `${start} → ${end} (${days} days)`);

    await botSay(
      <span>
        Perfect! <strong>{days} days</strong> from <strong>{start}</strong> to{" "}
        <strong>{end}</strong>.
      </span>,
      700,
    );
    await botSay(
      <span>
        What&apos;s your <strong>total budget</strong> for this trip? Use the
        slider to set your budget in USD, or add an optional amount in another
        currency.
      </span>,
      900,
    );
    setCurrentStep("budget");
  };

  // ── FIX: custom currency amount takes priority over slider ─────────────────
  const handleBudgetConfirm = async () => {
    // If the user typed a custom currency amount, use that value as the budget
    // and the selected currency. Otherwise fall back to the slider value in USD.
    let finalBudget: number;
    let finalCurrency: string;

    if (showCurrencyInput && formData.customCurrencyAmount) {
      const parsed = parseFloat(formData.customCurrencyAmount);
      if (!isNaN(parsed) && parsed > 0) {
        finalBudget = parsed;
        finalCurrency = selectedCurrency;
      } else {
        toast.error("Please enter a valid custom amount");
        return;
      }
    } else {
      finalBudget = budgetSlider[0];
      finalCurrency = "USD";
    }

    setFormData((prev) => ({
      ...prev,
      budget: finalBudget,
      currency: finalCurrency,
    }));

    const currencyInfo = CURRENCIES.find((c) => c.code === finalCurrency);
    const displayStr =
      finalCurrency === "USD"
        ? `$${finalBudget.toLocaleString()} USD`
        : `${currencyInfo?.symbol}${finalBudget.toLocaleString()} ${finalCurrency}`;

    addMessage("user", displayStr);

    await botSay(
      <span>
        Great budget! <strong>{displayStr}</strong> gives us plenty to work
        with.
      </span>,
      700,
    );
    await botSay(
      <span>
        How many <strong>travelers</strong> are going on this trip?
      </span>,
      900,
    );
    setCurrentStep("travelers");
  };

  const handleTravelersConfirm = async (count: number) => {
    setFormData((prev) => ({ ...prev, travelers: count }));
    addMessage("user", `${count} ${count === 1 ? "traveler" : "travelers"}`);

    await botSay(
      <span>
        Got it — <strong>{count}</strong>{" "}
        {count === 1 ? "traveler" : "travelers"}.
      </span>,
      700,
    );
    await botSay(
      <span>
        What <strong>type of trip</strong> are you looking for?
      </span>,
      900,
    );
    setCurrentStep("tripType");
  };

  const handleTripTypeSelect = async (type: TripType) => {
    setFormData((prev) => ({ ...prev, tripType: type }));
    const found = TRIP_TYPES.find((t) => t.value === type);
    addMessage("user", `${found?.emoji} ${found?.label}`);

    await botSay(
      <span>
        {found?.emoji} <strong>{found?.label}</strong> trip — excellent choice!
      </span>,
      700,
    );
    await botSay(
      <span>
        How do you plan to travel? This helps me suggest realistic activities
        and travel times.
      </span>,
      900,
    );
    setCurrentStep("transportation");
  };

  const handleTransportationSelect = async (transport: Transportation) => {
    setFormData((prev) => ({ ...prev, transportation: transport }));
    const transportLabels: Record<Transportation, string> = {
      flight: "✈️ Flight",
      road: "🚗 Road/Car",
      train: "🚂 Train",
      mix: "🔄 Mix of all",
    };
    addMessage("user", transportLabels[transport]);

    await botSay(
      <span>
        Perfect! <strong>{transportLabels[transport]}</strong> it is.
      </span>,
      700,
    );
    await botSay(
      <span>
        Almost done! Select your <strong>interests</strong> and{" "}
        <strong>preferences</strong> to personalize your itinerary.
      </span>,
      900,
    );
    setCurrentStep("preferences");
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handlePreferencesConfirm = async () => {
    const interestStr =
      formData.interests.length > 0
        ? formData.interests.join(", ")
        : "General sightseeing";
    addMessage(
      "user",
      `${interestStr} | ${formData.tripPace} pace | ${formData.accommodation} stay`,
    );

    await botSay(
      <span>
        Perfect! Here&apos;s a summary of your trip. Ready to generate your
        personalized itinerary?
      </span>,
      700,
    );
    setCurrentStep("summary");
  };

  const handleGenerateTrip = async () => {
    if (!session?.user?._id) {
      toast.error("Please sign in to generate a trip");
      return;
    }

    setIsGenerating(true);
    setCurrentStep("generating");
    addMessage("user", "Yes! Generate my trip itinerary!");

    await botSay(
      <span>
        Excellent! I&apos;m now crafting your personalized{" "}
        <strong>{formData.duration}-day</strong> itinerary for{" "}
        <strong>{formData.destinations.join(", ")}</strong>. This may take up to
        a minute...
      </span>,
      500,
    );

    try {
      const payload = {
        name: formData.name,
        destinations: formData.destinations,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        budget: formData.budget,
        currency: formData.currency,
        tripType: formData.tripType,
        tripPace: formData.tripPace,
        accommodation: formData.accommodation,
        transportation: formData.transportation,
        travelers: formData.travelers,
        interests: formData.interests,
      };

      const res = await fetch(`/api/trip/generate/${session.user._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "AI generation failed. Please try again.",
        );
      }

      const tripId = result.data?._id;
      if (!tripId) {
        throw new Error(
          "Trip was created but no ID returned. Please check your trips.",
        );
      }

      await botSay(
        <span>
          ✅ Your trip itinerary is ready! Redirecting you to your personalized
          plan...
        </span>,
        500,
      );

      toast.success("Trip generated successfully! 🎉");

      setTimeout(() => {
        router.push(`/app/trips/${tripId}`);
      }, 1500);
    } catch (error) {
      setIsGenerating(false);
      setCurrentStep("summary");
      const msg =
        error instanceof Error ? error.message : "Failed to generate trip";
      toast.error(msg);
      await botSay(
        <span>
          ❌ Oops! Something went wrong: <strong>{msg}</strong>. Please try
          again.
        </span>,
        300,
      );
    }
  };

  // ── Render input area based on step ───────────────────────────────────────

  const renderInputArea = () => {
    if (currentStep === "generating") {
      return (
        <div className="flex items-center justify-center gap-3 py-4 text-muted-foreground">
          <Spinner size="small" />
          <span className="text-sm font-medium">
            Generating your trip itinerary...
          </span>
        </div>
      );
    }

    if (currentStep === "welcome") {
      return null;
    }

    if (currentStep === "destination") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Added destinations */}
          {formData.destinations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.destinations.map((dest) => (
                <span
                  key={dest}
                  className="flex items-center gap-1.5 bg-accent border border-primary/20 text-primary text-sm px-3 py-1.5 rounded-full"
                >
                  <MapPin className="w-3 h-3" />
                  {dest}
                  <button
                    onClick={() => handleRemoveDestination(dest)}
                    className="ml-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Input row — Enter key adds destination */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (destInput.trim()) {
                      handleAddDestination();
                    } else if (formData.destinations.length > 0) {
                      handleDestinationConfirm();
                    }
                  }
                }}
                placeholder="e.g. Paris, Kumrat Valley, Tokyo..."
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent bg-white"
              />
            </div>
            <button
              onClick={handleAddDestination}
              className="px-3 py-2.5 bg-muted hover:bg-border rounded-xl transition-colors"
              title="Add destination"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleDestinationConfirm}
            disabled={formData.destinations.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      );
    }

    if (currentStep === "dates") {
      const days =
        dateRange.startDate && dateRange.endDate
          ? differenceInDays(dateRange.endDate, dateRange.startDate) + 1
          : 0;

      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Date range display */}
          <div className="flex items-center gap-3 p-3 bg-accent rounded-xl border border-primary/20">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 text-sm">
              {dateRange.startDate && dateRange.endDate ? (
                <span className="font-medium text-primary">
                  {format(dateRange.startDate, "MMM d, yyyy")} →{" "}
                  {format(dateRange.endDate, "MMM d, yyyy")}
                  <span className="ml-2 text-primary/70 font-normal">
                    ({days} {days === 1 ? "day" : "days"})
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Select your travel dates
                </span>
              )}
            </div>
          </div>

          {/* Date range picker */}
          <div className="overflow-x-auto rounded-xl border border-border bg-white">
            <DateRange
              ranges={[dateRange]}
              onChange={(item: RangeKeyDict) => {
                setDateRange(item.selection);
              }}
              minDate={new Date()}
              maxDate={addDays(new Date(), 365)}
              months={1}
              direction="horizontal"
              showMonthAndYearPickers
              rangeColors={["#2563eb"]}
              className="!font-sans"
            />
          </div>

          <button
            onClick={handleDateConfirm}
            disabled={!dateRange.startDate || !dateRange.endDate}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Confirm Dates
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      );
    }

    if (currentStep === "budget") {
      const budget = budgetSlider[0];
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Budget display */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Total Budget (USD)
              </span>
            </div>
            <span className="text-xl font-bold text-foreground">
              ${budget.toLocaleString()}
            </span>
          </div>

          {/* Slider */}
          <div className="px-1 space-y-2">
            <Slider
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={100}
              value={budgetSlider}
              onValueChange={setBudgetSlider}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatBudget(BUDGET_MIN)}</span>
              <span className="text-primary font-medium">
                {formatBudget(budget)}
              </span>
              <span>{formatBudget(BUDGET_MAX)}</span>
            </div>
          </div>

          {/* Quick budget presets */}
          <div className="flex gap-2 flex-wrap">
            {[500, 1000, 2500, 5000, 10000, 20000].map((preset) => (
              <button
                key={preset}
                onClick={() => setBudgetSlider([preset])}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  budgetSlider[0] === preset
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {formatBudget(preset)}
              </button>
            ))}
          </div>

          {/* Optional currency input */}
          <div className="border border-dashed border-border rounded-xl p-3 space-y-2">
            <button
              onClick={() => setShowCurrencyInput(!showCurrencyInput)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              {showCurrencyInput
                ? "Hide"
                : "Add amount in another currency (optional)"}
            </button>

            {showCurrencyInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex gap-2"
              >
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  {CURRENCIES.filter((c) => c.code !== "USD").map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} — {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={formData.customCurrencyAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCurrencyAmount: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBudgetConfirm();
                    }
                  }}
                  placeholder={`Amount in ${selectedCurrency}`}
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                />
              </motion.div>
            )}
          </div>

          <button
            onClick={handleBudgetConfirm}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Confirm Budget
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      );
    }

    if (currentStep === "travelers") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  travelers: Math.max(1, prev.travelers - 1),
                }))
              }
              className="w-10 h-10 rounded-full border-2 border-border hover:border-primary flex items-center justify-center text-xl font-bold text-muted-foreground transition-colors"
            >
              −
            </button>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {formData.travelers}
              </div>
              <div className="text-sm text-muted-foreground">
                {formData.travelers === 1 ? "traveler" : "travelers"}
              </div>
            </div>
            <button
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  travelers: Math.min(20, prev.travelers + 1),
                }))
              }
              className="w-10 h-10 rounded-full border-2 border-border hover:border-primary flex items-center justify-center text-xl font-bold text-muted-foreground transition-colors"
            >
              +
            </button>
          </div>

          {/* Quick select */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => handleTravelersConfirm(n)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  formData.travelers === n
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {n === 1 ? "Solo" : n === 2 ? "Couple" : `${n} people`}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleTravelersConfirm(formData.travelers)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      );
    }

    if (currentStep === "tripType") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          {TRIP_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTripTypeSelect(type.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                formData.tripType === type.value
                  ? "border-primary bg-accent text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{type.emoji}</span>
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </motion.div>
      );
    }

    if (currentStep === "transportation") {
      const transportOptions: {
        value: Transportation;
        label: string;
        emoji: string;
      }[] = [
        { value: "flight", label: "Flight", emoji: "✈️" },
        { value: "road", label: "Road/Car", emoji: "🚗" },
        { value: "train", label: "Train", emoji: "🚂" },
        { value: "mix", label: "Mix of all", emoji: "🔄" },
      ];

      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-2"
        >
          {transportOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleTransportationSelect(option.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                formData.transportation === option.value
                  ? "border-primary bg-accent text-primary"
                  : "border-border bg-white text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </motion.div>
      );
    }

    if (currentStep === "preferences") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Interests */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Interests (select all that apply)
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    formData.interests.includes(interest)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Trip Pace */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Trip Pace
            </p>
            <div className="flex gap-2">
              {(["slow", "moderate", "fast"] as TripPace[]).map((pace) => (
                <button
                  key={pace}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, tripPace: pace }))
                  }
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors capitalize ${
                    formData.tripPace === pace
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {pace === "slow"
                    ? "🐢 Slow"
                    : pace === "moderate"
                      ? "🚶 Moderate"
                      : "⚡ Fast"}
                </button>
              ))}
            </div>
          </div>

          {/* Accommodation */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Accommodation
            </p>
            <div className="flex gap-2">
              {(["budget", "mid-range", "luxury"] as Accommodation[]).map(
                (acc) => (
                  <button
                    key={acc}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, accommodation: acc }))
                    }
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      formData.accommodation === acc
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {acc === "budget"
                      ? "🏕️ Budget"
                      : acc === "mid-range"
                        ? "🏨 Mid-range"
                        : "🏰 Luxury"}
                  </button>
                ),
              )}
            </div>
          </div>

          <button
            onClick={handlePreferencesConfirm}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      );
    }

    if (currentStep === "summary") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Summary card */}
          <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Trip Summary
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">
                  {formData.destinations.join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{formData.duration} days</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="w-3.5 h-3.5 text-primary" />
                <span>${formData.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>{formData.travelers} travelers</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="capitalize">{formData.tripType}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Plane className="w-3.5 h-3.5 text-primary" />
                <span className="capitalize">{formData.tripPace} pace</span>
              </div>
            </div>
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-border">
                {formData.interests.map((i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-accent text-primary rounded-full text-xs border border-primary/20"
                  >
                    {i}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateTrip}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all text-sm"
          >
            {isGenerating ? (
              <>
                <Spinner
                  size="small"
                  className="border-white/30 border-t-white"
                />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate My Trip Itinerary
              </>
            )}
          </button>
        </motion.div>
      );
    }

    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-secondary overflow-hidden">
      {/* ── Chat column ── */}
      <div className="flex flex-col flex-1 min-w-0 bg-secondary">
        {/* Header */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-accent border border-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">
              SafarAI Planner
            </h1>
            <p className="text-xs text-[color:var(--success)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--success)] inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Chat messages — scrollable */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isNew={newMessageIds.has(msg.id)}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-accent border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area — fixed at bottom of chat column */}
        <div className="bg-white border-t border-border px-4 py-3 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderInputArea()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Right panel — desktop only ── */}
      <div className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 p-4 overflow-y-auto">
        <TripSoFarPanel formData={formData} currentStep={currentStep} />
      </div>
    </div>
  );
}
