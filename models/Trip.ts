import mongoose from "mongoose";
import type {
  IActivity,
  IDayItinerary,
  IBudgetBreakdown,
  ITripSummary,
  ITrip,
} from "@/types/app-types";

export type {
  IActivity,
  IDayItinerary,
  IBudgetBreakdown,
  ITripSummary,
  ITrip,
};

const ActivitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    timeOfDay: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    venue: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
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
    image: {
      url: { type: String },
      attribution: { type: String },
    },
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
    origin: {
      name: { type: String, required: true, trim: true },
      lat: { type: Number },
      lng: { type: Number },
      country: { type: String },
    },
    outbound: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    departureTime: { type: String, required: true },
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    pets: { type: Number, default: 0 },
    styles: { type: [String], default: [] },
    pace: { type: String, required: true },
    stayLevel: { type: String, required: true },
    localTransport: { type: String, required: true },
    destinationDays: {
      type: [{ _id: false, name: String, days: Number }],
      default: [],
    },
    interests: { type: [String], default: [] },
    comment: { type: String, default: "", maxlength: 2000 },
    budgetUSD: { type: Number },
    includesFlights: { type: Boolean, default: true },
    flightBudget: { type: Number },
    prebooked: {
      type: [
        {
          _id: false,
          type: { type: String, enum: ["flight"] },
          amount: { type: Number },
        },
      ],
      default: [],
    },
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
