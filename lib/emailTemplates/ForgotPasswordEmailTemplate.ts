import { renderEmailShell } from "./EmailShell";

interface ForgotPasswordProps {
  email: string;
  resetLink: string;
  expiryMinutes?: number;
}

export function ForgotPasswordEmailTemplate({
  email,
  resetLink,
  expiryMinutes = 15,
}: ForgotPasswordProps) {
  const bodyHtml = `
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Hello <strong style="color: #0f172a;">${email}</strong>,
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
      We received a request to reset your SAFAR AI password. Click the button below to choose a new password:
    </p>

    <!-- CTA Button -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0; width: 100%;">
      <tr>
        <td align="center">
          <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 40px; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px; background: linear-gradient(90deg, #fcd14a 10%, #f9a94a 18%, #ef595c 55%, #ef4563 72%, #654c9e 100%); box-shadow: 0 6px 18px rgba(239, 89, 92, 0.35);">
            Reset Password
          </a>
        </td>
      </tr>
    </table>
  `;

  const noticeHtml = `
    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569;">
      ⏱ <strong style="color: #0f172a;">This link expires in ${expiryMinutes} minutes.</strong><br/>
      If you did not request a password reset, you can safely ignore this email — your account remains secure.
    </p>
  `;

  return renderEmailShell({
    title: "Reset Your SAFAR AI Password",
    heading: "Password Reset Request",
    bodyHtml,
    noticeHtml,
  });
}

