import { response } from "@/lib/helperFunctions";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import z from "zod";

const newPasswordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[@$!%*?&]/, "Password must contain a special character");

export async function POST(req: NextRequest) {
  try {
    const { resetToken, newPassword } = await req.json();

    // use joi etc for validation in future

    const validation = newPasswordSchema.safeParse(newPassword);
    if (!validation.success) {
      return response(false, 400, validation.error.issues[0].message);
    }

    if (!resetToken) return response(false, 400, "Unauthorized request");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await dbConnect();
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
    });

    if (!user) return response(false, 400, "Unauthorized request");

    if (user.resetPasswordExpiry < Date.now()) {
      return response(false, 400, "Invalid or expired token");
    }

    user.password = newPassword; // plain password, mongoose pre-save hook will hash

    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    await user.save();

    return response(true, 200, "Password reset successfully");
  } catch (error) {
    return response(false, 500, "Internal server error");
  }
}
