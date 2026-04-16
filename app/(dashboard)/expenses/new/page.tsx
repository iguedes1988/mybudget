import { auth } from "@/auth";
import { Header } from "@/components/layout/header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getAllUsers } from "@/actions/users";
import { getTeamMembers } from "@/actions/invitations";

export default async function NewExpensePage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const hasTeam = !!session?.user?.teamId;

  const [users, teamMembers] = await Promise.all([
    isAdmin ? getAllUsers() : Promise.resolve([]),
    hasTeam ? getTeamMembers() : Promise.resolve([]),
  ]);

  return (
    <div>
      <Header title="New Expense" description="Record a new expense transaction" />
      <ExpenseForm
        isAdmin={isAdmin}
        users={users}
        teamMembers={teamMembers}
        defaultUserId={session?.user?.id}
        defaultMemberId={session?.user?.id}
      />
    </div>
  );
}
