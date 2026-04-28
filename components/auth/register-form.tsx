"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, User, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES = [
  {
    value: "PERSONAL",
    label: "Personal",
    description: "Just you",
    icon: User,
  },
  {
    value: "TEAM",
    label: "Team",
    description: "Up to 5 members",
    icon: Users,
  },
  {
    value: "FAMILY",
    label: "Family",
    description: "Up to 5 members",
    icon: Heart,
  },
];

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState("PERSONAL");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("accountType", accountType);
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create account</h2>
        <p className="text-muted-foreground mt-1">Start tracking your expenses privately</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-4">
        {/* Account Type Selector */}
        <div className="space-y-2">
          <Label>Account Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setAccountType(type.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center",
                  accountType === type.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <type.icon className="h-5 w-5" />
                <span className="text-xs font-semibold">{type.label}</span>
                <span className="text-[10px] opacity-70">{type.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Team/Family Name */}
        {accountType !== "PERSONAL" && (
          <div className="space-y-2">
            <Label htmlFor="teamName">
              {accountType === "FAMILY" ? "Family Name" : "Team Name"}
            </Label>
            <Input
              id="teamName"
              name="teamName"
              type="text"
              placeholder={accountType === "FAMILY" ? "e.g. The Smiths" : "e.g. Marketing Team"}
              required
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              You can invite up to 4 more members after creating your account.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            disabled={isPending}
          />
        </div>

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
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              required
              autoComplete="new-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={isPending}
          />
        </div>

        <input type="hidden" name="accountType" value={accountType} />

        {/* Terms acceptance */}
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="termsAccepted"
            name="termsAccepted"
            value="true"
            required
            disabled={isPending}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-input accent-primary cursor-pointer"
          />
          <label htmlFor="termsAccepted" className="text-sm text-muted-foreground leading-snug cursor-pointer">
            I agree to the{" "}
            <Link href="/terms" target="_blank" className="underline text-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="underline text-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" prefetch={false} className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
