import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Sign up",
};

// The sign-in options are shown but not connected yet (see AuthForm).
export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      lead="One profile behind every application you send."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
