"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { AreaResult, Fix } from "@/lib/core/evaluation";
import { demoHistory } from "@/lib/demo/data";
import { evaluation } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/store";
import { REVIEW_FOR } from "@/lib/demo/suggestions";
import { CountUp, ScreenMotion } from "../motion";
import { useReview } from "../review";
import { btn, listClass } from "../ui";

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
function AreaBar({ areas }: { areas: AreaResult[] }) {
  return (
    <>
      <div className="flex gap-1.5">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={area.href}
            style={{ flexGrow: area.max, flexBasis: 0 }}
            className="group min-w-0 md:min-w-24"
            aria-label={`${area.label}: ${area.points} of ${area.max} points`}
          >
            <span className="block h-2 overflow-hidden rounded-full bg-white/10">
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
            <span className="mt-2.5 hidden truncate text-xs text-paper/55 group-hover:text-paper md:block">
              {SHORT[area.id]}
              <span className="ml-1.5 text-paper/85 tabular-nums">
                {area.points}/{area.max}
              </span>
            </span>
          </Link>
        ))}
      </div>
      {/* On phones the labels go in a grid under the bar. */}
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm md:hidden">
        {areas.map((area) => (
          <li key={area.id} className="flex justify-between gap-2">
            <span className="text-paper/55">{SHORT[area.id]}</span>
            <span className="tabular-nums">
              {area.points}/{area.max}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Starts a step where it is quickest: in the review panel when the app has
 * suggestions for it, otherwise on the screen where it is done.
 */
function StartStep({
  fix,
  className,
  children,
}: {
  fix: Fix;
  className: string;
  children: ReactNode;
}) {
  const { open, countFor } = useReview();
  const area = REVIEW_FOR[fix.areaId];
  if (area && countFor(area) > 0) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => open({ area })}
      >
        {children}
      </button>
    );
  }
  return (
    <Link href={fix.href} className={className}>
      {children}
    </Link>
  );
}

export function DashboardScreen() {
  const state = useDemo();
  const { profile } = state;
  const result = evaluation(state);
  const [next, ...later] = result.topFixes;
  const done = result.areas.filter((area) => area.points === area.max);
  const delta = result.total - demoHistory[0].score;

  return (
    <ScreenMotion id="home" className="space-y-12">
      <h1 className="sr-only">Home</h1>

      {/* Where you stand, and the one thing to do now. */}
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
          <div className="flex min-w-0 flex-col">
            <p className="text-paper/70">
              Readiness for {profile.targetRole.toLowerCase()} roles
            </p>
            <p className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-2">
              <CountUp
                value={result.total}
                className="text-[6.5rem] leading-[0.8] font-medium tracking-[-0.06em] tabular-nums sm:text-[8.5rem]"
              />
              <span className="mb-2 text-2xl text-paper/50">/100</span>
              {delta !== 0 ? (
                <span className="mb-2 rounded-full bg-white/10 px-3 py-1 text-sm text-glow-1 tabular-nums">
                  {delta > 0 ? "+" : ""}
                  {delta} since {demoHistory[0].label}
                </span>
              ) : null}
            </p>
          </div>

          {next ? (
            <div className="flex flex-col rounded-3xl bg-paper p-6 text-ink">
              <p className="flex items-center justify-between gap-3 text-sm text-ink-muted">
                Next step
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-surface tabular-nums">
                  +{next.gain} points
                </span>
              </p>
              <p className="mt-3 text-xl leading-snug font-medium text-pretty">
                {next.fix}
              </p>
              <div aria-hidden className="min-h-6 flex-1" />
              <StartStep
                fix={next}
                className={`${btn.primary} h-12 w-full justify-between px-5`}
              >
                Start
                <ArrowRight className="size-4" aria-hidden />
              </StartStep>
            </div>
          ) : (
            <div className="flex flex-col justify-center rounded-3xl bg-white/6 p-6 ring-1 ring-white/10">
              <Check className="size-6 text-success" aria-hidden />
              <p className="mt-3 text-xl font-medium">Everything is done.</p>
              <p className="mt-1 text-paper/60">
                Add a job ad to tailor your next application.
              </p>
            </div>
          )}
        </div>

        {/* Every area, full width so each label has room. */}
        <div className="mt-8 lg:mt-10">
          <AreaBar areas={result.areas} />
        </div>
      </section>

      {/* The rest of the plan, quietly. */}
      {later.length > 0 ? (
        <section
          data-motion="tile"
          data-motion-hide
          aria-labelledby="later-title"
        >
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 id="later-title" className="text-xl font-medium tracking-tight">
              After that
            </h2>
            <p className="text-sm text-ink-muted tabular-nums">
              +{later.reduce((sum, fix) => sum + fix.gain, 0)} more points
            </p>
          </div>
          <ol className={listClass}>
            {later.map((fix, index) => (
              <li key={fix.areaId}>
                <StartStep
                  fix={fix}
                  className="group flex w-full items-center gap-4 rounded-xl py-4 text-left transition-colors hover:bg-ink/[0.025] focus-visible:outline-2 focus-visible:outline-accent sm:px-2"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink/5 text-sm text-ink-muted tabular-nums">
                    {index + 2}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-pretty">
                      {fix.fix}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {fix.label}
                    </span>
                  </span>
                  <span className="text-sm font-medium text-accent-strong tabular-nums">
                    +{fix.gain}
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-ink"
                    aria-hidden
                  />
                </StartStep>
              </li>
            ))}
          </ol>
          {done.length > 0 ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
              <Check className="size-4 text-success" aria-hidden />
              Done: {done.map((area) => area.label).join(", ")}
            </p>
          ) : null}
        </section>
      ) : null}
    </ScreenMotion>
  );
}
