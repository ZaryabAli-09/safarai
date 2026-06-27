import mongoose from "mongoose";

export interface IActivity {
  id: string;
  timeOfDay: string; // "morning" | "afternoon" | "evening"
  title: string;
  description: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  estimatedCost: string;
  duration?: string;
  category?: string;
  weather?: {
    temp?: string;
    condition?: string;
    icon?: string;
  };
  rating?: number;
}

export interface IDayItinerary {
  dayNumber: number;
  date?: string;
  title: string;
  location: string;
  activities: IActivity[];
}

export interface IBudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: string;
}

export interface ITripSummary {
  totalDays: number;
  destinations: string[];
  estimatedBudget: string;
  bestSeason?: string;
  travelStyle?: string;
  familyFriendly?: boolean;
}

export interface ITrip {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  destinations: string[];
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: number;
  currency: string;
  tripType: string;
  transportation: string;
  accommodation: string;
  tripPace: string;
  interests: string[];
  travelers: number;
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

const ActivitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    timeOfDay: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    estimatedCost: { type: String, default: "" },
    duration: { type: String, default: "" },
    category: { type: String, default: "" },
    weather: {
      temp: { type: String },
      condition: { type: String },
      icon: { type: String },
    },
    rating: { type: Number },
  },
  { _id: false },
);

const DayItinerarySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: String },
    title: { type: String, required: true },
    location: { type: String, required: true },
    activities: [ActivitySchema],
  },
  { _id: false },
);

const BudgetBreakdownSchema = new mongoose.Schema(
  {
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    miscellaneous: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
  },
  { _id: false },
);

const TripSummarySchema = new mongoose.Schema(
  {
    totalDays: { type: Number },
    destinations: { type: [String], default: [] },
    estimatedBudget: { type: String },
    bestSeason: { type: String },
    travelStyle: { type: String },
    familyFriendly: { type: Boolean },
  },
  { _id: false },
);

const TripSchema = new mongoose.Schema<ITrip>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    destinations: { type: [String], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    tripType: { type: String, required: true },
    transportation: { type: String, default: "mix" },
    accommodation: { type: String, default: "mid-range" },
    tripPace: { type: String, default: "moderate" },
    interests: { type: [String], default: [] },
    travelers: { type: Number, default: 1 },
    itinerary: [DayItinerarySchema],
    summary: TripSummarySchema,
    budgetBreakdown: BudgetBreakdownSchema,
    packingList: { type: [String], default: [] },
    travelTips: { type: [String], default: [] },
    aiNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["generating", "completed", "draft"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ createdAt: -1 });
TripSchema.index({ status: 1 });

const Trip = mongoose.models?.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export { Trip };
