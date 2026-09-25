/**
 * Central type registry for SafarAI.
 *
 * Every shared / domain type lives here so the shape of the app can be read in
 * one place. Purely local, single-use UI prop types stay with their components.
 *
 * Organized bottom-up along the data flow:
 *   vocabulary → creation input → wizard → AI pipeline → views → database.
 */

import type { ReactNode } from "react";
import type { Types } from "mongoose";

// ─── Database models ──────────────────────────────────────────────────────────

/** A user document in MongoDB. */
export interface IUser {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  gender?: string;
  dob?: string;
  avatar?: string;
  role?: "user" | "admin"; // Optional role field with default value
  isVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/** An itinerary activity as stored in the trip document. */
export interface IActivity {
  id: string;
  timeOfDay: string; // "morning" | "afternoon" | "evening"
  title: string;
  description: string;
  location?: string;
  venue?: string; // Specific place name (e.g., "Faisal Mosque")
  city?: string; // City name (e.g., "Islamabad")
  country?: string; // Country name (e.g., "Pakistan")
  coordinates?: { lat: number; lng: number };
  estimatedCost: string;
  duration?: string;
  category?: string;
  weather?: {
    temp?: string;
    condition?: string;
    icon?: string;
  };
  image?: {
    url: string;
    attribution?: string;
  };
}

/** A day of the itinerary as stored in the trip document. */
export interface IDayItinerary {
  dayNumber: number;
  date?: string;
  title: string;
  location: string;
  activities: IActivity[];
}

/** Budget split persisted on the trip document. */
export interface IBudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

/** Trip summary persisted on the trip document. */
export interface ITripSummary {
  totalDays: number;
  destinations: string[];
  estimatedBudget: string;
  bestSeason?: string;
  travelStyle?: string;
  familyFriendly?: boolean;
}

/** A trip document in MongoDB (dates as `Date`, ids as ObjectId). */
export interface ITrip {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  destinations: string[];
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: number;
  currency: string;
  origin?: { name: string; lat?: number; lng?: number; country?: string };
  outbound: string;
  arrivalTime: string;
  departureTime: string;
  adults: number;
  children: number;
  pets: number;
  styles: string[];
  pace: string;
  stayLevel: string;
  localTransport: string;
  destinationDays: { name: string; days: number }[];
  interests: string[];
  comment: string;
  budgetUSD?: number; // computed server-side from budget + currency
  includesFlights?: boolean;
  flightBudget?: number;
  prebooked?: { type: "flight"; amount?: number }[];
  itinerary: IDayItinerary[];
  summary: ITripSummary;
  budgetBreakdown: IBudgetBreakdown;
  packingList: string[];
  travelTips: string[];
  aiNotes: string;
  status: "generating" | "completed" | "draft";
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Trip vocabulary ──────────────────────────────────────────────────────────

/** How fast-paced the days should be. */
export type TripPace = "slow" | "moderate" | "fast";

/** Accommodation tier the traveller wants. */
export type Accommodation = "budget" | "mid-range" | "luxury";

/** How the group covers the long distance to the first destination. */
export type Outbound = "flight" | "road" | "train" | "bus";

/** Primary way of getting around once at the destination. */
export type LocalTransport =
  | "taxi"
  | "rental"
  | "own-car"
  | "public"
  | "walking";

/** Arrival / departure slot used to weigh the first and last day. */
export type TimeSlot = "morning" | "afternoon" | "evening" | "night";

/** Where the trip starts — coordinates are optional until geocoded. */
export interface Origin {
  name: string;
  lat?: number;
  lng?: number;
  country?: string;
}

/** An already-paid expense that must not be double-counted in the budget. */
export interface Prebooked {
  type: "flight";
  amount?: number;
}

/** Days allocated to one stop of a multi-destination trip. */
export interface DestinationDays {
  name: string;
  days: number;
}

// ─── Trip creation input ──────────────────────────────────────────────────────

/**
 * The validated, sanitized trip payload produced by `sanitizeTripInput` and
 * consumed by the generate route / AI pipeline (dates as `Date`, bounded
 * numbers, enum-constrained preferences).
 */
export interface SanitizedTrip {
  name: string;
  destinations: string[];
  destinationDays: DestinationDays[];
  origin: Origin;
  outbound: Outbound;
  startDate: Date;
  endDate: Date;
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
  includesFlights: boolean;
  flightBudget?: number;
  prebooked: Prebooked[];
  comment: string;
}

/** Result of sanitizing the raw new-trip payload — either data or an error. */
export type SanitizeResult =
  | { ok: true; data: SanitizedTrip }
  | { ok: false; error: string };

// ─── New trip wizard ──────────────────────────────────────────────────────────

/** Everything the chat-style new-trip wizard collects before generating. */
export interface TripFormData {
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

/** The wizard is driven by these ordered steps (plus the initial welcome). */
export type ChatStep =
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

/** One message in the planner conversation — bot or traveller. */
export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: ReactNode;
  timestamp: Date;
}

/** A geocoded starting-point suggestion returned by `/api/geocode`. */
export interface OriginCandidate {
  displayName: string;
  lat: number;
  lng: number;
  country: string;
}

// ─── AI pipeline ──────────────────────────────────────────────────────────────

/** Sanitized trip plus its precomputed USD budget — the AI prompt input. */
export interface TripAIInput extends SanitizedTrip {
  budgetUSD: number;
}

/** One activity as returned by the AI before it is normalized. */
export interface GeneratedActivity {
  id?: string;
  timeOfDay?: string;
  title?: string;
  description?: string;
  location?: string;
  venue?: string;
  city?: string;
  country?: string;
  estimatedCost?: string;
  duration?: string;
  category?: string;
  [key: string]: unknown;
}

/** One day of the AI-generated itinerary, before normalization. */
export interface GeneratedDay {
  dayNumber?: number;
  date?: string;
  title?: string;
  location?: string;
  activities?: GeneratedActivity[];
  [key: string]: unknown;
}

/** Raw itinerary bundle returned by `generateTripItinerary`. */
export interface AIItineraryResult {
  itinerary: GeneratedDay[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  budgetBreakdown?: any;
  packingList?: string[];
  travelTips?: string[];
  aiNotes?: string;
}

// ─── Trip list & filters ──────────────────────────────────────────────────────

/**
 * Trip as returned by the trips list API and rendered on cards — a lighter
 * projection where the itinerary only carries activity images.
 */
export interface TripListItem {
  _id: string;
  name: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  currency: string;
  styles?: string[];
  adults?: number;
  children?: number;
  status: "generating" | "completed" | "draft";
  createdAt: string;
  itinerary?: Array<{
    activities?: Array<{
      image?: {
        url: string;
      };
    }>;
  }>;
}

/** Active filter/search state shared by the sidebar, sheet and trips page. */
export interface TripFilters {
  searchTerm: string;
  sortBy: "latest" | "oldest" | "a-z" | "z-a";
  statusFilter: "all" | "ready" | "draft" | "in-progress";
  styleFilter: string[];
  durationRange: [number, number];
  budgetRange: [number, number];
}

/** Cursorless pagination metadata returned by the trips list API. */
export interface PaginationData {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// ─── Trip detail view ─────────────────────────────────────────────────────────

/** A single planned activity as displayed on the trip detail page. */
export interface Activity {
  id: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  title: string;
  description: string;
  location?: string;
  venue?: string;
  city?: string;
  country?: string;
  estimatedCost: string;
  duration?: string;
  category?: string;
  weather?: { temp?: string; condition?: string; icon?: string };
  coordinates?: { lat: number; lng: number };
  image?: { url: string; attribution?: string };
}

/** One day of the itinerary as displayed on the trip detail page. */
export interface DayItinerary {
  dayNumber: number;
  date?: string;
  title: string;
  location: string;
  activities: Activity[];
}

/** Per-category budget split shown in the detail page's breakdown bars. */
export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

/** AI-written trip summary card (season, style, family friendliness). */
export interface TripSummary {
  totalDays: number;
  destinations: string[];
  estimatedBudget: string;
  bestSeason?: string;
  travelStyle?: string;
  familyFriendly?: boolean;
}

/**
 * Full trip as returned by the trip detail API — dates serialized as ISO
 * strings (compare with `ITrip`, the MongoDB document shape).
 */
export interface TripDetail {
  _id: string;
  name: string;
  origin?: { name: string };
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  budget: number;
  currency: string;
  styles: string[];
  adults: number;
  children: number;
  stayLevel: string;
  itinerary: DayItinerary[];
  summary: TripSummary;
  budgetBreakdown: BudgetBreakdown;
  packingList: string[];
  travelTips: string[];
  aiNotes: string;
  status: "generating" | "completed" | "draft";
  createdAt: string;
}
