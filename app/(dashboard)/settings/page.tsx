import type { Metadata } from "next";
import { auth } from "@/auth";
import { getUserSettings } from "@/actions/settings";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Settings — MyBudget",
  description: "Manage your account preferences",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const settings = await getUserSettings();

  if (!settings) {
    return (
      <div>
        <Header title="Settings" />
        <p className="text-muted-foreground">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div>
      <Header title="Settings" description="Manage your account and preferences" />
      <SettingsForm settings={settings} />
    </div>
  );
}
