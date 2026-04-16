import type { Metadata } from "next";
import { auth } from "@/auth";
import { getDashboardStats } from "@/actions/expenses";
import { getIncomeStats } from "@/actions/income";
import { getUserSettings } from "@/actions/settings";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { BalanceCards } from "@/components/dashboard/balance-cards";
import { IncomeChart } from "@/components/dashboard/income-chart";
import { getMonthName, getCurrentYear, getCurrentMonth } from "@/lib/utils";
import { DashboardUserFilter } from "@/components/dashboard/user-filter";
import { getAllUsers } from "@/actions/users";
import { getTeamMembers } from "@/actions/invitations";

export const metadata: Metadata = {
  title: "Dashboard — MyBudget",
  description: "Your financial overview and spending trends",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; year?: string; memberId?: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const hasTeam = !!session?.user?.teamId;
  const params = await searchParams;

  const targetUserId = isAdmin && params.userId ? params.userId : undefined;
  const year = params.year ? parseInt(params.year) : getCurrentYear();

  const settings = await getUserSettings();
  const incomeEnabled = settings?.incomeEnabled ?? false;

  const [stats, users, teamMembers, incomeStats] = await Promise.all([
    getDashboardStats(targetUserId, year, params.memberId),
    isAdmin ? getAllUsers() : Promise.resolve([]),
    hasTeam ? getTeamMembers() : Promise.resolve([]),
    incomeEnabled ? getIncomeStats(targetUserId, year, params.memberId) : Promise.resolve(null),
  ]);

  if (!stats) {
    return (
      <div>
        <Header title="Dashboard" />
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
      </div>
    );
  }

  const currentMonth = getMonthName(getCurrentMonth());

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Your financial overview for {year}
          </p>
        </div>
        {(isAdmin || (hasTeam && teamMembers.length > 1)) && (
          <DashboardUserFilter
            users={users}
            selectedUserId={params.userId}
            selectedYear={year}
            isAdmin={isAdmin}
            teamMembers={teamMembers}
            selectedMemberId={params.memberId}
          />
        )}
      </div>

      <div className="space-y-6">
        <StatsCards
          ytdTotal={stats.ytdTotal}
          monthTotal={stats.monthTotal}
          prevMonthTotal={stats.prevMonthTotal}
          monthChange={stats.monthChange}
          transactionCount={stats.transactionCount}
          monthTransactionCount={stats.monthTransactionCount}
          currentMonth={currentMonth}
          currentYear={year}
        />

        {incomeEnabled && incomeStats && (
          <BalanceCards
            monthIncome={incomeStats.monthTotal}
            monthExpenses={stats.monthTotal}
            ytdIncome={incomeStats.ytdTotal}
            ytdExpenses={stats.ytdTotal}
            currentMonth={currentMonth}
            currentYear={year}
          />
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {incomeEnabled && incomeStats ? (
            <>
              <IncomeChart
                expenseData={stats.monthlyData}
                incomeData={incomeStats.monthlyData}
                year={year}
              />
              <CategoryChart data={stats.categoryBreakdown} year={year} />
            </>
          ) : (
            <>
              <SpendingChart data={stats.monthlyData} year={year} />
              <CategoryChart data={stats.categoryBreakdown} year={year} />
            </>
          )}
        </div>

        <RecentExpenses expenses={stats.recentExpenses} showMember={hasTeam && teamMembers.length > 1} />
      </div>
    </div>
  );
}
