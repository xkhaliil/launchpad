"use client";

import { ArrowRight, Check, CircleDashed, RotateCcw, X } from "lucide-react";
import { setGithubStatus } from "@/lib/demo/actions";
import { demoGithubChanges, demoRepos } from "@/lib/demo/data";
import { githubProgress } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/store";
import { ScreenMotion } from "../motion";
import { useReview } from "../review";
import { btn, listClass, PageHeader, SectionTitle } from "../ui";

export function GithubScreen() {
  const state = useDemo();
  const review = useReview();
  const progress = githubProgress(state);
  const open = review.countFor("github");

  return (
    <ScreenMotion id="github" className="space-y-10">
      <PageHeader
        title="GitHub"
        stat={progress.health}
        statLabel="average repo health"
        actions={
          open > 0 ? (
            <button
              type="button"
              className={`${btn.accent} h-11 px-5`}
              onClick={() => review.open({ area: "github" })}
            >
              Review {open} change{open === 1 ? "" : "s"}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null
        }
      >
        Demo: no GitHub account is connected, so nothing is written.
      </PageHeader>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          data-motion="tile"
          data-motion-hide
          aria-labelledby="changes-title"
        >
          <SectionTitle id="changes-title">
            Proposed changes{" "}
            <span className="ml-1 text-base font-normal text-ink-muted tabular-nums">
              {progress.applied}/{progress.total} applied
            </span>
          </SectionTitle>
          <ul className={listClass}>
            {demoGithubChanges.map((change) => {
              const status = state.github[change.id] ?? "proposed";
              return (
                <li key={change.id} className="flex items-center gap-3 py-3">
                  <span
                    aria-hidden
                    className={`grid size-8 shrink-0 place-items-center rounded-full ${
                      status === "applied"
                        ? "bg-success-soft text-success"
                        : status === "skipped"
                          ? "bg-ink/5 text-ink-muted"
                          : "bg-accent-soft text-accent-strong"
                    }`}
                  >
                    {status === "applied" ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : status === "skipped" ? (
                      <X className="size-4" />
                    ) : (
                      <CircleDashed className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">
                      {change.title}
                    </span>
                    <span className="block truncate text-sm text-ink-muted">
                      {change.repo ?? "Your profile"}
                      {status === "proposed"
                        ? change.confidence === "high"
                          ? ""
                          : ` · ${change.confidence} confidence`
                        : ` · ${status}`}
                    </span>
                  </span>
                  {status === "proposed" ? (
                    <button
                      type="button"
                      className={btn.small}
                      onClick={() =>
                        review.open({ area: "github", first: change.id })
                      }
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${btn.ghost} h-8 px-2.5 text-[13px]`}
                      onClick={() => setGithubStatus(change, "proposed")}
                    >
                      <RotateCcw className="size-3.5" aria-hidden />
                      Undo
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section
          data-motion="tile"
          data-motion-hide
          aria-labelledby="repos-title"
        >
          <SectionTitle id="repos-title">Repositories</SectionTitle>
          <ul className={listClass}>
            {demoRepos.map((repo) => (
              <li key={repo.name} className="py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[15px] font-medium">
                    {repo.name}
                  </span>
                  <span className="text-sm text-ink-muted tabular-nums">
                    {repo.isFork ? "fork, not counted" : repo.health}
                  </span>
                </div>
                {!repo.isFork ? (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/8">
                    <div
                      data-motion="fill"
                      className={`h-full rounded-full ${repo.health < 50 ? "bg-danger" : "bg-accent"}`}
                      style={{ width: `${repo.health}%` }}
                    />
                  </div>
                ) : null}
                <p className="mt-1.5 truncate text-sm text-ink-muted">
                  {repo.isFork ? "Forks are left out" : repo.issues.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            Pinned repos and the profile picture have no public API, so those
            stay manual.
          </p>
        </section>
      </div>
    </ScreenMotion>
  );
}
