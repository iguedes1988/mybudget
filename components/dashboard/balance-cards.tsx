"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BalanceCardsProps {
  monthIncome: number;
  monthExpenses: number;
  ytdIncome: number;
  ytdExpenses: number;
  currentMonth: string;
  currentYear: number;
}

export function BalanceCards({
  monthIncome,
  monthExpenses,
  ytdIncome,
  ytdExpenses,
  currentMonth,
  currentYear,
}: BalanceCardsProps) {
  const monthBalance = monthIncome - monthExpenses;
  const ytdBalance = ytdIncome - ytdExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {currentMonth} Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {monthBalance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span
              className={`text-2xl font-bold ${
                monthBalance >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {monthBalance >= 0 ? "+" : ""}
              {formatCurrency(monthBalance)}
            </span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>Income: {formatCurrency(monthIncome)}</span>
            <span>Expenses: {formatCurrency(monthExpenses)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            YTD Balance ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {ytdBalance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            <span
              className={`text-2xl font-bold ${
                ytdBalance >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {ytdBalance >= 0 ? "+" : ""}
              {formatCurrency(ytdBalance)}
            </span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span>Income: {formatCurrency(ytdIncome)}</span>
            <span>Expenses: {formatCurrency(ytdExpenses)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
