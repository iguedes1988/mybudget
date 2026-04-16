import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeamInfo } from "@/actions/invitations";
import { Header } from "@/components/layout/header";
import { TeamManagement } from "@/components/team/team-management";

export const metadata: Metadata = {
  title: "Team Members — MyBudget",
  description: "Manage your team or family members",
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.teamId) redirect("/dashboard");

  const team = await getTeamInfo();
  if (!team) redirect("/dashboard");

  const isOwner = team.ownerId === session.user.id;

  return (
    <div>
      <Header
        title={team.name}
        description={`${team.type === "FAMILY" ? "Family" : "Team"} account — ${team.members.length}/5 members`}
      />
      <TeamManagement team={team} isOwner={isOwner} currentUserId={session.user.id} />
    </div>
  );
}
