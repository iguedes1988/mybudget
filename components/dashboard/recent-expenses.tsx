import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";

interface Expense {
  id: string;
  date: Date;
  category: string;
  vendor: string;
  amount: unknown;
  notes: string | null;
  createdBy?: { name: string } | null;
}

interface RecentExpensesProps {
  expenses: Expense[];
  showMember?: boolean;
}

export function RecentExpenses({ expenses, showMember }: RecentExpensesProps) {
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your 10 most recent transactions</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses recorded yet.</p>
            <Link href="/expenses/new" prefetch={false}>
              <Button variant="outline" size="sm" className="mt-3">
                Add your first expense
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const color = CATEGORY_COLORS[expense.category] || "#94a3b8";
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: color }}
                  >
                    {expense.category.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{expense.vendor}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: color }}
                      >
                        {expense.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                      </span>
                      {showMember && expense.createdBy?.name && (
                        <span className="text-xs text-muted-foreground">
                          · {expense.createdBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">{formatCurrency(Number(expense.amount))}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {expenses.length > 0 && (
        <CardFooter>
          <Link href="/expenses" prefetch={false} className="w-full">
            <Button variant="outline" className="w-full gap-2">
              View All Expenses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
