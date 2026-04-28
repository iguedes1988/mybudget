"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        An error occurred while loading this page. You can try again or navigate elsewhere.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} size="sm">Try again</Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard" prefetch={false}>Back to Dashboard</Link>
        </Button>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-4">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
