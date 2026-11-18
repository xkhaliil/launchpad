"use client";

import { ArrowLeft, RotateCcw, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { auditRepo } from "@/lib/core/github/audit";
import {
  DESCRIPTION_MAX,
  TOPIC_PATTERN,
  toTopic,
  validateDraft,
} from "@/lib/core/github/proposal";
import type { Evidence, RepoProposal } from "@/lib/core/github/types";
import {
  buildEvidence,
  generateOne,
  githubRepos,
  skipReason,
  undoApply,
  updateProposal,
} from "@/lib/demo/github";
import { demoNow } from "@/lib/demo/clock";
import { DEMO_GITHUB_LOGIN } from "@/lib/demo/github-data";
import { useDemo } from "@/lib/demo/store";
import { Markdown } from "../markdown";
import { ScreenMotion } from "../motion";
import { btn, Disclosure, inputClass, PageHeader, Segmented } from "../ui";
import { relativeTime, StatusBadge } from "./github-parts";

/*
 * One repository, as gitms's repo page: its audit, the evidence the model was
 * given, and the proposal to edit, approve, skip or regenerate with a
 * correction.
 */

const SEVERITY = {
  high: "bg-danger",
  medium: "bg-accent",
  low: "bg-ink/25",
} as const;

export function RepoDetail({ name }: { name: string }) {
  const state = useDemo();
  const repo = githubRepos(state, { all: true }).find((r) => r.name === name);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [hint, setHint] = useState("");

  const back = (
    <Link href="/github" className={`${btn.ghost} -ml-3`}>
      <ArrowLeft className="size-4" aria-hidden />
      All repositories
    </Link>
  );

  if (!repo || !state.github.scannedAt) {
    return (
      <div className="space-y-4">
        {back}
        <p className="text-ink-muted">
          {repo
            ? "Scan your account first."
            : "This repository is not in the scan."}
        </p>
      </div>
    );
  }

  const audit = auditRepo(repo, demoNow());
  const proposal = state.github.proposals[name];
  const evidence = buildEvidence(state, name);

  const draft = async (correction?: string) => {
    setBusy(true);
    setMessage(null);
    const result = await generateOne(name, correction);
    setBusy(false);
    setMessage(result.state === "done" ? null : result.message);
    if (result.state === "done") setHint("");
  };

  return (
    <ScreenMotion id={`github-${name}`} className="space-y-8">
      {back}
      <PageHeader
        title={name}
        stat={audit.score}
        statLabel={`health · ${repo.language ?? "no language"} · pushed ${relativeTime(repo.pushedAt)}`}
        actions={proposal ? <StatusBadge status={proposal.status} /> : null}
      >
        github.com/{DEMO_GITHUB_LOGIN}/{name} (example account)
      </PageHeader>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          {proposal ? (
            <ProposalEditor key={proposal.generatedAt} proposal={proposal} />
          ) : (
            <section className="rounded-3xl border border-dashed border-ink/20 px-6 py-10 text-center">
              <h2 className="font-medium">No proposal yet</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
                Drafts a description, topics and README from this repo&apos;s
                actual code. You review every word before anything is written.
              </p>
              {skipReason(state, repo) ? (
                <p className="mx-auto mt-3 max-w-md text-sm text-accent-strong">
                  {skipReason(state, repo)}
                </p>
              ) : null}
              <button
                type="button"
                className={`${btn.accent} mt-5`}
                onClick={() => draft()}
                disabled={busy}
              >
                <Sparkles className="size-4" aria-hidden />
                {busy ? "Reading the code…" : "Draft for this repo"}
              </button>
            </section>
          )}

          {message ? (
            <p role="status" className="text-sm text-accent-strong">
              {message}
            </p>
          ) : null}

          {/* A correction outranks inference, never the evidence rule. */}
          {proposal?.status !== "applied" ? (
            <section aria-labelledby="correction-title">
              <h2 id="correction-title" className="font-medium">
                {proposal
                  ? "Regenerate with a correction"
                  : "Or start with a correction"}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Tell it what it got wrong or what the code cannot show, such as
                &ldquo;this was a university assignment&rdquo;.
              </p>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (hint.trim()) draft(hint);
                }}
              >
                <label htmlFor="hint" className="sr-only">
                  Correction
                </label>
                <input
                  id="hint"
                  value={hint}
                  onChange={(event) => setHint(event.target.value)}
                  placeholder="Optional context for the rewrite"
                  className={`${inputClass} h-10`}
                />
                <button
                  type="submit"
                  className={btn.secondary}
                  disabled={busy || !hint.trim()}
                >
                  {busy ? "Drafting…" : "Regenerate"}
                </button>
              </form>
            </section>
          ) : null}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
          <section aria-labelledby="audit-title">
            <h2 id="audit-title" className="font-medium">
              Audit
            </h2>
            {audit.issues.length === 0 ? (
              <p className="mt-2 text-sm text-success">
                Nothing to fix. This repo is in good shape.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {audit.issues.map((issue) => (
                  <li key={issue.code} className="flex gap-2.5 text-sm">
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${SEVERITY[issue.severity]}`}
                    />
                    <span>
                      <span className="block font-medium">
                        {issue.title}
                        <span className="sr-only">, {issue.severity}</span>
                      </span>
                      <span className="block text-ink-muted">{issue.fix}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {proposal ? (
            <section aria-labelledby="why-title">
              <h2 id="why-title" className="font-medium">
                Why it wrote this
              </h2>
              <p className="mt-2 text-sm">
                <span className="font-medium">
                  {proposal.confidence} confidence.
                </span>{" "}
                <span className="text-ink-muted">{proposal.reasoning}</span>
              </p>
              {proposal.unknowns.length > 0 ? (
                <>
                  <p className="mt-3 text-sm font-medium">
                    Left out or unresolved
                  </p>
                  <ul className="mt-1 space-y-1 text-sm text-ink-muted">
                    {proposal.unknowns.map((unknown) => (
                      <li key={unknown}>· {unknown}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          ) : null}

          {evidence ? <EvidencePane evidence={evidence} /> : null}
        </aside>
      </div>
    </ScreenMotion>
  );
}

function ProposalEditor({ proposal }: { proposal: RepoProposal }) {
  const [draft, setDraft] = useState(proposal);
  const [tab, setTab] = useState<"preview" | "edit">("preview");
  const [topic, setTopic] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const applied = proposal.status === "applied";
  const dirty =
    draft.description !== proposal.description ||
    draft.readme !== proposal.readme ||
    draft.topics.join() !== proposal.topics.join();

  const save = (status?: RepoProposal["status"]) => {
    if (status === "approved") {
      const found = validateDraft(draft);
      setProblems(found);
      if (found.length > 0) return;
    }
    updateProposal(proposal.name, {
      description: draft.description.trim(),
      topics: draft.topics,
      readme: draft.readme,
      ...(status ? { status } : {}),
    });
  };

  const addTopic = () => {
    const value = toTopic(topic);
    if (value && TOPIC_PATTERN.test(value) && !draft.topics.includes(value)) {
      setDraft({ ...draft, topics: [...draft.topics, value] });
    }
    setTopic("");
  };

  return (
    <>
      <section aria-labelledby="description-title">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="description-title" className="font-medium">
            Description
          </h2>
          <span
            className={`text-xs tabular-nums ${draft.description.length > 320 ? "text-accent-strong" : "text-ink-muted"}`}
          >
            {draft.description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
        <label htmlFor="description" className="sr-only">
          Description
        </label>
        <textarea
          id="description"
          rows={2}
          maxLength={DESCRIPTION_MAX}
          readOnly={applied}
          value={draft.description}
          onChange={(event) =>
            setDraft({ ...draft, description: event.target.value })
          }
          className={`${inputClass} mt-2 py-2.5 leading-6`}
        />
      </section>

      <section aria-labelledby="topics-title">
        <h2 id="topics-title" className="font-medium">
          Topics
          <span className="ml-2 text-sm font-normal text-ink-muted">
            3 to 6, lowercase
          </span>
        </h2>
        <ul className="mt-2 flex flex-wrap items-center gap-1.5">
          {draft.topics.map((item) => (
            <li
              key={item}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-ink/5 pr-1 pl-3 font-mono text-[13px]"
            >
              {item}
              {applied ? null : (
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      topics: draft.topics.filter((t) => t !== item),
                    })
                  }
                  className="grid size-6 place-items-center rounded-full text-ink-muted hover:bg-ink/10 hover:text-ink"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              )}
            </li>
          ))}
          {applied ? null : (
            <li>
              <label htmlFor="new-topic" className="sr-only">
                Add a topic
              </label>
              <input
                id="new-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  addTopic();
                }}
                onBlur={() => topic.trim() && addTopic()}
                placeholder="add topic"
                className="h-8 w-28 rounded-full border border-dashed border-ink/25 bg-transparent px-3 font-mono text-[13px] outline-none placeholder:text-ink-muted focus:border-accent"
              />
            </li>
          )}
        </ul>
      </section>

      {proposal.homepage ? (
        <p className="text-sm">
          <span className="font-medium">Homepage </span>
          <span className="text-ink-muted">
            {proposal.homepage} (the live URL in your profile)
          </span>
        </p>
      ) : null}

      <section aria-labelledby="readme-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="readme-title" className="font-medium">
            README
          </h2>
          {applied ? null : (
            <Segmented
              label="README view"
              value={tab}
              options={[
                { value: "preview", label: "Preview" },
                { value: "edit", label: "Edit" },
              ]}
              onChange={setTab}
            />
          )}
        </div>
        {tab === "edit" && !applied ? (
          <>
            <label htmlFor="readme" className="sr-only">
              README in Markdown
            </label>
            <textarea
              id="readme"
              rows={22}
              spellCheck={false}
              value={draft.readme}
              onChange={(event) =>
                setDraft({ ...draft, readme: event.target.value })
              }
              className={`${inputClass} mt-3 py-3 font-mono text-[13px] leading-6`}
            />
          </>
        ) : (
          <div className="mt-3 max-h-[36rem] overflow-y-auto rounded-3xl bg-surface p-5 ring-1 ring-line sm:p-7">
            <Markdown source={draft.readme} />
          </div>
        )}
      </section>

      {problems.length > 0 ? (
        <ul role="alert" className="space-y-1 text-sm text-danger">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        {applied ? (
          <>
            <p className="mr-auto text-sm text-success">
              Applied {relativeTime(proposal.applied?.at ?? null)}. The earlier
              version is kept.
            </p>
            <button
              type="button"
              className={btn.secondary}
              onClick={() => undoApply(proposal.name)}
            >
              <RotateCcw className="size-4" aria-hidden />
              Undo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={btn.primary}
              disabled={proposal.status === "approved" && !dirty}
              onClick={() => save("approved")}
            >
              {proposal.status === "approved" && !dirty
                ? "Approved"
                : dirty
                  ? "Save and approve"
                  : "Approve"}
            </button>
            <button
              type="button"
              className={btn.secondary}
              disabled={!dirty}
              onClick={() => save()}
            >
              {dirty ? "Save edits" : "Saved"}
            </button>
            {proposal.status === "skipped" ? null : (
              <button
                type="button"
                className={btn.ghost}
                onClick={() => save("skipped")}
              >
                Skip
              </button>
            )}
            {proposal.status === "approved" ? (
              <Link href="/github#apply" className={`${btn.ghost} ml-auto`}>
                Go to apply
              </Link>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

const TABS = ["deps", "files", "commits", "code"] as const;

/** What the model was shown, so a wrong answer can be traced. */
function EvidencePane({ evidence }: { evidence: Evidence }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("deps");
  const counts = {
    deps: evidence.manifests.length,
    files: evidence.tree.length,
    commits: evidence.commitMessages.length,
    code: evidence.entrypoints.length,
  };
  const labels = {
    deps: "Deps",
    files: "Files",
    commits: "Commits",
    code: "Code",
  };

  return (
    <section aria-labelledby="evidence-title">
      <Disclosure
        summary={
          <span id="evidence-title">
            Evidence it was given · {(evidence.bytes / 1024).toFixed(1)} KB
          </span>
        }
      >
        <div className="flex gap-1" role="tablist" aria-label="Evidence">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tab === id
                  ? "bg-ink text-paper"
                  : "text-ink-muted hover:bg-ink/5"
              }`}
            >
              {labels[id]} <span className="opacity-60">{counts[id]}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 max-h-64 overflow-auto rounded-2xl bg-ink/4 p-3 font-mono text-xs leading-5 text-ink-muted">
          {tab === "files" ? (
            <pre className="whitespace-pre-wrap">
              {evidence.tree.join("\n") || "(no files read)"}
            </pre>
          ) : null}
          {tab === "deps" ? (
            evidence.manifests.length === 0 ? (
              <p>No dependency manifests found.</p>
            ) : (
              evidence.manifests.map((manifest) => (
                <div key={manifest.file} className="mb-3 last:mb-0">
                  <p className="text-ink">
                    {manifest.file} ({manifest.ecosystem})
                  </p>
                  <p className="whitespace-pre-wrap">
                    {manifest.dependencies.join(", ") || "(none)"}
                  </p>
                </div>
              ))
            )
          ) : null}
          {tab === "commits" ? (
            <pre className="whitespace-pre-wrap">
              {evidence.commitMessages.map((m) => `· ${m}`).join("\n") ||
                "(none read)"}
            </pre>
          ) : null}
          {tab === "code" ? (
            evidence.entrypoints.length === 0 ? (
              <p className="text-accent-strong">
                No entry-point files could be read. Treat the draft with extra
                care.
              </p>
            ) : (
              evidence.entrypoints.map((file) => (
                <div key={file.path} className="mb-3 last:mb-0">
                  <p className="text-ink">{file.path}</p>
                  <pre className="whitespace-pre-wrap">
                    {file.text.slice(0, 1500)}
                  </pre>
                </div>
              ))
            )
          ) : null}
        </div>
      </Disclosure>
    </section>
  );
}
