"use server";

import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

export async function updateEmail(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const newEmail = (formData.get("newEmail") as string)?.toLowerCase().trim();
  const currentPassword = formData.get("currentPassword") as string;

  if (!newEmail || !currentPassword) {
    return { error: "Email and current password are required." };
  }

  const emailValid = z.string().email().safeParse(newEmail);
  if (!emailValid.success) {
    return { error: "Invalid email address." };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: "Current password is incorrect." };
  }

  const existing = await db.user.findUnique({ where: { email: newEmail } });
  if (existing && existing.id !== session.user.id) {
    return { error: "This email is already in use." };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { email: newEmail },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: "Current password is incorrect." };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function requestAccountDeletion(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const confirmEmail = (formData.get("confirmEmail") as string)?.toLowerCase().trim();

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "User not found." };

  if (confirmEmail !== user.email) {
    return { error: "Email does not match your account." };
  }

  // Auto-disband team if user is the owner
  const ownedTeam = await db.team.findFirst({ where: { ownerId: session.user.id } });
  if (ownedTeam) {
    await db.$transaction([
      // Reset all team members to PERSONAL
      db.user.updateMany({
        where: { teamId: ownedTeam.id, id: { not: session.user.id } },
        data: { teamId: null, accountType: "PERSONAL" },
      }),
      // Unlink team from expenses (preserve the expenses)
      db.expense.updateMany({
        where: { teamId: ownedTeam.id },
        data: { teamId: null },
      }),
      // Unlink team from income
      db.income.updateMany({
        where: { teamId: ownedTeam.id },
        data: { teamId: null },
      }),
      // Delete pending invitations
      db.teamInvitation.deleteMany({ where: { teamId: ownedTeam.id } }),
      // Delete team member records
      db.teamMember.deleteMany({ where: { teamId: ownedTeam.id } }),
      // Delete the team
      db.team.delete({ where: { id: ownedTeam.id } }),
    ]);
  }

  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30);

  await db.user.update({
    where: { id: session.user.id },
    data: {
      pendingDeletion: true,
      deletionScheduledAt: deletionDate,
      teamId: null,
    },
  });

  // Sign out
  await signOut({ redirectTo: "/login" });

  return { success: true };
}

export async function cancelAccountDeletion() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      pendingDeletion: false,
      deletionScheduledAt: null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
