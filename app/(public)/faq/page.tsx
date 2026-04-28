import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — MyBudget",
  description: "Frequently asked questions about MyBudget",
};

const faqs = [
  {
    question: "How do I create an account?",
    answer:
      "Navigate to the registration page and fill in your name, email, and password. You can choose between a Personal, Team, or Family account type. The first user to register automatically becomes the administrator.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Yes. Passwords are hashed with bcrypt, sessions use JWT tokens, authentication is rate-limited, and all security headers (CSP, X-Frame-Options, etc.) are enforced. We do not sell or share your data.",
  },
  {
    question: "What file formats can I import and export?",
    answer:
      "You can import expenses from CSV, XLS, and XLSX files. The import wizard lets you map your file's columns to the required fields (Date, Category, Vendor, Amount). For exports, you can download your data as CSV, Excel (.xlsx), or PDF. Excel exports include monthly sheets with summary totals.",
  },
  {
    question: "Can I track income as well as expenses?",
    answer:
      "Yes! Enable income tracking from the Settings page. Once enabled, an \"Income\" section appears in the sidebar where you can add, edit, and delete income entries. The dashboard will also show spending-vs-income charts and balance cards.",
  },
  {
    question: "How do categories work?",
    answer:
      "MyBudget comes with 19 built-in expense categories including Housing, Transportation, Healthcare, Groceries, Dining, Entertainment, and more. Each category has a unique color for easy identification in charts and tables. Income has its own set of categories (Salary, Freelance, Investment, Gift, Other).",
  },
  {
    question: "How do Teams and Families work?",
    answer:
      "When you create a Team or Family account, you become the owner and can invite up to 4 additional members via email invitation links. All members share the same financial data — everyone can add expenses, and you can filter by member. The owner can manage members and revoke invitations.",
  },
  {
    question: "How do I delete my data?",
    answer:
      "You can delete individual expenses or income entries from their respective list pages. To delete your entire account and all associated data, go to Settings and use the \"Delete my account\" option in the Danger Zone. Account deletion is soft-deleted with a 30-day grace period during which you can cancel.",
  },
  {
    question: "Is MyBudget free?",
    answer:
      "MyBudget is completely free. There are no subscriptions, premium tiers, or hidden costs.",
  },
  {
    question: "What devices can I use?",
    answer:
      "MyBudget works on any modern web browser — desktop, tablet, or mobile. The interface is fully responsive.",
  },
  {
    question: "Can an administrator see my data?",
    answer:
      "Administrators can view aggregate statistics and manage users from the Admin panel. In team/family accounts, the account owner has admin privileges. Admins have visibility into user data for management purposes.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Everything you need to know about MyBudget.
        </p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-5">
            <h3 className="font-semibold text-base mb-2">{faq.question}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <p className="text-muted-foreground text-sm">
          Still have questions?{" "}
          <Link href="/contact" prefetch={false} className="text-primary hover:underline font-medium">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
