import type { Metadata } from "next";
import { auth } from "@/auth";
import { getMonthlyReport } from "@/actions/expenses";
import { getAllUsers } from "@/actions/users";
import { getTeamMembers } from "@/actions/invitations";
import { MonthlyReportTable } from "@/components/reports/monthly-report-table";
import { YearlyBarChart } from "@/components/reports/yearly-bar-chart";
import { ReportFilters } from "@/components/reports/report-filters";
import { getCurrentYear } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reports — MyBudget",
  description: "Monthly and yearly spending summaries",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; userId?: string; memberId?: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const hasTeam = !!session?.user?.teamId;
  const params = await searchParams;
  const year = params.year ? parseInt(params.year) : getCurrentYear();
  const targetUserId = isAdmin && params.userId ? params.userId : undefined;

  const [report, users, teamMembers] = await Promise.all([
    getMonthlyReport(year, targetUserId, params.memberId),
    isAdmin ? getAllUsers() : Promise.resolve([]),
    hasTeam ? getTeamMembers() : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Monthly and yearly spending summaries</p>
        </div>
        <ReportFilters
          isAdmin={isAdmin}
          users={users}
          selectedYear={year}
          selectedUserId={params.userId}
          teamMembers={teamMembers}
          selectedMemberId={params.memberId}
        />
      </div>

      {report && (
        <div className="space-y-6">
          <YearlyBarChart data={report.monthlyReport} year={year} yearTotal={report.yearTotal} />
          <MonthlyReportTable report={report.monthlyReport} year={year} yearTotal={report.yearTotal} />
        </div>
      )}
    </div>
  );
}
