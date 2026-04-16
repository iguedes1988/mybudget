"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, CheckCircle2, XCircle, AlertCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { acceptInvitation, declineInvitation } from "@/actions/invitations";

interface InviteAcceptProps {
  token: string;
  teamName: string;
  teamType: string;
  ownerName: string;
  memberCount: number;
  memberNames: string[];
  isExpired: boolean;
  isAlreadyUsed: boolean;
  status: string;
  userEmail: string;
  inviteEmail: string;
}

export function InviteAccept({
  token,
  teamName,
  teamType,
  ownerName,
  memberCount,
  memberNames,
  isExpired,
  isAlreadyUsed,
  status,
  userEmail,
  inviteEmail,
}: InviteAcceptProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const emailMismatch = userEmail.toLowerCase() !== inviteEmail.toLowerCase();

  async function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitation(token);
      if (result?.error) {
        setError(result.error);
      } else {
        setAccepted(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    });
  }

  async function handleDecline() {
    startTransition(async () => {
      await declineInvitation(token);
      router.push("/dashboard");
    });
  }

  if (accepted) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <p className="font-semibold text-lg">Welcome to {teamName}!</p>
          <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  if (isAlreadyUsed) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">Invitation {status.toLowerCase()}</p>
          <p className="text-sm text-muted-foreground mt-1">This invitation has already been {status.toLowerCase()}.</p>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <XCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold">Invitation Expired</p>
          <p className="text-sm text-muted-foreground mt-1">Ask the team owner to send a new invitation.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          {teamType === "FAMILY" ? (
            <Heart className="h-12 w-12 text-pink-500" />
          ) : (
            <Users className="h-12 w-12 text-primary" />
          )}
        </div>
        <CardTitle>Join {teamName}</CardTitle>
        <CardDescription>
          {ownerName} invited you to their {teamType === "FAMILY" ? "family" : "team"} budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {emailMismatch && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This invitation was sent to <strong>{inviteEmail}</strong> but you&apos;re logged in as{" "}
              <strong>{userEmail}</strong>. You need to log in with the invited email.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Current members ({memberCount}/5):</p>
          <div className="flex flex-wrap gap-1">
            {memberNames.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          By joining, you&apos;ll share expense tracking with all team members. Everyone can see and
          manage shared expenses.
        </p>

        <div className="flex gap-3">
          <Button
            onClick={handleAccept}
            disabled={isPending || emailMismatch}
            className="flex-1"
          >
            {isPending ? "Joining..." : "Accept & Join"}
          </Button>
          <Button variant="outline" onClick={handleDecline} disabled={isPending}>
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
