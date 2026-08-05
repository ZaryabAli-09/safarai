"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, addDays } from "date-fns";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import type { DateRange as RDPDateRange } from "react-day-picker";
import { MobileTopBar } from "@/app/_components/navigation/MobileTopBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  Plane,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Users,
  Zap,
  ChevronRight,
  ChevronDown,
  Bot,
  User,
  CheckCircle2,
  Plus,
  X,
  Wallet,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TripType =
  | "adventure"
  | "cultural"
  | "relaxation"
  | "family"
  | "honeymoon"
  | "vlogging";
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
  { value: "vlogging", label: "Vlogging", emoji: "📹" },
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

const BUDGET_PRESETS = [500, 1000, 2500, 5000, 10000, 20000];
const BUDGET_MIN = 500;
const BUDGET_MAX = 20000;

const GENERATION_STEPS = [
  "Analyzing your preferences",
  "Matching destinations to your interests",
  "Building your day-by-day itinerary",
  "Estimating costs & logistics",
  "Finalizing your personalized plan",
];

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

function formatBudgetWithCurrency(amount: number, currencyCode: string) {
  const currencyInfo = CURRENCIES.find((c) => c.code === currencyCode);
  return `${currencyInfo?.symbol || currencyCode} ${amount.toLocaleString()}`;
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

/** Single chat bubble */
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

/** Progress + "trip so far" summary — shared shape, rendered differently on mobile vs desktop */
function useTripProgress(formData: TripFormData, currentStep: ChatStep) {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const totalSteps = 8; // destination → summary
  const completedSteps = Math.max(0, stepIndex - 1);
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
      icon: CalendarIcon,
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
        completedSteps >= 3
          ? `${CURRENCIES.find((c) => c.code === formData.currency)?.symbol || ""}${formData.budget.toLocaleString()} ${formData.currency}`
          : null,
    },
    {
      icon: Users,
      label: "Travelers",
      value: completedSteps >= 4 ? `${formData.travelers}` : null,
    },
  ];

  return {
    rows,
    progressPct,
    stepLabel: `Step ${Math.min(completedSteps + 1, totalSteps)} of ${totalSteps}`,
  };
}

/** Desktop "Trip so far" side panel — fixed width, never contributes to page overflow */
function TripSoFarPanel({
  formData,
  currentStep,
}: {
  formData: TripFormData;
  currentStep: ChatStep;
}) {
  const { rows, progressPct, stepLabel } = useTripProgress(
    formData,
    currentStep,
  );

  return (
    <div className="flex flex-col gap-4">
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
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-[#dcfce7] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[color:var(--success)]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p
                    className={`text-xs ${isDone || isInProgress ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                  >
                    {row.label}
                  </p>
                  {row.value ? (
                    <p
                      className={`text-sm font-semibold truncate ${isInProgress ? "text-muted-foreground" : "text-foreground"}`}
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

      <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <Progress value={progressPct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {stepLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Compact progress strip for mobile/tablet — replaces the desktop-only sidebar there */
function MobileProgressBar({
  formData,
  currentStep,
}: {
  formData: TripFormData;
  currentStep: ChatStep;
}) {
  const { progressPct, stepLabel } = useTripProgress(formData, currentStep);
  return (
    <div className="lg:hidden bg-white border-b border-border px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
      <Progress value={progressPct} className="h-1.5 flex-1" />
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {stepLabel}
      </span>
    </div>
  );
}

/** Full-screen overlay shown while the itinerary is being generated */
function GeneratingOverlay({
  visible,
  destinations,
  duration,
  activeStep,
}: {
  visible: boolean;
  destinations: string[];
  duration: number;
  activeStep: number;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-5">
        <div className="relative w-16 h-16">
          <span className="absolute inset-0 rounded-full border-4 border-accent" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <Plane className="w-6 h-6 text-primary absolute inset-0 m-auto" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-foreground">
            Crafting your itinerary…
          </h2>
          <p className="text-sm text-muted-foreground">
            Building a personalized {duration || ""}-day plan
            {destinations.length > 0 ? ` for ${destinations.join(", ")}` : ""}.
            This can take up to a minute.
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5 text-center mt-1">
          {GENERATION_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2.5 text-sm">
              {i < activeStep ? (
                <CheckCircle2 className="w-4 h-4 text-[color:var(--success)] flex-shrink-0" />
              ) : i === activeStep ? (
                <Spinner size="small" className="flex-shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
              )}
              <span
                className={
                  i <= activeStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/50"
                }
              >
                {step}
              </span>
            </div>
          ))}
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
  const dateConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
    tripType: "adventure",
    tripPace: "moderate",
    accommodation: "mid-range",
    transportation: "mix",
    travelers: 2,
    interests: [],
  });

  // Destination input
  const [destInput, setDestInput] = useState("");

  // Date range — popover-based, never affects page layout/width
  const [dateRange, setDateRange] = useState<RDPDateRange>({
    from: new Date(),
    to: addDays(new Date(), 6),
  });
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(1);

  // Budget — single unified control (amount + currency, driven by one source of truth)
  const [budgetAmount, setBudgetAmount] = useState(2000);
  const [budgetCurrency, setBudgetCurrency] = useState("USD");

  // Trip generation progress (cosmetic — reflects a single API call)
  const [genStepIndex, setGenStepIndex] = useState(0);

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const setMonths = () => {
      if (window.innerWidth >= 1024) setCalendarMonths(2);
      else setCalendarMonths(1);
    };
    setMonths();
    window.addEventListener("resize", setMonths);
    return () => window.removeEventListener("resize", setMonths);
  }, []);

  // Auto-open the date popover when the user reaches that step
  useEffect(() => {
    if (currentStep === "dates") setIsDatePopoverOpen(true);
  }, [currentStep]);

  // Cosmetic step-through animation for the full-screen generating overlay
  useEffect(() => {
    if (!isGenerating) {
      setGenStepIndex(0);
      return;
    }
    const id = setInterval(() => {
      setGenStepIndex((i) => (i < GENERATION_STEPS.length - 1 ? i + 1 : i));
    }, 2200);
    return () => clearInterval(id);
  }, [isGenerating]);

  // Lock background scroll while the full-screen loader is up
  useEffect(() => {
    document.body.style.overflow = isGenerating ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isGenerating]);

  useEffect(() => {
    return () => {
      if (dateConfirmTimerRef.current) {
        clearTimeout(dateConfirmTimerRef.current);
      }
    };
  }, []);

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
  };

  const handleDateConfirmWithRange = async (range: RDPDateRange) => {
    if (dateConfirmTimerRef.current) {
      clearTimeout(dateConfirmTimerRef.current);
      dateConfirmTimerRef.current = null;
    }

    if (!range.from || !range.to) {
      toast.error("Please select travel dates");
      return;
    }

    const start = format(range.from, "MMM d, yyyy");
    const end = format(range.to, "MMM d, yyyy");
    const days = differenceInDays(range.to, range.from) + 1;

    setFormData((prev) => ({
      ...prev,
      startDate: format(range.from!, "yyyy-MM-dd"),
      endDate: format(range.to!, "yyyy-MM-dd"),
      duration: days,
    }));

    setIsDatePopoverOpen(false);
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
        What&apos;s your <strong>total budget</strong> for this trip?
      </span>,
      900,
    );
    setCurrentStep("budget");
  };

  const handleDateConfirm = async () => {
    if (dateConfirmTimerRef.current) {
      clearTimeout(dateConfirmTimerRef.current);
      dateConfirmTimerRef.current = null;
    }

    await handleDateConfirmWithRange(dateRange);
  };

  const handleBudgetConfirm = async () => {
    if (!budgetAmount || budgetAmount <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      budget: budgetAmount,
      currency: budgetCurrency,
    }));

    const currencyInfo = CURRENCIES.find((c) => c.code === budgetCurrency);
    const displayStr = `${currencyInfo?.symbol || ""}${budgetAmount.toLocaleString()} ${budgetCurrency}`;

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

      toast.success("Trip generated successfully! 🎉");
      router.push(`/app/trips/${tripId}`);
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
    if (currentStep === "generating" || currentStep === "welcome") {
      return null;
    }

    if (currentStep === "destination") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
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

          {/* Added destinations */}
          {formData.destinations.length > 0 && (
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
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
        dateRange.from && dateRange.to
          ? differenceInDays(dateRange.to, dateRange.from) + 1
          : 0;

      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Date range trigger — opens a popover calendar that floats above
             the page instead of an inline block, so it can never widen or
             overflow the layout */}
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 p-3.5 bg-white border border-border rounded-xl hover:border-primary/40 transition-colors text-left"
              >
                <CalendarIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="flex-1 min-w-0 text-sm">
                  {dateRange.from && dateRange.to ? (
                    <span className="font-medium text-foreground">
                      {format(dateRange.from, "MMM d, yyyy")} →{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                      <span className="ml-2 text-muted-foreground font-normal">
                        ({days} {days === 1 ? "day" : "days"})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select your travel dates
                    </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              className="w-auto max-w-[95vw] p-3"
            >
              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  const newRange = range ?? { from: undefined, to: undefined };
                  setDateRange(newRange);
                  if (dateConfirmTimerRef.current) {
                    clearTimeout(dateConfirmTimerRef.current);
                  }
                  if (newRange.from && newRange.to) {
                    dateConfirmTimerRef.current = setTimeout(() => {
                      dateConfirmTimerRef.current = null;
                      void handleDateConfirmWithRange(newRange);
                    }, 300);
                  }
                }}
                numberOfMonths={calendarMonths}
                disabled={{ before: new Date() }}
              />
            </PopoverContent>
          </Popover>

          <button
            onClick={handleDateConfirm}
            disabled={!dateRange.from || !dateRange.to}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      );
    }

    if (currentStep === "budget") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Currency
            </p>
            <Select value={budgetCurrency} onValueChange={setBudgetCurrency}>
              <SelectTrigger className="w-full h-11 bg-white border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unified budget control: the slider and manual input drive the same amount. */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Budget amount
            </p>
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  {CURRENCIES.find((c) => c.code === budgetCurrency)?.symbol ||
                    budgetCurrency}
                </span>
                <input
                  type="number"
                  min={0}
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(Number(e.target.value) || 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBudgetConfirm();
                    }
                  }}
                  className="w-full h-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent bg-white"
                />
              </div>
            </div>
          </div>

          {/* Slider — bound to the same budgetAmount value */}
          <div className="px-1 space-y-2">
            <Slider
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={100}
              value={[Math.min(Math.max(budgetAmount, BUDGET_MIN), BUDGET_MAX)]}
              onValueChange={([v]) => setBudgetAmount(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {formatBudgetWithCurrency(BUDGET_MIN, budgetCurrency)}
              </span>
              <span>
                {formatBudgetWithCurrency(BUDGET_MAX, budgetCurrency)}
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap">
            {BUDGET_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setBudgetAmount(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  budgetAmount === preset
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {formatBudgetWithCurrency(preset, budgetCurrency)}
              </button>
            ))}
          </div>

          <button
            onClick={handleBudgetConfirm}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            Continue
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
                onClick={() =>
                  setFormData((prev) => ({ ...prev, travelers: n }))
                }
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
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-medium truncate">
                  {formData.destinations.join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{formData.duration} days</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wallet className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>
                  {CURRENCIES.find((c) => c.code === formData.currency)
                    ?.symbol || ""}
                  {formData.budget.toLocaleString()} {formData.currency}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span>{formData.travelers} travelers</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="capitalize">{formData.tripType}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Plane className="w-3.5 h-3.5 text-primary flex-shrink-0" />
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
            <Zap className="w-4 h-4" />
            Generate My Trip Itinerary
          </button>
        </motion.div>
      );
    }

    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-dvh bg-secondary overflow-hidden">
      {/* ── Chat column ── */}
      <div className="flex flex-col flex-1 min-w-0 bg-secondary pt-14 md:pt-0">
        <MobileTopBar pageName="New Trip" />
        {/* Header */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-accent border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-foreground text-sm">
              SafarAI Planner
            </h1>
            <p className="text-xs text-[color:var(--success)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--success)] inline-block" />
              Online
            </p>
          </div>
        </div>

        {/* Mobile/tablet progress — desktop gets the full sidebar instead */}
        <MobileProgressBar formData={formData} currentStep={currentStep} />

        {/* Chat messages — scrollable */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 scroll-smooth"
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

      {/* ── Right panel — desktop only, fixed width, cannot overflow the page ── */}
      <div className="hidden lg:block w-80 flex-shrink-0 border-l border-border overflow-y-auto overflow-x-hidden p-4">
        <TripSoFarPanel formData={formData} currentStep={currentStep} />
      </div>

      {/* ── Full-screen generation overlay ── */}
      <GeneratingOverlay
        visible={isGenerating}
        destinations={formData.destinations}
        duration={formData.duration}
        activeStep={genStepIndex}
      />
    </div>
  );
}
