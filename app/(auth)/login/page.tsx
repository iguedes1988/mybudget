import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — MyBudget",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginForm
      callbackUrl={params.callbackUrl}
      justRegistered={params.registered === "true"}
      error={params.error}
    />
  );
}
