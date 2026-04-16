"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { expenseSchema } from "@/lib/validations";
import { parseDateInput } from "@/lib/utils";
import { revalidatePath } from "next/cache";

/**
 * Build the base expense filter depending on context:
 * - Admin viewing specific user: filter by userId
 * - Team/Family member: filter by teamId (shared data)
 * - Personal account: filter by userId
 */
function buildOwnerFilter(session: {
  user: { id: string; role: string; teamId?: string; accountType?: string };
}, overrideUserId?: string, memberId?: string): Record<string, unknown> {
  const isAdmin = session.user.role === "ADMIN";

  // Admin overriding to see specific user
  if (isAdmin && overrideUserId) {
    const where: Record<string, unknown> = { userId: overrideUserId };
    return where;
  }

  // Team/Family user: query by teamId
  if (session.user.teamId) {
    const where: Record<string, unknown> = { teamId: session.user.teamId };
    if (memberId && memberId !== "all") {
      where.createdById = memberId;
    }
    return where;
  }

  // Personal account: query by userId
  return { userId: session.user.id };
}

export async function createExpense(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    vendor: formData.get("vendor") as string,
    amount: formData.get("amount") as string,
    notes: (formData.get("notes") as string) || undefined,
    userId: (formData.get("userId") as string) || undefined,
    memberId: (formData.get("memberId") as string) || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { date, category, vendor, amount, notes, userId, memberId } = parsed.data;

  // Determine target user for the expense
  const isAdmin = session.user.role === "ADMIN";
  const targetUserId = isAdmin && userId ? userId : session.user.id;

  await db.expense.create({
    data: {
      date: parseDateInput(date),
      category,
      vendor,
      amount: parseFloat(amount),
      notes: notes || null,
      userId: targetUserId,
      teamId: session.user.teamId || null,
      createdById: memberId || session.user.id,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) return { error: "Expense not found" };

  // Check authorization: owner, team member, or admin
  const isAdmin = session.user.role === "ADMIN";
  const isTeamExpense = expense.teamId && expense.teamId === session.user.teamId;
  const isOwner = expense.userId === session.user.id;

  if (!isOwner && !isTeamExpense && !isAdmin) {
    return { error: "Unauthorized" };
  }

  const raw = {
    date: formData.get("date") as string,
    category: formData.get("category") as string,
    vendor: formData.get("vendor") as string,
    amount: formData.get("amount") as string,
    notes: (formData.get("notes") as string) || undefined,
    memberId: (formData.get("memberId") as string) || undefined,
  };

  const parsed = expenseSchema.omit({ userId: true }).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { date, category, vendor, amount, notes, memberId } = parsed.data;

  await db.expense.update({
    where: { id },
    data: {
      date: parseDateInput(date),
      category,
      vendor,
      amount: parseFloat(amount),
      notes: notes || null,
      ...(memberId ? { createdById: memberId } : {}),
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) return { error: "Expense not found" };

  const isAdmin = session.user.role === "ADMIN";
  const isTeamExpense = expense.teamId && expense.teamId === session.user.teamId;
  const isOwner = expense.userId === session.user.id;

  if (!isOwner && !isTeamExpense && !isAdmin) {
    return { error: "Unauthorized" };
  }

  await db.expense.delete({ where: { id } });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getExpenses({
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
  if (!session?.user?.id) return { expenses: [], total: 0 };

  const where = buildOwnerFilter(session as { user: typeof session.user & { id: string; role: string } }, userId, memberId);

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
      { vendor: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  const [expenses, total] = await db.$transaction([
    db.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { name: true, email: true } },
        createdBy: { select: { name: true, email: true } },
      },
    }),
    db.expense.count({ where }),
  ]);

  return { expenses, total };
}

export async function getDashboardStats(userId?: string, year?: number, memberId?: string) {
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
  const prevMonthStart = new Date(currentYear, currentMonth - 2, 1);
  const prevMonthEnd = new Date(currentYear, currentMonth - 1, 0, 23, 59, 59);

  const [ytdExpenses, monthExpenses, prevMonthExpenses, categoryBreakdown, yearExpensesList, recentExpenses] =
    await db.$transaction([
      db.expense.aggregate({
        where: { ...baseFilter, date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
        _count: true,
      }),
      db.expense.aggregate({
        where: { ...baseFilter, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
        _count: true,
      }),
      db.expense.aggregate({
        where: { ...baseFilter, date: { gte: prevMonthStart, lte: prevMonthEnd } },
        _sum: { amount: true },
      }),
      db.expense.groupBy({
        by: ["category"],
        where: { ...baseFilter, date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
      db.expense.findMany({
        where: { ...baseFilter, date: { gte: yearStart, lte: yearEnd } },
        select: { date: true, amount: true },
        orderBy: { date: "asc" },
      }),
      db.expense.findMany({
        where: baseFilter,
        orderBy: { date: "desc" },
        take: 10,
        include: {
          user: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      }),
    ]);

  const monthlyMap: Record<number, number> = {};
  for (const e of yearExpensesList) {
    const m = new Date(e.date).getMonth() + 1;
    monthlyMap[m] = (monthlyMap[m] || 0) + Number(e.amount);
  }

  const now = new Date();
  const maxMonth = currentYear === now.getFullYear() ? now.getMonth() + 1 : 12;

  const monthlyData = Array.from({ length: maxMonth }, (_, i) => ({
    month: i + 1,
    total: monthlyMap[i + 1] || 0,
  }));

  const ytdTotal = Number(ytdExpenses._sum.amount || 0);
  const monthTotal = Number(monthExpenses._sum.amount || 0);
  const prevMonthTotal = Number(prevMonthExpenses._sum.amount || 0);
  const monthChange =
    prevMonthTotal > 0
      ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
      : 0;

  return {
    ytdTotal,
    monthTotal,
    prevMonthTotal,
    monthChange,
    transactionCount: ytdExpenses._count,
    monthTransactionCount: monthExpenses._count,
    categoryBreakdown: categoryBreakdown.map((c) => {
      const sum = c._sum as { amount: unknown };
      return {
        category: c.category,
        total: sum.amount ? Number(sum.amount) : 0,
      };
    }),
    monthlyData,
    recentExpenses,
  };
}

export async function getMonthlyReport(year: number, userId?: string, memberId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const baseFilter = buildOwnerFilter(
    session as { user: typeof session.user & { id: string; role: string } },
    userId,
    memberId
  );

  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  const expenses = await db.expense.findMany({
    where: { ...baseFilter, date: { gte: yearStart, lte: yearEnd } },
    orderBy: [{ date: "asc" }, { category: "asc" }],
  });

  const monthlyReport: Record<
    number,
    { expenses: typeof expenses; total: number; byCategory: Record<string, number> }
  > = {};

  for (let m = 1; m <= 12; m++) {
    monthlyReport[m] = { expenses: [], total: 0, byCategory: {} };
  }

  for (const e of expenses) {
    const m = new Date(e.date).getMonth() + 1;
    monthlyReport[m].expenses.push(e);
    monthlyReport[m].total += Number(e.amount);
    monthlyReport[m].byCategory[e.category] =
      (monthlyReport[m].byCategory[e.category] || 0) + Number(e.amount);
  }

  const yearTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return { monthlyReport, yearTotal, year };
}
