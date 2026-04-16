import type { Metadata } from "next";
import { auth } from "@/auth";
import { Header } from "@/components/layout/header";
import { ImportForm } from "@/components/import/import-form";
import { ExportSection } from "@/components/import/export-section";
import { getAllUsers } from "@/actions/users";
import { getUserSettings } from "@/actions/settings";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Import / Export — MyBudget",
  description: "Upload or download your expense data",
};

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const isAdmin = session.user.role === "ADMIN";
  const users = isAdmin ? await getAllUsers() : [];
  const settings = await getUserSettings();
  const incomeEnabled = settings?.incomeEnabled ?? false;

  // Get counts for export preview
  const ownerFilter = session.user.teamId
    ? { teamId: session.user.teamId }
    : { userId: session.user.id };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [expenseCount, incomeCount] = await Promise.all([
    db.expense.count({
      where: { ...ownerFilter, date: { gte: monthStart, lte: monthEnd } },
    }),
    incomeEnabled
      ? db.income.count({
          where: { ...ownerFilter, date: { gte: monthStart, lte: monthEnd } },
        })
      : Promise.resolve(0),
  ]);

  return (
    <div>
      <Header
        title="Import / Export"
        description="Upload Excel or CSV files to bulk import expenses, or export your data."
      />
      <div className="space-y-6">
        <ImportForm isAdmin={isAdmin} users={users} />
        <ExportSection
          incomeEnabled={incomeEnabled}
          expenseCount={expenseCount}
          incomeCount={incomeCount}
        />
      </div>
    </div>
  );
}
