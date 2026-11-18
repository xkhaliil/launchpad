import type { PlannedCall, RepoDraft, RepoSummary } from "./types";

/*
 * GitHub's own limits, the cleanup a schema cannot express, and the exact
 * calls an apply makes. Ported from gitms (core/ai/schemas.ts and
 * web/src/lib/pipeline.ts; MIT, © 2026 gitms contributors).
 */

export const DESCRIPTION_MAX = 350;
export const TOPIC_MAX = 50;
export const MIN_TOPICS = 3;
export const MAX_TOPICS = 6;
/** GitHub keeps at most 20 topics on a repo. */
const REPO_TOPICS_MAX = 20;

/** GitHub topics: lowercase letters, digits and hyphens. */
export const TOPIC_PATTERN = /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/;

/** "React Native!" → "react-native". Empty when nothing usable is left. */
export function toTopic(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, TOPIC_MAX);
}

/** Problems that would make GitHub reject the proposal, or mislead a reader. */
export function validateDraft(draft: RepoDraft): string[] {
  const problems: string[] = [];
  const description = draft.description.trim();
  if (description.length < 10) problems.push("The description is too short.");
  if (description.length > DESCRIPTION_MAX) {
    problems.push(`The description is over ${DESCRIPTION_MAX} characters.`);
  }
  if (draft.topics.length < MIN_TOPICS || draft.topics.length > MAX_TOPICS) {
    problems.push(`Use ${MIN_TOPICS} to ${MAX_TOPICS} topics.`);
  }
  const bad = draft.topics.filter((topic) => !TOPIC_PATTERN.test(topic));
  if (bad.length > 0) {
    problems.push(`Not valid GitHub topics: ${bad.join(", ")}.`);
  }
  if (draft.readme.trim().length < 120)
    problems.push("The README is too short.");
  return problems;
}

/**
 * Cleanup after the model answers: GitHub strips a trailing period anyway,
 * and mixed-case topics are better fixed than rejected. Every change is
 * reported, so nothing is rewritten silently.
 */
export function normaliseDraft(draft: RepoDraft): {
  value: RepoDraft;
  notes: string[];
} {
  const notes: string[] = [];
  let description = draft.description.trim().replace(/\s+/g, " ");
  if (description.endsWith(".") && !description.endsWith("..")) {
    description = description.slice(0, -1);
    notes.push("Removed a trailing period from the description.");
  }
  if (description.length > DESCRIPTION_MAX) {
    description = description.slice(0, DESCRIPTION_MAX).trimEnd();
    notes.push(
      `Cut the description to GitHub's ${DESCRIPTION_MAX} characters.`,
    );
  }

  const topics: string[] = [];
  for (const raw of draft.topics) {
    const topic = toTopic(raw);
    if (topic && TOPIC_PATTERN.test(topic) && !topics.includes(topic)) {
      topics.push(topic);
    }
  }
  if (topics.length !== draft.topics.length) {
    notes.push("Some topics were changed or dropped to match GitHub's format.");
  }

  return {
    value: { ...draft, description, topics: topics.slice(0, MAX_TOPICS) },
    notes,
  };
}

/** The topics endpoint replaces the whole set, so keep what is there. */
export function mergeTopics(existing: string[], proposed: string[]): string[] {
  return [...new Set([...existing, ...proposed])].slice(0, REPO_TOPICS_MAX);
}

/** The exact API calls an apply would make, for the dry run. */
export function planCalls(repo: RepoSummary, draft: RepoDraft): PlannedCall[] {
  const path = `/repos/${repo.owner}/${repo.name}`;
  const fields = [`description = "${draft.description}"`];
  if (draft.homepage && !repo.homepage) {
    fields.push(`homepage = "${draft.homepage}"`);
  }
  const calls: PlannedCall[] = [
    { repo: repo.name, method: "PATCH", path, summary: fields.join(", ") },
    {
      repo: repo.name,
      method: "PUT",
      path: `${path}/topics`,
      summary: `topics = [${mergeTopics(repo.topics, draft.topics).join(", ")}]`,
    },
  ];
  if (draft.readme.trim()) {
    calls.push({
      repo: repo.name,
      method: "PUT",
      path: `${path}/contents/README.md`,
      summary: `${repo.files.hasReadme ? "replace" : "create"} README.md on ${repo.defaultBranch} (${draft.readme.length} characters)`,
    });
  }
  return calls;
}

/** A plain sentence for a failed GitHub write. */
export function describeApplyError(status: number | undefined): string {
  if (status === 409) {
    return "The README changed on GitHub since it was read. Scan again and regenerate before applying.";
  }
  if (status === 403) {
    return "GitHub refused the write (403): the app lacks permission for this repo.";
  }
  if (status === 404) {
    return "Repository not found (404). It may have been renamed or deleted since the scan.";
  }
  return "GitHub could not apply this change. Try again in a moment.";
}
