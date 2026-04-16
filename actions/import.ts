"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface ImportRow {
  date: string;
  category: string;
  vendor: string;
  amount: string;
  notes?: string;
}

const MAX_IMPORT_ROWS = 5000;

/** Parses dates in ISO (YYYY-MM-DD), DD/MM/YYYY, MM/DD/YYYY, and MM-DD-YYYY formats */
function parseFlexibleDate(raw: string): Date | null {
  if (!raw) return null;

  // ISO: YYYY-MM-DD or JS-parseable string
  const iso = new Date(raw);
  if (!isNaN(iso.getTime()) && raw.includes("-") && raw.length >= 8) {
    // Avoid MM-DD-YYYY being parsed as ISO incorrectly
    const parts = raw.split("-");
    if (parts[0].length === 4) {
      return new Date(Date.UTC(iso.getFullYear(), iso.getMonth(), iso.getDate(), 12, 0, 0));
    }
  }

  // DD/MM/YYYY or MM/DD/YYYY (try DD/MM/YYYY first as it's more common internationally)
  const slashParts = raw.split("/");
  if (slashParts.length === 3) {
    const [a, b, c] = slashParts.map(Number);
    if (c > 31) {
      // c is year → DD/MM/YYYY
      const d = new Date(Date.UTC(c, b - 1, a, 12, 0, 0));
      if (!isNaN(d.getTime())) return d;
    } else {
      // MM/DD/YYYY
      const d = new Date(Date.UTC(a < 100 ? a + 2000 : a, b - 1, c, 12, 0, 0));
      if (!isNaN(d.getTime())) return d;
    }
  }

  // MM-DD-YYYY
  const dashParts = raw.split("-");
  if (dashParts.length === 3 && dashParts[2].length === 4) {
    const [m, d, y] = dashParts.map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/** Parses amounts in US (1,234.56), European (1.234,56), and currency-prefixed ($1,234.56) formats */
function parseFlexibleAmount(raw: string): number {
  // Remove currency symbols and whitespace
  let cleaned = raw.replace(/[€£¥₹$\s]/g, "");

  // European format: 1.234,56 → detect by comma being the decimal separator
  if (/\d+\.\d{3},\d{1,2}$/.test(cleaned) || /^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(cleaned)) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // US format: remove thousands commas
    cleaned = cleaned.replace(/,/g, "");
  }

  return parseFloat(cleaned);
}

export async function importExpenses(
  rows: ImportRow[],
  targetUserId?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Server-side validation: limit row count to prevent memory abuse
  if (!Array.isArray(rows) || rows.length === 0) {
    return { error: "No data to import." };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return { error: `Too many rows. Maximum ${MAX_IMPORT_ROWS} rows per import.` };
  }

  const userId =
    session.user.role === "ADMIN" && targetUserId
      ? targetUserId
      : session.user.id;

  const errors: string[] = [];
  const validRows: {
    date: Date;
    category: string;
    vendor: string;
    amount: number;
    notes: string | null;
    userId: string;
  }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (!row.date || !row.category || !row.vendor || !row.amount) {
      errors.push(`Row ${rowNum}: Missing required fields`);
      continue;
    }

    const date = parseFlexibleDate(row.date.trim());
    if (!date) {
      errors.push(`Row ${rowNum}: Invalid date "${row.date}"`);
      continue;
    }

    const amount = parseFlexibleAmount(row.amount.toString().trim());
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Row ${rowNum}: Invalid amount "${row.amount}"`);
      continue;
    }

    validRows.push({
      date,
      category: row.category.trim(),
      vendor: row.vendor.trim(),
      amount,
      notes: row.notes?.trim() || null,
      userId,
    });
  }

  if (errors.length > 0 && validRows.length === 0) {
    return { error: errors.join("; ") };
  }

  await db.expense.createMany({ data: validRows });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");

  return {
    success: true,
    imported: validRows.length,
    skipped: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}
