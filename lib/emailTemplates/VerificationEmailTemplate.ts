// VerificationEmailTemplate.ts

interface VerificationProps {
  email: string;
  otp: string;
}

export function verificationEmailTemplate({ email, otp }: VerificationProps) {
  const appName = process.env.APP_NAME || "SafarAI";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your ${appName} Account</title>
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
                Verify Your Account
              </h1>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Welcome to ${appName}! Hello <strong style="color: #0f172a;">${email}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
                Please enter the following 6-digit verification code to confirm your email and activate your account:
              </p>

              <!-- OTP Code Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0; width: 100%;">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 16px 32px; background: #faf5ff; border: 2px dashed #654c9e; border-radius: 16px; letter-spacing: 10px; font-size: 32px; font-weight: 800; color: #654c9e; font-family: 'Courier New', Courier, monospace;">
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #fdf2f4; border-left: 4px solid #ef595c; padding: 14px 16px; border-radius: 8px; margin: 24px 0 20px 0;">
                <p style="margin: 0; font-size: 12.5px; line-height: 19px; color: #881337;">
                  ⏱ <strong>This code expires in 10 minutes.</strong><br/>
                  Never share this code with anyone. If you didn't create a SafarAI account, you can safely ignore this email.
                </p>
              </div>
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
