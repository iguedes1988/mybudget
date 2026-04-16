"use client";

import { useState, useEffect, useTransition } from "react";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface ExportSectionProps {
  incomeEnabled: boolean;
  expenseCount: number;
  incomeCount: number;
}

export function ExportSection({ incomeEnabled, expenseCount, incomeCount }: ExportSectionProps) {
  const [period, setPeriod] = useState<"this-month" | "this-year" | "all">("this-month");
  const [includeIncome, setIncludeIncome] = useState(true);

  const periods = [
    { value: "this-month" as const, label: "This Month" },
    { value: "this-year" as const, label: "This Year" },
    { value: "all" as const, label: "All Time" },
  ];

  const formats = [
    { value: "pdf", label: "PDF", icon: FileText, description: "Formatted report" },
    { value: "excel", label: "Excel", icon: FileSpreadsheet, description: ".xlsx with sheets" },
    { value: "csv", label: "CSV", icon: File, description: "Comma-separated" },
  ];

  function buildUrl(format: string) {
    const params = new URLSearchParams();
    params.set("format", format);
    params.set("period", period);
    if (incomeEnabled && includeIncome) {
      params.set("includeIncome", "true");
    }
    return `/api/export?${params.toString()}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>Download your financial data in your preferred format</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period selector */}
        <div className="space-y-2">
          <Label>Period</Label>
          <div className="flex gap-2">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Income checkbox */}
        {incomeEnabled && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="includeIncome"
              checked={includeIncome}
              onCheckedChange={(checked) => setIncludeIncome(!!checked)}
            />
            <Label htmlFor="includeIncome" className="text-sm cursor-pointer">
              Include income entries
            </Label>
          </div>
        )}

        {/* Preview count */}
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          {expenseCount} expense row{expenseCount !== 1 ? "s" : ""}
          {incomeEnabled && includeIncome && (
            <> + {incomeCount} income row{incomeCount !== 1 ? "s" : ""}</>
          )}{" "}
          will be exported
        </div>

        {/* Format buttons */}
        <div className="space-y-2">
          <Label>Format</Label>
          <div className="grid grid-cols-3 gap-3">
            {formats.map((f) => (
              <a key={f.value} href={buildUrl(f.value)} download>
                <Button variant="outline" className="w-full h-auto py-3 flex flex-col gap-1">
                  <f.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.description}</span>
                </Button>
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
