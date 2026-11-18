"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { buttonPrimary } from "@/components/landing/ui";

/*
 * The planned sign-in options (plan.md, section 4: GitHub, Google and an email
 * link). Sign-in is NOT built yet, so every option opens the demo instead:
 * sign up goes to onboarding, log in to the dashboard. No account is created
 * and nothing is sent. When Supabase Auth is added, replace `enterDemo` with
 * the real calls.
 */

const providerButton =
  "flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink/20 bg-surface text-base font-medium text-ink transition-colors hover:border-ink/45 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function GithubIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-5" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const emailId = useId();
  const enterDemo = () =>
    router.push(mode === "signup" ? "/onboarding" : "/dashboard");

  return (
    <div>
      <div className="space-y-3">
        <button type="button" onClick={enterDemo} className={providerButton}>
          <GithubIcon />
          Continue with GitHub
        </button>
        <button type="button" onClick={enterDemo} className={providerButton}>
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      <div
        aria-hidden
        className="my-6 flex items-center gap-4 font-mono text-xs tracking-[0.16em] text-ink-muted uppercase"
      >
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          enterDemo();
        }}
      >
        <label htmlFor={emailId} className="text-sm font-medium">
          Email
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="mt-2 block h-12 w-full rounded-xl border border-line bg-paper px-4 text-base text-ink transition-colors placeholder:text-ink-muted/60 hover:border-ink/30 focus:border-accent focus:bg-surface focus:outline-2 focus:outline-offset-0 focus:outline-accent/25"
        />
        <button
          type="submit"
          className={`${buttonPrimary} mt-4 h-12 w-full px-6 text-base`}
        >
          Continue with email
        </button>
      </form>

      <p className="mt-6 rounded-2xl bg-accent-soft p-4 text-sm leading-6 text-accent-strong">
        Demo: accounts are not open yet. Any option opens the demo with example
        data; no account is created and nothing is sent.
      </p>

      <p className="mt-7 text-sm text-ink-muted">
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <Link
          href={mode === "signup" ? "/login" : "/signup"}
          className="rounded font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {mode === "signup" ? "Log in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
