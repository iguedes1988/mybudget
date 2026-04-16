import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") || "excel";
  const period = searchParams.get("period") || "all"; // this-month, this-year, all
  const category = searchParams.get("category") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const includeIncome = searchParams.get("includeIncome") === "true";
  const isAdmin = session.user.role === "ADMIN";

  // Support legacy year/month params and new period param
  let year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  let month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : undefined;

  const now = new Date();
  if (period === "this-month" && !year) {
    year = now.getFullYear();
    month = now.getMonth() + 1;
  } else if (period === "this-year" && !year) {
    year = now.getFullYear();
  }

  // Build owner filter
  const targetUserId = isAdmin && userId ? userId : session.user.id;
  const expenseWhere: Record<string, unknown> = session.user.teamId
    ? { teamId: session.user.teamId }
    : { userId: targetUserId };
  const incomeWhere: Record<string, unknown> = { ...expenseWhere };

  if (year) {
    const start = new Date(year, month ? month - 1 : 0, 1);
    const end = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);
    expenseWhere.date = { gte: start, lte: end };
    incomeWhere.date = { gte: start, lte: end };
  }

  if (category && category !== "all") {
    expenseWhere.category = category;
  }

  const expenses = await db.expense.findMany({
    where: expenseWhere,
    orderBy: [{ date: "asc" }],
    include: { user: { select: { name: true, email: true } } },
  });

  // Check if user has income enabled
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { incomeEnabled: true },
  });

  const shouldIncludeIncome = includeIncome && user?.incomeEnabled;
  const incomes = shouldIncludeIncome
    ? await db.income.findMany({
        where: incomeWhere,
        orderBy: [{ date: "asc" }],
        include: { user: { select: { name: true, email: true } } },
      })
    : [];

  const expenseRows = expenses.map((e) => ({
    Date: new Date(e.date).toLocaleDateString("en-US"),
    Description: e.vendor,
    Category: e.category,
    Amount: Number(e.amount),
    Currency: "USD",
    Type: "expense" as const,
    Notes: e.notes || "",
  }));

  const incomeRows = incomes.map((i) => ({
    Date: new Date(i.date).toLocaleDateString("en-US"),
    Description: i.source,
    Category: i.category,
    Amount: Number(i.amount),
    Currency: "USD",
    Type: "income" as const,
    Notes: i.notes || "",
  }));

  const periodLabel = month && year
    ? new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })
    : year
    ? `${year}`
    : "All Time";

  // CSV format
  if (format === "csv") {
    const allRows = [...expenseRows, ...incomeRows];
    const ws = XLSX.utils.json_to_sheet(allRows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const fileName = `mybudget-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.csv`;
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  // PDF format
  if (format === "pdf") {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(99, 102, 241); // primary color
    doc.text("MyBudget", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Export: ${periodLabel}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, 14, 34);

    // Summary
    const expenseTotal = expenseRows.reduce((s, r) => s + r.Amount, 0);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Expenses: $${expenseTotal.toFixed(2)} (${expenseRows.length} transactions)`, 14, 44);

    if (shouldIncludeIncome && incomeRows.length > 0) {
      const incomeTotal = incomeRows.reduce((s, r) => s + r.Amount, 0);
      doc.text(`Total Income: $${incomeTotal.toFixed(2)} (${incomeRows.length} entries)`, 14, 52);
      doc.text(`Balance: $${(incomeTotal - expenseTotal).toFixed(2)}`, 14, 60);
    }

    const startY = shouldIncludeIncome && incomeRows.length > 0 ? 68 : 52;

    // Expense table
    autoTable(doc, {
      startY,
      head: [["Date", "Description", "Category", "Amount", "Notes"]],
      body: expenseRows.map((r) => [r.Date, r.Description, r.Category, `$${r.Amount.toFixed(2)}`, r.Notes]),
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.getNumberOfPages()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      },
    });

    // Income table on new page if applicable
    if (shouldIncludeIncome && incomeRows.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Income", 14, 20);

      autoTable(doc, {
        startY: 28,
        head: [["Date", "Source", "Category", "Amount", "Notes"]],
        body: incomeRows.map((r) => [r.Date, r.Description, r.Category, `$${r.Amount.toFixed(2)}`, r.Notes]),
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      });
    }

    const pdfBuffer = doc.output("arraybuffer");
    const fileName = `mybudget-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  // Excel format (default)
  const wb = XLSX.utils.book_new();

  // Expenses sheet
  if (year) {
    for (let m = 1; m <= 12; m++) {
      const monthExpenses = expenses.filter(
        (e) => new Date(e.date).getMonth() + 1 === m
      );
      if (monthExpenses.length === 0) continue;

      const monthRows = monthExpenses.map((e) => ({
        Date: new Date(e.date).toLocaleDateString("en-US"),
        Category: e.category,
        Vendor: e.vendor,
        Amount: Number(e.amount),
        Notes: e.notes || "",
      }));

      const ws = XLSX.utils.json_to_sheet(monthRows);
      const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      XLSX.utils.sheet_add_aoa(ws, [["", "", "TOTAL", total, ""]], {
        origin: monthRows.length + 1,
      });

      const monthName = new Date(year, m - 1, 1).toLocaleString("en-US", { month: "long" });
      XLSX.utils.book_append_sheet(wb, ws, monthName);
    }

    // Summary sheet
    const summaryRows = [];
    for (let m = 1; m <= 12; m++) {
      const monthExpenses = expenses.filter(
        (e) => new Date(e.date).getMonth() + 1 === m
      );
      const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const monthName = new Date(year, m - 1, 1).toLocaleString("en-US", { month: "long" });
      summaryRows.push({ Month: monthName, Total: total, Transactions: monthExpenses.length });
    }
    summaryRows.push({
      Month: "GRAND TOTAL",
      Total: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      Transactions: expenses.length,
    });
    const summaryWs = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  } else {
    const ws = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
  }

  // Income sheet
  if (shouldIncludeIncome && incomeRows.length > 0) {
    const incWs = XLSX.utils.json_to_sheet(incomeRows);
    XLSX.utils.book_append_sheet(wb, incWs, "Income");
  }

  // Set column widths
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    ws["!cols"] = Array.from({ length: range.e.c + 1 }, () => ({ wch: 18 }));
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const fileName = `mybudget-${periodLabel.replace(/\s+/g, "-").toLowerCase()}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
