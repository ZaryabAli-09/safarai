import mongoose from "mongoose";

export interface IActivity {
  timeOfDay: string; // e.g. "Morning Activity"
  title: string; // e.g. "Visit Lake Saif-ul-Malook"
  budget: string; // e.g. "PKR 3000"
  description: string; // Detailed paragraph
}

export interface IAiSuggestion {
  day: string; // e.g. "Day 1: 2025-11-05 (Kaghan)"
  activities: IActivity[];
}
export interface ITrip {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // ✅ Link to the user who created the trip
  name: string;
  destinations: string[];
  startDate: Date;
  endDate: Date;
  duration: number;
  budget: number;
  tripType: string;
  transportation: string;
  accommodation: string;
  tripPace: string;
  specialOccasion: string;
  interests: string[];
  diningPreferences: string[];
  aiSuggestions: IAiSuggestion[];
  aiSuggestedNotes: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TripSchema = new mongoose.Schema<ITrip>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    destinations: [],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    budget: { type: Number, required: true },
    tripType: { type: String, required: true },
    transportation: { type: String, required: true },
    accommodation: { type: String, required: true },
    tripPace: { type: String, required: true },
    specialOccasion: { type: String, required: true },
    interests: { type: [String], default: [] },
    diningPreferences: { type: [String], default: [] },
    aiSuggestions: [
      {
        day: String,
        activities: [
          {
            timeOfDay: String,
            title: String,
            budget: String,
            description: String,
          },
        ],
      },
    ],
    aiSuggestedNotes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.models?.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export { Trip };
