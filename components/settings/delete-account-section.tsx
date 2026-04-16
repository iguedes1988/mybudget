"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestAccountDeletion, cancelAccountDeletion } from "@/actions/account";

interface DeleteAccountSectionProps {
  email: string;
  pendingDeletion: boolean;
  deletionScheduledAt: Date | null;
}

export function DeleteAccountSection({
  email,
  pendingDeletion,
  deletionScheduledAt,
}: DeleteAccountSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleDelete(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await requestAccountDeletion(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      await cancelAccountDeletion();
    });
  }

  if (pendingDeletion && deletionScheduledAt) {
    return (
      <Card className="border-amber-500/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Account Scheduled for Deletion
          </CardTitle>
          <CardDescription>
            Your account will be permanently deleted on{" "}
            {new Date(deletionScheduledAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCancel} disabled={isPending}>
            {isPending ? "Cancelling..." : "Cancel Deletion"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setShowDialog(true)}>
            Delete my account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={(o) => !o && setShowDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all associated data, including
              expenses, income entries, categories, and export history. This cannot be undone.
              Your data will be permanently removed after a 30-day grace period.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <a
              href="/api/export?period=all&format=csv"
              download
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Download className="h-4 w-4" />
              Download all my data first (CSV)
            </a>

            <form action={handleDelete}>
              <div className="space-y-2">
                <Label htmlFor="confirmEmailDel">
                  Type your email to confirm: <span className="font-mono text-xs">{email}</span>
                </Label>
                <Input
                  id="confirmEmailDel"
                  name="confirmEmail"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={email}
                  disabled={isPending}
                />
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" type="button" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={isPending || confirmEmail.toLowerCase() !== email.toLowerCase()}
                >
                  {isPending ? "Deleting..." : "Permanently Delete Account"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
