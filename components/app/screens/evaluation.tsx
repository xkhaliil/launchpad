"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { FIELD_LABELS } from "@/lib/core/consistency";
import { demoHistory } from "@/lib/demo/data";
import { consistencyIssues, evaluation } from "@/lib/demo/selectors";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { Badge, btn, Card, ScreenHero, SectionTitle } from "../ui";
import { ScreenMotion } from "../motion";
import { AreaBar } from "./dashboard";

export function EvaluationScreen() {
  const state = useDemo();
  const result = evaluation(state);
  const issues = consistencyIssues(state);
  const history = [...demoHistory, { label: "Now", score: result.total }];

  return (
    <ScreenMotion id="evaluation" className="space-y-4">
      <ScreenHero
        title="Full evaluation"
        description="Every module scored at once, with the fixes that add the most points first. Scores are estimates: ATS systems and recruiters differ."
        stat={result.total}
        statSuffix="/100"
        statLabel="estimated readiness"
      >
        <AreaBar areas={result.areas} />
      </ScreenHero>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <Card surface="sand" className="flex flex-col">
          <div className="w-full text-left">
            <p className="text-lg font-medium tracking-tight">Progress</p>
            <p className="mt-1 text-sm text-ink-muted">
              Your score at each evaluation.
            </p>
            {/* Score history as simple bars, oldest first. */}
            <ol
              className="mt-3 flex h-32 items-end gap-2"
              aria-label="Score history"
            >
              {history.map((entry) => (
                <li
                  key={entry.label}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span className="text-xs tabular-nums">{entry.score}</span>
                  <span
                    className={`w-full rounded-t-lg ${entry.label === "Now" ? "bg-accent" : "bg-ink/15"}`}
                    style={{ height: `${entry.score}%` }}
                  />
                  <span className="text-[11px] whitespace-nowrap text-ink-muted">
                    {entry.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle>Top fixes</SectionTitle>
            {result.topFixes.length === 0 ? (
              <p className="text-sm text-ink-muted">Nothing left to fix.</p>
            ) : (
              <ol className="space-y-2">
                {result.topFixes.map((fix, index) => (
                  <li key={fix.areaId}>
                    <Link
                      href={fix.href}
                      className="group flex items-center gap-4 rounded-2xl bg-paper p-4 transition-colors hover:bg-ink hover:text-paper"
                    >
                      <span className="text-sm text-ink-muted tabular-nums group-hover:text-paper/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink-muted group-hover:text-paper/60">
                          {fix.label}
                        </span>
                        <span className="block font-medium text-pretty">
                          {fix.fix}
                        </span>
                      </span>
                      <Badge tone="warning">+{fix.gain}</Badge>
                      <ArrowRight className="size-4 shrink-0" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>

      <section id="consistency" className="scroll-mt-24 pt-6">
        <SectionTitle>
          Consistency{" "}
          <span className="ml-1 align-middle">
            <Badge tone={issues.length ? "warning" : "success"}>
              {issues.length
                ? `${issues.length} mismatch${issues.length === 1 ? "" : "es"}`
                : "All match"}
            </Badge>
          </span>
        </SectionTitle>
        <p className="-mt-2 mb-4 max-w-2xl text-sm text-ink-muted">
          Your name, headline, location and email compared across your profile,
          LinkedIn and GitHub. Your profile is the reference.
        </p>
        {issues.length === 0 ? (
          <Card className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-success-soft text-success">
              <Check className="size-4" strokeWidth={3} aria-hidden />
            </span>
            <p className="font-medium">Everything matches your profile.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {issues.map((issue) => (
              <li key={`${issue.sourceId}-${issue.field}`}>
                <Card className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-muted">
                      {FIELD_LABELS[issue.field]} on {issue.sourceLabel}
                    </p>
                    <p className="font-medium break-words text-danger">
                      {issue.value}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink-muted">Your profile</p>
                    <p className="font-medium break-words">{issue.expected}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={issue.severity === "high" ? "danger" : "warning"}
                    >
                      {issue.severity}
                    </Badge>
                    <button
                      type="button"
                      className={btn.primary}
                      onClick={() =>
                        updateDemo((s) => ({
                          ...s,
                          sources: {
                            ...s.sources,
                            [issue.sourceId]: {
                              ...s.sources[
                                issue.sourceId as "linkedin" | "github"
                              ],
                              [issue.field]: issue.expected,
                            },
                          },
                        }))
                      }
                    >
                      Use profile value
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-5 text-ink-muted">
          On LinkedIn you paste the value yourself; on GitHub the change goes
          through the usual approval and dry run.
        </p>
      </section>
    </ScreenMotion>
  );
}
