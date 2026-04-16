"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Mail,
  Crown,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  sendInvitation,
  revokeInvitation,
  removeTeamMember,
} from "@/actions/invitations";

interface TeamMember {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
}

interface TeamInvitation {
  id: string;
  email: string;
  token: string;
  status: string;
  expiresAt: Date;
  invitedBy: { name: string };
}

interface Team {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
}

interface TeamManagementProps {
  team: Team;
  isOwner: boolean;
  currentUserId: string;
}

export function TeamManagement({ team, isOwner, currentUserId }: TeamManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [inviteResult, setInviteResult] = useState<{
    success?: boolean;
    error?: string;
    token?: string;
    message?: string;
  } | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const slotsUsed = team.members.length + team.invitations.length;
  const slotsRemaining = 5 - slotsUsed;

  async function handleInvite(formData: FormData) {
    setInviteResult(null);
    startTransition(async () => {
      const result = await sendInvitation(formData);
      setInviteResult(result);
    });
  }

  async function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeInvitation(id);
    });
  }

  async function handleRemove() {
    if (!removeId) return;
    startTransition(async () => {
      const result = await removeTeamMember(removeId);
      if (result?.error) alert(result.error);
      setRemoveId(null);
    });
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({team.members.length}/5)
          </CardTitle>
          <CardDescription>
            Everyone in the {team.type === "FAMILY" ? "family" : "team"} shares the same finance data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {team.members.map((member) => {
              const isOwnerMember = member.user.id === team.ownerId;
              const isSelf = member.user.id === currentUserId;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {member.user.name}
                        {isSelf && (
                          <span className="text-xs text-muted-foreground">(you)</span>
                        )}
                        {isOwnerMember && (
                          <Badge variant="default" className="gap-1 text-xs py-0">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  {isOwner && !isOwnerMember && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setRemoveId(member.user.id)}
                      disabled={isPending}
                      aria-label={`Remove ${member.user.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {team.invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations ({team.invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {team.invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited by {invite.invitedBy.name} — expires{" "}
                        {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyInviteLink(invite.token)}
                      aria-label="Copy invite link"
                    >
                      {copiedToken === invite.token ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleRevoke(invite.id)}
                        disabled={isPending}
                        aria-label="Revoke invitation"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      {isOwner && slotsRemaining > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a Member</CardTitle>
            <CardDescription>
              {slotsRemaining} slot{slotsRemaining !== 1 ? "s" : ""} remaining. Share the invite link
              with the person you want to add.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteResult?.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{inviteResult.error}</AlertDescription>
              </Alert>
            )}
            {inviteResult?.success && inviteResult.token && (
              <Alert variant="success" className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <p>{inviteResult.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/invite/${inviteResult.token}`
                        : `/invite/${inviteResult.token}`}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 shrink-0"
                      onClick={() => copyInviteLink(inviteResult.token!)}
                    >
                      {copiedToken === inviteResult.token ? (
                        <><CheckCircle2 className="h-3 w-3" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy</>
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form action={handleInvite} className="flex gap-2">
              <Input
                name="email"
                type="email"
                placeholder="member@example.com"
                aria-label="Member email address"
                required
                disabled={isPending}
                className="flex-1"
              />
              <Button type="submit" disabled={isPending} className="gap-2 shrink-0">
                <Mail className="h-4 w-4" />
                Send Invite
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Remove confirmation */}
      <Dialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              This member will lose access to all shared data. Their personal account will be
              converted back to a Personal plan. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
              {isPending ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
