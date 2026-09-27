import { renderEmailShell } from "./EmailShell";

interface VerificationProps {
  email: string;
  otp: string;
  expiryMinutes?: number;
}

export function verificationEmailTemplate({
  email,
  otp,
  expiryMinutes = 10,
}: VerificationProps) {
  const bodyHtml = `
    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Welcome to SAFAR AI! Hello <strong style="color: #0f172a;">${email}</strong>,
    </p>
    
    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
      Please enter the following 6-digit verification code to confirm your email and activate your account:
    </p>

    <!-- OTP Code Box with gradient accent container -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0; width: 100%;">
      <tr>
        <td align="center">
          <div style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #f4e9c6 0%, #fce6c8 28%, #fbd5d6 55%, #fbd0d6 72%, #d9d3ea 100%); border-radius: 16px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.04);">
            <div style="background-color: #ffffff; padding: 12px 28px; border-radius: 12px; border: 2px dashed #654c9e; letter-spacing: 10px; font-size: 32px; font-weight: 800; color: #654c9e; font-family: Courier, monospace;">
              ${otp}
            </div>
          </div>
        </td>
      </tr>
    </table>
  `;

  const noticeHtml = `
    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569;">
      ⏱ <strong style="color: #0f172a;">This code expires in ${expiryMinutes} minutes.</strong><br/>
      Never share this code with anyone. If you didn't create a SAFAR AI account, you can safely ignore this email.
    </p>
  `;

  return renderEmailShell({
    title: "Verify Your SAFAR AI Account",
    heading: "Verify Your Account",
    bodyHtml,
    noticeHtml,
  });
}

