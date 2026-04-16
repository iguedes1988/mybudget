"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { incomeSchema } from "@/lib/validations";
import { parseDateInput } from "@/lib/utils";
import { revalidatePath } from "next/cache";

function buildOwnerFilter(session: {
  user: { id: string; role: string; teamId?: string };
}, overrideUserId?: string, memberId?: string): Record<string, unknown> {
  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin && overrideUserId) {
    return { userId: overrideUserId };
  }

  if (session.user.teamId) {
    const where: Record<string, unknown> = { teamId: session.user.teamId };
    if (memberId && memberId !== "all") {
      where.createdById = memberId;
    }
    return where;
  }

  return { userId: session.user.id };
}

export async function createIncome(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    source: formData.get("source") as string,
    amount: formData.get("amount") as string,
    notes: (formData.get("notes") as string) || undefined,
    userId: (formData.get("userId") as string) || undefined,
    memberId: (formData.get("memberId") as string) || undefined,
  };

  const parsed = incomeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { date, category, source, amount, notes, userId, memberId } = parsed.data;
  const isAdmin = session.user.role === "ADMIN";
  const targetUserId = isAdmin && userId ? userId : session.user.id;

  await db.income.create({
    data: {
      date: parseDateInput(date),
      category,
      source,
      amount: parseFloat(amount),
      notes: notes || null,
      userId: targetUserId,
      teamId: session.user.teamId || null,
      createdById: memberId || session.user.id,
    },
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateIncome(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const income = await db.income.findUnique({ where: { id } });
  if (!income) return { error: "Income not found" };

  const isAdmin = session.user.role === "ADMIN";
  const isTeamIncome = income.teamId && income.teamId === session.user.teamId;
  const isOwner = income.userId === session.user.id;

  if (!isOwner && !isTeamIncome && !isAdmin) {
    return { error: "Unauthorized" };
  }

  const raw = {
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    source: formData.get("source") as string,
    amount: formData.get("amount") as string,
    notes: (formData.get("notes") as string) || undefined,
    memberId: (formData.get("memberId") as string) || undefined,
  };

  const parsed = incomeSchema.omit({ userId: true }).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { date, category, source, amount, notes, memberId } = parsed.data;

  await db.income.update({
    where: { id },
    data: {
      date: parseDateInput(date),
      category,
      source,
      amount: parseFloat(amount),
      notes: notes || null,
      ...(memberId ? { createdById: memberId } : {}),
    },
  });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const income = await db.income.findUnique({ where: { id } });
  if (!income) return { error: "Income not found" };

  const isAdmin = session.user.role === "ADMIN";
  const isTeamIncome = income.teamId && income.teamId === session.user.teamId;
  const isOwner = income.userId === session.user.id;

  if (!isOwner && !isTeamIncome && !isAdmin) {
    return { error: "Unauthorized" };
  }

  await db.income.delete({ where: { id } });

  revalidatePath("/income");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getIncomes({
  userId,
  memberId,
  month,
  year,
  category,
  search,
  page = 1,
  pageSize = 50,
}: {
  userId?: string;
  memberId?: string;
  month?: number;
  year?: number;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { incomes: [], total: 0 };

  const where = buildOwnerFilter(
    session as { user: typeof session.user & { id: string; role: string } },
    userId,
    memberId
  );

  if (year) {
    const start = new Date(year, month ? month - 1 : 0, 1);
    const end = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  if (category && category !== "all") {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { source: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  const [incomes, total] = await db.$transaction([
    db.income.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        createdBy: { select: { name: true, email: true } },
      },
    }),
    db.income.count({ where }),
  ]);

  return { incomes, total };
}

export async function getIncomeStats(userId?: string, year?: number, memberId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const baseFilter = buildOwnerFilter(
    session as { user: typeof session.user & { id: string; role: string } },
    userId,
    memberId
  );

  const currentYear = year || new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
  const monthStart = new Date(currentYear, currentMonth - 1, 1);
  const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

  const [ytdIncome, monthIncome, yearIncomesList] = await db.$transaction([
    db.income.aggregate({
      where: { ...baseFilter, date: { gte: yearStart, lte: yearEnd } },
      _sum: { amount: true },
    }),
    db.income.aggregate({
      where: { ...baseFilter, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    db.income.findMany({
      where: { ...baseFilter, date: { gte: yearStart, lte: yearEnd } },
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const monthlyMap: Record<number, number> = {};
  for (const e of yearIncomesList) {
    const m = new Date(e.date).getMonth() + 1;
    monthlyMap[m] = (monthlyMap[m] || 0) + Number(e.amount);
  }

  const now = new Date();
  const maxMonth = currentYear === now.getFullYear() ? now.getMonth() + 1 : 12;

  const monthlyData = Array.from({ length: maxMonth }, (_, i) => ({
    month: i + 1,
    total: monthlyMap[i + 1] || 0,
  }));

  return {
    ytdTotal: Number(ytdIncome._sum.amount || 0),
    monthTotal: Number(monthIncome._sum.amount || 0),
    monthlyData,
  };
}

export async function getIncomeCount(filters?: {
  year?: number;
  month?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return 0;

  const where: Record<string, unknown> = session.user.teamId
    ? { teamId: session.user.teamId }
    : { userId: session.user.id };

  if (filters?.year) {
    const start = new Date(filters.year, filters.month ? filters.month - 1 : 0, 1);
    const end = filters.month
      ? new Date(filters.year, filters.month, 0, 23, 59, 59)
      : new Date(filters.year, 11, 31, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  return db.income.count({ where });
}
