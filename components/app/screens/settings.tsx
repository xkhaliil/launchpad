"use client";

import { Check, Download, RotateCcw } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { ai } from "@/lib/ai/mock";
import { resetDemo, updateDemo, useDemo } from "@/lib/demo/store";
import { ScreenMotion } from "../motion";
import { Badge, btn, listClass, PageHeader } from "../ui";

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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-motion="tile"
      data-motion-hide
      className="scroll-mt-24"
    >
      <h2
        id={`${id}-title`}
        className="mb-2 text-lg font-medium tracking-tight"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{children}</dd>
    </div>
  );
}

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
    <ScreenMotion id="settings" className="space-y-12">
      <PageHeader
        title="Settings"
        stat={state.plan === "pro" ? "Pro" : "Free"}
        statLabel="plan · demo data"
      />

      <div className="grid max-w-3xl grid-cols-1 gap-12">
        <Section id="account" title="Account">
          <dl className={listClass}>
            <Row label="Name">{state.profile.fullName}</Row>
            <Row label="Email">{state.profile.email}</Row>
            <Row label="Sign-in">Demo (no account)</Row>
            <Row label="GitHub">
              <Badge>Not connected</Badge>
            </Row>
            <Row label="AI provider">
              <Badge tone="warning">{ai.name}</Badge>
            </Row>
          </dl>
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            Drafts come from a mock that only rearranges your profile facts. A
            real provider must not train on student data.{" "}
            <Link href="/profile" className="underline underline-offset-2">
              Edit your details in Profile
            </Link>
            .
          </p>
        </Section>

        <Section id="plan" title="Plan">
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
                  className={`rounded-3xl p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    active
                      ? "bg-ink text-paper"
                      : "bg-surface ring-1 ring-line hover:ring-ink/30"
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
            Demo: switching is free. Prices are a proposal; payments are not set
            up.
          </p>
        </Section>

        <Section id="data" title="Your data">
          <p className="text-sm text-ink-muted">
            Everything is stored only in this browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={btn.secondary}
              onClick={exportData}
            >
              <Download className="size-4" aria-hidden />
              Export my data
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
        </Section>
      </div>
    </ScreenMotion>
  );
}
