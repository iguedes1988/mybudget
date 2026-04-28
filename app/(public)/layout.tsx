import Link from "next/link";
import { Wallet, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" prefetch={false} className="flex items-center gap-2 font-bold text-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            MyBudget
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              prefetch={false}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Sign in
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
