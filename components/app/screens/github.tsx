"use client";

import { GitBranch, RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  demoGithubChanges,
  demoRepos,
  type GithubChange,
} from "@/lib/demo/data";
import { githubProgress } from "@/lib/demo/selectors";
import { type ChangeStatus, updateDemo, useDemo } from "@/lib/demo/store";
import {
  Badge,
  Bar,
  btn,
  Card,
  DemoNote,
  ScreenHero,
  SectionTitle,
} from "../ui";
import { ScreenMotion } from "../motion";

function setStatus(change: GithubChange, status: ChangeStatus) {
  updateDemo((state) => {
    // Applying the bio makes GitHub match the profile headline.
    const sources =
      change.kind === "bio"
        ? {
            ...state.sources,
            github: {
              ...state.sources.github,
              headline:
                status === "applied"
                  ? state.profile.headline
                  : "Full-stack dev",
            },
          }
        : state.sources;
    return {
      ...state,
      sources,
      github: { ...state.github, [change.id]: status },
    };
  });
}

const confidenceTone = {
  high: "success",
  medium: "warning",
  low: "danger",
} as const;

function ChangeCard({
  change,
  status,
}: {
  change: GithubChange;
  status: ChangeStatus;
}) {
  const [step, setStep] = useState<"idle" | "dryRun">("idle");
  const multiline = change.after.includes("\n");

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm text-ink-muted">
            {change.repo
              ? `ada-lovelace/${change.repo}`
              : "Your GitHub profile"}
          </p>
          <h3 className="font-medium">{change.title}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={confidenceTone[change.confidence]}>
            {change.confidence} confidence
          </Badge>
          {status === "applied" ? <Badge tone="success">Applied</Badge> : null}
          {status === "skipped" ? <Badge>Skipped</Badge> : null}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-danger/6 p-3.5">
          <p className="text-xs font-medium text-danger">Now</p>
          <p className="mt-1 break-words text-ink-muted">{change.before}</p>
        </div>
        <div className="min-w-0 rounded-2xl bg-success-soft p-3.5">
          <p className="text-xs font-medium text-success">Proposed</p>
          {multiline ? (
            <pre className="mt-1 overflow-x-auto font-mono text-xs leading-5 whitespace-pre-wrap">
              {change.after}
            </pre>
          ) : (
            <p className="mt-1 break-words">{change.after}</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-muted">
        Based on: {change.evidence.join(" · ")}
      </p>

      {step === "dryRun" && status === "proposed" ? (
        <div className="mt-4 rounded-2xl bg-ink p-4 text-paper">
          <p className="text-xs font-medium text-glow-1">
            Dry run: this is the exact call
          </p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs leading-5 whitespace-pre-wrap">
            {change.call}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex min-h-10 items-center rounded-full bg-paper px-4 text-sm font-medium text-ink"
              onClick={() => setStatus(change, "applied")}
            >
              Apply
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center rounded-full px-4 text-sm text-paper/80 hover:bg-paper/10"
              onClick={() => setStep("idle")}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {status === "proposed" && step === "idle" ? (
          <>
            <button
              type="button"
              className={btn.primary}
              onClick={() => setStep("dryRun")}
            >
              <ShieldCheck className="size-4" aria-hidden />
              Approve
            </button>
            <button
              type="button"
              className={btn.ghost}
              onClick={() => setStatus(change, "skipped")}
            >
              Skip
            </button>
          </>
        ) : null}
        {status !== "proposed" ? (
          <button
            type="button"
            className={btn.secondary}
            onClick={() => {
              setStatus(change, "proposed");
              setStep("idle");
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Undo
          </button>
        ) : null}
      </div>
    </Card>
  );
}

export function GithubScreen() {
  const state = useDemo();
  const progress = githubProgress(state);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const changes = demoGithubChanges.filter(
    (change) =>
      filter === "all" ||
      (state.github[change.id] ?? "proposed") === "proposed",
  );

  return (
    <ScreenMotion id="github" className="space-y-4">
      <ScreenHero
        title="GitHub"
        description="An audit of your profile and repos, and proposed fixes built from your code. Nothing changes on GitHub until you approve it, and every change shows a dry run first."
        stat={progress.health}
        statLabel={`average repo health · ${progress.applied} of ${progress.total} changes applied`}
      />

      <div>
        <DemoNote>
          Demo: no GitHub account is connected and nothing is written. The repos
          and proposals below are examples.
        </DemoNote>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="space-y-4">
          <Card surface="ink">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-paper text-ink">
                <GitBranch className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-medium">ada-lovelace</p>
                <p className="text-sm text-paper/60">Demo account</p>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Repositories</SectionTitle>
            <ul className="space-y-4">
              {demoRepos.map((repo) => (
                <li key={repo.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{repo.name}</span>
                    <span className="text-ink-muted tabular-nums">
                      {repo.isFork ? "fork" : repo.health}
                    </span>
                  </div>
                  {!repo.isFork ? (
                    <div className="mt-1.5">
                      <Bar
                        value={repo.health / 100}
                        className={repo.health < 50 ? "bg-danger" : "bg-accent"}
                      />
                    </div>
                  ) : null}
                  <p className="mt-1.5 text-xs text-ink-muted">
                    {repo.issues.join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium tracking-tight">
              Proposed changes
            </h2>
            <div
              className="flex rounded-full bg-ink/5 p-1 text-sm"
              role="tablist"
              aria-label="Show"
            >
              {(["open", "all"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={filter === value}
                  onClick={() => setFilter(value)}
                  className={`min-h-9 rounded-full px-4 font-medium ${filter === value ? "bg-surface shadow-sm" : "text-ink-muted"}`}
                >
                  {value === "open" ? "To review" : "All"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {changes.length === 0 ? (
              <Card>
                <p className="text-sm text-ink-muted">
                  Nothing left to review.
                </p>
              </Card>
            ) : (
              changes.map((change) => (
                <ChangeCard
                  key={change.id}
                  change={change}
                  status={state.github[change.id] ?? "proposed"}
                />
              ))
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-ink-muted">
            Pinned repos and the profile picture have no public GitHub API, so
            those stay manual steps. README changes open a pull request by
            default.
          </p>
        </div>
      </div>
    </ScreenMotion>
  );
}
