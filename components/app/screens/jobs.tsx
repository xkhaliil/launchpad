"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ai } from "@/lib/ai/mock";
import { extractKeywords, matchKeywords } from "@/lib/core/keywords";
import type { JobAd } from "@/lib/demo/data";
import { cvText } from "@/lib/demo/selectors";
import { newId, updateDemo, useDemo } from "@/lib/demo/store";
import {
  Badge,
  btn,
  Card,
  DemoNote,
  inputClass,
  ScreenHero,
  btnDark,
  SectionTitle,
} from "../ui";
import { ScreenMotion } from "../motion";
import { CopyButton } from "./cover-letters";

function updateJob(id: string, change: Partial<JobAd>) {
  updateDemo((state) => ({
    ...state,
    jobAds: state.jobAds.map((job) =>
      job.id === id ? { ...job, ...change } : job,
    ),
  }));
}

function AddJobAd({ onAdded }: { onAdded: (id: string) => void }) {
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
    <form onSubmit={submit}>
      <label htmlFor="job-text" className="text-sm font-medium">
        Paste a job description
      </label>
      <textarea
        id="job-text"
        rows={7}
        required
        minLength={40}
        className={`${inputClass} mt-1.5 py-2.5 leading-6`}
        placeholder="Copy the full job ad here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className={`${btn.primary} mt-3`} disabled={busy}>
        <Sparkles className="size-4" aria-hidden />
        {busy ? "Reading the ad…" : "Save and analyse"}
      </button>
    </form>
  );
}

/** The ad text with every recognised keyword highlighted. */
function Highlighted({ text, keywords }: { text: string; keywords: string[] }) {
  if (keywords.length === 0) return <>{text}</>;
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((part, index) => {
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

export function JobsScreen() {
  const { profile, jobAds } = useDemo();
  const params = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(params.get("ad"));
  const [adding, setAdding] = useState(jobAds.length === 0);
  const [drafting, setDrafting] = useState(false);

  const job = jobAds.find((item) => item.id === selectedId) ?? jobAds[0];
  const keywords = job ? extractKeywords(job.text) : [];
  const before = matchKeywords(keywords, cvText(profile));
  const after = matchKeywords(keywords, cvText(profile, { allFacts: true }));

  const tailor = async () => {
    if (!job) return;
    setDrafting(true);
    const letter = await ai.draftCoverLetter({
      profile,
      company: job.company,
      role: job.title,
      keywords,
    });
    updateJob(job.id, { tailored: true, letter });
    setDrafting(false);
  };

  return (
    <ScreenMotion id="jobs" className="space-y-4">
      <ScreenHero
        title="Job ads"
        description="Paste a job ad to get a CV and letter tailored to it, with a match score before and after. Skills you lack are listed as gaps, never added."
        stat={jobAds.length}
        statLabel={`job ads saved · ${jobAds.filter((item) => item.tailored).length} tailored`}
        actions={
          <button
            type="button"
            className={btnDark.primary}
            onClick={() => setAdding((value) => !value)}
          >
            <Plus className="size-4" aria-hidden />
            Add job ad
          </button>
        }
      />

      {adding ? (
        <Card surface="sand">
          <AddJobAd
            onAdded={(id) => {
              setSelectedId(id);
              setAdding(false);
            }}
          />
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <Card pad="tight" className="h-fit">
          <ul className="space-y-1">
            {jobAds.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-current={item.id === job?.id ? "true" : undefined}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                    item.id === job?.id ? "bg-ink text-paper" : "hover:bg-ink/5"
                  }`}
                >
                  <p className="font-medium">{item.title}</p>
                  <p
                    className={`mt-0.5 text-sm ${item.id === job?.id ? "text-paper/70" : "text-ink-muted"}`}
                  >
                    {item.company} · {item.addedOn}
                    {item.tailored ? " · Tailored" : ""}
                  </p>
                </button>
              </li>
            ))}
            {jobAds.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink-muted">
                No job ads yet.
              </li>
            ) : null}
          </ul>
        </Card>

        {job ? (
          <div className="min-w-0 space-y-4">
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-medium tracking-tight">
                    {job.title}
                  </h2>
                  <p className="mt-0.5 text-ink-muted">{job.company}</p>
                </div>
                <button
                  type="button"
                  className={btn.ghost}
                  onClick={() => {
                    updateDemo((state) => ({
                      ...state,
                      jobAds: state.jobAds.filter((item) => item.id !== job.id),
                    }));
                    setSelectedId(null);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Generic CV",
                    value: before.score,
                    tone: "bg-ink/30",
                  },
                  {
                    label: "Tailored CV",
                    value: after.score,
                    tone: "bg-accent",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-paper p-4">
                    <p className="text-sm text-ink-muted">{item.label}</p>
                    <p className="mt-1 text-3xl font-medium tracking-tight tabular-nums">
                      {item.value}
                    </p>
                    <div className="mt-3 h-1.5 rounded-full bg-ink/8">
                      <div
                        className={`h-full rounded-full ${item.tone}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-ink-muted">
                Estimated keyword match. Tailoring reorders and rephrases your
                own facts with the ad&apos;s terms; it never adds skills.
              </p>

              <div className="mt-6">
                <p className="text-sm font-medium">Keywords in this ad</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {after.matched.map((keyword) => (
                    <li key={keyword}>
                      <Badge tone="success">✓ {keyword}</Badge>
                    </li>
                  ))}
                  {after.missing.map((keyword) => (
                    <li key={keyword}>
                      <Badge tone="danger">{keyword}</Badge>
                    </li>
                  ))}
                </ul>
                {after.missing.length > 0 ? (
                  <p className="mt-3 text-sm text-ink-muted">
                    Gaps (not on your CV, not added): {after.missing.join(", ")}
                    .
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btn.accent}
                  onClick={tailor}
                  disabled={drafting}
                >
                  <Sparkles className="size-4" aria-hidden />
                  {drafting
                    ? "Tailoring…"
                    : job.tailored
                      ? "Redo tailored letter"
                      : "Tailor CV and letter"}
                </button>
              </div>
            </Card>

            {job.letter ? (
              <Card>
                <SectionTitle action={<CopyButton text={job.letter} />}>
                  Tailored cover letter
                </SectionTitle>
                <p className="text-sm leading-7 whitespace-pre-line">
                  {job.letter}
                </p>
              </Card>
            ) : job.tailored ? (
              <DemoNote>
                Tailored version saved. Click “Redo tailored letter” to draft
                the letter.
              </DemoNote>
            ) : null}

            <Card surface="sand">
              <SectionTitle>The ad</SectionTitle>
              <p className="text-sm leading-7 text-pretty">
                <Highlighted text={job.text} keywords={keywords} />
              </p>
            </Card>
          </div>
        ) : null}
      </div>
    </ScreenMotion>
  );
}
