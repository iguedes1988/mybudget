import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { auth } from "@/auth";
import { getExpenses } from "@/actions/expenses";
import { getAllUsers } from "@/actions/users";
import { getTeamMembers } from "@/actions/invitations";
import { Button } from "@/components/ui/button";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseFilters } from "@/components/expenses/expense-filters";

export const metadata: Metadata = {
  title: "Expenses — MyBudget",
  description: "View and manage your expense transactions",
};

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    year?: string;
    category?: string;
    userId?: string;
    memberId?: string;
    search?: string;
    page?: string;
  }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const hasTeam = !!session?.user?.teamId;
  const params = await searchParams;

  const page = parseInt(params.page || "1");
  const pageSize = 50;
  const targetUserId = isAdmin && params.userId ? params.userId : undefined;

  const [{ expenses, total }, users, teamMembers] = await Promise.all([
    getExpenses({
      userId: targetUserId,
      memberId: params.memberId,
      month: params.month ? parseInt(params.month) : undefined,
      year: params.year ? parseInt(params.year) : undefined,
      category: params.category,
      search: params.search,
      page,
      pageSize,
    }),
    isAdmin ? getAllUsers() : Promise.resolve([]),
    hasTeam ? getTeamMembers() : Promise.resolve([]),
  ]);

  const exportParams = new URLSearchParams(params as Record<string, string>).toString();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            {total} transaction{total !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/export?${exportParams}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </Link>
          <Link href="/expenses/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <ExpenseFilters isAdmin={isAdmin} users={users} teamMembers={teamMembers} />
        <ExpenseTable
          expenses={expenses}
          total={total}
          page={page}
          pageSize={pageSize}
          isAdmin={isAdmin}
          showUser={isAdmin && !!params.userId}
          showMember={hasTeam && teamMembers.length > 1}
        />
      </div>
    </div>
  );
}
