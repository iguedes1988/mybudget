"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/actions/verification";

function getClientIp(): string {
  try {
    const hdrs = headers() as unknown as Headers;
    return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  // Rate limit: 10 login attempts per 15 minutes per IP (configurable via env)
  const ip = getClientIp();
  const loginMax = Number(process.env.RATE_LIMIT_LOGIN_MAX) || 10;
  const loginWindow = Number(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000;
  const { success } = rateLimit(`login:${ip}`, loginMax, loginWindow);
  if (!success) {
    return { error: "Too many login attempts. Please try again in 15 minutes." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  // Rate limit: 5 registrations per hour per IP (configurable via env)
  const ip = getClientIp();
  const registerMax = Number(process.env.RATE_LIMIT_REGISTER_MAX) || 5;
  const registerWindow = Number(process.env.RATE_LIMIT_REGISTER_WINDOW_MS) || 60 * 60 * 1000;
  const { success } = rateLimit(`register:${ip}`, registerMax, registerWindow);
  if (!success) {
    return { error: "Too many registration attempts. Please try again later." };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    accountType: (formData.get("accountType") as string) || "PERSONAL",
    teamName: (formData.get("teamName") as string) || undefined,
    termsAccepted: formData.get("termsAccepted") === "true" ? (true as const) : (false as unknown as true),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    return { error: firstError.message };
  }

  const { name, email, password, accountType, teamName } = parsed.data;

  const existing = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const userCount = await db.user.count();
  const role = userCount === 0 ? "ADMIN" : "USER";
  const hashedPassword = await bcrypt.hash(password, 12);

  let newUserId: string;

  if (accountType === "PERSONAL") {
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role as "ADMIN" | "USER",
        accountType: "PERSONAL",
      },
    });
    newUserId = user.id;
  } else {
    // Create user + team + membership in a transaction
    let userId = "";
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role as "ADMIN" | "USER",
          accountType: accountType as "TEAM" | "FAMILY",
        },
      });
      userId = user.id;

      const team = await tx.team.create({
        data: {
          name: teamName || `${name}'s ${accountType === "FAMILY" ? "Family" : "Team"}`,
          type: accountType as "TEAM" | "FAMILY",
          ownerId: user.id,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { teamId: team.id },
      });
    });
    newUserId = userId;
  }

  // Send verification email (non-blocking — don't fail registration if email fails)
  try {
    await sendVerificationEmail(newUserId, email.toLowerCase(), name);
  } catch (err) {
    console.error("[Registration] Failed to send verification email:", err);
  }

  redirect("/login?registered=true");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
