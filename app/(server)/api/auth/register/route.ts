import { dbConnect } from "@/lib/db";
import { NextRequest } from "next/server";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/nodemailer";
import { generateOtp, response } from "@/lib/helperFunctions";
import { verificationEmailTemplate } from "@/lib/emails/VerificationEmailTemplate";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters"),
  email: z.string().trim().email("Invalid email format"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return response(false, 400, "Username Email and password are required");
    }

    const validation = registerSchema.safeParse({ username, email, password });

    if (!validation.success) {
      return response(false, 400, validation.error.issues[0].message);
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // if user exists and is verified
      if (existingUser.isVerified) {
        return response(false, 400, "User already registered, please login");

        // if user exists but is not verified
      } else {
        const verificationOtp = await generateOtp();

        existingUser.verificationCode = verificationOtp.otp;
        existingUser.verificationCodeExpiry = verificationOtp.expiry;
        existingUser.password = password;
        existingUser.isVerified = false; // Ensure user is not verified

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
      username,
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
    console.error("Error in reset password route:", error);
    return response(false, 500, "Internal server error");
  }
}
