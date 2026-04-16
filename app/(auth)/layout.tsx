import Link from "next/link";
import { Wallet } from "lucide-react";

const staticLinks = [
  { name: "How it Works", href: "/how-it-works" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const features = [
    { label: "100% Private", desc: "Easy and intuitive expense tracking. Your data stays private and secure." },
    { label: "Multi-User", desc: "Teams & families supported" },
    { label: "Excel Export", desc: "Download your data anytime" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="flex items-center justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl">
              <Wallet className="h-9 w-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">MyBudget</h1>
          <p className="text-lg text-white/70 mb-8">
            Your private personal finance tracker.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {features.map((feature) => (
              <div key={feature.label} className="bg-white/10 rounded-lg p-3">
                <p className="font-semibold text-sm text-white">{feature.label}</p>
                <p className="text-xs text-white/60 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">MyBudget</span>
          </div>
          {children}
          {/* Static page links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-8 pt-6 border-t">
            {staticLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
