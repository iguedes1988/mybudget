"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
import { INCOME_CATEGORY_COLORS } from "@/lib/constants";
import { deleteIncome } from "@/actions/income";

interface Income {
  id: string;
  date: Date;
  category: string;
  source: string;
  amount: { toString(): string } | number;
  notes: string | null;
  createdBy?: { name: string; email: string } | null;
}

interface IncomeTableProps {
  incomes: Income[];
  total: number;
  page: number;
  pageSize: number;
  showMember?: boolean;
}

export function IncomeTable({ incomes, total, page, pageSize, showMember }: IncomeTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteIncome(deleteId);
      setDeleteId(null);
    });
  }

  const totalPages = Math.ceil(total / pageSize);
  const pageTotal = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  if (incomes.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground mb-4">No income entries found.</p>
        <Link href="/income/new">
          <Button>Add your first income</Button>
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
              <TableHead>Source</TableHead>
              {showMember && <TableHead>Member</TableHead>}
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map((income) => (
              <TableRow key={income.id}>
                <TableCell className="text-sm">{formatDate(income.date)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: INCOME_CATEGORY_COLORS[income.category] || "#94a3b8",
                      color: INCOME_CATEGORY_COLORS[income.category] || "#94a3b8",
                    }}
                  >
                    {income.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">{income.source}</TableCell>
                {showMember && (
                  <TableCell className="text-sm text-muted-foreground">
                    {income.createdBy?.name || "—"}
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {income.notes || "—"}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-emerald-600">
                  +{formatCurrency(Number(income.amount))}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/income/${income.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit income">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteId(income.id)}
                      aria-label="Delete income"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3 + (showMember ? 1 : 0)} className="font-semibold">
                Page Total
              </TableCell>
              <TableCell />
              <TableCell className="text-right font-bold text-emerald-600">
                +{formatCurrency(pageTotal)}
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
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`/income?page=${page - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/income?page=${page + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Income Entry</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
