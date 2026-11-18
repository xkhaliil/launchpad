"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ai } from "@/lib/ai/mock";
import {
  findCliches,
  findPlaceholders,
  paragraphCount,
  WORD_LIMIT,
  wordCount,
} from "@/lib/core/cover-letter";
import { updateDemo, useDemo } from "@/lib/demo/store";
import {
  Badge,
  Bar,
  btn,
  Card,
  inputClass,
  ScreenHero,
  btnDark,
  SectionTitle,
} from "../ui";
import { ScreenMotion } from "../motion";

export function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={btn.secondary}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          // Clipboard blocked: nothing to do, the text is still on screen.
        }
      }}
    >
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

export function CoverLettersScreen() {
  const { profile, coverLetter, jobAds } = useDemo();
  const [drafting, setDrafting] = useState(false);
  const words = wordCount(coverLetter);
  const paragraphs = paragraphCount(coverLetter);
  const cliches = findCliches(coverLetter);
  const placeholders = findPlaceholders(coverLetter);

  const draft = async () => {
    setDrafting(true);
    const text = await ai.draftCoverLetter({ profile });
    updateDemo((state) => ({ ...state, coverLetter: text }));
    setDrafting(false);
  };

  return (
    <ScreenMotion id="cover-letters" className="space-y-4">
      <ScreenHero
        title="Cover letters"
        description="A generic letter from your profile: three paragraphs, under 250 words, without the clichés. Tailored letters are made per job ad."
        stat={words}
        statSuffix={`/${WORD_LIMIT}`}
        statLabel="words in your letter"
        actions={
          <button
            type="button"
            className={btnDark.accent}
            onClick={draft}
            disabled={drafting}
          >
            <Sparkles className="size-4" aria-hidden />
            {drafting ? "Drafting…" : "Draft from my profile"}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
        <Card>
          <SectionTitle action={<CopyButton text={coverLetter} />}>
            Generic letter
          </SectionTitle>
          <label htmlFor="letter" className="sr-only">
            Cover letter text
          </label>
          <textarea
            id="letter"
            rows={18}
            className={`${inputClass} py-3 leading-7 ${drafting ? "opacity-50" : ""}`}
            value={coverLetter}
            onChange={(e) =>
              updateDemo((state) => ({ ...state, coverLetter: e.target.value }))
            }
          />
          <p className="mt-3 text-xs text-ink-muted">
            Drafts use only facts from your profile. Anything missing is left as
            [ADD: …] for you to fill in.
          </p>
        </Card>

        <div className="space-y-4">
          <Card surface="sand">
            <SectionTitle>Checks</SectionTitle>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">Length</span>
              <span
                className={`tabular-nums ${words > WORD_LIMIT ? "text-danger" : "text-ink-muted"}`}
              >
                {words} / {WORD_LIMIT} words
              </span>
            </div>
            <div className="mt-2">
              <Bar
                value={words / WORD_LIMIT}
                className={words > WORD_LIMIT ? "bg-danger" : "bg-accent"}
              />
            </div>
            <p className="mt-4 flex items-baseline justify-between text-sm">
              <span className="font-medium">Paragraphs</span>
              <span className="text-ink-muted">
                {paragraphs} (aim for 3 plus greeting)
              </span>
            </p>
            <p className="mt-4 flex items-baseline justify-between text-sm">
              <span className="font-medium">Placeholders to fill</span>
              <Badge tone={placeholders.length ? "warning" : "success"}>
                {placeholders.length}
              </Badge>
            </p>
          </Card>

          <Card>
            <SectionTitle>
              Clichés{" "}
              <span className="ml-1 align-middle">
                <Badge tone={cliches.length ? "warning" : "success"}>
                  {cliches.length}
                </Badge>
              </span>
            </SectionTitle>
            {cliches.length === 0 ? (
              <p className="text-sm text-ink-muted">None found.</p>
            ) : (
              <ul className="space-y-3">
                {cliches.map((cliche) => (
                  <li
                    key={cliche.phrase}
                    className="rounded-2xl bg-paper p-3.5 text-sm"
                  >
                    <p className="font-medium">“{cliche.phrase}”</p>
                    <p className="mt-1 text-ink-muted">{cliche.suggestion}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle>Tailored letters</SectionTitle>
            <ul className="space-y-2 text-sm">
              {jobAds.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/jobs?ad=${job.id}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 hover:bg-ink/5"
                  >
                    <span className="min-w-0 truncate">
                      {job.title} · {job.company}
                    </span>
                    <Badge tone={job.tailored ? "success" : "neutral"}>
                      {job.tailored ? "Ready" : "Not yet"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </ScreenMotion>
  );
}
