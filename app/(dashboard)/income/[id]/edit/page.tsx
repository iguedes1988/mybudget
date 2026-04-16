import type { Metadata } from "next";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserSettings } from "@/actions/settings";
import { getTeamMembers } from "@/actions/invitations";
import { redirect, notFound } from "next/navigation";
import { IncomeForm } from "@/components/income/income-form";

export const metadata: Metadata = {
  title: "Edit Income — MyBudget",
  description: "Edit an income entry",
};

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const settings = await getUserSettings();
  if (!settings?.incomeEnabled) redirect("/dashboard");

  const { id } = await params;
  const income = await db.income.findUnique({ where: { id } });
  if (!income) notFound();

  const isAdmin = session?.user?.role === "ADMIN";
  const isTeamIncome = income.teamId && income.teamId === session?.user?.teamId;
  const isOwner = income.userId === session?.user?.id;

  if (!isOwner && !isTeamIncome && !isAdmin) redirect("/income");

  const hasTeam = !!session?.user?.teamId;
  const teamMembers = hasTeam ? await getTeamMembers() : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Edit Income</h1>
      <IncomeForm income={income} teamMembers={teamMembers} />
    </div>
  );
}
