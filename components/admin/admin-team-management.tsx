"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, UserPlus, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  adminCreateTeam,
  adminAddUserToTeam,
  adminRemoveUserFromTeam,
  adminDeleteTeam,
} from "@/actions/users";

interface User {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
}

interface Team {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  owner: { id: string; name: string };
  members: TeamMember[];
}

interface AdminTeamManagementProps {
  teams: Team[];
  availableUsers: User[];
}

export function AdminTeamManagement({ teams, availableUsers }: AdminTeamManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [addMemberUserId, setAddMemberUserId] = useState("");
  const [error, setError] = useState("");

  // Create team form state
  const [teamName, setTeamName] = useState("");
  const [teamType, setTeamType] = useState<string>("TEAM");
  const [ownerId, setOwnerId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  function resetCreateForm() {
    setTeamName("");
    setTeamType("TEAM");
    setOwnerId("");
    setSelectedMemberIds([]);
    setError("");
  }

  function handleCreateTeam() {
    if (!teamName || !ownerId) {
      setError("Team name and owner are required.");
      return;
    }

    const formData = new FormData();
    formData.set("name", teamName);
    formData.set("type", teamType);
    formData.set("ownerId", ownerId);
    for (const id of selectedMemberIds) {
      formData.append("memberIds", id);
    }

    startTransition(async () => {
      const result = await adminCreateTeam(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setCreateOpen(false);
        resetCreateForm();
      }
    });
  }

  function handleAddMember() {
    if (!addMemberTeamId || !addMemberUserId) return;

    startTransition(async () => {
      const result = await adminAddUserToTeam(addMemberUserId, addMemberTeamId);
      if (result.error) {
        alert(result.error);
      } else {
        setAddMemberTeamId(null);
        setAddMemberUserId("");
      }
    });
  }

  function handleRemoveMember(userId: string) {
    startTransition(async () => {
      const result = await adminRemoveUserFromTeam(userId);
      if (result.error) alert(result.error);
    });
  }

  function handleDeleteTeam() {
    if (!deleteTeamId) return;
    startTransition(async () => {
      const result = await adminDeleteTeam(deleteTeamId);
      if (result.error) alert(result.error);
      setDeleteTeamId(null);
    });
  }

  function toggleMember(userId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }

  // Filter available users for member selection (exclude selected owner)
  const memberCandidates = availableUsers.filter((u) => u.id !== ownerId);

  return (
    <div className="space-y-6">
      {/* Create team button */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Group existing users into a Team or Family. Select an owner and optionally add members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2">{error}</p>
            )}
            <div>
              <Label>Team Name</Label>
              <Input
                placeholder="e.g. Smith Family"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={teamType} onValueChange={setTeamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM">Team</SelectItem>
                  <SelectItem value="FAMILY">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Owner</Label>
              <Select value={ownerId} onValueChange={(v) => { setOwnerId(v); setSelectedMemberIds((prev) => prev.filter((id) => id !== v)); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ownerId && memberCandidates.length > 0 && (
              <div>
                <Label>Additional Members (optional, max 4)</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {memberCandidates.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                    >
                      <Checkbox
                        checked={selectedMemberIds.includes(u.id)}
                        onCheckedChange={() => toggleMember(u.id)}
                        disabled={!selectedMemberIds.includes(u.id) && selectedMemberIds.length >= 4}
                      />
                      <span>{u.name}</span>
                      <span className="text-muted-foreground text-xs">({u.email})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={isPending}>
              {isPending ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Existing teams */}
      {teams.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No teams yet. Create one to group users together.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="mt-1">
                        {team.type}
                      </Badge>
                      <span className="ml-2 text-xs">
                        Owner: {team.owner.name}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {availableUsers.length > 0 && team.members.length < 5 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setAddMemberTeamId(team.id); setAddMemberUserId(""); }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTeamId(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">
                  Members ({team.members.length}/5)
                </p>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user.name}
                            {member.userId === team.ownerId && (
                              <Badge variant="outline" className="ml-1 text-[10px] py-0">
                                Owner
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.user.email}</p>
                        </div>
                      </div>
                      {member.userId !== team.ownerId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.userId)}
                          disabled={isPending}
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add member dialog */}
      <Dialog open={!!addMemberTeamId} onOpenChange={(open) => !open && setAddMemberTeamId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Team</DialogTitle>
            <DialogDescription>
              Select a user to add to this team.
            </DialogDescription>
          </DialogHeader>
          <Select value={addMemberUserId} onValueChange={setAddMemberUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberTeamId(null)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={isPending || !addMemberUserId}>
              {isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete team confirm */}
      <Dialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              This will remove the team and set all members back to Personal accounts.
              Their expenses will be preserved but no longer linked to a team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTeamId(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
