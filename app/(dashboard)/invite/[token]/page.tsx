import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { InviteAccept } from "@/components/team/invite-accept";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=/invite/${token}`);

  const invitation = await db.teamInvitation.findUnique({
    where: { token },
    include: {
      team: {
        include: {
          owner: { select: { name: true } },
          members: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!invitation) {
    return (
      <div>
        <Header title="Invalid Invitation" />
        <p className="text-muted-foreground">This invitation link is invalid or has been revoked.</p>
      </div>
    );
  }

  const isExpired = new Date() > invitation.expiresAt;
  const isAlreadyUsed = invitation.status !== "PENDING";

  return (
    <div>
      <Header title="Team Invitation" />
      <InviteAccept
        token={token}
        teamName={invitation.team.name}
        teamType={invitation.team.type}
        ownerName={invitation.team.owner.name}
        memberCount={invitation.team.members.length}
        memberNames={invitation.team.members.map((m) => m.user.name)}
        isExpired={isExpired}
        isAlreadyUsed={isAlreadyUsed}
        status={invitation.status}
        userEmail={session.user.email || ""}
        inviteEmail={invitation.email}
      />
    </div>
  );
}
