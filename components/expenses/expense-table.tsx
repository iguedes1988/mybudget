"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Edit, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";
import { deleteExpense } from "@/actions/expenses";

interface Expense {
  id: string;
  date: Date;
  category: string;
  vendor: string;
  amount: unknown;
  notes: string | null;
  userId: string;
  user?: { name: string; email: string };
}

interface ExpenseTableProps {
  expenses: (Expense & { createdBy?: { name: string; email: string } | null })[];
  total: number;
  page: number;
  pageSize: number;
  isAdmin?: boolean;
  showUser?: boolean;
  showMember?: boolean;
}

export function ExpenseTable({
  expenses,
  total,
  page,
  pageSize,
  isAdmin,
  showUser,
  showMember,
}: ExpenseTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.ceil(total / pageSize);
  const grandTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteExpense(deleteId);
      setDeleteId(null);
    });
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-sm mb-3">No expenses found</p>
        <Link href="/expenses/new" prefetch={false}>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              {showUser && <TableHead>User</TableHead>}
              {showMember && <TableHead>Member</TableHead>}
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const color = CATEGORY_COLORS[expense.category] || "#94a3b8";
              return (
                <TableRow key={expense.id} className="group">
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDate(expense.date)}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{expense.vendor}</TableCell>
                  {showUser && (
                    <TableCell className="text-sm text-muted-foreground">
                      {expense.user?.name}
                    </TableCell>
                  )}
                  {showMember && (
                    <TableCell className="text-sm text-muted-foreground">
                      {(expense as { createdBy?: { name: string } | null }).createdBy?.name || "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {expense.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(Number(expense.amount))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/expenses/${expense.id}/edit`} prefetch={false}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(expense.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4 + (showUser ? 1 : 0) + (showMember ? 1 : 0)} className="font-semibold">
                Page Total ({expenses.length} items)
              </TableCell>
              <TableCell className="text-right font-bold text-base">
                {formatCurrency(grandTotal)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Link href={`?page=${page - 1}`} prefetch={false} aria-disabled={page <= 1}>
              <Button variant="outline" size="sm" disabled={page <= 1} className="gap-1">
                <ChevronLeft className="h-3 w-3" />
                Previous
              </Button>
            </Link>
            <Link href={`?page=${page + 1}`} prefetch={false} aria-disabled={page >= totalPages}>
              <Button variant="outline" size="sm" disabled={page >= totalPages} className="gap-1">
                Next
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
