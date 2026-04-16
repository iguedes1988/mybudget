"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateEmail } from "@/actions/account";

interface UpdateEmailFormProps {
  currentEmail: string;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.substring(0, 1);
  return `${visible}***@${domain}`;
}

export function UpdateEmailForm({ currentEmail }: UpdateEmailFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = await updateEmail(formData);
      setResult(res);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Email</CardTitle>
        <CardDescription>
          Current: {maskEmail(currentEmail)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result?.success && (
          <Alert variant="success" className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Email updated successfully.</AlertDescription>
          </Alert>
        )}
        {result?.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email</Label>
            <Input
              id="newEmail"
              name="newEmail"
              type="email"
              placeholder="new@example.com"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailPassword">Current Password</Label>
            <Input
              id="emailPassword"
              name="currentPassword"
              type="password"
              placeholder="Enter current password to confirm"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Updating..." : "Update Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
