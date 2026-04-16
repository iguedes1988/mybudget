import { TrendingUp, TrendingDown, DollarSign, Receipt, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface StatsCardsProps {
  ytdTotal: number;
  monthTotal: number;
  prevMonthTotal: number;
  monthChange: number;
  transactionCount: number;
  monthTransactionCount: number;
  currentMonth: string;
  currentYear: number;
}

export function StatsCards({
  ytdTotal,
  monthTotal,
  prevMonthTotal,
  monthChange,
  transactionCount,
  monthTransactionCount,
  currentMonth,
  currentYear,
}: StatsCardsProps) {
  const monthAvg = transactionCount > 0 ? ytdTotal / new Date().getMonth() + 1 : 0;
  const isIncrease = monthChange > 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* YTD Total */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Year-to-Date Total
          </CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(ytdTotal)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {transactionCount} transactions in {currentYear}
          </p>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {currentMonth} Spending
          </CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthTotal)}</div>
          <div className="flex items-center gap-1 mt-1">
            {isIncrease ? (
              <TrendingUp className="h-3 w-3 text-destructive" />
            ) : (
              <TrendingDown className="h-3 w-3 text-emerald-500" />
            )}
            <p className={`text-xs ${isIncrease ? "text-destructive" : "text-emerald-500"}`}>
              {Math.abs(monthChange).toFixed(1)}% vs last month
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Previous Month */}
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Previous Month
          </CardTitle>
          <Receipt className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(prevMonthTotal)}</div>
          <p className="text-xs text-muted-foreground mt-1">Last month&apos;s total</p>
        </CardContent>
      </Card>

      {/* Monthly Average */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Avg ({currentYear})
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthAvg)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {monthTransactionCount} expenses this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
