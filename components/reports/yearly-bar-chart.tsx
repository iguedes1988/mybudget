"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getMonthShort } from "@/lib/utils";

interface MonthlyReportData {
  expenses: unknown[];
  total: number;
  byCategory: Record<string, number>;
}

interface YearlyBarChartProps {
  data: Record<number, MonthlyReportData>;
  year: number;
  yearTotal: number;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-primary text-sm font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function YearlyBarChart({ data, year, yearTotal }: YearlyBarChartProps) {
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: getMonthShort(i + 1),
    total: data[i + 1]?.total || 0,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Breakdown — {year}</CardTitle>
          <CardDescription>Total spending per month</CardDescription>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Year Total</p>
          <p className="text-2xl font-bold">{formatCurrency(yearTotal)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <YAxis
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
