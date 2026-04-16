"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { INCOME_CATEGORIES } from "@/lib/constants";
import { formatDateInput } from "@/lib/utils";
import { createIncome, updateIncome } from "@/actions/income";

interface IncomeFormProps {
  income?: {
    id: string;
    date: Date;
    category: string;
    source: string;
    amount: { toString(): string } | number;
    notes: string | null;
    createdById?: string | null;
  };
  teamMembers?: { id: string; name: string }[];
}

export function IncomeForm({ income, teamMembers }: IncomeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const isEdit = !!income;

  async function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateIncome(income!.id, formData)
        : await createIncome(formData);
      setResult(res);
      if (res.success) {
        setTimeout(() => router.push("/income"), 500);
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {result?.success && (
          <Alert variant="success" className="mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Income {isEdit ? "updated" : "added"} successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}
        {result?.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={income ? formatDateInput(income.date) : formatDateInput(new Date())}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  defaultValue={income ? Number(income.amount).toFixed(2) : ""}
                  required
                  disabled={isPending}
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" defaultValue={income?.category || ""} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {INCOME_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              name="source"
              placeholder="e.g. Company Inc., Client name"
              defaultValue={income?.source || ""}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional details..."
              defaultValue={income?.notes || ""}
              disabled={isPending}
              rows={2}
            />
          </div>

          {teamMembers && teamMembers.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="memberId">Attributed to</Label>
              <Select name="memberId" defaultValue={income?.createdById || ""}>
                <SelectTrigger id="memberId">
                  <SelectValue placeholder="Select member..." />
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Income"
              ) : (
                "Add Income"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
