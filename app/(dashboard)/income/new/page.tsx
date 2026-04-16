import type { Metadata } from "next";
import { auth } from "@/auth";
import { getUserSettings } from "@/actions/settings";
import { getTeamMembers } from "@/actions/invitations";
import { redirect } from "next/navigation";
import { IncomeForm } from "@/components/income/income-form";

export const metadata: Metadata = {
  title: "Add Income — MyBudget",
  description: "Record a new income entry",
};

export default async function NewIncomePage() {
  const session = await auth();
  const settings = await getUserSettings();
  if (!settings?.incomeEnabled) redirect("/dashboard");

  const hasTeam = !!session?.user?.teamId;
  const [teamMembers] = await Promise.all([
    hasTeam ? getTeamMembers() : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Add Income</h1>
      <IncomeForm teamMembers={teamMembers} />
    </div>
  );
}
