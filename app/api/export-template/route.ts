import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
  const headers = ["Date", "Category", "Vendor", "Amount", "Notes"];
  const sampleRow = ["2026-01-15", "Groceries", "Supermarket", "45.99", "Weekly shopping"];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const csv = XLSX.utils.sheet_to_csv(ws);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="mybudget-import-template.csv"',
    },
  });
}
