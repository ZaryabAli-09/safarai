import mongoose from "mongoose";

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
  accomodations: string;
  tripPace: string;
  specialAccessiblity: string;
  specialOccasion: string;
  interests: string[];
  diningPreferences: string[];
  activityPreferences: string[];
  dietaryRestrictions: string[];

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
    accomodations: { type: String, required: true },
    tripPace: { type: String, required: true },
    specialAccessiblity: { type: String, required: true },
    specialOccasion: { type: String, required: true },
    interests: { type: [String], default: [] },
    diningPreferences: { type: [String], default: [] },
    activityPreferences: { type: [String], default: [] },
    dietaryRestrictions: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.models?.Trip || mongoose.model<ITrip>("Trip", TripSchema);

export { Trip };
