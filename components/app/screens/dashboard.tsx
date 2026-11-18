"use client";

import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import { checkCv } from "@/lib/core/ats";
import type { AreaResult } from "@/lib/core/evaluation";
import { extractKeywords, matchKeywords } from "@/lib/core/keywords";
import { FIELD_LABELS } from "@/lib/core/consistency";
import { demoHistory, demoRepos, LINKEDIN_FIELDS } from "@/lib/demo/data";
import {
  consistencyIssues,
  cvText,
  evaluation,
  githubProgress,
  requiredDocs,
} from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/store";
import { CvDocument } from "../cv-document";
import { CountUp, ScreenMotion } from "../motion";
import { Card as Tile, TileTitle } from "../ui";

/** Short names for the segmented bar, where space is tight. */
const SHORT: Record<string, string> = {
  cv: "CV",
  github: "GitHub",
  linkedin: "LinkedIn",
  coverLetters: "Letters",
  website: "Website",
  documents: "Documents",
  consistency: "Consistency",
};

/** The seven areas as one bar; each takes the width it is worth in the score. */
export function AreaBar({ areas }: { areas: AreaResult[] }) {
  return (
    <>
      <div className="flex gap-1.5">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={area.href}
            style={{ flexGrow: area.max, flexBasis: 0 }}
            className="group min-w-0 md:min-w-28"
            aria-label={`${area.label}: ${area.points} of ${area.max} points`}
          >
            <span className="block h-2.5 overflow-hidden rounded-full bg-white/10">
              <span
                data-motion="fill"
                className={`block h-full rounded-full transition-[width] duration-700 ${
                  area.points === area.max
                    ? "bg-success"
                    : "bg-glow-1 group-hover:bg-paper"
                }`}
                style={{ width: `${(area.points / area.max) * 100}%` }}
              />
            </span>
            <span className="mt-3 hidden truncate text-xs text-paper/60 group-hover:text-paper md:block">
              {SHORT[area.id]}
              <span className="ml-1.5 text-paper/90 tabular-nums">
                {area.points}/{area.max}
              </span>
            </span>
          </Link>
        ))}
      </div>
      {/* On phones the labels go in a grid under the bar. */}
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:hidden">
        {areas.map((area) => (
          <li key={area.id} className="flex justify-between gap-2">
            <span className="text-paper/60">{SHORT[area.id]}</span>
            <span className="tabular-nums">
              {area.points}/{area.max}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Score history as a small line chart, oldest to newest. */
function Sparkline({ values }: { values: number[] }) {
  const W = 220;
  const H = 64;
  const min = Math.min(...values) - 8;
  const max = Math.max(...values) + 4;
  const points = values.map((value, index) => [
    (index / (values.length - 1)) * (W - 8) + 4,
    H - 4 - ((value - min) / (max - min)) * (H - 8),
  ]);
  const line = points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full" aria-hidden>
      <path
        d={`${line} L${last[0]} ${H} L4 ${H} Z`}
        className="fill-glow-1/10"
      />
      <path
        data-motion="draw"
        d={line}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-glow-1"
      />
      {points.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={index === points.length - 1 ? 4 : 2.5}
          className={
            index === points.length - 1 ? "fill-glow-1" : "fill-paper/40"
          }
        />
      ))}
    </svg>
  );
}

export function DashboardScreen() {
  const state = useDemo();
  const { profile } = state;
  const result = evaluation(state);
  const next = result.topFixes[0];
  const cv = checkCv(profile);
  const cvIssues = cv.checks.filter((check) => !check.passed);
  const gh = githubProgress(state);
  const waiting = gh.total - gh.applied;
  const issues = consistencyIssues(state);
  const required = requiredDocs(state);
  const history = [...demoHistory.map((entry) => entry.score), result.total];
  const delta = result.total - demoHistory[0].score;

  return (
    <ScreenMotion id="dashboard" className="space-y-4">
      {/* ---------------- The report ---------------- */}
      <section
        data-motion="tile"
        data-motion-hide
        className="relative isolate overflow-clip rounded-[2rem] bg-ink p-6 text-paper sm:p-9"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-48 -right-40 size-152 bg-radial-[closest-side] from-accent/45 to-transparent" />
          <div className="absolute -bottom-56 -left-32 size-120 bg-radial-[closest-side] from-glow-3/12 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-12">
          <div>
            <h1 className="sr-only">Dashboard</h1>
            <p className="text-paper/70">
              {profile.fullName} · {profile.targetRole}
            </p>
            <p className="mt-4 flex items-end gap-3">
              <CountUp
                value={result.total}
                className="text-[6.5rem] leading-[0.8] font-medium tracking-[-0.06em] tabular-nums sm:text-[9rem]"
              />
              <span className="mb-2 text-2xl text-paper/50 sm:mb-3">/100</span>
            </p>
            <p className="mt-4 max-w-md text-lg leading-7 text-pretty text-paper/80">
              Estimated readiness for {profile.targetRole.toLowerCase()} roles.
              <span className="text-paper/50">
                {" "}
                ATS systems and recruiters differ, so treat it as a guide.
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {next ? (
              <Link
                href={next.href}
                className="group block rounded-3xl bg-paper p-5 text-ink transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center justify-between text-sm text-ink-muted">
                  Next step
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-surface">
                    +{next.gain} points
                  </span>
                </span>
                <span className="mt-3 block text-xl leading-snug font-medium text-pretty">
                  {next.fix}
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                  Do it now
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ) : null}
            <div className="rounded-3xl bg-white/6 p-5 ring-1 ring-white/10">
              <p className="flex items-baseline justify-between text-sm">
                <span className="text-paper/70">
                  Since {demoHistory[0].label}
                </span>
                <span className="font-medium text-glow-1">
                  {delta >= 0 ? "+" : ""}
                  {delta} points
                </span>
              </p>
              <Sparkline values={history} />
            </div>
          </div>
        </div>

        {/* Each area takes as much width as it is worth in the score. */}
        <div className="mt-10">
          <AreaBar areas={result.areas} />
        </div>
      </section>

      {/* ---------------- The work ---------------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Tile className="flex flex-col lg:col-span-5">
          <TileTitle href="/evaluation" action="Full report">
            Up next
          </TileTitle>
          <p className="mt-1 text-sm text-ink-muted">
            Ordered by the points each one adds.
          </p>
          <ol className="mt-5 flex-1 divide-y divide-line">
            {result.topFixes.map((fix, index) => (
              <li key={fix.areaId}>
                <Link
                  href={fix.href}
                  className="group flex items-start gap-4 py-3.5 transition-colors first:pt-0"
                >
                  <span className="mt-0.5 w-5 text-sm text-ink-muted tabular-nums">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-snug font-medium text-pretty group-hover:text-accent">
                      {fix.fix}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink-muted">
                      {fix.label}
                    </span>
                  </span>
                  <span className="mt-0.5 shrink-0 text-sm font-medium text-accent tabular-nums">
                    +{fix.gain}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Tile>

        <Tile surface="sand" className="flex flex-col lg:col-span-7">
          <TileTitle href="/cv" action="CV builder">
            Your CV
          </TileTitle>
          <div className="mt-5 grid flex-1 grid-cols-1 gap-6 sm:grid-cols-[15rem_minmax(0,1fr)]">
            {/* A real thumbnail of the CV, scaled down. */}
            <div
              aria-hidden
              className="relative h-64 overflow-hidden rounded-xl bg-white shadow-lift ring-1 ring-black/5 sm:h-auto sm:min-h-72"
            >
              <div className="pointer-events-none absolute top-0 left-0 w-[40rem] origin-top-left scale-[0.375] p-10">
                <CvDocument profile={profile} />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-white to-transparent" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-ink-muted">Estimated ATS score</p>
              <p className="mt-1 flex items-baseline gap-2">
                <CountUp
                  value={cv.score}
                  className="text-6xl leading-none font-medium tracking-tight tabular-nums"
                />
                <span className="text-ink-muted">target 85</span>
              </p>
              <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-ink/10">
                <span
                  data-motion="fill"
                  className="block h-full rounded-full bg-ink transition-[width] duration-700"
                  style={{ width: `${cv.score}%` }}
                />
              </span>
              {cvIssues.length > 0 ? (
                <ul className="mt-5 space-y-2.5 text-sm">
                  {cvIssues.slice(0, 3).map((check) => (
                    <li key={check.id} className="flex gap-2.5">
                      <span
                        aria-hidden
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
                      />
                      {check.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm">Every check passes.</p>
              )}
            </div>
          </div>
        </Tile>

        <Tile className="flex flex-col lg:col-span-7">
          <TileTitle href="/jobs" action="All job ads">
            Applications
          </TileTitle>
          {state.jobAds.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">
              No job ads yet. Paste one to tailor your CV.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {state.jobAds.slice(0, 4).map((job) => {
                const keywords = extractKeywords(job.text);
                const before = matchKeywords(keywords, cvText(profile)).score;
                const after = matchKeywords(
                  keywords,
                  cvText(profile, { allFacts: true }),
                ).score;
                return (
                  <li key={job.id}>
                    <Link
                      href={`/jobs?ad=${job.id}`}
                      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_auto]"
                    >
                      <span className="col-start-1 row-start-1 min-w-0">
                        <span className="block truncate font-medium group-hover:text-accent">
                          {job.title}
                        </span>
                        <span className="block truncate text-sm text-ink-muted">
                          {job.company}
                        </span>
                      </span>
                      <span className="col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                        <span className="flex items-baseline justify-between text-xs text-ink-muted tabular-nums">
                          <span>Match</span>
                          <span>
                            {before}
                            <ArrowRight
                              aria-label="to"
                              className="mx-1 inline size-3 align-[-1px]"
                            />
                            <span className="font-medium text-ink">
                              {after}
                            </span>
                          </span>
                        </span>
                        <span className="relative mt-1.5 block h-1.5 overflow-hidden rounded-full bg-ink/8">
                          <span
                            data-motion="fill"
                            className="absolute inset-y-0 left-0 rounded-full bg-accent/35"
                            style={{ width: `${after}%` }}
                          />
                          <span
                            data-motion="fill"
                            className="absolute inset-y-0 left-0 rounded-full bg-accent"
                            style={{
                              width: `${job.tailored ? after : before}%`,
                            }}
                          />
                        </span>
                      </span>
                      <span
                        className={`col-start-2 row-start-1 justify-self-end rounded-full px-2.5 py-0.5 text-xs font-medium sm:col-start-3 ${
                          job.tailored
                            ? "bg-success-soft text-success"
                            : "bg-paper text-ink-muted ring-1 ring-line"
                        }`}
                      >
                        {job.tailored ? "Tailored" : "To tailor"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/jobs"
            className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-3 text-sm ring-1 ring-line transition-colors hover:ring-ink/25"
            style={{ marginTop: "auto" }}
          >
            Paste a new job ad to tailor your CV
            <ArrowRight aria-hidden className="size-4 shrink-0" />
          </Link>
        </Tile>

        <Tile surface="ink" className="flex flex-col lg:col-span-5">
          <TileTitle href="/github" tone="dark" action="Review">
            GitHub
          </TileTitle>
          <p className="mt-5 flex items-baseline gap-2">
            <CountUp
              value={gh.health}
              className="text-6xl leading-none font-medium tracking-tight tabular-nums"
            />
            <span className="text-paper/60">average repo health</span>
          </p>
          <ul className="mt-6 space-y-3">
            {demoRepos
              .filter((repo) => !repo.isFork)
              .map((repo) => (
                <li
                  key={repo.name}
                  className="grid grid-cols-[7rem_minmax(0,1fr)_2rem] items-center gap-3 text-sm"
                >
                  <span className="truncate text-paper/80">{repo.name}</span>
                  <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      data-motion="fill"
                      className={`block h-full rounded-full ${repo.health < 50 ? "bg-accent" : "bg-glow-1"}`}
                      style={{ width: `${repo.health}%` }}
                    />
                  </span>
                  <span className="text-right text-paper/60 tabular-nums">
                    {repo.health}
                  </span>
                </li>
              ))}
          </ul>
          <Link
            href="/github"
            className="mt-auto flex items-center justify-between gap-3 rounded-2xl bg-white/7 px-4 py-3 text-sm ring-1 ring-white/10 transition-colors hover:bg-white/12"
            style={{ marginTop: "1.5rem" }}
          >
            <span>
              {waiting > 0
                ? `${waiting} change${waiting === 1 ? "" : "s"} waiting for your review`
                : "All changes reviewed"}
            </span>
            <ArrowRight aria-hidden className="size-4 shrink-0" />
          </Link>
        </Tile>

        <Tile surface="accent" className="flex flex-col lg:col-span-4">
          <TileTitle href="/linkedin" tone="dark" action="Studio">
            LinkedIn
          </TileTitle>
          <div
            aria-hidden
            className="mt-5 flex aspect-[4/1] items-end rounded-xl bg-linear-to-r from-glow-2 via-glow-1 to-glow-3 p-3"
          >
            <span className="-mb-6 grid size-11 place-items-center rounded-full border-[3px] border-accent bg-ink text-xs font-medium text-paper">
              {profile.fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
          </div>
          <div className="mt-10 flex gap-1.5" aria-hidden>
            {LINKEDIN_FIELDS.map((field) => (
              <span
                key={field}
                className={`h-2 flex-1 rounded-full ${state.linkedin.done.includes(field) ? "bg-surface" : "bg-surface/25"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm">
            {state.linkedin.done.length} of {LINKEDIN_FIELDS.length} fields done
          </p>
        </Tile>

        <Tile className="flex flex-col lg:col-span-4">
          <TileTitle href="/documents" action="Upload">
            Documents
          </TileTitle>
          <ul className="mt-5 space-y-3">
            {required.map((spec) => {
              const done = !!state.documents[spec.type];
              return (
                <li key={spec.type} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden
                    className={`grid size-6 shrink-0 place-items-center rounded-full ${done ? "bg-ink text-paper" : "border border-dashed border-ink/30 text-ink/40"}`}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      <Minus className="size-3" />
                    )}
                  </span>
                  <span className={done ? "" : "text-ink-muted"}>
                    {spec.label}
                  </span>
                  <span className="sr-only">
                    {done ? "uploaded" : "missing"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Tile>

        <Tile surface="sand" className="flex flex-col lg:col-span-4">
          <TileTitle href="/evaluation#consistency" action="Fix">
            Consistency
          </TileTitle>
          {issues.length === 0 ? (
            <p className="mt-5 flex items-center gap-3 text-sm">
              <span className="grid size-6 place-items-center rounded-full bg-ink text-paper">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              Your profile, LinkedIn and GitHub match.
            </p>
          ) : (
            <>
              <p className="mt-5 text-sm text-ink-muted">
                {issues.length} place{issues.length === 1 ? "" : "s"} where your
                details disagree:
              </p>
              <ul className="mt-3 space-y-2">
                {issues.slice(0, 3).map((issue) => (
                  <li
                    key={`${issue.sourceId}-${issue.field}`}
                    className="rounded-2xl bg-surface/80 px-4 py-3 text-sm"
                  >
                    <span className="block text-ink-muted">
                      {FIELD_LABELS[issue.field]} on {issue.sourceLabel}
                    </span>
                    <span className="block truncate">
                      <span className="text-danger line-through decoration-danger/40">
                        {issue.value}
                      </span>
                      <ArrowRight
                        aria-label="should be"
                        className="mx-1.5 inline size-3.5 align-[-2px] text-ink-muted"
                      />
                      {issue.expected}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Tile>
      </div>
    </ScreenMotion>
  );
}
