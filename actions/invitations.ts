"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { inviteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

const MAX_TEAM_MEMBERS = 5;
const INVITE_EXPIRY_DAYS = 7;

export async function getTeamInfo() {
  const session = await auth();
  if (!session?.user?.id || !session.user.teamId) return null;

  const team = await db.team.findUnique({
    where: { id: session.user.teamId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
      invitations: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        include: { invitedBy: { select: { name: true } } },
      },
    },
  });

  return team;
}

export async function getTeamMembers(teamId?: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const tid = teamId || session.user.teamId;
  if (!tid) return [];

  const members = await db.teamMember.findMany({
    where: { teamId: tid },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  });

  return members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }));
}

export async function sendInvitation(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.teamId) {
    return { error: "You must be in a team to send invitations." };
  }

  const raw = { email: formData.get("email") as string };
  const parsed = inviteSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { email } = parsed.data;

  // Check ownership
  const team = await db.team.findUnique({
    where: { id: session.user.teamId },
    include: { members: true, invitations: { where: { status: "PENDING" } } },
  });

  if (!team) return { error: "Team not found." };
  if (team.ownerId !== session.user.id) {
    return { error: "Only the team owner can send invitations." };
  }

  // Check member cap (members + pending invites)
  const totalSlots = team.members.length + team.invitations.length;
  if (totalSlots >= MAX_TEAM_MEMBERS) {
    return { error: `Maximum ${MAX_TEAM_MEMBERS} members allowed (including pending invites).` };
  }

  // Check if already a member
  const existingMember = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existingMember) {
    const isMember = team.members.some((m) => m.userId === existingMember.id);
    if (isMember) return { error: "This person is already a team member." };
  }

  // Check for existing pending invite
  const existingInvite = await db.teamInvitation.findFirst({
    where: { teamId: team.id, email: email.toLowerCase(), status: "PENDING" },
  });
  if (existingInvite) return { error: "An invitation is already pending for this email." };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const invitation = await db.teamInvitation.create({
    data: {
      teamId: team.id,
      email: email.toLowerCase(),
      invitedById: session.user.id,
      expiresAt,
    },
  });

  revalidatePath("/team");
  return {
    success: true,
    token: invitation.token,
    message: `Invitation sent! Share the invite link with ${email}.`,
  };
}

export async function acceptInvitation(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please log in first." };

  const invitation = await db.teamInvitation.findUnique({
    where: { token },
    include: { team: { include: { members: true } } },
  });

  if (!invitation) return { error: "Invalid invitation." };
  if (invitation.status !== "PENDING") return { error: "This invitation has already been used." };
  if (new Date() > invitation.expiresAt) {
    await db.teamInvitation.update({ where: { id: invitation.id }, data: { status: "EXPIRED" } });
    return { error: "This invitation has expired." };
  }

  // Check email matches
  if (invitation.email !== session.user.email?.toLowerCase()) {
    return { error: "This invitation was sent to a different email address." };
  }

  // Check member cap
  if (invitation.team.members.length >= MAX_TEAM_MEMBERS) {
    return { error: "This team has reached the maximum number of members." };
  }

  // Already a member of another team?
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { teamId: true },
  });
  if (currentUser?.teamId) {
    return { error: "You are already a member of another team. Leave that team first." };
  }

  await db.$transaction([
    db.teamMember.create({
      data: { teamId: invitation.teamId, userId: session.user.id },
    }),
    db.user.update({
      where: { id: session.user.id },
      data: {
        teamId: invitation.teamId,
        accountType: invitation.team.type,
      },
    }),
    db.teamInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  revalidatePath("/team");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function declineInvitation(token: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.teamInvitation.update({
    where: { token },
    data: { status: "DECLINED" },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function revokeInvitation(id: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.teamId) return { error: "Unauthorized" };

  const team = await db.team.findUnique({ where: { id: session.user.teamId } });
  if (!team || team.ownerId !== session.user.id) {
    return { error: "Only the team owner can revoke invitations." };
  }

  await db.teamInvitation.delete({ where: { id } });
  revalidatePath("/team");
  return { success: true };
}

export async function removeTeamMember(userId: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.teamId) return { error: "Unauthorized" };

  const team = await db.team.findUnique({ where: { id: session.user.teamId } });
  if (!team || team.ownerId !== session.user.id) {
    return { error: "Only the team owner can remove members." };
  }
  if (userId === session.user.id) {
    return { error: "You cannot remove yourself from your own team." };
  }

  await db.$transaction([
    db.teamMember.deleteMany({ where: { teamId: team.id, userId } }),
    db.user.update({
      where: { id: userId },
      data: { teamId: null, accountType: "PERSONAL" },
    }),
  ]);

  revalidatePath("/team");
  return { success: true };
}
