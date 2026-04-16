"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrength } from "@/components/settings/password-strength";
import { updatePassword } from "@/actions/account";

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = await updatePassword(formData);
      setResult(res);
      if (res.success) {
        setNewPassword("");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Password</CardTitle>
      </CardHeader>
      <CardContent>
        {result?.success && (
          <Alert variant="success" className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Password updated successfully.</AlertDescription>
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
            <Label htmlFor="currentPwd">Current Password</Label>
            <Input
              id="currentPwd"
              name="currentPassword"
              type="password"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPwd">New Password</Label>
            <Input
              id="newPwd"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isPending}
              placeholder="Min 8 chars, uppercase, number, special char"
            />
            <PasswordStrength password={newPassword} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPwd">Confirm New Password</Label>
            <Input
              id="confirmPwd"
              name="confirmPassword"
              type="password"
              required
              disabled={isPending}
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
