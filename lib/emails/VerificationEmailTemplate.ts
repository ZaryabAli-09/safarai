// emailTemplates.ts

interface verificationProps {
  email: string;
  otp: string;
}

export function verificationEmailTemplate({ email, otp }: verificationProps) {
  return `
 <div style="background-color:#e5e7eb; padding:24px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); border:1px solid #d1d5db;">
    <h1 style="font-weight:bold; font-size:20px;">Welcome to ${process.env
      .APP_NAME!}!</h1>
    <p>Hello, ${email}, your verification OTP is: <strong>${otp}</strong></p>
    <p>Please use this code to verify your email address.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,</p>
    <p>The Safarai Team</p>
  </div>
  `;
}
