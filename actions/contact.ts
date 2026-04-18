"use server";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.enum(["general", "bug", "feature", "privacy"], {
    errorMap: () => ({ message: "Please select a subject" }),
  }),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

function getClientIp(): string {
  try {
    const hdrs = headers() as unknown as Headers;
    return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export async function submitContactForm(formData: FormData) {
  // Rate limit: 5 submissions per hour per IP (configurable via env)
  const ip = getClientIp();
  const contactMax = Number(process.env.RATE_LIMIT_CONTACT_MAX) || 5;
  const contactWindow = Number(process.env.RATE_LIMIT_CONTACT_WINDOW_MS) || 60 * 60 * 1000;
  const { success } = rateLimit(`contact:${ip}`, contactMax, contactWindow);
  if (!success) {
    return { error: "Too many submissions. Please try again later." };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, subject, message } = parsed.data;

  const subjectLabels: Record<string, string> = {
    general: "General Inquiry",
    bug: "Bug Report",
    feature: "Feature Request",
    privacy: "Privacy Request",
  };

  const recipientEmail =
    process.env.CONTACT_RECIPIENT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@apphouse.app";

  // Send email if SMTP is configured, otherwise log
  if (process.env.SMTP_HOST) {
    try {
      const { sendMail } = await import("@/lib/mail");
      await sendMail({
        to: recipientEmail,
        subject: `[MyBudget Contact] ${subjectLabels[subject] || subject} — ${name}`,
        replyTo: email,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subjectLabels[subject] || subject}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subjectLabels[subject] || subject}</p><hr/><p>${message.replace(/\n/g, "<br/>")}</p>`,
      });
    } catch (err) {
      console.error("[Contact Form] Email send failed:", err);
      return { error: "Unable to send message. Please try again later." };
    }
  } else {
    console.warn("[Contact Form] SMTP not configured. Message from:", name, "Subject:", subject);
  }

  return { success: true };
}
