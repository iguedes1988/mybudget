import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { getIncomes } from "@/actions/income";
import { getTeamMembers } from "@/actions/invitations";
import { getUserSettings } from "@/actions/settings";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IncomeTable } from "@/components/income/income-table";
import { IncomeFilters } from "@/components/income/income-filters";

export const metadata: Metadata = {
  title: "Income — MyBudget",
  description: "View and manage your income entries",
};

export const dynamic = "force-dynamic";

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
    category?: string;
    memberId?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const settings = await getUserSettings();
  if (!settings?.incomeEnabled) redirect("/dashboard");

  const hasTeam = !!session?.user?.teamId;
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const pageSize = 50;

  const [{ incomes, total }, teamMembers] = await Promise.all([
    getIncomes({
      memberId: params.memberId,
      month: params.month ? parseInt(params.month) : undefined,
      year: params.year ? parseInt(params.year) : undefined,
      category: params.category,
      search: params.search,
      page,
      pageSize,
    }),
    hasTeam ? getTeamMembers() : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground mt-1">
            {total} entr{total !== 1 ? "ies" : "y"} found
          </p>
        </div>
        <Link href="/income/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <IncomeFilters teamMembers={teamMembers} />
        <IncomeTable
          incomes={incomes}
          total={total}
          page={page}
          pageSize={pageSize}
          showMember={hasTeam && teamMembers.length > 1}
        />
      </div>
    </div>
  );
}
