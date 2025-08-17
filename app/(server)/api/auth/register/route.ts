import { dbConnect } from "@/lib/db";
import { NextRequest } from "next/server";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/nodemailer";
import { generateOtp, response } from "@/lib/helperFunctions";
import { verificationEmailTemplate } from "@/emails/VerificationEmailTemplate";

// In future add som checks for email password length and format or use external validation libraries like Joi or Yup or even Zod for better validation handling
export async function POST(req: NextRequest) {
  try {
    // use joi etc for validation in future
    const { email, password } = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      return response(false, 400, "Invalid email format");
    }

    if (!password || password.trim().length < 6) {
      return response(
        false,
        400,
        "Password must be at least 6 characters long"
      );
    }
    if (password && password.length < 6) {
      return response(
        false,
        400,
        "Password must be at least 6 characters long"
      );
    }

    if (!email || !password) {
      return response(false, 400, "Email and password are required");
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // if user exists and is verified
      if (existingUser.isVerified) {
        return response(false, 400, "User already exists, please login");

        // if user exists but is not verified
      } else {
        const verificationOtp = await generateOtp();

        existingUser.verificationCode = verificationOtp.otp;
        existingUser.verificationCodeExpiry = verificationOtp.expiry;

        await existingUser.save();

        // Resend verification email
        await sendEmail({
          to: email,
          subject: "Verify your account",
          html: verificationEmailTemplate({
            email,
            otp: existingUser.verificationCode,
          }),
        });

        return response(
          true,
          200,
          "Verification email resent, please check your inbox",
          existingUser._id
        );
      }
    }

    // generate otp
    const verificationOtp = await generateOtp();

    const user = new User({
      email,
      password,
      isVerified: false,
      verificationCode: verificationOtp?.otp,
      verificationCodeExpiry: verificationOtp?.expiry,
    });

    await user.save();

    // send verification email
    await sendEmail({
      to: email,
      subject: "Verify your account",
      html: verificationEmailTemplate({ email, otp: user.verificationCode }),
    });

    return response(
      true,
      201,
      "User registered successfully, please verify your email",
      user._id
    );
  } catch (error) {
    return response(
      false,
      500,
      (error as Error).message || "Failed to register user",
      error
    );
  }
}
