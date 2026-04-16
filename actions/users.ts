"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { adminUserCreateSchema, userUpdateSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAllUsers() {
  await requireAdmin();
  return db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      suspended: true,
      accountType: true,
      teamId: true,
      createdAt: true,
      team: { select: { id: true, name: true, type: true } },
      _count: { select: { expenses: true } },
    },
  });
}

export async function getAllTeams() {
  await requireAdmin();
  return db.team.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      owner: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
}

export async function adminCreateTeam(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const ownerId = formData.get("ownerId") as string;
  const memberIds = formData.getAll("memberIds") as string[];

  if (!name || name.length < 2) return { error: "Team name must be at least 2 characters." };
  if (!["TEAM", "FAMILY"].includes(type)) return { error: "Type must be TEAM or FAMILY." };
  if (!ownerId) return { error: "An owner must be selected." };

  // Verify owner is not already in a team
  const owner = await db.user.findUnique({ where: { id: ownerId }, select: { teamId: true } });
  if (owner?.teamId) return { error: "The selected owner is already in a team." };

  // Verify members are not already in teams
  const allMemberIds = [ownerId, ...memberIds.filter((id) => id !== ownerId)];
  if (allMemberIds.length > 5) return { error: "Maximum 5 members per team." };

  const usersInTeams = await db.user.findMany({
    where: { id: { in: allMemberIds }, teamId: { not: null } },
    select: { name: true },
  });
  if (usersInTeams.length > 0) {
    return { error: `${usersInTeams.map((u) => u.name).join(", ")} already in a team.` };
  }

  const accountType = type as "TEAM" | "FAMILY";

  await db.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: { name, type: accountType, ownerId },
    });

    // Create TeamMember entries for all members
    await tx.teamMember.createMany({
      data: allMemberIds.map((userId) => ({ teamId: team.id, userId })),
    });

    // Update all members' user records
    await tx.user.updateMany({
      where: { id: { in: allMemberIds } },
      data: { teamId: team.id, accountType },
    });
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/teams");
  return { success: true };
}

export async function adminAddUserToTeam(userId: string, teamId: string) {
  await requireAdmin();

  const user = await db.user.findUnique({ where: { id: userId }, select: { teamId: true } });
  if (user?.teamId) return { error: "User is already in a team." };

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team) return { error: "Team not found." };
  if (team.members.length >= 5) return { error: "Team already has 5 members." };

  await db.$transaction([
    db.teamMember.create({ data: { teamId, userId } }),
    db.user.update({
      where: { id: userId },
      data: { teamId, accountType: team.type },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin/teams");
  return { success: true };
}

export async function adminRemoveUserFromTeam(userId: string) {
  await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { teamId: true },
  });
  if (!user?.teamId) return { error: "User is not in a team." };

  // Check if user is team owner
  const team = await db.team.findUnique({ where: { id: user.teamId } });
  if (team?.ownerId === userId) {
    return { error: "Cannot remove the team owner. Delete the team instead." };
  }

  await db.$transaction([
    db.teamMember.deleteMany({ where: { teamId: user.teamId, userId } }),
    db.user.update({
      where: { id: userId },
      data: { teamId: null, accountType: "PERSONAL" },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin/teams");
  return { success: true };
}

export async function adminDeleteTeam(teamId: string) {
  await requireAdmin();

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });
  if (!team) return { error: "Team not found." };

  const memberIds = team.members.map((m) => m.userId);

  await db.$transaction([
    // Remove team association from all members
    db.user.updateMany({
      where: { id: { in: memberIds } },
      data: { teamId: null, accountType: "PERSONAL" },
    }),
    // Remove team association from expenses (keep expenses, just remove team link)
    db.expense.updateMany({
      where: { teamId },
      data: { teamId: null },
    }),
    // Delete team members
    db.teamMember.deleteMany({ where: { teamId } }),
    // Delete invitations
    db.teamInvitation.deleteMany({ where: { teamId } }),
    // Delete team
    db.team.delete({ where: { id: teamId } }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin/teams");
  return { success: true };
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as string,
  };

  const parsed = adminUserCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "A user with this email already exists." };

  const hashedPassword = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { name, email: email.toLowerCase(), password: hashedPassword, role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUser(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const isAdmin = session.user.role === "ADMIN";
  const isSelf = session.user.id === id;

  if (!isAdmin && !isSelf) return { error: "Unauthorized" };

  const raw = {
    name: (formData.get("name") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    password: (formData.get("password") as string) || undefined,
  };

  const parsed = userUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.email) updateData.email = parsed.data.email.toLowerCase();
  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  await db.user.update({ where: { id }, data: updateData });

  revalidatePath("/admin/users");
  revalidatePath("/profile");
  return { success: true };
}

export async function suspendUser(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) return { error: "Cannot suspend yourself." };

  await db.user.update({ where: { id }, data: { suspended: true } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function unsuspendUser(id: string) {
  await requireAdmin();
  await db.user.update({ where: { id }, data: { suspended: false } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) return { error: "Cannot delete yourself." };

  await db.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function changeUserRole(id: string, role: "USER" | "ADMIN") {
  const session = await requireAdmin();
  if (session.user.id === id) return { error: "Cannot change your own role." };

  await db.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}
