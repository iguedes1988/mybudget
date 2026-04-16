"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction } from "@/actions/auth";
import { resendVerificationEmail } from "@/actions/verification";

interface LoginFormProps {
  callbackUrl?: string;
  justRegistered?: boolean;
  error?: string;
  emailUnverified?: boolean;
}

export function LoginForm({ callbackUrl, justRegistered, error: urlError, emailUnverified }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(urlError || null);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [showUnverified, setShowUnverified] = useState(!!emailUnverified);

  async function handleSubmit(formData: FormData) {
    if (callbackUrl) formData.append("callbackUrl", callbackUrl);
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleResend() {
    setResendMessage(null);
    startResendTransition(async () => {
      const result = await resendVerificationEmail();
      if (result.error) {
        setResendMessage(result.error);
      } else {
        setResendMessage("Verification email sent! Check your inbox.");
      }
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Welcome</h2>
        <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
      </div>

      {justRegistered && (
        <Alert variant="success" className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Account created! Check your email to verify your address, then sign in.
          </AlertDescription>
        </Alert>
      )}

      {showUnverified && (
        <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
          <MailWarning className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm">Please verify your email address.</span>
            <div className="flex items-center gap-2">
              {resendMessage ? (
                <span className="text-xs text-muted-foreground">{resendMessage}</span>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={isResending}
                  onClick={handleResend}
                >
                  {isResending ? (
                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />Sending…</>
                  ) : "Resend email"}
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isPending}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
