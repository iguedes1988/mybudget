"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, X } from "lucide-react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importExpenses } from "@/actions/import";
import { formatCurrency } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
}

interface ImportFormProps {
  isAdmin: boolean;
  users: User[];
}

interface ParsedRow {
  date: string;
  category: string;
  vendor: string;
  amount: string;
  notes?: string;
}

const COLUMN_HINTS: Record<string, string[]> = {
  date: ["date", "Date", "DATE", "transaction date", "Transaction Date"],
  category: ["category", "Category", "CATEGORY", "type", "Type"],
  vendor: ["vendor", "Vendor", "VENDOR", "description", "Description", "merchant", "Merchant", "payee", "Payee"],
  amount: ["amount", "Amount", "AMOUNT", "cost", "Cost", "price", "Price", "total", "Total"],
  notes: ["notes", "Notes", "NOTES", "memo", "Memo", "comment", "Comment"],
};

function autoMapColumn(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [field, hints] of Object.entries(COLUMN_HINTS)) {
    const found = headers.find((h) => hints.some((hint) => h.toLowerCase() === hint.toLowerCase()));
    if (found) mapping[field] = found;
  }
  return mapping;
}

export function ImportForm({ isAdmin, users }: ImportFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{
    success?: boolean;
    imported?: number;
    skipped?: number;
    errors?: string[];
    error?: string;
  } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);

    const isCsv = file.name.toLowerCase().endsWith(".csv");

    if (isCsv) {
      // Use papaparse for robust CSV parsing
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          const json = results.data;
          if (json.length === 0) {
            setResult({ error: "No data found in file." });
            return;
          }
          const cols = Object.keys(json[0]);
          setHeaders(cols);
          setRawRows(json);
          setMapping(autoMapColumn(cols));
        },
        error: () => {
          setResult({ error: "Failed to parse CSV file. Please check the file format." });
        },
      });
    } else {
      // Use xlsx for Excel files
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { raw: false, defval: "" });

          if (json.length === 0) {
            setResult({ error: "No data found in file." });
            return;
          }

          const cols = Object.keys(json[0]);
          setHeaders(cols);
          setRawRows(json);
          setMapping(autoMapColumn(cols));
        } catch {
          setResult({ error: "Failed to parse file. Please ensure it's a valid Excel or CSV file." });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  async function handleImport() {
    if (!mapping.date || !mapping.category || !mapping.vendor || !mapping.amount) {
      setResult({ error: "Please map all required columns (Date, Category, Vendor, Amount)." });
      return;
    }

    const rows = rawRows.map((r) => ({
      date: r[mapping.date] || "",
      category: r[mapping.category] || "",
      vendor: r[mapping.vendor] || "",
      amount: r[mapping.amount] || "",
      notes: mapping.notes ? r[mapping.notes] : undefined,
    }));

    startTransition(async () => {
      const res = await importExpenses(rows, targetUserId || undefined);
      setResult(res);
      if (res.success) {
        setHeaders([]);
        setRawRows([]);
        setMapping({});
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  function clearFile() {
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setFileName("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const previewRows = rawRows.slice(0, 5);
  const requiredFields = ["date", "category", "vendor", "amount"] as const;
  const allMapped = requiredFields.every((f) => mapping[f]);

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle>Import Expenses</CardTitle>
          <CardDescription>
            Upload a .xlsx, .xls, or .csv file. Required columns: Date, Category, Vendor, Amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result?.success && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Import Successful</AlertTitle>
              <AlertDescription>
                Imported {result.imported} expense{result.imported !== 1 ? "s" : ""}.
                {result.skipped ? ` ${result.skipped} rows skipped.` : ""}
              </AlertDescription>
            </Alert>
          )}
          {result?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}

          {!headers.length ? (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls, .csv supported</p>
              <input
                ref={fileRef}
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFile}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted-foreground">{rawRows.length} rows detected</p>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} className="h-7 w-7" aria-label="Remove file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column mapping */}
      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Map Columns</CardTitle>
            <CardDescription>
              Match your file&apos;s columns to the required fields. Required: Date, Category, Vendor, Amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && users.length > 0 && (
              <div className="space-y-2">
                <Label>Import for user (optional)</Label>
                <Select value={targetUserId || "self"} onValueChange={(v) => setTargetUserId(v === "self" ? "" : v)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Import for myself" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self">Import for myself</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(["date", "category", "vendor", "amount", "notes"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label className="capitalize">
                    {field}
                    {field !== "notes" && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  <Select
                    value={mapping[field] || "none"}
                    onValueChange={(v) =>
                      setMapping((prev) => ({ ...prev, [field]: v === "none" ? "" : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Skip —</SelectItem>
                      {headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Preview */}
            {allMapped && previewRows.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Preview (first 5 rows):</p>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Amount</TableHead>
                        {mapping.notes && <TableHead>Notes</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{row[mapping.date]}</TableCell>
                          <TableCell className="text-xs">{row[mapping.category]}</TableCell>
                          <TableCell className="text-xs">{row[mapping.vendor]}</TableCell>
                          <TableCell className="text-xs">{row[mapping.amount]}</TableCell>
                          {mapping.notes && (
                            <TableCell className="text-xs">{row[mapping.notes]}</TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!allMapped || isPending}
              className="gap-2"
            >
              {isPending ? (
                "Importing..."
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import {rawRows.length} expenses
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template download */}
      <div className="flex items-center gap-2">
        <a href="/api/export-template" download>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download import template (CSV)
          </Button>
        </a>
        <span className="text-xs text-muted-foreground">
          Required columns: Date, Category, Vendor, Amount. Optional: Notes.
        </span>
      </div>
    </div>
  );
}
