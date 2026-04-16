"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { createExpense, updateExpense } from "@/actions/expenses";
import { formatDateInput } from "@/lib/utils";

interface Expense {
  id: string;
  date: Date;
  category: string;
  vendor: string;
  amount: unknown;
  notes: string | null;
  userId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TeamMember {
  id: string;
  name: string;
}

interface ExpenseFormProps {
  expense?: Expense & { createdById?: string | null };
  isAdmin?: boolean;
  users?: User[];
  teamMembers?: TeamMember[];
  defaultUserId?: string;
  defaultMemberId?: string;
}

export function ExpenseForm({ expense, isAdmin, users, teamMembers, defaultUserId, defaultMemberId }: ExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState(expense?.category || "");
  const [selectedUserId, setSelectedUserId] = useState(
    expense?.userId || defaultUserId || ""
  );
  const [selectedMemberId, setSelectedMemberId] = useState(
    expense?.createdById || defaultMemberId || ""
  );

  const isEditing = !!expense;

  async function handleSubmit(formData: FormData) {
    setError(null);
    if (category) formData.set("category", category);
    if (isAdmin && selectedUserId) formData.set("userId", selectedUserId);
    if (selectedMemberId) formData.set("memberId", selectedMemberId);

    startTransition(async () => {
      const result = isEditing
        ? await updateExpense(expense.id, formData)
        : await createExpense(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/expenses"), 800);
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Expense" : "New Expense"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the details of this expense" : "Record a new expense transaction"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              {isEditing ? "Expense updated successfully!" : "Expense saved successfully!"}
            </AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
          {/* Admin user selector */}
          {isAdmin && users && users.length > 0 && (
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Team member selector */}
          {teamMembers && teamMembers.length > 1 && (
            <div className="space-y-2">
              <Label>Responsible Member</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Who made this expense?" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={expense ? formatDateInput(expense.date) : new Date().toISOString().split("T")[0]}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  defaultValue={expense ? Number(expense.amount).toFixed(2) : ""}
                  required
                  disabled={isPending}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor *</Label>
            <Input
              id="vendor"
              name="vendor"
              type="text"
              placeholder="e.g. Amazon, Walmart"
              defaultValue={expense?.vendor || ""}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Optional notes about this expense"
              defaultValue={expense?.notes || ""}
              disabled={isPending}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending || success || !category}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Saving..."}
                </>
              ) : isEditing ? "Update Expense" : "Save Expense"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
