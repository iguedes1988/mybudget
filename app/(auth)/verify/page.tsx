import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmailToken } from "@/actions/verification";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email — MyBudget",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          No verification token was provided. Please check your email for the correct link.
        </p>
        <Link href="/login" prefetch={false}>
          <Button variant="outline" size="sm">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  const result = await verifyEmailToken(token);

  if (result.error) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Verification Failed</h2>
        <p className="text-muted-foreground mb-6 text-sm">{result.error}</p>
        <Link href="/login" prefetch={false}>
          <Button variant="outline" size="sm">Back to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Your email address has been verified. You can now sign in to your account.
      </p>
      <Link href="/login" prefetch={false}>
        <Button size="sm">Sign In</Button>
      </Link>
    </div>
  );
}
