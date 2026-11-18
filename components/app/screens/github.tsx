"use client";

import {
  ArrowRight,
  GitBranch,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { PlannedCall, ScanSettings } from "@/lib/core/github/types";
import {
  applyApproved,
  approveAll,
  currentBio,
  generateOne,
  githubAudit,
  githubCounts,
  githubRepos,
  markScanned,
  plannedCalls,
  setBioStatus,
  setScanSetting,
  undoApply,
} from "@/lib/demo/github";
import { DEMO_GITHUB_LOGIN, demoAccount } from "@/lib/demo/github-data";
import { getDemo, useDemo } from "@/lib/demo/store";
import { ScreenMotion } from "../motion";
import { useReview } from "../review";
import { btn, Disclosure, listClass, PageHeader, Segmented } from "../ui";
import {
  HealthMeter,
  MissingSlots,
  relativeTime,
  type Run,
  type RunStep,
  RunView,
  StatusBadge,
} from "./github-parts";
import { RepoDetail } from "./github-repo";

/*
 * The GitHub module, built on gitms (plan.md, section 6.1): scan the account,
 * audit every repo, draft a description, topics and README from the code,
 * review, then apply only what was approved, with a dry run first.
 */

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Filter =
  "all" | "no-description" | "no-readme" | "no-topics" | "stale" | "proposed";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "no-description", label: "No description" },
  { value: "no-readme", label: "No README" },
  { value: "no-topics", label: "No topics" },
  { value: "stale", label: "Stale" },
  { value: "proposed", label: "Has proposal" },
] as const;

const SETTINGS: { key: keyof ScanSettings; label: string; hint: string }[] = [
  {
    key: "includeForks",
    label: "Include forks",
    hint: "A README on someone else's project is rarely wanted.",
  },
  { key: "includeArchived", label: "Include archived repositories", hint: "" },
  {
    key: "includePrivate",
    label: "Include private repositories",
    hint: "They are not on your public profile, but can still be tidied.",
  },
  {
    key: "overwriteExistingReadme",
    label: "Regenerate READMEs that already exist",
    hint: "The current README is used as input and backed up before it is replaced.",
  },
];

export function GithubScreen() {
  const name = useSearchParams().get("repo");
  return name ? <RepoDetail key={name} name={name} /> : <Repositories />;
}

function Repositories() {
  const state = useDemo();
  const review = useReview();
  const { repos, audit, priority } = githubAudit(state);
  const counts = githubCounts(state);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [run, setRun] = useState<Run | null>(null);
  const running = run !== null && !run.finished;
  const scannedAt = state.github.scannedAt;

  const step = (repo: string, patch: Partial<RunStep>) =>
    setRun((current) =>
      current
        ? {
            ...current,
            steps: current.steps.map((item) =>
              item.repo === repo ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );

  const scan = async () => {
    const names = githubRepos(getDemo()).map((repo) => repo.name);
    setRun({
      kind: "scan",
      steps: names.map((repo) => ({ repo, state: "pending" })),
      finished: false,
    });
    for (const repo of names) {
      step(repo, { state: "running" });
      await wait(140);
      const files = demoAccount.find((item) => item.name === repo)?.tree;
      step(repo, {
        state: "done",
        message: files?.length ? `${files.length} files` : "empty repository",
      });
    }
    markScanned();
    setRun((current) => (current ? { ...current, finished: true } : current));
  };

  const generate = async (names: string[]) => {
    setSelected(new Set());
    setRun({
      kind: "generate",
      steps: names.map((repo) => ({ repo, state: "pending" })),
      finished: false,
    });
    for (const repo of names) {
      step(repo, { state: "running", message: "reading the code" });
      const result = await generateOne(repo);
      step(repo, result);
    }
    setRun((current) => (current ? { ...current, finished: true } : current));
  };

  const toggle = (name: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const shown = repos
    .filter((repo) => {
      const issues = audit.repos.find((item) => item.name === repo.name);
      switch (filter) {
        case "no-description":
          return !repo.description;
        case "no-readme":
          return !repo.files.hasReadme;
        case "no-topics":
          return repo.topics.length === 0;
        case "stale":
          return issues?.issues.some((issue) => issue.code === "stale");
        case "proposed":
          return Boolean(state.github.proposals[repo.name]);
        default:
          return true;
      }
    })
    // Worst health first: the point of the list is what needs work.
    .sort(
      (a, b) =>
        (audit.repos.find((item) => item.name === a.name)?.score ?? 100) -
        (audit.repos.find((item) => item.name === b.name)?.score ?? 100),
    );

  const drafted =
    run?.kind === "generate"
      ? run.steps.filter((item) => item.state === "done").length
      : 0;

  return (
    <ScreenMotion id="github" className="space-y-8">
      <PageHeader
        title="GitHub"
        stat={scannedAt ? audit.averageScore : undefined}
        statLabel={
          scannedAt
            ? `average health · ${repos.length} repos · scanned ${relativeTime(scannedAt)}`
            : undefined
        }
        actions={
          scannedAt ? (
            <>
              <button
                type="button"
                className={btn.secondary}
                onClick={scan}
                disabled={running}
              >
                <RefreshCw className="size-4" aria-hidden />
                Rescan
              </button>
              {counts.pending > 0 ? (
                <button
                  type="button"
                  className={`${btn.accent} h-11 px-5`}
                  onClick={() => review.open({ area: "github" })}
                >
                  Review {counts.pending}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              ) : null}
            </>
          ) : null
        }
      >
        Demo: reads the example account {DEMO_GITHUB_LOGIN}. Nothing is sent to
        GitHub.
      </PageHeader>

      {run ? (
        <RunView
          run={run}
          onClose={() => setRun(null)}
          footer={
            run.kind === "generate" && drafted > 0 ? (
              <button
                type="button"
                className={btn.accent}
                onClick={() => {
                  setRun(null);
                  review.open({ area: "github" });
                }}
              >
                Review {drafted} draft{drafted === 1 ? "" : "s"}
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : null
          }
        />
      ) : null}

      {!scannedAt && !run ? (
        <section
          data-motion="tile"
          data-motion-hide
          className="rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center"
        >
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-ink text-paper">
            <GitBranch className="size-5" aria-hidden />
          </span>
          <h2 className="mt-5 text-xl font-medium tracking-tight">
            Scan your repositories
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-ink-muted">
            Reads each repo and its files, then scores what a visitor sees.
            Read-only: nothing on GitHub changes.
          </p>
          <button
            type="button"
            className={`${btn.accent} mt-6 h-11 px-5`}
            onClick={scan}
          >
            Scan my account
          </button>
        </section>
      ) : null}

      {scannedAt ? (
        <>
          {/* The account at a glance. */}
          <dl
            data-motion="tile"
            data-motion-hide
            className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-5 sm:grid-cols-5"
          >
            {[
              { label: "Repositories", value: audit.totals.repos, bad: false },
              {
                label: "No description",
                value: audit.totals.missingDescription,
                bad: audit.totals.missingDescription > 0,
              },
              {
                label: "No README",
                value: audit.totals.missingReadme,
                bad: audit.totals.missingReadme > 0,
              },
              {
                label: "No topics",
                value: audit.totals.missingTopics,
                bad: audit.totals.missingTopics > 0,
              },
              {
                label: "Average health",
                value: audit.averageScore,
                bad: false,
              },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-sm text-ink-muted">{item.label}</dt>
                <dd
                  className={`mt-0.5 text-3xl font-medium tracking-tight tabular-nums ${item.bad ? "text-danger" : ""}`}
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <ProfileRow />

          {counts.pendingRepos > 0 ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm">
              <span className="font-medium text-accent-strong">
                {counts.pendingRepos} draft
                {counts.pendingRepos === 1 ? "" : "s"} waiting for review
              </span>
              <span className="ml-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btn.small}
                  onClick={() => approveAll("high")}
                >
                  Approve all high confidence
                </button>
                <button
                  type="button"
                  className={`${btn.small} border-transparent bg-ink text-paper hover:border-transparent hover:bg-ink/85`}
                  onClick={() => review.open({ area: "github" })}
                >
                  Review one by one
                </button>
              </span>
            </div>
          ) : null}

          {priority.length > 0 ? (
            <section aria-labelledby="first-title">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="first-title" className="font-medium">
                  Fix these first
                  <span className="ml-2 text-sm font-normal text-ink-muted">
                    lowest health that can be fixed here
                  </span>
                </h2>
                <button
                  type="button"
                  className={`${btn.ghost} -mr-3 h-8`}
                  onClick={() => setSelected(new Set(priority))}
                >
                  Select all {priority.length}
                </button>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {priority.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      aria-pressed={selected.has(name)}
                      onClick={() => toggle(name)}
                      className={`h-9 rounded-full px-3.5 font-mono text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                        selected.has(name)
                          ? "bg-ink text-paper"
                          : "bg-surface ring-1 ring-line hover:ring-ink/30"
                      }`}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section
            aria-label="Repositories"
            data-motion="tile"
            data-motion-hide
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <Segmented
                label="Show"
                value={filter}
                options={FILTERS}
                onChange={setFilter}
              />
              <p className="hidden gap-3 text-xs text-ink-muted lg:flex">
                {[
                  ["D", "description"],
                  ["R", "README"],
                  ["T", "topics"],
                  ["L", "license"],
                ].map(([key, label]) => (
                  <span key={key}>
                    <span className="font-mono text-ink">{key}</span> {label}
                  </span>
                ))}
              </p>
            </div>
            <ul className={listClass}>
              {shown.map((repo) => {
                const score =
                  audit.repos.find((item) => item.name === repo.name)?.score ??
                  100;
                const proposal = state.github.proposals[repo.name];
                return (
                  <li key={repo.name} className="flex items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(repo.name)}
                      onChange={() => toggle(repo.name)}
                      aria-label={`Select ${repo.name}`}
                      className="size-4 shrink-0 accent-[var(--color-accent)]"
                    />
                    <Link
                      href={`/github?repo=${encodeURIComponent(repo.name)}`}
                      className="group min-w-0 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <span className="block truncate font-medium group-hover:text-accent-strong">
                        {repo.name}
                        {repo.isFork ? (
                          <span className="ml-2 text-xs font-normal text-ink-muted">
                            fork
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-sm text-ink-muted">
                        {repo.description || (
                          <span className="italic">no description</span>
                        )}
                      </span>
                    </Link>
                    <span className="hidden sm:block">
                      <MissingSlots repo={repo} />
                    </span>
                    <span className="hidden w-28 truncate text-sm text-ink-muted md:block">
                      {repo.language ?? "—"}
                    </span>
                    <span className="hidden w-24 text-sm text-ink-muted xl:block">
                      {relativeTime(repo.pushedAt)}
                    </span>
                    <span className="hidden w-24 sm:block">
                      {proposal ? (
                        <StatusBadge status={proposal.status} />
                      ) : null}
                    </span>
                    <HealthMeter score={score} />
                  </li>
                );
              })}
              {shown.length === 0 ? (
                <li className="py-10 text-center text-sm text-ink-muted">
                  No repositories match this filter.
                </li>
              ) : null}
            </ul>
          </section>

          <ApplySection />

          <Disclosure summary="What to scan">
            <ul className="max-w-xl space-y-3 pl-6">
              {SETTINGS.map((setting) => (
                <li key={setting.key}>
                  <label className="flex cursor-pointer gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
                      checked={state.github.settings[setting.key]}
                      onChange={(event) =>
                        setScanSetting(setting.key, event.target.checked)
                      }
                    />
                    <span>
                      <span className="font-medium">{setting.label}</span>
                      {setting.hint ? (
                        <span className="block text-ink-muted">
                          {setting.hint}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </Disclosure>
        </>
      ) : null}

      {/* What to do with the selection, within reach. */}
      {selected.size > 0 ? (
        <div className="fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 lg:bottom-6">
          <div className="flex items-center gap-2 rounded-full bg-ink py-2 pr-2 pl-5 text-paper shadow-float">
            <span className="text-sm whitespace-nowrap">
              <span className="font-medium tabular-nums">{selected.size}</span>{" "}
              selected
            </span>
            <button
              type="button"
              className="h-9 rounded-full px-3 text-sm text-paper/70 hover:bg-white/10 hover:text-paper"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </button>
            <button
              type="button"
              className={`${btn.accent} h-9`}
              disabled={running}
              onClick={() => generate([...selected])}
            >
              <Sparkles className="size-4" aria-hidden />
              Draft fixes
            </button>
          </div>
        </div>
      ) : null}
    </ScreenMotion>
  );
}

/** The GitHub profile itself: today, only the bio (PATCH /user). */
function ProfileRow() {
  const state = useDemo();
  const review = useReview();
  const status = state.github.bio;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper"
      >
        <GitBranch className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{DEMO_GITHUB_LOGIN}</span>
        <span className="block truncate text-sm text-ink-muted">
          Bio: {currentBio(state) || "none"}
        </span>
      </span>
      {status === "proposed" ? (
        <button
          type="button"
          className={btn.small}
          onClick={() => review.open({ area: "github", first: "github-bio" })}
        >
          Review new bio
        </button>
      ) : (
        <span className="flex items-center gap-2 text-sm text-ink-muted">
          {status === "applied" ? "Bio updated" : "Bio change skipped"}
          <button
            type="button"
            className={`${btn.ghost} h-8 px-2.5 text-[13px]`}
            onClick={() => setBioStatus("proposed")}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Undo
          </button>
        </span>
      )}
    </div>
  );
}

/** Only approved proposals are written, and a dry run comes first. */
function ApplySection() {
  const state = useDemo();
  const counts = githubCounts(state);
  const [dryRun, setDryRun] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [calls, setCalls] = useState<PlannedCall[] | null>(null);
  const runs = state.github.runs;
  const applied = Object.values(state.github.proposals).filter(
    (proposal) => proposal.status === "applied",
  );

  if (counts.approved === 0 && runs.length === 0 && applied.length === 0) {
    return null;
  }

  return (
    <section id="apply" aria-labelledby="apply-title" className="scroll-mt-24">
      <h2 id="apply-title" className="text-lg font-medium tracking-tight">
        Apply to GitHub
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Only approved proposals are written: description, topics and README.md
        on the default branch.{" "}
        <span className="font-medium text-ink tabular-nums">
          {counts.approved} approved.
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            role="switch"
            checked={dryRun}
            onChange={(event) => {
              setDryRun(event.target.checked);
              setConfirming(false);
            }}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-6 w-10 rounded-full bg-ink/15 transition-colors peer-checked:bg-success peer-focus-visible:outline-2 peer-focus-visible:outline-accent after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:shadow after:transition-transform peer-checked:after:translate-x-4"
          />
          <span>
            <span className="font-medium">Dry run</span>
            <span className="text-ink-muted">
              {" "}
              · list the exact calls, send nothing
            </span>
          </span>
        </label>
        {confirming ? null : (
          <button
            type="button"
            className={dryRun ? btn.secondary : btn.primary}
            disabled={counts.approved === 0}
            onClick={() => {
              if (dryRun) {
                setCalls(applyApproved(true).calls);
              } else {
                setConfirming(true);
              }
            }}
          >
            {dryRun
              ? `Dry run (${counts.approved})`
              : `Apply ${counts.approved} for real`}
          </button>
        )}
      </div>

      {confirming ? (
        <div
          role="alertdialog"
          aria-label="Confirm apply"
          className="mt-4 rounded-2xl bg-accent-soft p-4 text-sm"
        >
          <p className="text-accent-strong">
            This writes to {counts.approved}{" "}
            {counts.approved === 1 ? "repository" : "repositories"} on GitHub.
            Existing READMEs are backed up first, and you can undo each one.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className={btn.primary}
              onClick={() => {
                applyApproved(false);
                setConfirming(false);
                setCalls(null);
              }}
            >
              Yes, apply
            </button>
            <button
              type="button"
              className={btn.ghost}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {calls && counts.approved > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium">
            The dry run would make {calls.length} calls. Nothing was sent.
          </p>
          <ul className="mt-2 space-y-1 rounded-2xl bg-ink px-4 py-3 font-mono text-xs leading-5 text-paper/80">
            {calls.map((call, index) => (
              <li key={index} className="break-all">
                <span className="text-glow-1">{call.method}</span> {call.path}
                <span className="text-paper/50"> · {call.summary}</span>
              </li>
            ))}
          </ul>
          {plannedCalls(state).length !== calls.length ? (
            <p className="mt-2 text-xs text-ink-muted">
              The approvals changed since this dry run. Run it again.
            </p>
          ) : null}
        </div>
      ) : null}

      {applied.length > 0 ? (
        <ul className={`mt-6 ${listClass}`} aria-label="Applied">
          {applied.map((proposal) => (
            <li
              key={proposal.name}
              className="flex items-center gap-3 py-3 text-sm"
            >
              <span className="min-w-0 flex-1">
                <span className="font-medium">{proposal.name}</span>
                <span className="text-ink-muted">
                  {" "}
                  · applied {relativeTime(proposal.applied?.at ?? null)}
                </span>
              </span>
              <button
                type="button"
                className={`${btn.ghost} h-8 px-2.5 text-[13px]`}
                onClick={() => undoApply(proposal.name)}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Undo
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {runs.length > 0 ? (
        <Disclosure className="mt-3" summary={`History · ${runs.length}`}>
          <ul className="space-y-1.5 pl-6 text-sm text-ink-muted">
            {runs.map((run) => (
              <li key={run.at}>
                {run.dryRun ? "Dry run" : "Applied"} · {run.repos.length} repo
                {run.repos.length === 1 ? "" : "s"} · {run.calls.length} calls ·{" "}
                {relativeTime(run.at)}
              </li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </section>
  );
}
