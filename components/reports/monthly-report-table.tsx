import Link from "next/link";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";

interface MonthlyReportData {
  expenses: unknown[];
  total: number;
  byCategory: Record<string, number>;
}

interface MonthlyReportTableProps {
  report: Record<number, MonthlyReportData>;
  year: number;
  yearTotal: number;
}

export function MonthlyReportTable({ report, year, yearTotal }: MonthlyReportTableProps) {
  // Get categories that actually have data
  const usedCategories = Array.from(
    new Set(
      Object.values(report).flatMap((m) => Object.keys(m.byCategory))
    )
  ).sort();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monthly Detail — {year}</CardTitle>
        <Link href={`/api/export?year=${year}&format=excel`} prefetch={false}>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="sticky left-0 bg-muted/50 min-w-[130px]">Category</TableHead>
                {Array.from({ length: 12 }, (_, i) => (
                  <TableHead key={i + 1} className="text-right min-w-[90px] whitespace-nowrap">
                    {getMonthName(i + 1).slice(0, 3)}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold min-w-[100px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usedCategories.map((category) => {
                const rowTotal = Object.values(report).reduce(
                  (sum, m) => sum + (m.byCategory[category] || 0),
                  0
                );
                return (
                  <TableRow key={category}>
                    <TableCell className="sticky left-0 bg-background font-medium text-sm">
                      {category}
                    </TableCell>
                    {Array.from({ length: 12 }, (_, i) => {
                      const amount = report[i + 1]?.byCategory[category] || 0;
                      return (
                        <TableCell key={i + 1} className="text-right text-sm tabular-nums">
                          {amount > 0 ? formatCurrency(amount) : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-semibold text-sm tabular-nums">
                      {formatCurrency(rowTotal)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50 font-bold">Monthly Total</TableCell>
                {Array.from({ length: 12 }, (_, i) => (
                  <TableCell key={i + 1} className="text-right font-bold text-sm tabular-nums">
                    {report[i + 1]?.total > 0
                      ? formatCurrency(report[i + 1].total)
                      : <span className="text-muted-foreground/40">—</span>
                    }
                  </TableCell>
                ))}
                <TableCell className="text-right font-bold text-base tabular-nums">
                  {formatCurrency(yearTotal)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
