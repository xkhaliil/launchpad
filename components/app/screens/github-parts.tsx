"use client";

import { Check, LoaderCircle, Minus, X } from "lucide-react";
import type { ReactNode } from "react";
import { demoNow } from "@/lib/demo/clock";
import type { ProposalStatus, RepoSummary } from "@/lib/core/github/types";

/* Small pieces shared by the GitHub list and the repo page. */

export function relativeTime(iso: string | null, now = demoNow()): string {
  if (!iso) return "never";
  const minutes = Math.round((now - Date.parse(iso)) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 31) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30.4);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** A 0–100 health score as a short bar and the number. */
export function HealthMeter({ score }: { score: number }) {
  const tone =
    score >= 80 ? "bg-success" : score >= 50 ? "bg-accent" : "bg-danger";
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-ink/8 sm:block"
      >
        <span
          className={`block h-full rounded-full ${tone}`}
          style={{ width: `${score}%` }}
        />
      </span>
      <span className="w-7 text-right text-sm font-medium tabular-nums">
        {score}
        <span className="sr-only"> health</span>
      </span>
    </span>
  );
}

/**
 * Four fixed slots, as in gitms: Description, README, Topics, License.
 * The same letters in the same place on every row read as one column.
 */
export function MissingSlots({ repo }: { repo: RepoSummary }) {
  const slots = [
    {
      key: "D",
      label: "description",
      missing: !repo.description,
      severe: true,
    },
    { key: "R", label: "README", missing: !repo.files.hasReadme, severe: true },
    {
      key: "T",
      label: "topics",
      missing: repo.topics.length === 0,
      severe: false,
    },
    {
      key: "L",
      label: "license",
      missing: !repo.files.hasLicenseFile && !repo.license,
      severe: false,
    },
  ];
  const missing = slots.filter((slot) => slot.missing);
  return (
    <span className="flex gap-1">
      <span className="sr-only">
        {missing.length
          ? `Missing ${missing.map((slot) => slot.label).join(", ")}`
          : "Nothing missing"}
      </span>
      {slots.map((slot) => (
        <span
          key={slot.key}
          aria-hidden
          title={slot.missing ? `Missing ${slot.label}` : `Has ${slot.label}`}
          className={`grid size-5 place-items-center rounded font-mono text-[11px] leading-none ${
            slot.missing
              ? slot.severe
                ? "bg-danger/12 text-danger"
                : "bg-accent-soft text-accent-strong"
              : "text-ink/20"
          }`}
        >
          {slot.key}
        </span>
      ))}
    </span>
  );
}

const STATUS: Record<ProposalStatus, { label: string; tone: string }> = {
  pending: { label: "To review", tone: "bg-accent-soft text-accent-strong" },
  approved: { label: "Approved", tone: "bg-ink text-paper" },
  applied: { label: "Applied", tone: "bg-success-soft text-success" },
  skipped: { label: "Skipped", tone: "bg-ink/5 text-ink-muted" },
  failed: { label: "Failed", tone: "bg-danger/10 text-danger" },
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  const { label, tone } = STATUS[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tone}`}
    >
      {label}
    </span>
  );
}

export type RunStep = {
  repo: string;
  state: "pending" | "running" | "done" | "skipped" | "failed";
  message?: string;
};

export type Run = {
  kind: "scan" | "generate";
  steps: RunStep[];
  finished: boolean;
};

const STEP_ICON = {
  pending: <span className="size-1.5 rounded-full bg-ink/20" />,
  running: <LoaderCircle className="size-4 animate-spin text-accent" />,
  done: <Check className="size-4 text-success" strokeWidth={2.5} />,
  skipped: <Minus className="size-4 text-ink-muted" />,
  failed: <X className="size-4 text-danger" />,
};

/** Progress of a scan or a drafting run, one line per repo. */
export function RunView({
  run,
  onClose,
  footer,
}: {
  run: Run;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const done = run.steps.filter(
    (step) => step.state !== "pending" && step.state !== "running",
  ).length;
  const title =
    run.kind === "scan"
      ? run.finished
        ? `Scanned ${run.steps.length} repositories`
        : `Scanning ${run.steps.length} repositories…`
      : run.finished
        ? "Drafting finished"
        : `Drafting ${run.steps.length} proposal${run.steps.length === 1 ? "" : "s"}…`;

  return (
    <section
      aria-live="polite"
      aria-label={title}
      className="rounded-3xl bg-surface p-5 ring-1 ring-line sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{title}</p>
        {run.finished ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : (
          <span className="text-sm text-ink-muted tabular-nums">
            {done}/{run.steps.length}
          </span>
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/8">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${(done / Math.max(1, run.steps.length)) * 100}%` }}
        />
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {run.steps.map((step) => (
          <li key={step.repo} className="flex items-start gap-3">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center">
              {STEP_ICON[step.state]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-medium">{step.repo}</span>
              {step.message ? (
                <span className="text-ink-muted"> · {step.message}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {run.finished && footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}
