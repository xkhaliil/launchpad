"use client";

import { Check, Download, GitBranch, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ai } from "@/lib/ai/mock";
import { resetDemo, updateDemo, useDemo } from "@/lib/demo/store";
import { Badge, btn, Card, ScreenHero, SectionTitle } from "../ui";
import { ScreenMotion } from "../motion";

/** Plans and limits from plan.md, section 9 (proposal; prices not final). */
const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "€0",
    features: [
      "Full profile",
      "1 CV, 3 ATS checks a month",
      "GitHub audit and 3 proposals",
      "Website with a small badge",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "€9 a month",
    features: [
      "Unlimited tailored CVs and letters",
      "Full GitHub manager",
      "LinkedIn studio",
      "Website without badge",
      "Merged application PDF",
    ],
  },
];

export function SettingsScreen() {
  const state = useDemo();
  const [confirming, setConfirming] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "launchpad-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <ScreenMotion id="settings" className="space-y-4">
      <ScreenHero
        title="Settings"
        description="Account, plan, connected services and your data."
        stat={state.plan === "pro" ? "Pro" : "Free"}
        statLabel="current plan · demo data"
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Account</SectionTitle>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Name</dt>
              <dd className="font-medium">{state.profile.fullName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Email</dt>
              <dd className="truncate font-medium">{state.profile.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-muted">Sign-in</dt>
              <dd className="font-medium">Demo (no account)</dd>
            </div>
          </dl>
          <Link href="/profile" className={`${btn.secondary} mt-5`}>
            Edit in profile
          </Link>
        </Card>

        <Card surface="sand">
          <SectionTitle>Connected services</SectionTitle>
          <ul className="space-y-3">
            <li className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 text-sm font-medium">
                <GitBranch className="size-5" aria-hidden /> GitHub
              </span>
              <Badge>Not connected</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3 text-sm font-medium">
                <Sparkles className="size-5" aria-hidden /> AI provider
              </span>
              <Badge tone="warning">{ai.name}</Badge>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-ink-muted">
            Drafts are written by a mock that only rearranges your profile
            facts. Any AI provider can be plugged in later, as long as its terms
            do not allow training on student data.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle>Plan</SectionTitle>
          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
            role="radiogroup"
            aria-label="Plan"
          >
            {plans.map((plan) => {
              const active = state.plan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateDemo((s) => ({ ...s, plan: plan.id }))}
                  className={`rounded-3xl border p-5 text-left transition-colors ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink/30"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-lg font-medium">{plan.name}</span>
                    <span
                      className={active ? "text-paper/70" : "text-ink-muted"}
                    >
                      {plan.price}
                    </span>
                  </span>
                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check
                          className={`mt-0.5 size-4 shrink-0 ${active ? "text-glow-1" : "text-accent"}`}
                          aria-hidden
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Demo: switching plans is free and changes nothing. Prices are a
            proposal; payments are not set up.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle>Your data</SectionTitle>
          <p className="max-w-2xl text-sm text-ink-muted">
            In this demo everything is stored only in this browser. Export it as
            a file, or reset to the example data.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              className={btn.secondary}
              onClick={exportData}
            >
              <Download className="size-4" aria-hidden />
              Export my data (JSON)
            </button>
            {confirming ? (
              <>
                <button
                  type="button"
                  className={`${btn.primary} bg-danger hover:bg-danger/85`}
                  onClick={() => {
                    resetDemo();
                    setConfirming(false);
                  }}
                >
                  Yes, reset everything
                </button>
                <button
                  type="button"
                  className={btn.ghost}
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className={btn.ghost}
                onClick={() => setConfirming(true)}
              >
                <RotateCcw className="size-4" aria-hidden />
                Reset demo data
              </button>
            )}
          </div>
        </Card>
      </div>
    </ScreenMotion>
  );
}
