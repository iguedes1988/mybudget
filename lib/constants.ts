export const CATEGORIES = [
  "Housing",
  "Transportation",
  "Healthcare",
  "Utilities",
  "Personal Care",
  "Personal Spendings",
  "Groceries",
  "Dining",
  "Leisure",
  "Offerings",
  "Studies",
  "Education",
  "Entertainment",
  "Travel",
  "Insurance",
  "Subscriptions",
  "Clothing",
  "Gifts",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#6366f1",
  Transportation: "#f59e0b",
  Healthcare: "#ef4444",
  Utilities: "#3b82f6",
  "Personal Care": "#ec4899",
  "Personal Spendings": "#8b5cf6",
  Groceries: "#10b981",
  Dining: "#f97316",
  Leisure: "#06b6d4",
  Offerings: "#84cc16",
  Studies: "#14b8a6",
  Education: "#0ea5e9",
  Entertainment: "#a855f7",
  Travel: "#22c55e",
  Insurance: "#64748b",
  Subscriptions: "#e879f9",
  Clothing: "#fb7185",
  Gifts: "#fbbf24",
  Other: "#94a3b8",
};

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

export const INCOME_CATEGORY_COLORS: Record<string, string> = {
  Salary: "#10b981",
  Freelance: "#3b82f6",
  Investment: "#f59e0b",
  Gift: "#ec4899",
  Other: "#94a3b8",
};

export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];
