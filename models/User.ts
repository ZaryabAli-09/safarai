import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  _id?: mongoose.Types.ObjectId;
  isVerified?: boolean;
  role?: "user" | "admin"; // Optional role field with default value
  verificationCode?: string;
  verificationCodeExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpiry: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.models?.User || mongoose.model<IUser>("User", userSchema);

export { User };
