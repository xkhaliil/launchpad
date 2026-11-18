"use client";

import { ArrowRight, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ai } from "@/lib/ai/mock";
import {
  findCliches,
  findPlaceholders,
  WORD_LIMIT,
  wordCount,
} from "@/lib/core/cover-letter";
import { extractKeywords, matchKeywords } from "@/lib/core/keywords";
import type { JobAd } from "@/lib/demo/data";
import { cvText } from "@/lib/demo/selectors";
import { newId, updateDemo, useDemo } from "@/lib/demo/store";
import { CopyButton } from "../copy-button";
import { ScreenMotion } from "../motion";
import { Badge, btn, Disclosure, inputClass, PageHeader } from "../ui";

/*
 * Applications: one entry per job ad, each with its match score and its own
 * cover letter, plus a generic CV and letter for applications without an ad
 * (plan.md, sections 6.3 and 6.4).
 */

const GENERIC = "generic";

function updateJob(id: string, change: Partial<JobAd>) {
  updateDemo((state) => ({
    ...state,
    jobAds: state.jobAds.map((job) =>
      job.id === id ? { ...job, ...change } : job,
    ),
  }));
}

function AddJobAd({
  onAdded,
  onCancel,
}: {
  onAdded: (id: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (text.trim().length < 40) return;
    setBusy(true);
    const details = await ai.readJobAd(text);
    const id = newId("job");
    updateDemo((state) => ({
      ...state,
      jobAds: [
        {
          id,
          ...details,
          text: text.trim(),
          addedOn: "Today",
          tailored: false,
        },
        ...state.jobAds,
      ],
    }));
    setBusy(false);
    setText("");
    onAdded(id);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl bg-surface p-4 ring-1 ring-line sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="job-text" className="font-medium">
          Paste the job ad
        </label>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className={btn.icon}
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <textarea
        id="job-text"
        rows={6}
        required
        minLength={40}
        autoFocus
        className={`${inputClass} mt-2 py-2.5 leading-6`}
        placeholder="Copy the whole ad here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className={`${btn.primary} mt-3`} disabled={busy}>
        <Sparkles className="size-4" aria-hidden />
        {busy ? "Reading the ad…" : "Add and compare"}
      </button>
    </form>
  );
}

/** A letter you can edit, with its checks as small counts underneath. */
function LetterEditor({
  value,
  onChange,
  busy,
}: {
  value: string;
  onChange: (value: string) => void;
  busy: boolean;
}) {
  const words = wordCount(value);
  const cliches = findCliches(value);
  const placeholders = findPlaceholders(value);

  return (
    <div>
      <label htmlFor="letter" className="sr-only">
        Cover letter
      </label>
      <textarea
        id="letter"
        rows={14}
        className={`${inputClass} py-3 leading-7 ${busy ? "opacity-50" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={words > WORD_LIMIT ? "danger" : "neutral"}>
          {words}/{WORD_LIMIT} words
        </Badge>
        <Badge tone={placeholders.length ? "warning" : "success"}>
          {placeholders.length
            ? `${placeholders.length} [ADD] to fill`
            : "Nothing to fill"}
        </Badge>
        <Badge tone={cliches.length ? "warning" : "success"}>
          {cliches.length
            ? `${cliches.length} cliché${cliches.length === 1 ? "" : "s"}`
            : "No clichés"}
        </Badge>
        <span className="ml-auto">
          <CopyButton text={value} size="small" />
        </span>
      </div>
      {cliches.length > 0 ? (
        <Disclosure className="mt-2" summary="How to replace the clichés">
          <ul className="space-y-2 pl-6 text-sm">
            {cliches.map((cliche) => (
              <li key={cliche.phrase}>
                <span className="font-medium">“{cliche.phrase}”</span>
                <span className="text-ink-muted"> · {cliche.suggestion}</span>
              </li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </div>
  );
}

/** The ad text with every recognised keyword highlighted. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, index) => {
        const word = part.replace(/[.,;:!?()]+$/, "");
        const hit = word.length > 1 && extractKeywords(word).length > 0;
        return hit ? (
          <mark
            key={index}
            className="rounded bg-accent-soft px-0.5 text-accent-strong"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}

function JobDetail({ job }: { job: JobAd }) {
  const { profile } = useDemo();
  const [tab, setTab] = useState<"letter" | "ad">("letter");
  const [drafting, setDrafting] = useState(false);
  const keywords = extractKeywords(job.text);
  const before = matchKeywords(keywords, cvText(profile));
  const after = matchKeywords(keywords, cvText(profile, { allFacts: true }));

  const tailor = async () => {
    setDrafting(true);
    const letter = await ai.draftCoverLetter({
      profile,
      company: job.company,
      role: job.title,
      keywords,
    });
    updateJob(job.id, { tailored: true, letter });
    setDrafting(false);
    setTab("letter");
  };

  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl leading-tight font-medium tracking-tight">
            {job.title}
          </h2>
          <p className="mt-0.5 text-ink-muted">
            {job.company} · added {job.addedOn}
          </p>
        </div>
        <button
          type="button"
          className={btn.icon}
          aria-label={`Delete ${job.title}`}
          onClick={() =>
            updateDemo((state) => ({
              ...state,
              jobAds: state.jobAds.filter((item) => item.id !== job.id),
            }))
          }
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>

      {/* The match, as one line: generic → tailored. */}
      <div className="mt-6">
        {/* Nohemi has no arrow glyph, so the arrow is an icon. */}
        <p className="flex flex-wrap items-center gap-x-2">
          <span className="text-sm text-ink-muted">Keyword match</span>
          <span className="text-lg font-medium tabular-nums">
            {before.score}
          </span>
          {after.score > before.score ? (
            <>
              <ArrowRight className="size-4 text-ink-muted" aria-hidden />
              <span className="text-lg font-medium tabular-nums">
                {after.score}
              </span>
              <span className="text-sm text-ink-muted">when tailored</span>
            </>
          ) : (
            <span className="text-sm text-ink-muted">· tailoring keeps it</span>
          )}
        </p>
        <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-ink/8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent/35"
            style={{ width: `${after.score}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            style={{ width: `${before.score}%` }}
          />
        </div>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Keywords">
          {after.matched.map((keyword) => (
            <li key={keyword}>
              <Badge tone="success">{keyword}</Badge>
            </li>
          ))}
          {after.missing.map((keyword) => (
            <li key={keyword}>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs text-ink-muted ring-1 ring-ink/15 ring-inset">
                {keyword}
              </span>
            </li>
          ))}
        </ul>
        {after.missing.length > 0 ? (
          <p className="mt-2 text-xs text-ink-muted">
            Outlined: not on your CV. They are never added for you.
          </p>
        ) : null}
      </div>

      {/* Letter or ad, one at a time. */}
      <div
        role="tablist"
        aria-label="Show"
        className="mt-8 flex gap-6 border-b border-line"
      >
        {(
          [
            ["letter", "Cover letter"],
            ["ad", "Job ad"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`tab-${value}`}
            aria-selected={tab === value}
            aria-controls={`panel-${value}`}
            onClick={() => setTab(value)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              tab === value
                ? "border-ink text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="pt-5"
      >
        {tab === "ad" ? (
          <p className="max-w-2xl leading-7 text-pretty">
            <Highlighted text={job.text} />
          </p>
        ) : job.letter ? (
          <>
            <LetterEditor
              value={job.letter}
              busy={drafting}
              onChange={(letter) => updateJob(job.id, { letter })}
            />
            <button
              type="button"
              className={`${btn.ghost} mt-2 -ml-3`}
              onClick={tailor}
              disabled={drafting}
            >
              <Sparkles className="size-4" aria-hidden />
              {drafting ? "Drafting…" : "Draft again"}
            </button>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-10 text-center">
            <p className="font-medium">No letter for this job yet</p>
            <p className="mt-1 text-sm text-ink-muted">
              Drafted from your profile, using the ad&apos;s words.
            </p>
            <button
              type="button"
              className={`${btn.accent} mt-5`}
              onClick={tailor}
              disabled={drafting}
            >
              <Sparkles className="size-4" aria-hidden />
              {drafting ? "Tailoring…" : "Tailor CV and letter"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GenericDetail() {
  const { profile, coverLetter } = useDemo();
  const [drafting, setDrafting] = useState(false);

  const draft = async () => {
    setDrafting(true);
    const text = await ai.draftCoverLetter({ profile });
    updateDemo((state) => ({ ...state, coverLetter: text }));
    setDrafting(false);
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl leading-tight font-medium tracking-tight">
            Generic
          </h2>
          <p className="mt-0.5 text-ink-muted">
            Your CV and a letter for any job, without an ad.
          </p>
        </div>
        <button
          type="button"
          className={btn.secondary}
          onClick={draft}
          disabled={drafting}
        >
          <Sparkles className="size-4" aria-hidden />
          {drafting ? "Drafting…" : "Draft from my profile"}
        </button>
      </div>
      <div className="mt-6">
        <LetterEditor
          value={coverLetter}
          busy={drafting}
          onChange={(text) =>
            updateDemo((state) => ({ ...state, coverLetter: text }))
          }
        />
      </div>
    </div>
  );
}

export function JobsScreen() {
  const { profile, jobAds } = useDemo();
  const params = useSearchParams();
  const [selectedId, setSelectedId] = useState<string>(
    params.get("ad") ?? jobAds[0]?.id ?? GENERIC,
  );
  const [adding, setAdding] = useState(false);

  const job = jobAds.find((item) => item.id === selectedId);
  const generic = cvText(profile, { allFacts: true });
  const rows = [
    ...jobAds.map((item) => ({
      id: item.id,
      title: item.title,
      meta: item.company,
      score: matchKeywords(extractKeywords(item.text), generic).score,
      done: !!item.letter,
    })),
    {
      id: GENERIC,
      title: "Generic",
      meta: "For any job",
      score: null,
      done: false,
    },
  ];
  const selected = job ? job.id : GENERIC;

  return (
    <ScreenMotion id="jobs" className="space-y-8">
      <PageHeader
        title="Applications"
        stat={jobAds.length}
        statLabel={`job ad${jobAds.length === 1 ? "" : "s"} · ${jobAds.filter((item) => item.letter).length} with a letter`}
        actions={
          adding ? null : (
            <button
              type="button"
              className={btn.primary}
              onClick={() => setAdding(true)}
            >
              <Plus className="size-4" aria-hidden />
              Add job ad
            </button>
          )
        }
      />

      {adding ? (
        <AddJobAd
          onAdded={(id) => {
            setSelectedId(id);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <nav aria-label="Applications" data-motion="tile" data-motion-hide>
          {/* Stacked on every size: a sideways scroller hides entries and
              widens the page on phones. */}
          <ul className="space-y-1">
            {rows.map((row) => {
              const active = row.id === selected;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      active
                        ? "bg-surface shadow-[0_1px_2px_rgb(26_22_19/0.06),0_0_0_1px_var(--color-line)]"
                        : "hover:bg-ink/[0.04]"
                    } ${row.id === GENERIC ? "mt-3" : ""}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {row.title}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {row.meta}
                        {row.done ? " · letter ready" : ""}
                      </span>
                    </span>
                    {row.score !== null ? (
                      <span
                        className="text-sm font-medium tabular-nums"
                        title="Keyword match when tailored"
                      >
                        {row.score}
                        <span className="sr-only">% keyword match</span>
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div data-motion="tile" data-motion-hide>
          {job ? <JobDetail key={job.id} job={job} /> : <GenericDetail />}
        </div>
      </div>
    </ScreenMotion>
  );
}
