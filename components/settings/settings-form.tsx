"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toggleIncomeTracking } from "@/actions/settings";
import { UpdateEmailForm } from "@/components/settings/update-email-form";
import { UpdatePasswordForm } from "@/components/settings/update-password-form";
import { DeleteAccountSection } from "@/components/settings/delete-account-section";

interface SettingsFormProps {
  settings: {
    id: string;
    name: string;
    email: string;
    incomeEnabled: boolean;
    pendingDeletion: boolean;
    deletionScheduledAt: Date | null;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [incomeEnabled, setIncomeEnabled] = useState(settings.incomeEnabled);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleToggleIncome() {
    const newValue = !incomeEnabled;

    if (incomeEnabled && !newValue) {
      const confirmed = window.confirm(
        "Disabling income tracking will hide the Income page and dashboard balance cards. Your income data will be preserved. Continue?"
      );
      if (!confirmed) return;
    }

    setIncomeEnabled(newValue);
    setMessage(null);

    startTransition(async () => {
      const result = await toggleIncomeTracking(newValue);
      if (result.error) {
        setIncomeEnabled(!newValue);
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: newValue ? "Income tracking enabled" : "Income tracking disabled",
        });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === "success" ? "success" : "destructive"}>
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Income Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Enable income tracking to monitor your earnings and see balance reports
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={incomeEnabled}
              aria-label="Toggle income tracking"
              disabled={isPending}
              onClick={handleToggleIncome}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                incomeEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                  incomeEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Account section */}
      <div className="space-y-1 pt-2">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">Manage your account credentials and security</p>
      </div>

      <UpdateEmailForm currentEmail={settings.email} />
      <UpdatePasswordForm />

      {/* Danger zone */}
      <div className="pt-4">
        <DeleteAccountSection
          email={settings.email}
          pendingDeletion={settings.pendingDeletion}
          deletionScheduledAt={settings.deletionScheduledAt}
        />
      </div>
    </div>
  );
}
