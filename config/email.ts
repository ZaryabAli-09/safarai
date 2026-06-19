import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_SMTP_EMAIL!,
        pass: process.env.GMAIL_SMTP_APP_PASSWORD!,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_SMTP_EMAIL,
      to,
      subject,
      html,
    };

    const emailsend = await transporter.sendMail(mailOptions);

    console.log(emailsend ? "Email sent successfully" : "Failed to send email");
  } catch (error) {
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
