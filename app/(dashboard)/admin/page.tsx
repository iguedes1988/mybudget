import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getCurrentYear } from "@/lib/utils";
import { Users, Receipt, TrendingUp, ShieldCheck } from "lucide-react";
import { AdminCategoryChart } from "@/components/admin/admin-category-chart";

export const metadata: Metadata = {
  title: "Admin Overview — MyBudget",
  description: "System-wide statistics and management",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const currentYear = getCurrentYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

  const [userCount, totalExpenses, yearExpenses, topCategories, topUsersRaw] = await Promise.all([
    db.user.count(),
    db.expense.aggregate({ _sum: { amount: true }, _count: true }),
    db.expense.aggregate({
      where: { date: { gte: yearStart, lte: yearEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    db.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 8,
    }),
    db.expense.groupBy({
      by: ["userId"],
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
  ]);

  const userIds = topUsersRaw.map((u) => u.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const topUsers = topUsersRaw.map((u) => ({
    ...u,
    _sum: { amount: u._sum.amount },
    user: userMap[u.userId],
  }));

  return (
    <div>
      <Header title="Admin Overview" description="System-wide statistics and management" />

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">{userCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">All-Time Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Receipt className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(totalExpenses._sum.amount || 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {totalExpenses._count} transactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">YTD {currentYear}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(yearExpenses._sum.amount || 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">{yearExpenses._count} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Avg per User (YTD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-amber-500" />
                <span className="text-2xl font-bold">
                  {formatCurrency(
                    userCount > 0 ? Number(yearExpenses._sum.amount || 0) / userCount : 0
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminCategoryChart
            data={topCategories.map((c) => ({
              category: c.category,
              total: Number(c._sum.amount || 0),
            }))}
          />

          <Card>
            <CardHeader>
              <CardTitle>Top Spenders (All Time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.map((u, i) => {
                  const total = Number(u._sum.amount || 0);
                  const maxTotal = Number(topUsers[0]._sum.amount || 1);
                  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                  return (
                    <div key={u.userId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-5">
                            #{i + 1}
                          </span>
                          <span className="text-sm font-medium">
                            {u.user?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">{formatCurrency(total)}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({u._count} txns)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {topUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
