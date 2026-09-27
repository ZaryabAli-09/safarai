interface EmailShellOptions {
  title: string;
  heading: string;
  bodyHtml: string;
  noticeHtml: string;
}

const MUTED_GRADIENT =
  "linear-gradient(90deg, #f4e9c6 0%, #fce6c8 28%, #fbd5d6 55%, #fbd0d6 72%, #d9d3ea 100%)";

export function renderEmailShell({
  title,
  heading,
  bodyHtml,
  noticeHtml,
}: EmailShellOptions) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container with Brand Gradient Border & Shadow -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px -5px rgba(239, 89, 92, 0.15), 0 4px 16px -2px rgba(101, 76, 158, 0.12); border: 1px solid rgba(239, 89, 92, 0.25);">
          
          <!-- 1: Top Gradient Accent Bar (brand-gradient-muted) -->
          <tr>
            <td style="height: 6px; background: ${MUTED_GRADIENT};"></td>
          </tr>

          <!-- 2: Header / Brand Text -->
          <tr>
            <td style="padding: 36px 36px 16px 36px; text-align: center;">
              <div style="font-size: 32px; font-weight: 800; letter-spacing: -0.5px; line-height: 1; color: #ef595c;">
                SAFAR AI.
              </div>
            </td>
          </tr>

          <!-- 3: Content Body -->
          <tr>
            <td style="padding: 16px 36px 32px 36px;">
              <h1 style="margin: 0 0 14px 0; font-size: 20px; font-weight: 700; color: #0f172a; text-align: left;">
                ${heading}
              </h1>
              ${bodyHtml}

              <!-- 4: Notice Box with bg-brand-gradient-muted & brand gradient side border -->
              <div style="background: ${MUTED_GRADIENT}; padding: 2px; border-radius: 12px; margin: 28px 0 10px 0;">
                <div style="background-color: #ffffff; padding: 14px 18px; border-radius: 10px; border-left: 4px solid #ef595c;">
                  ${noticeHtml}
                </div>
              </div>
            </td>
          </tr>

          <!-- 5: Footer with brand-gradient-muted background -->
          <tr>
            <td style="padding: 24px 36px; background: ${MUTED_GRADIENT}; text-align: center;">
              <div style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #ef595c;">
                SAFAR AI.
              </div>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #475569;">
                Happy travels from SAFAR AI.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
                This is an automated security message. Please do not reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
