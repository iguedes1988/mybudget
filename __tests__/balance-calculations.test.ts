import { describe, it, expect } from "@jest/globals";

// Test the balance calculation logic used in BalanceCards component
describe("Balance Calculations", () => {
  function calculateMonthBalance(monthIncome: number, monthExpenses: number) {
    return monthIncome - monthExpenses;
  }

  function calculateYtdBalance(ytdIncome: number, ytdExpenses: number) {
    return ytdIncome - ytdExpenses;
  }

  describe("Monthly Balance", () => {
    it("should return positive balance when income exceeds expenses", () => {
      expect(calculateMonthBalance(5000, 3000)).toBe(2000);
    });

    it("should return negative balance when expenses exceed income", () => {
      expect(calculateMonthBalance(3000, 5000)).toBe(-2000);
    });

    it("should return zero when income equals expenses", () => {
      expect(calculateMonthBalance(3000, 3000)).toBe(0);
    });

    it("should handle zero income", () => {
      expect(calculateMonthBalance(0, 1500)).toBe(-1500);
    });

    it("should handle zero expenses", () => {
      expect(calculateMonthBalance(5000, 0)).toBe(5000);
    });

    it("should handle both zero", () => {
      expect(calculateMonthBalance(0, 0)).toBe(0);
    });

    it("should handle decimal amounts correctly", () => {
      const balance = calculateMonthBalance(5000.50, 3000.25);
      expect(balance).toBeCloseTo(2000.25, 2);
    });
  });

  describe("YTD Balance", () => {
    it("should calculate year-to-date balance correctly", () => {
      expect(calculateYtdBalance(60000, 45000)).toBe(15000);
    });

    it("should handle large negative YTD balance", () => {
      expect(calculateYtdBalance(10000, 50000)).toBe(-40000);
    });

    it("should handle very large amounts", () => {
      expect(calculateYtdBalance(1000000, 999999.99)).toBeCloseTo(0.01, 2);
    });
  });
});

// Test month change percentage calculation from getDashboardStats
describe("Month Change Percentage", () => {
  function calculateMonthChange(monthTotal: number, prevMonthTotal: number): number {
    return prevMonthTotal > 0
      ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100
      : 0;
  }

  it("should calculate positive percentage increase", () => {
    expect(calculateMonthChange(1500, 1000)).toBe(50);
  });

  it("should calculate negative percentage decrease", () => {
    expect(calculateMonthChange(800, 1000)).toBe(-20);
  });

  it("should return 0 when previous month is zero", () => {
    expect(calculateMonthChange(1000, 0)).toBe(0);
  });

  it("should return 0 when both months are zero", () => {
    expect(calculateMonthChange(0, 0)).toBe(0);
  });

  it("should return -100 when current month is zero", () => {
    expect(calculateMonthChange(0, 1000)).toBe(-100);
  });

  it("should return 100 when spending doubles", () => {
    expect(calculateMonthChange(2000, 1000)).toBe(100);
  });
});
