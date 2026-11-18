import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Log in",
};

// The sign-in options are shown but not connected yet (see AuthForm).
export default function LogInPage() {
  return (
    <AuthShell
      title="Welcome back"
      lead="Log in to pick up where you left off."
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
