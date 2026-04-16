import nodemailer from "nodemailer";

function resolveSmtpPass(): string | undefined {
  if (process.env.SMTP_PASS_B64) {
    return Buffer.from(process.env.SMTP_PASS_B64, "base64").toString("utf-8");
  }
  return process.env.SMTP_PASS;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE !== "false", // default true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: resolveSmtpPass(),
  },
});

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, text, html, replyTo }: SendMailOptions) {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    replyTo,
  });
}

export function isMailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    (process.env.SMTP_PASS_B64 || process.env.SMTP_PASS)
  );
}
