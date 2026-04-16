"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      incomeEnabled: true,
      pendingDeletion: true,
      deletionScheduledAt: true,
    },
  });

  return user;
}

export async function toggleIncomeTracking(enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: session.user.id },
    data: { incomeEnabled: enabled },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
