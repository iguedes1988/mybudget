"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";

interface CategoryData {
  category: string;
  total: number;
}

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: CategoryData }>;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{payload[0].payload.category}</p>
        <p className="text-sm font-bold">{formatCurrency(payload[0].payload.total)}</p>
      </div>
    );
  }
  return null;
};

export function AdminCategoryChart({ data }: { data: CategoryData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories (All Time)</CardTitle>
        <CardDescription>Spending breakdown across all users</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              className="fill-muted-foreground"
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
