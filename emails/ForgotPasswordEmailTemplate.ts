export function ForgotPasswordEmailTemplate({
  email,
  resetLink,
}: {
  email: string;
  resetLink: string;
}) {
  return `
    <div style="background-color:#e5e7eb; padding:24px; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); border:1px solid #d1d5db;">
    <h1 style="font-weight:bold; font-size:20px;">Welcome to ${process.env
      .APP_NAME!}!</h1>
    <p>Hello, ${email}</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}" style="color:#2563eb; text-decoration:none; font-weight:bold;">Reset Password</a>
    <p>This link will expire in 5 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,</p>
    <p>The Safarai Team</p>
  </div>
  `;
}
