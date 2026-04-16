import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllUsers, getAllTeams } from "@/actions/users";
import { AdminTeamManagement } from "@/components/admin/admin-team-management";

export const metadata: Metadata = {
  title: "Team Management — MyBudget",
  description: "Group users into teams or families",
};

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, teams] = await Promise.all([
    getAllUsers(),
    getAllTeams(),
  ]);

  // Users not in any team (available for grouping)
  const availableUsers = users.filter((u) => !u.teamId);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground mt-1">
          Group users into Teams or Families
        </p>
      </div>

      <AdminTeamManagement teams={teams} availableUsers={availableUsers} />
    </div>
  );
}
