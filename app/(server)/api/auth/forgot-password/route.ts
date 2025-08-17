import { dbConnect } from "@/lib/db";
import { response } from "@/lib/helperFunctions";
import { User } from "@/models/User";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/nodemailer";
import { ForgotPasswordEmailTemplate } from "@/emails/ForgotPasswordEmailTemplate";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return response(false, 404, "Please enter your email");
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return response(false, 400, "User not found with this email");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashToken;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min from now

    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: ForgotPasswordEmailTemplate({
        email: user.email,
        resetLink: resetUrl,
      }),
    });
    return response(
      true,
      200,
      "Password reset email sent, please check your inbox"
    );
  } catch (error) {
    console.error("Error in forgot password route:", error);
    return response(false, 500, "Internal server error");
  }
}
