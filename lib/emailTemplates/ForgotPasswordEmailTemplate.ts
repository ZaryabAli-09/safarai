// ForgotPasswordEmailTemplate.ts
interface ForgotPasswordProps {
  email: string;
  resetLink: string;
}

export function ForgotPasswordEmailTemplate({
  email,
  resetLink,
}: ForgotPasswordProps) {
  const appName = process.env.APP_NAME || "SafarAI";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your ${appName} Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(101, 76, 158, 0.08); border: 1px solid #f1f5f9;">
          
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #f9a94a 0%, #ef595c 40%, #ef4563 70%, #654c9e 100%);"></td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="padding: 32px 36px 12px 36px; text-align: center;">
              <h2 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #1e293b;">
                <span style="color: #ef595c;">Safar</span><span style="color: #654c9e;">AI</span>
              </h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">
                AI-Powered Travel Planner
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 16px 36px 32px 36px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: left;">
                Password Reset Request
              </h1>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Hello <strong style="color: #0f172a;">${email}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
                We received a request to reset your SafarAI password. Click the button below to choose a new password:
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 9999px; background: linear-gradient(90deg, #f9a94a 0%, #ef595c 40%, #ef4563 70%, #654c9e 100%); box-shadow: 0 4px 12px rgba(239, 89, 92, 0.25);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #fdf2f4; border-left: 4px solid #ef595c; padding: 14px 16px; border-radius: 8px; margin: 24px 0 20px 0;">
                <p style="margin: 0; font-size: 12.5px; line-height: 19px; color: #881337;">
                  ⏱ <strong>This link expires in 15 minutes.</strong><br/>
                  If you didn't ask to reset your password, you can safely ignore this email — your account is safe.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 18px; color: #94a3b8; word-break: break-all;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${resetLink}" style="color: #654c9e; text-decoration: underline;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #faf5ff; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Happy travels from <strong>${appName}</strong>
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                This is an automated security message. Please do not reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
