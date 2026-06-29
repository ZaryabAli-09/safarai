"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import {
  Send,
  MapPin,
  Calendar,
  Wallet,
  Users,
  Sparkles,
  Loader2,
  Bot,
  CheckCircle2,
  X,
} from "lucide-react";

// Chat message type
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

// Collected trip data
interface TripData {
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  travelers: number;
  tripType: string;
  interests: string[];
  accommodation: string;
  tripPace: string;
}

// Options
const TRIP_TYPES = [
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
  { value: "relaxation", label: "Relaxation" },
  { value: "family", label: "Family" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "solo", label: "Solo" },
];

const ACCOMMODATION_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-range" },
  { value: "luxury", label: "Luxury" },
];

const TRIP_PACES = [
  { value: "relaxed", label: "Relaxed" },
  { value: "moderate", label: "Moderate" },
  { value: "fast", label: "Fast-paced" },
];

const INTERESTS = [
  "hiking",
  "photography",
  "food",
  "history",
  "culture",
  "nature",
  "adventure",
  "shopping",
  "nightlife",
  "wildlife",
];

export default function NewTrip() {
  const router = useRouter();
  const { data: session } = useSession();
  const userid = session?.user?._id;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Hi! I'm your AI travel planner. I'll help you create the perfect trip!\n\nLet's start - **what's the name of your trip?** (e.g., Dubai Adventure)",
    },
  ]);

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(0);
  const [tripData, setTripData] = useState<TripData>({
    name: "",
    destinations: [],
    startDate: "",
    endDate: "",
    duration: 0,
    budget: 500,
    travelers: 1,
    tripType: "",
    interests: [],
    accommodation: "mid-range",
    tripPace: "moderate",
  });

  // Steps in the conversation
  const steps = [
    {
      key: "name",
      question: "What's the name of your trip?",
      field: "name" as const,
    },
    {
      key: "destination",
      question: "Where would you like to travel? (city, country)",
      field: "destinations" as const,
      isArray: true,
    },
    {
      key: "startDate",
      question: "When do you want to start your trip? (YYYY-MM-DD)",
      field: "startDate" as const,
    },
    {
      key: "endDate",
      question: "When does your trip end? (YYYY-MM-DD)",
      field: "endDate" as const,
    },
    {
      key: "budget",
      question: "What's your estimated budget in USD?",
      field: "budget" as const,
      isNumber: true,
    },
    {
      key: "travelers",
      question: "How many travelers?",
      field: "travelers" as const,
      isNumber: true,
    },
    {
      key: "type",
      question: "What type of trip?",
      field: "tripType" as const,
      isSelect: true,
      options: TRIP_TYPES,
    },
    {
      key: "accommodation",
      question: "What accommodation preference?",
      field: "accommodation" as const,
      isSelect: true,
      options: ACCOMMODATION_OPTIONS,
    },
    {
      key: "pace",
      question: "What's your preferred pace?",
      field: "tripPace" as const,
      isSelect: true,
      options: TRIP_PACES,
    },
    {
      key: "interests",
      question: "What are your interests? (select multiple)",
      field: "interests" as const,
      isMulti: true,
      options: INTERESTS,
    },
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Calculate duration when dates are set
  useEffect(() => {
    if (tripData.startDate && tripData.endDate) {
      const start = new Date(tripData.startDate);
      const end = new Date(tripData.endDate);
      const days =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      setTripData((prev) => ({ ...prev, duration: Math.max(1, days) }));
    }
  }, [tripData.startDate, tripData.endDate]);

  const addMessage = (
    role: "user" | "assistant",
    content: string,
    isLoading = false,
  ) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role, content, isLoading },
    ]);
  };

  const updateLastAssistantMessage = (content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          content,
          isLoading: false,
        };
      }
      return newMessages;
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userInput = input.trim();
    setInput("");
    addMessage("user", userInput);

    const currentStep = steps[step];

    // Process the input based on current step
    if (currentStep.isArray) {
      // Handle array fields (like destinations)
      setTripData((prev) => ({
        ...prev,
        [currentStep.field]: [
          ...(prev[currentStep.field as keyof TripData] as string[]),
          userInput,
        ],
      }));
    } else if (currentStep.isNumber) {
      // Handle number fields
      const num = parseInt(userInput);
      if (isNaN(num)) {
        addMessage("assistant", "Please enter a valid number.");
        return;
      }
      setTripData((prev) => ({ ...prev, [currentStep.field]: num }));
    } else if (currentStep.isSelect) {
      // Handle select fields - user should choose from options
      const option = currentStep.options?.find(
        (o) =>
          o.label.toLowerCase() === userInput.toLowerCase() ||
          o.value.toLowerCase() === userInput.toLowerCase(),
      );
      if (option) {
        setTripData((prev) => ({ ...prev, [currentStep.field]: option.value }));
      } else {
        addMessage(
          "assistant",
          `Please choose from: ${currentStep.options?.map((o) => o.label).join(", ")}`,
        );
        return;
      }
    } else {
      // Handle regular text fields
      setTripData((prev) => ({ ...prev, [currentStep.field]: userInput }));
    }

    // Move to next step
    if (step < steps.length - 1) {
      const nextStep = steps[step + 1];
      addMessage("assistant", `Got it! ${nextStep.question}`, true);
      setStep(step + 1);
    } else {
      // All steps complete - generate trip
      addMessage(
        "assistant",
        "🎉 Perfect! I have all the information I need. Let me generate your trip...",
        true,
      );
      await generateTrip();
    }
  };

  const handleSelectOption = (value: string, optionValue?: string) => {
    const currentStep = steps[step];

    if (currentStep.isMulti && currentStep.options) {
      // Handle multi-select (interests)
      const current = tripData[currentStep.field as keyof TripData] as string[];
      const newValue = current.includes(optionValue || value)
        ? current.filter((i) => i !== (optionValue || value))
        : [...current, optionValue || value];
      setTripData((prev) => ({ ...prev, [currentStep.field]: newValue }));
    } else {
      // Handle single select
      setTripData((prev) => ({
        ...prev,
        [currentStep.field]: optionValue || value,
      }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    const current = tripData.interests;
    const newInterests = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
    setTripData((prev) => ({ ...prev, interests: newInterests }));
  };

  const generateTrip = async () => {
    if (!userid) return;

    setIsGenerating(true);
    try {
      const res = await fetch(`/api/trip/generate/${userid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      const result = await res.json();

      if (!res.ok) {
        updateLastAssistantMessage(
          result.message || "Failed to generate trip. Please try again.",
        );
        toast.error(result.message || "Failed to generate trip");
        return;
      }

      updateLastAssistantMessage(
        "🎉 **Your trip has been generated!**\n\nCheck your trips to see the full itinerary with day-by-day activities, budget breakdown, packing list, and travel tips!",
      );

      setTimeout(() => {
        router.push("/app/trips");
      }, 2000);
    } catch (error) {
      updateLastAssistantMessage("Something went wrong. Please try again.");
      toast.error((error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl h-[calc(100vh-120px)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Plan Your Trip with AI
          </CardTitle>
        </CardHeader>

        {/* Progress indicator */}
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Step {step + 1} of {steps.length}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          {currentStep?.isSelect && !currentStep.isMulti ? (
            // Show buttons for select options
            <div className="space-y-3">
              <p className="text-sm font-medium">{currentStep.question}</p>
              <div className="flex flex-wrap gap-2">
                {currentStep.options?.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={
                      tripData[currentStep.field as keyof TripData] ===
                      opt.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleSelectOption(opt.label, opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : currentStep?.isMulti ? (
            // Show multi-select for interests
            <div className="space-y-3">
              <p className="text-sm font-medium">{currentStep.question}</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <Button
                    key={interest}
                    variant={
                      tripData.interests.includes(interest)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
              {tripData.interests.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (step < steps.length - 1) {
                        setStep(step + 1);
                        addMessage("assistant", steps[step + 1].question, true);
                      } else {
                        addMessage(
                          "assistant",
                          "🎉 Perfect! Let me generate your trip...",
                          true,
                        );
                        generateTrip();
                      }
                    }}
                  >
                    {isLastStep ? "Generate Trip" : "Continue"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Text input
            <div className="flex gap-2">
              <Input
                placeholder={currentStep?.question || "Type your answer..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isGenerating}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isGenerating || !input.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Trip Summary Preview */}
      {(tripData.name || tripData.destinations.length > 0) && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Trip Summary
            </h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {tripData.name && (
                <Badge variant="secondary">📌 {tripData.name}</Badge>
              )}
              {tripData.destinations.map((d) => (
                <Badge key={d} variant="outline">
                  📍 {d}
                </Badge>
              ))}
              {tripData.duration > 0 && (
                <Badge variant="outline">📅 {tripData.duration} days</Badge>
              )}
              {tripData.budget > 0 && (
                <Badge variant="outline">💰 ${tripData.budget}</Badge>
              )}
              {tripData.travelers > 0 && (
                <Badge variant="outline">
                  👥 {tripData.travelers} travelers
                </Badge>
              )}
              {tripData.tripType && (
                <Badge variant="outline">🏷️ {tripData.tripType}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
