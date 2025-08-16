import { dbConnect } from "@/lib/db";
import { response } from "@/lib/helperFunctions";
import { User } from "@/models/User";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { otp, userId } = await req.json();

    if (!otp || !userId) {
      return response(false, 400, "OTP and User ID are required");
    }

    await dbConnect();

    const user = await User.findById(userId);

    if (!user) {
      return response(false, 404, "Invalid request");
    }

    if (user.isVerified) {
      return response(false, 400, "Email already verified");
    }

    if (!user.verificationCode || !user.verificationCodeExpiry) {
      return response(
        false,
        400,
        "No verification code found, please register again"
      );
    }
    if (
      user.verificationCodeExpiry &&
      user.verificationCodeExpiry < new Date()
    ) {
      return response(
        false,
        400,
        "Otp is expired please request a new one by filling the registration form again"
      );
    }

    if (String(user.verificationCode) !== String(otp)) {
      return response(false, 400, "Incorrect Otp");
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;

    await user.save();

    return response(true, 200, "Email verified successfully");
  } catch (error) {
    console.error("Error verifying email:", error);
    return response(false, 500, "Internal Server Error");
  }
}
