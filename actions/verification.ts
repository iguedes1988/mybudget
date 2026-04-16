"use server";

import { db } from "@/lib/db";
import { sendMail, isMailConfigured } from "@/lib/mail";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import crypto from "crypto";

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@apphouse.app";
const TOKEN_EXPIRY_HOURS = 24;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getClientIp(): string {
  try {
    const hdrs = headers() as unknown as Headers;
    return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export async function sendVerificationEmail(userId: string, email: string, name: string) {
  const token = generateToken();
  const expiry = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await db.user.update({
    where: { id: userId },
    data: {
      verificationToken: token,
      verificationTokenExpiry: expiry,
    },
  });

  if (!isMailConfigured()) {
    // In dev/no-SMTP mode, just log the link
    console.info(`[Verification] Link for ${email}: ${APP_URL}/verify?token=${token}`);
    return;
  }

  const verifyUrl = `${APP_URL}/verify?token=${token}`;

  await sendMail({
    to: email,
    subject: "Verify your MyBudget email address",
    text: `Hi ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link expires in ${TOKEN_EXPIRY_HOURS} hours.\n\nIf you did not create a MyBudget account, you can safely ignore this email.\n\n— The MyBudget Team`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p style="color:#666">Hi ${name},</p>
        <p style="color:#666">Thanks for signing up for MyBudget. Please verify your email address to get started.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#0f172a;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
          Verify Email Address
        </a>
        <p style="color:#999;font-size:13px">This link expires in ${TOKEN_EXPIRY_HOURS} hours.</p>
        <p style="color:#999;font-size:13px">If you did not create a MyBudget account, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#bbb;font-size:12px">MyBudget · <a href="${APP_URL}" style="color:#bbb">${APP_URL}</a></p>
      </div>
    `,
  });
}

export async function verifyEmailToken(token: string): Promise<{ success?: boolean; error?: string }> {
  if (!token || token.length < 10) {
    return { error: "Invalid verification link." };
  }

  const user = await db.user.findUnique({
    where: { verificationToken: token },
    select: { id: true, emailVerified: true, verificationTokenExpiry: true },
  });

  if (!user) {
    return { error: "This verification link is invalid or has already been used." };
  }

  if (user.emailVerified) {
    return { success: true }; // already verified — treat as success
  }

  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
    return { error: "This verification link has expired. Please request a new one from your account." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });

  return { success: true };
}

export async function resendVerificationEmail(): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };

  // Rate limit: 1 resend per 2 minutes per user
  const ip = getClientIp();
  const { success } = rateLimit(`resend-verify:${session.user.id}:${ip}`, 1, 2 * 60 * 1000);
  if (!success) {
    return { error: "Please wait 2 minutes before requesting another verification email." };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, emailVerified: true },
  });

  if (!user) return { error: "User not found." };
  if (user.emailVerified) return { error: "Your email is already verified." };

  await sendVerificationEmail(user.id, user.email, user.name);
  return { success: true };
}
