"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal, ShieldCheck, ShieldOff, Trash2, UserX, UserCheck, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { suspendUser, unsuspendUser, deleteUser, changeUserRole } from "@/actions/users";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  suspended: boolean;
  accountType?: string;
  teamId?: string | null;
  team?: { id: string; name: string; type: string } | null;
  createdAt: Date;
  _count: { expenses: number };
}

interface UserManagementTableProps {
  users: User[];
  currentUserId: string;
}

export function UserManagementTable({ users, currentUserId }: UserManagementTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) alert(result.error);
    });
  }

  return (
    <div>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-14">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {user.name}
                          {isSelf && (
                            <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role === "ADMIN" ? (
                        <><ShieldCheck className="h-3 w-3 mr-1" />Admin</>
                      ) : (
                        "User"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.team ? (
                      <Link href="/admin/teams" prefetch={false} className="hover:underline">
                        <Badge variant="outline" className="text-xs">
                          {user.team.name}
                        </Badge>
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Personal</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.suspended ? "destructive" : "success"}>
                      {user.suspended ? "Suspended" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/expenses?userId=${user.id}`} prefetch={false} className="flex items-center gap-1 text-sm hover:underline">
                      <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                      {user._count.expenses}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    {!isSelf && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for ${user.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* Suspend/Unsuspend */}
                          {user.suspended ? (
                            <DropdownMenuItem
                              onClick={() => handleAction(() => unsuspendUser(user.id))}
                              disabled={isPending}
                            >
                              <UserCheck className="h-4 w-4 mr-2 text-emerald-500" />
                              Unsuspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAction(() => suspendUser(user.id))}
                              disabled={isPending}
                            >
                              <UserX className="h-4 w-4 mr-2 text-amber-500" />
                              Suspend
                            </DropdownMenuItem>
                          )}

                          {/* Change role */}
                          {user.role === "ADMIN" ? (
                            <DropdownMenuItem
                              onClick={() => handleAction(() => changeUserRole(user.id, "USER"))}
                              disabled={isPending}
                            >
                              <ShieldOff className="h-4 w-4 mr-2" />
                              Remove Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleAction(() => changeUserRole(user.id, "ADMIN"))}
                              disabled={isPending}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                              Make Admin
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently delete the user and ALL their expenses. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (!deleteId) return;
                handleAction(() => deleteUser(deleteId));
                setDeleteId(null);
              }}
            >
              {isPending ? "Deleting..." : "Delete User & Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
