import { describe, it, expect } from "@jest/globals";

// Test export format logic — validating the data transformation for each format
describe("Export Format Output", () => {
  const sampleExpenses = [
    { date: new Date("2026-01-15"), vendor: "Supermarket", category: "Groceries", amount: 45.99, notes: "Weekly" },
    { date: new Date("2026-01-20"), vendor: "Gas Station", category: "Transportation", amount: 60.0, notes: "" },
    { date: new Date("2026-02-05"), vendor: "Restaurant", category: "Dining", amount: 35.5, notes: null },
  ];

  const sampleIncomes = [
    { date: new Date("2026-01-01"), source: "Company Inc", category: "Salary", amount: 5000, notes: "" },
  ];

  describe("CSV format", () => {
    function buildCsvRows(expenses: typeof sampleExpenses, incomes: typeof sampleIncomes, includeIncome: boolean) {
      const expenseRows = expenses.map((e) => ({
        Date: e.date.toLocaleDateString("en-US"),
        Description: e.vendor,
        Category: e.category,
        Amount: e.amount,
        Currency: "USD",
        Type: "expense",
        Notes: e.notes || "",
      }));

      const incomeRows = includeIncome
        ? incomes.map((i) => ({
            Date: i.date.toLocaleDateString("en-US"),
            Description: i.source,
            Category: i.category,
            Amount: i.amount,
            Currency: "USD",
            Type: "income",
            Notes: i.notes || "",
          }))
        : [];

      return [...expenseRows, ...incomeRows];
    }

    it("should include all required columns", () => {
      const rows = buildCsvRows(sampleExpenses, sampleIncomes, false);
      const keys = Object.keys(rows[0]);
      expect(keys).toContain("Date");
      expect(keys).toContain("Description");
      expect(keys).toContain("Category");
      expect(keys).toContain("Amount");
      expect(keys).toContain("Currency");
      expect(keys).toContain("Type");
    });

    it("should mark expenses as type 'expense'", () => {
      const rows = buildCsvRows(sampleExpenses, sampleIncomes, false);
      rows.forEach((r) => expect(r.Type).toBe("expense"));
    });

    it("should include income rows when includeIncome is true", () => {
      const rows = buildCsvRows(sampleExpenses, sampleIncomes, true);
      expect(rows.length).toBe(4); // 3 expenses + 1 income
      expect(rows[3].Type).toBe("income");
    });

    it("should not include income rows when includeIncome is false", () => {
      const rows = buildCsvRows(sampleExpenses, sampleIncomes, false);
      expect(rows.length).toBe(3);
    });

    it("should handle empty notes gracefully", () => {
      const rows = buildCsvRows(sampleExpenses, sampleIncomes, false);
      expect(rows[1].Notes).toBe("");
      expect(rows[2].Notes).toBe("");
    });
  });

  describe("Excel format", () => {
    it("should group expenses by month for yearly export", () => {
      const monthGroups: Record<number, typeof sampleExpenses> = {};
      for (const e of sampleExpenses) {
        const m = e.date.getMonth() + 1;
        if (!monthGroups[m]) monthGroups[m] = [];
        monthGroups[m].push(e);
      }

      expect(Object.keys(monthGroups).length).toBe(2); // January and February
      expect(monthGroups[1].length).toBe(2);
      expect(monthGroups[2].length).toBe(1);
    });

    it("should calculate monthly totals correctly", () => {
      const janExpenses = sampleExpenses.filter((e) => e.date.getMonth() === 0);
      const total = janExpenses.reduce((sum, e) => sum + e.amount, 0);
      expect(total).toBeCloseTo(105.99, 2);
    });
  });

  describe("Period filtering", () => {
    function filterByPeriod(
      expenses: typeof sampleExpenses,
      period: "this-month" | "this-year" | "all"
    ) {
      const now = new Date();
      if (period === "all") return expenses;

      if (period === "this-year") {
        return expenses.filter((e) => e.date.getFullYear() === now.getFullYear());
      }

      if (period === "this-month") {
        return expenses.filter(
          (e) => e.date.getFullYear() === now.getFullYear() && e.date.getMonth() === now.getMonth()
        );
      }

      return expenses;
    }

    it("should return all expenses for 'all' period", () => {
      const result = filterByPeriod(sampleExpenses, "all");
      expect(result.length).toBe(3);
    });

    it("should filter by current year for 'this-year' period", () => {
      const result = filterByPeriod(sampleExpenses, "this-year");
      expect(result.length).toBe(3); // All 2026 dates match 2026 year
    });
  });
});
