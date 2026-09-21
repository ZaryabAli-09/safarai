"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, startOfToday } from "date-fns";
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
import {
  CURRENCIES,
  STYLE_OPTIONS,
  INTEREST_OPTIONS,
  OUTBOUND_OPTIONS,
  LOCAL_TRANSPORT_OPTIONS,
  TIME_SLOTS,
  LIMITS,
  FALLBACK_RATES,
  budgetScale,
  niceRound,
  type TripPace,
  type Accommodation,
  type Outbound,
  type LocalTransport,
  type TimeSlot,
  type Origin,
} from "@/lib/trip-creation-input";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripFormData {
  name: string;
  destinations: string[];
  destinationDays: { name: string; days: number }[];
  origin: Origin;
  outbound: Outbound;
  startDate: string;
  endDate: string;
  duration: number;
  arrivalTime: TimeSlot;
  departureTime: TimeSlot;
  adults: number;
  children: number;
  pets: number;
  styles: string[];
  interests: string[];
  pace: TripPace;
  stayLevel: Accommodation;
  localTransport: LocalTransport;
  budget: number;
  currency: string;
  includesFlights?: boolean;
  flightBudget?: number;
  prebooked: { type: "flight"; amount?: number }[];
  comment: string;
}

type ChatStep =
  | "welcome"
  | "destination"
  | "origin"
  | "dates"
  | "split"
  | "timing"
  | "travelers"
  | "vibe"
  | "preferences"
  | "budget"
  | "extras"
  | "summary"
  | "generating";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: React.ReactNode;
  timestamp: Date;
}

interface OriginCandidate {
  displayName: string;
  lat: number;
  lng: number;
  country: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENERATION_STEPS = [
  "Analyzing your preferences",
  "Matching destinations to your interests",
  "Building your day-by-day itinerary",
  "Estimating costs & logistics",
  "Finalizing your personalized plan",
];

// Steps that ask the user something (the optional "split" step is filtered out
// of the progress count when it doesn't apply).
const QUESTION_STEPS: ChatStep[] = [
  "destination",
  "origin",
  "dates",
  "split",
  "timing",
  "travelers",
  "vibe",
  "preferences",
  "budget",
  "extras",
];

// Pre-select a sensible currency from where the traveler starts.
const COUNTRY_CURRENCY: Record<string, string> = {
  Pakistan: "PKR",
  India: "INR",
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  Türkiye: "TRY",
  Turkey: "TRY",
  "United Kingdom": "GBP",
  Germany: "EUR",
  France: "EUR",
  Italy: "EUR",
  Spain: "EUR",
  Netherlands: "EUR",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code;
}

function formatMoney(amount: number, currencyCode: string) {
  return `${currencySymbol(currencyCode)} ${Math.round(amount).toLocaleString()}`;
}

function evenSplit(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const rem = total % parts;
  return Array.from({ length: parts }, (_, i) => base + (i < rem ? 1 : 0));
}

const cardCls = (active: boolean) =>
  `flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
    active
      ? "border-primary bg-accent text-primary"
      : "border-border bg-white text-muted-foreground hover:border-primary/40"
  }`;

const chipCls = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
    active
      ? "bg-primary text-white border-primary"
      : "bg-white text-muted-foreground border-border hover:border-primary/40"
  }`;

const segCls = (active: boolean) =>
  `flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
    active
      ? "bg-primary text-white border-primary"
      : "bg-white text-muted-foreground border-border hover:border-primary/40"
  }`;

const inputCls =
  "w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent bg-white";

// ─── Small shared UI pieces ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
      {children}
    </p>
  );
}

function ContinueButton({
  onClick,
  disabled,
  loading,
  children = "Continue",
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
    >
      {loading ? <Spinner size="small" /> : null}
      {children}
      {!loading && <ChevronRight className="w-4 h-4" />}
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const btn =
    "w-8 h-8 rounded-full border-2 border-border hover:border-primary disabled:opacity-40 disabled:hover:border-border flex items-center justify-center text-lg font-bold text-muted-foreground transition-colors";
  return (
    <div className="flex items-center justify-between bg-white border border-border rounded-xl px-3 py-2">
      <span className="text-sm text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={btn}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center text-lg font-bold text-primary">
          {value}
        </span>
        <button
          type="button"
          className={btn}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

/** Text box + plus button used for "add your own" chips */
function ChipAdder({
  placeholder,
  onAdd,
  disabled,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const submit = () => {
    const t = value.trim();
    if (!t) return;
    onAdd(t);
    setValue("");
  };
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        maxLength={60}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className={`${inputCls} flex-1 disabled:opacity-50`}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled}
        title="Add"
        className="px-3 py-2 bg-muted hover:bg-border rounded-xl transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
}

/** Selected chips that can be removed (used for custom + free-form lists) */
function RemovableChips({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (item: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="flex items-center gap-1.5 bg-accent border border-primary/20 text-primary text-xs px-3 py-1.5 rounded-full"
        >
          {item}
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Chat sub-components ──────────────────────────────────────────────────────

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
  const splitApplies =
    formData.destinations.length > 1 &&
    formData.duration >= formData.destinations.length;
  const steps = QUESTION_STEPS.filter((s) => s !== "split" || splitApplies);

  const done = currentStep === "summary" || currentStep === "generating";
  const idx = steps.indexOf(currentStep);
  const completed = done ? steps.length : Math.max(0, idx);
  const passed = (s: ChatStep) => done || steps.indexOf(s) < completed;

  const progressPct = Math.min(
    100,
    Math.round((completed / steps.length) * 100),
  );

  const who =
    `${formData.adults} adult${formData.adults === 1 ? "" : "s"}` +
    (formData.children > 0
      ? `, ${formData.children} child${formData.children === 1 ? "" : "ren"}`
      : "") +
    (formData.pets > 0
      ? `, ${formData.pets} pet${formData.pets === 1 ? "" : "s"}`
      : "");

  const rows: {
    icon: React.ElementType;
    label: string;
    value: string | null;
  }[] = [
    {
      icon: Plane,
      label: "Starting from",
      value: passed("origin") ? formData.origin.name || null : null,
    },
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
          ? `${formData.duration} ${formData.duration === 1 ? "day" : "days"}`
          : currentStep === "dates"
            ? "In progress"
            : null,
    },
    {
      icon: Users,
      label: "Travelers",
      value: passed("travelers") ? who : null,
    },
    {
      icon: DollarSign,
      label: "Budget",
      value: passed("budget")
        ? `${currencySymbol(formData.currency)}${Math.round(formData.budget).toLocaleString()} ${formData.currency}`
        : null,
    },
  ];

  return {
    rows,
    progressPct,
    stepLabel: done
      ? "Ready"
      : `Step ${Math.min(completed + 1, steps.length)} of ${steps.length}`,
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

  // ── State ──────────────────────────────────────────────────────────────────

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("welcome");
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<TripFormData>({
    name: "",
    destinations: [],
    destinationDays: [],
    origin: { name: "" },
    outbound: "flight",
    startDate: "",
    endDate: "",
    duration: 0,
    arrivalTime: "afternoon",
    departureTime: "evening",
    adults: 2,
    children: 0,
    pets: 0,
    styles: [],
    interests: [],
    pace: "moderate",
    stayLevel: "mid-range",
    localTransport: "taxi",
    budget: 0,
    currency: "USD",
    includesFlights: undefined,
    flightBudget: undefined,
    prebooked: [],
    comment: "",
  });

  // Destination
  const [destInput, setDestInput] = useState("");

  // Origin (checked once against the geocoder so "Islamabad" can't silently mean something else)
  const [originInput, setOriginInput] = useState("");
  const [originCandidate, setOriginCandidate] =
    useState<OriginCandidate | null>(null);
  const [originChecking, setOriginChecking] = useState(false);
  const [originNotFound, setOriginNotFound] = useState(false);

  // Dates — starts EMPTY so the user must choose (no accidental default range)
  const [dateRange, setDateRange] = useState<RDPDateRange>({
    from: undefined,
    to: undefined,
  });
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [calendarMonths, setCalendarMonths] = useState(1);

  // Days per destination (only used with 2+ destinations)
  const [split, setSplit] = useState<number[]>([]);

  // Budget
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetCurrency, setBudgetCurrency] = useState("USD");
  const [rates, setRates] = useState<{
    rates: Record<string, number>;
    live: boolean;
  } | null>(null);
  const [flightAmount, setFlightAmount] = useState("");

  const [genStepIndex, setGenStepIndex] = useState(0);

  const unitsPerUSD = useCallback(
    (code: string) => rates?.rates?.[code] ?? FALLBACK_RATES[code] ?? 1,
    [rates],
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const setMonths = () =>
      setCalendarMonths(window.innerWidth >= 1024 ? 2 : 1);
    setMonths();
    window.addEventListener("resize", setMonths);
    return () => window.removeEventListener("resize", setMonths);
  }, []);

  useEffect(() => {
    if (currentStep === "dates") setIsDatePopoverOpen(true);
  }, [currentStep]);

  // Live FX rates for the budget step (falls back to built-in rates if it fails)
  useEffect(() => {
    if (currentStep !== "budget" || rates) return;
    let cancelled = false;
    fetch("/api/fx")
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled && j?.data?.rates) setRates(j.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentStep, rates]);

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

  useEffect(() => {
    document.body.style.overflow = isGenerating ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isGenerating]);

  // ── Chat helpers ───────────────────────────────────────────────────────────

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

  /** user bubble → one or more bot bubbles → move to the next step */
  const advance = useCallback(
    async (userText: string, bot: React.ReactNode[], next: ChatStep) => {
      addMessage("user", userText);
      for (let i = 0; i < bot.length; i++) {
        await botSay(bot[i], i === 0 ? 600 : 800);
      }
      setCurrentStep(next);
    },
    [addMessage, botSay],
  );

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

  // ── Generic list helpers ───────────────────────────────────────────────────

  type ListField = "styles" | "interests";

  const toggleInList = (field: ListField, value: string, max: number) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter((v) => v !== value) };
      }
      if (list.length >= max) {
        toast.error(`You can pick up to ${max}`);
        return prev;
      }
      return { ...prev, [field]: [...list, value] };
    });
  };

  const addToList = (field: ListField, value: string, max: number) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.some((v) => v.toLowerCase() === value.toLowerCase())) {
        return prev;
      }
      if (list.length >= max) {
        toast.error(`You can add up to ${max}`);
        return prev;
      }
      return { ...prev, [field]: [...list, value] };
    });
  };

  const removeFromList = (field: ListField, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
  };

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleAddDestination = () => {
    const trimmed = destInput.trim();
    if (!trimmed) return;
    if (
      formData.destinations.some(
        (d) => d.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      toast.error("Destination already added");
      return;
    }
    if (formData.destinations.length >= LIMITS.maxDestinations) {
      toast.error(`You can add up to ${LIMITS.maxDestinations} destinations`);
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
    setFormData((prev) => ({
      ...prev,
      name: `Trip to ${prev.destinations[0]}`,
    }));
    await advance(
      formData.destinations.join(", "),
      [
        <span key="q">
          Great choice. Where will you be <strong>starting from</strong>, and
          how will you get to {formData.destinations[0]}?
        </span>,
      ],
      "origin",
    );
  };

  const handleOriginCheck = async () => {
    const q = originInput.trim();
    if (q.length < 2) {
      toast.error("Please enter your starting location");
      return;
    }
    setOriginChecking(true);
    setOriginNotFound(false);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOriginCandidate(json.data as OriginCandidate);
      } else {
        setOriginCandidate(null);
        setOriginNotFound(true);
      }
    } catch {
      setOriginCandidate(null);
      setOriginNotFound(true);
    } finally {
      setOriginChecking(false);
    }
  };

  const handleOriginConfirm = async (candidate: OriginCandidate | null) => {
    const name = originInput.trim();
    const origin: Origin = candidate
      ? {
          name,
          lat: candidate.lat,
          lng: candidate.lng,
          country: candidate.country,
        }
      : { name };
    setFormData((prev) => ({ ...prev, origin }));
    const outboundLabel = OUTBOUND_OPTIONS.find(
      (o) => o.value === formData.outbound,
    )?.label;
    await advance(
      `${name} · ${outboundLabel}`,
      [<span key="q">Got it. Now pick your travel dates below.</span>],
      "dates",
    );
  };

  const timingQuestion = (
    <span key="timing">
      When will you <strong>arrive</strong> in {formData.destinations[0]}, and
      when do you need to <strong>head back</strong>? This tells me how much of
      the first and last day I can use.
    </span>
  );

  const handleDateConfirm = async () => {
    const { from, to } = dateRange;
    if (!from || !to) {
      toast.error("Please select travel dates");
      return;
    }
    const days = differenceInDays(to, from) + 1;
    if (days > LIMITS.maxDays) {
      toast.error(`Trips can be at most ${LIMITS.maxDays} days`);
      return;
    }
    const start = format(from, "MMM d, yyyy");
    const end = format(to, "MMM d, yyyy");
    const needSplit =
      formData.destinations.length > 1 && days >= formData.destinations.length;

    setFormData((prev) => ({
      ...prev,
      startDate: format(from, "yyyy-MM-dd"),
      endDate: format(to, "yyyy-MM-dd"),
      duration: days,
      destinationDays: [],
    }));
    if (needSplit) setSplit(evenSplit(days, formData.destinations.length));
    setIsDatePopoverOpen(false);

    const confirmMsg = (
      <span key="c">
        Perfect!{" "}
        <strong>
          {days} {days === 1 ? "day" : "days"}
        </strong>{" "}
        from <strong>{start}</strong> to <strong>{end}</strong>.
      </span>
    );

    await advance(
      `${start} → ${end} (${days} ${days === 1 ? "day" : "days"})`,
      needSplit
        ? [
            confirmMsg,
            <span key="s">
              You have {formData.destinations.length} destinations. How should
              we split the {days} days?
            </span>,
          ]
        : [confirmMsg, timingQuestion],
      needSplit ? "split" : "timing",
    );
  };

  const handleSplitConfirm = async (letAIDecide: boolean) => {
    const destinationDays = letAIDecide
      ? []
      : formData.destinations.map((name, i) => ({ name, days: split[i] }));
    setFormData((prev) => ({ ...prev, destinationDays }));
    await advance(
      letAIDecide
        ? "Let AI decide"
        : destinationDays.map((d) => `${d.name} ${d.days}d`).join(", "),
      [timingQuestion],
      "timing",
    );
  };

  const handleTimingConfirm = async () => {
    const arr = TIME_SLOTS.find((s) => s.value === formData.arrivalTime)?.label;
    const dep = TIME_SLOTS.find(
      (s) => s.value === formData.departureTime,
    )?.label;
    await advance(
      `Arrive ${arr?.toLowerCase()}, leave ${dep?.toLowerCase()}`,
      [
        <span key="q">
          Who is travelling? This changes costs and the kind of places I pick.
        </span>,
      ],
      "travelers",
    );
  };

  const setPartyCount = (adults: number, children: number, pets: number) => {
    setFormData((prev) => ({ ...prev, adults, children, pets }));
  };

  const handleTravelersConfirm = async () => {
    const { adults, children, pets } = formData;
    await advance(
      `${adults} adult${adults === 1 ? "" : "s"}${children ? `, ${children} child${children === 1 ? "" : "ren"}` : ""}${pets ? `, ${pets} pet${pets === 1 ? "" : "s"}` : ""}`,
      [
        <span key="q">
          What <strong>kind of trip</strong> do you want? Pick up to{" "}
          {LIMITS.maxStyles} styles, or add your own.
        </span>,
      ],
      "vibe",
    );
  };

  const handleVibeConfirm = async () => {
    const parts = [...formData.styles, ...formData.interests];
    await advance(
      parts.length > 0 ? parts.join(", ") : "Open to anything",
      [
        <span key="q">
          Almost there. How do you like to travel — <strong>pace</strong>,{" "}
          <strong>hotel level</strong>, and how you get around once you arrive?
        </span>,
      ],
      "preferences",
    );
  };

  const handlePreferencesConfirm = async () => {
    // Pre-fill currency + a sensible starting amount (~USD 1,500 equivalent)
    const cur = COUNTRY_CURRENCY[formData.origin.country || ""] || "USD";
    setBudgetCurrency(cur);
    setBudgetAmount(niceRound(1500 * unitsPerUSD(cur)));

    const stay = formData.stayLevel;
    await advance(
      `${formData.pace} pace · ${stay} stay · ${formData.localTransport}`,
      [
        <span key="q">
          Now the <strong>budget</strong>. Tell me the total, whether it covers
          flights, and anything you have already booked.
        </span>,
      ],
      "budget",
    );
  };

  const handleCurrencyChange = (next: string) => {
    if (next === budgetCurrency) return;
    const usd = budgetAmount / unitsPerUSD(budgetCurrency);
    setBudgetCurrency(next);
    setBudgetAmount(niceRound(usd * unitsPerUSD(next)));
    setFlightAmount("");
  };

  const handleBudgetConfirm = async () => {
    if (!budgetAmount || budgetAmount <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }
    const includesFlights =
      formData.outbound === "flight" ? formData.includesFlights : false;
    const flightBudget = includesFlights ? Number(flightAmount) : undefined;
    if (
      formData.outbound === "flight" &&
      typeof includesFlights !== "boolean"
    ) {
      toast.error("Please choose whether your budget includes flights");
      return;
    }
    if (
      includesFlights &&
      (!flightAmount.trim() ||
        flightBudget === undefined ||
        !isFinite(flightBudget) ||
        flightBudget < 0)
    ) {
      toast.error("Please enter the flight expense");
      return;
    }
    if (flightBudget !== undefined && flightBudget > budgetAmount) {
      toast.error("The flight expense can't be more than your budget");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      budget: budgetAmount,
      currency: budgetCurrency,
      includesFlights,
      flightBudget,
      prebooked: [],
    }));

    const usd = budgetAmount / unitsPerUSD(budgetCurrency);
    const display = formatMoney(budgetAmount, budgetCurrency);
    const flightsNote = formData.includesFlights
      ? "including flights"
      : "not including flights";
    await advance(
      `${display} (${flightsNote})`,
      [
        <span key="a">
          Noted — <strong>{display}</strong>
          {budgetCurrency !== "USD"
            ? ` (about $${Math.round(usd).toLocaleString()})`
            : ""}
          , {flightsNote}.
        </span>,
        <span key="q">
          Last thing, all optional: food needs, places you <strong>must</strong>{" "}
          see, things to <strong>avoid</strong>, or any other notes.
        </span>,
      ],
      "extras",
    );
  };

  const handleExtrasConfirm = async () => {
    const bits = [formData.comment.trim()].filter(Boolean);
    await advance(
      bits.length ? bits.join(" | ") : "Nothing else",
      [
        <span key="q">
          Thanks. I have everything I need to prepare your itinerary.
        </span>,
      ],
      "summary",
    );
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
      // duration is intentionally NOT sent: the server derives it from the dates
      const payload = {
        name: formData.name,
        destinations: formData.destinations,
        destinationDays: formData.destinationDays,
        origin: formData.origin,
        outbound: formData.outbound,
        startDate: formData.startDate,
        endDate: formData.endDate,
        arrivalTime: formData.arrivalTime,
        departureTime: formData.departureTime,
        adults: formData.adults,
        children: formData.children,
        pets: formData.pets,
        styles: formData.styles,
        interests: formData.interests,
        pace: formData.pace,
        stayLevel: formData.stayLevel,
        localTransport: formData.localTransport,
        budget: formData.budget,
        currency: formData.currency,
        includesFlights: formData.includesFlights,
        flightBudget: formData.flightBudget,
        prebooked: formData.prebooked,
        comment: formData.comment,
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
    if (currentStep === "generating" || currentStep === "welcome") return null;

    // 1 — Destinations
    if (currentStep === "destination") {
      return (
        <div className="flex flex-col gap-3">
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
                    if (destInput.trim()) handleAddDestination();
                    else if (formData.destinations.length > 0)
                      handleDestinationConfirm();
                  }
                }}
                placeholder="e.g. Paris, Kumrat Valley, Tokyo..."
                className={`${inputCls} pl-9`}
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

          <ContinueButton
            onClick={handleDestinationConfirm}
            disabled={formData.destinations.length === 0}
          />
        </div>
      );
    }

    // 2 — Origin (+ how you get there)
    if (currentStep === "origin") {
      return (
        <div className="space-y-3">
          <div>
            <SectionLabel>Starting from</SectionLabel>
            {originCandidate ? (
              <div className="flex items-start gap-2.5 p-3 bg-accent border border-primary/20 rounded-xl">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    Is this right?
                  </p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {originCandidate.displayName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOriginCandidate(null)}
                  className="text-xs text-primary hover:underline flex-shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={originInput}
                  onChange={(e) => {
                    setOriginInput(e.target.value);
                    setOriginNotFound(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleOriginCheck();
                    }
                  }}
                  placeholder="e.g. Islamabad, Pakistan"
                  className={`${inputCls} pl-9`}
                />
              </div>
            )}
            {originNotFound && !originCandidate && (
              <p className="text-xs text-muted-foreground mt-1.5">
                I couldn&apos;t verify that place. Try adding the country, or
                continue anyway.
              </p>
            )}
          </div>

          <div>
            <SectionLabel>
              How will you get to {formData.destinations[0]}?
            </SectionLabel>
            <div className="grid grid-cols-4 gap-2">
              {OUTBOUND_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, outbound: o.value }))
                  }
                  className={cardCls(formData.outbound === o.value)}
                >
                  <span className="text-xl">{o.emoji}</span>
                  <span className="text-xs font-medium">{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {originCandidate ? (
            <ContinueButton
              onClick={() => handleOriginConfirm(originCandidate)}
            >
              Yes, continue
            </ContinueButton>
          ) : originNotFound ? (
            <ContinueButton onClick={() => handleOriginConfirm(null)}>
              Continue anyway
            </ContinueButton>
          ) : (
            <ContinueButton
              onClick={handleOriginCheck}
              loading={originChecking}
              disabled={originInput.trim().length < 2}
            >
              Check location
            </ContinueButton>
          )}
        </div>
      );
    }

    // 3 — Dates
    if (currentStep === "dates") {
      const days =
        dateRange.from && dateRange.to
          ? differenceInDays(dateRange.to, dateRange.from) + 1
          : 0;

      return (
        <div className="space-y-3">
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
              {/* No auto-confirm: tapping a day never ends the step. The user
                  presses Continue when the range is what they want. */}
              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={(range) =>
                  setDateRange(range ?? { from: undefined, to: undefined })
                }
                numberOfMonths={calendarMonths}
                disabled={{ before: startOfToday() }}
              />
            </PopoverContent>
          </Popover>

          <p className="text-xs text-muted-foreground">
            Tap your first day, then your last day. One tap on its own means a
            1-day trip.
          </p>

          <ContinueButton
            onClick={handleDateConfirm}
            disabled={!dateRange.from || !dateRange.to}
          />
        </div>
      );
    }

    // 3b — Days per destination (only with 2+ destinations)
    if (currentStep === "split") {
      const total = split.reduce((a, b) => a + b, 0);
      const n = formData.destinations.length;
      const maxEach = Math.max(1, formData.duration - (n - 1));
      const ok = total === formData.duration;
      return (
        <div className="space-y-3">
          <div className="space-y-2">
            {formData.destinations.map((d, i) => (
              <Stepper
                key={d}
                label={d}
                value={split[i] ?? 1}
                min={1}
                max={maxEach}
                onChange={(v) =>
                  setSplit((prev) => prev.map((x, j) => (j === i ? v : x)))
                }
              />
            ))}
          </div>
          <p
            className={`text-xs ${ok ? "text-muted-foreground" : "text-destructive"}`}
          >
            {total} of {formData.duration} days assigned
            {ok ? "" : " — the days need to add up exactly"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSplitConfirm(true)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border bg-white text-muted-foreground hover:border-primary/40 transition-colors"
            >
              Let AI decide
            </button>
            <div className="flex-1">
              <ContinueButton
                onClick={() => handleSplitConfirm(false)}
                disabled={!ok}
              >
                Use this
              </ContinueButton>
            </div>
          </div>
        </div>
      );
    }

    // 4 — Arrival / departure timing
    if (currentStep === "timing") {
      const group = (label: string, field: "arrivalTime" | "departureTime") => (
        <div>
          <SectionLabel>{label}</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, [field]: s.value }))
                }
                className={cardCls(formData[field] === s.value)}
              >
                <span className="text-xs font-medium">{s.label}</span>
                <span className="text-[10px] opacity-70">{s.hint}</span>
              </button>
            ))}
          </div>
        </div>
      );
      return (
        <div className="space-y-4">
          {group(`Arriving in ${formData.destinations[0]}`, "arrivalTime")}
          {group("Leaving for home", "departureTime")}
          <ContinueButton onClick={handleTimingConfirm} />
        </div>
      );
    }

    // 5 — Who
    if (currentStep === "travelers") {
      return (
        <div className="space-y-3">
          <Stepper
            label="Adults"
            value={formData.adults}
            min={1}
            max={LIMITS.maxAdults}
            onChange={(v) => setPartyCount(v, formData.children, formData.pets)}
          />
          <Stepper
            label="Children"
            value={formData.children}
            min={0}
            max={LIMITS.maxChildren}
            onChange={(v) => setPartyCount(formData.adults, v, formData.pets)}
          />
          <Stepper
            label="Pets"
            value={formData.pets}
            min={0}
            max={LIMITS.maxPets}
            onChange={(v) =>
              setPartyCount(formData.adults, formData.children, v)
            }
          />
          <ContinueButton onClick={handleTravelersConfirm} />
        </div>
      );
    }

    // 6 — Vibe + interests (with "add your own")
    if (currentStep === "vibe") {
      const customStyles = formData.styles.filter(
        (s) => !STYLE_OPTIONS.some((o) => o.value === s),
      );
      const customInterests = formData.interests.filter(
        (i) => !INTEREST_OPTIONS.includes(i),
      );
      return (
        <div className="space-y-4">
          <div>
            <SectionLabel>
              Trip style (up to {LIMITS.maxStyles}) — {formData.styles.length}{" "}
              picked
            </SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    toggleInList("styles", s.value, LIMITS.maxStyles)
                  }
                  className={cardCls(formData.styles.includes(s.value))}
                >
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-xs font-medium text-center">
                    {s.value}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 space-y-2">
              <RemovableChips
                items={customStyles}
                onRemove={(v) => removeFromList("styles", v)}
              />
              <ChipAdder
                placeholder="Add your own style, e.g. Sufi shrines"
                onAdd={(v) => addToList("styles", v, LIMITS.maxStyles)}
                disabled={formData.styles.length >= LIMITS.maxStyles}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Interests</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    toggleInList("interests", i, LIMITS.maxInterests)
                  }
                  className={chipCls(formData.interests.includes(i))}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="mt-2 space-y-2">
              <RemovableChips
                items={customInterests}
                onRemove={(v) => removeFromList("interests", v)}
              />
              <ChipAdder
                placeholder="Add your own interest"
                onAdd={(v) => addToList("interests", v, LIMITS.maxInterests)}
                disabled={formData.interests.length >= LIMITS.maxInterests}
              />
            </div>
          </div>

          <ContinueButton onClick={handleVibeConfirm} />
        </div>
      );
    }

    // 7 — Pace / stay / getting around
    if (currentStep === "preferences") {
      return (
        <div className="space-y-4">
          <div>
            <SectionLabel>Trip pace</SectionLabel>
            <div className="flex gap-2">
              {(
                [
                  ["slow", "🐢 Slow"],
                  ["moderate", "🚶 Moderate"],
                  ["fast", "⚡ Fast"],
                ] as [TripPace, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, pace: v }))}
                  className={segCls(formData.pace === v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Stay level</SectionLabel>
            <div className="flex gap-2">
              {(
                [
                  ["budget", "🏕️ Budget"],
                  ["mid-range", "🏨 Mid-range"],
                  ["luxury", "🏰 Luxury"],
                ] as [Accommodation, string][]
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, stayLevel: v }))}
                  className={segCls(formData.stayLevel === v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Getting around once there</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {LOCAL_TRANSPORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, localTransport: o.value }))
                  }
                  className={segCls(formData.localTransport === o.value)}
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          <ContinueButton onClick={handlePreferencesConfirm} />
        </div>
      );
    }

    // 8 — Budget (currency-aware, with scope + already-booked)
    if (currentStep === "budget") {
      const rate = unitsPerUSD(budgetCurrency);
      const scale = budgetScale(rate);
      const usd = budgetAmount / rate;
      const people = Math.max(1, formData.adults + formData.children);
      const perPersonPerDay = usd / (people * Math.max(1, formData.duration));
      const tooLow = budgetAmount > 0 && perPersonPerDay < 25;

      return (
        <div className="space-y-4">
          <div>
            <SectionLabel>Currency</SectionLabel>
            <Select value={budgetCurrency} onValueChange={handleCurrencyChange}>
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

          <div>
            <SectionLabel>Total budget for the whole group</SectionLabel>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                {currencySymbol(budgetCurrency)}
              </span>
              <input
                type="number"
                min={0}
                value={budgetAmount || ""}
                onChange={(e) => setBudgetAmount(Number(e.target.value) || 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleBudgetConfirm();
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent bg-white"
              />
            </div>
            {budgetCurrency !== "USD" && budgetAmount > 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                ≈ ${Math.round(usd).toLocaleString()} USD
                {rates && !rates.live ? " (approximate rate)" : ""}
              </p>
            )}
            {tooLow && (
              <p className="text-xs text-destructive mt-1.5">
                That is under $25 per person per day, which is very tight for a
                trip that includes travel. The plan may need to cut things.
              </p>
            )}
          </div>

          <div className="px-1 space-y-2">
            <Slider
              min={scale.min}
              max={scale.max}
              step={scale.step}
              value={[Math.min(Math.max(budgetAmount, scale.min), scale.max)]}
              onValueChange={([v]) => setBudgetAmount(v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatMoney(scale.min, budgetCurrency)}</span>
              <span>{formatMoney(scale.max, budgetCurrency)}</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {scale.presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBudgetAmount(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  budgetAmount === preset
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {formatMoney(preset, budgetCurrency)}
              </button>
            ))}
          </div>

          {formData.outbound === "flight" && (
            <div>
              <SectionLabel>Does this budget include flights?</SectionLabel>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, includesFlights: true }))
                  }
                  className={segCls(formData.includesFlights === true)}
                >
                  Yes, include flights
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      includesFlights: false,
                      flightBudget: undefined,
                    }))
                  }
                  className={segCls(formData.includesFlights === false)}
                >
                  No, already paid
                </button>
              </div>
              {formData.includesFlights === true && (
                <input
                  type="number"
                  min={0}
                  value={flightAmount}
                  onChange={(e) => setFlightAmount(e.target.value)}
                  placeholder={`Flight expense in ${budgetCurrency}`}
                  className={`${inputCls} mt-2`}
                />
              )}
            </div>
          )}

          <ContinueButton onClick={handleBudgetConfirm} />
        </div>
      );
    }

    // 9 — Optional extras
    if (currentStep === "extras") {
      return (
        <div className="space-y-4">
          <div>
            <SectionLabel>Anything else?</SectionLabel>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData((p) => ({ ...p, comment: e.target.value }))
              }
              placeholder="e.g. It's my parents' first trip abroad, so keep walking light. We want time for prayer."
              rows={3}
              maxLength={2000}
              className="w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 text-sm leading-relaxed focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <ContinueButton onClick={handleExtrasConfirm} />
        </div>
      );
    }

    // 10 — Summary
    if (currentStep === "summary") {
      const timeLabel = (v: TimeSlot) =>
        TIME_SLOTS.find((s) => s.value === v)?.label.toLowerCase();
      const row = (Icon: React.ElementType, text: React.ReactNode) => (
        <div className="flex items-start gap-1.5 text-muted-foreground min-w-0">
          <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
          <span className="min-w-0 break-words">{text}</span>
        </div>
      );
      const tags = [...formData.styles, ...formData.interests];
      return (
        <div className="space-y-3">
          <div className="bg-muted border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Trip Summary
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {row(
                MapPin,
                <span className="font-medium">
                  {formData.destinations.join(", ")}
                </span>,
              )}
              {row(
                Plane,
                `From ${formData.origin.name} · ${formData.outbound}`,
              )}
              {row(
                CalendarIcon,
                `${formData.duration} ${formData.duration === 1 ? "day" : "days"} · arrive ${timeLabel(formData.arrivalTime)}, leave ${timeLabel(formData.departureTime)}`,
              )}
              {row(
                Users,
                `${formData.adults} adult${formData.adults === 1 ? "" : "s"}${formData.children ? `, ${formData.children} child${formData.children === 1 ? "" : "ren"}` : ""}${formData.pets ? `, ${formData.pets} pet${formData.pets === 1 ? "" : "s"}` : ""}`,
              )}
              {row(
                Wallet,
                `${formatMoney(formData.budget, formData.currency)} ${formData.currency}${formData.includesFlights ? "" : " (excl. flights)"}`,
              )}
              {row(Zap, `${formData.pace} pace · ${formData.stayLevel} stay`)}
            </div>
            {formData.destinationDays.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Split:{" "}
                {formData.destinationDays
                  .map((d) => `${d.name} ${d.days}d`)
                  .join(", ")}
              </p>
            )}
            {formData.prebooked.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Already booked:{" "}
                {formData.prebooked.map((p) => p.type).join(", ")}
              </p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-border">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-accent text-primary rounded-full text-xs border border-primary/20"
                  >
                    {t}
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
        </div>
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

        <MobileProgressBar formData={formData} currentStep={currentStep} />

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

        {/* Input area — scrolls internally so tall steps (vibe, budget, extras)
            never push the chat off small screens */}
        <div className="bg-white border-t border-border px-4 py-3 flex-shrink-0 max-h-[65dvh] overflow-y-auto">
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

      <div className="hidden lg:block w-80 flex-shrink-0 border-l border-border overflow-y-auto overflow-x-hidden p-4">
        <TripSoFarPanel formData={formData} currentStep={currentStep} />
      </div>

      <GeneratingOverlay
        visible={isGenerating}
        destinations={formData.destinations}
        duration={formData.duration}
        activeStep={genStepIndex}
      />
    </div>
  );
}
