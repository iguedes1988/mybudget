import type { Metadata } from "next";
import { Receipt, Tags, BarChart3, Download, Users, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How It Works — MyBudget",
  description: "Learn how MyBudget helps you track expenses and manage finances",
};

const steps = [
  {
    number: 1,
    title: "Add Your Expenses",
    description:
      "Record each expense with a date, amount, vendor, and category. Use the quick-add form or bulk import from Excel/CSV files you already have.",
    icon: Receipt,
    color: "text-primary bg-primary/10",
  },
  {
    number: 2,
    title: "Categorize Everything",
    description:
      "Choose from 19 built-in categories like Housing, Transportation, Healthcare, and more. Categories are color-coded for quick visual identification across charts and tables.",
    icon: Tags,
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    number: 3,
    title: "View Your Dashboard",
    description:
      "See your spending at a glance: year-to-date totals, monthly trends, category breakdowns in pie charts, and recent transactions. Filter by month, year, or team member.",
    icon: BarChart3,
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    number: 4,
    title: "Generate Reports",
    description:
      "Dive deeper with monthly reports showing spending by category over the entire year. View data as tables, bar charts, and export to Excel for further analysis.",
    icon: Download,
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    number: 5,
    title: "Collaborate with Your Team",
    description:
      "Create a Team or Family account and invite up to 4 members. Everyone shares the same financial data, and you can filter by member to see individual contributions.",
    icon: Users,
    color: "text-violet-600 bg-violet-500/10",
  },
  {
    number: 6,
    title: "Stay Private & Secure",
    description:
      "Your data is secure. MyBudget uses encrypted passwords, rate-limited authentication, and has no third-party tracking.",
    icon: Shield,
    color: "text-rose-600 bg-rose-500/10",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">How It Works</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
          MyBudget makes it simple to track every dollar. Here&apos;s how to get started
          in six easy steps.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <Card key={step.number} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
