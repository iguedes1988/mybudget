"use client";

import { useState, useTransition } from "react";
import { MailWarning, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/actions/verification";

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (dismissed) return null;

  function handleResend() {
    setMessage(null);
    startTransition(async () => {
      const result = await resendVerificationEmail();
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Verification email sent! Check your inbox.");
      }
    });
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <MailWarning className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Please verify your email address to secure your account.
          </span>
          {message && (
            <span className="text-xs text-muted-foreground ml-2">{message}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!message && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isPending}
            >
              {isPending ? (
                <><Loader2 className="h-3 w-3 animate-spin mr-1" />Sending…</>
              ) : "Resend verification email"}
            </Button>
          )}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
