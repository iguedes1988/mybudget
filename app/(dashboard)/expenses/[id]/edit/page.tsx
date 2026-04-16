import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getAllUsers } from "@/actions/users";
import { getTeamMembers } from "@/actions/invitations";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";
  const hasTeam = !!session.user.teamId;

  const expense = await db.expense.findUnique({ where: { id } });
  if (!expense) notFound();

  // Only owner, team member, or admin can edit
  const isTeamExpense = expense.teamId && expense.teamId === session.user.teamId;
  if (expense.userId !== session.user.id && !isTeamExpense && !isAdmin) {
    redirect("/expenses");
  }

  const [users, teamMembers] = await Promise.all([
    isAdmin ? getAllUsers() : Promise.resolve([]),
    hasTeam ? getTeamMembers() : Promise.resolve([]),
  ]);

  return (
    <div>
      <Header title="Edit Expense" description="Update the expense details" />
      <ExpenseForm
        expense={expense}
        isAdmin={isAdmin}
        users={users}
        teamMembers={teamMembers}
      />
    </div>
  );
}
