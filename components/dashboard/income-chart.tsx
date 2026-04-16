"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthShort } from "@/lib/utils";

interface IncomeChartProps {
  expenseData: { month: number; total: number }[];
  incomeData: { month: number; total: number }[];
  year: number;
}

export function IncomeChart({ expenseData, incomeData, year }: IncomeChartProps) {
  const merged = expenseData.map((e) => {
    const inc = incomeData.find((i) => i.month === e.month);
    return {
      month: getMonthShort(e.month),
      expenses: e.total,
      income: inc?.total || 0,
    };
  });

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Spending vs Income ({year})</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "expenses" ? "Expenses" : "Income",
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
