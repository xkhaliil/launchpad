import type { LinkedinSuggestions } from "@/lib/ai/provider";
import { type ConsistencyField, FIELD_LABELS } from "@/lib/core/consistency";
import type { AreaId } from "@/lib/core/evaluation";
import { findPlaceholders } from "@/lib/core/cover-letter";
import { DESCRIPTION_MAX } from "@/lib/core/github/proposal";
import type { Confidence } from "@/lib/core/github/types";
import { improveBullet } from "@/lib/core/rewrite";
import type { LinkedinField } from "./data";
import { currentBio, githubRepos, suggestedBio } from "./github";
import { consistencyIssues, evaluation } from "./selectors";
import type { DemoState } from "./store";

/*
 * The review queue: every change the app proposes, in one shape, so the whole
 * app has one way to act on them (Accept, Edit, Skip). Pure functions over
 * the state; the review panel (components/app/review.tsx) applies them.
 */

export type ReviewArea = "github" | "linkedin" | "cv" | "consistency";

export const REVIEW_AREAS: Record<ReviewArea, { label: string; href: string }> =
  {
    github: { label: "GitHub", href: "/github" },
    linkedin: { label: "LinkedIn", href: "/linkedin" },
    cv: { label: "CV", href: "/cv" },
    consistency: { label: "Consistency", href: "/dashboard" },
  };

/** Which review area finishes an evaluation area, if any. */
export const REVIEW_FOR: Partial<Record<AreaId, ReviewArea>> = {
  github: "github",
  linkedin: "linkedin",
  cv: "cv",
  consistency: "consistency",
};

export type SuggestionTarget =
  | { kind: "github-bio" }
  | { kind: "repo"; name: string }
  | { kind: "linkedin"; field: LinkedinField }
  | { kind: "bullet"; before: string }
  | {
      kind: "mismatch";
      sourceId: "linkedin" | "github";
      field: ConsistencyField;
    };

export type Suggestion = {
  id: string;
  /** The areas this finishes; the first one names it. */
  areas: ReviewArea[];
  /** Where the change goes, e.g. "GitHub · route-planner". */
  where: string;
  title: string;
  /** What is there now, when known. */
  before: string | null;
  after: string;
  /** One line on where the suggestion comes from. */
  why: string;
  /**
   * "apply": the app makes the change. "copy": you paste it yourself.
   * "approve": it is approved now and applied later, after a dry run.
   */
  mode: "apply" | "copy" | "approve";
  /** The suggested text can be changed before accepting. */
  editable: boolean;
  multiline: boolean;
  /** For GitHub: the exact call a dry run shows. */
  call?: string;
  /** For a repo proposal: everything else that would change. */
  details?: {
    topics: string[];
    readme: string;
    homepage?: string;
    confidence: Confidence;
    unknowns: string[];
  };
  target: SuggestionTarget;
};

const LINKEDIN_TEXT: {
  field: LinkedinField;
  title: string;
  text: (s: LinkedinSuggestions) => string;
}[] = [
  { field: "headline", title: "Headline", text: (s) => s.headline },
  { field: "about", title: "About", text: (s) => s.about },
  {
    field: "experience",
    title: "Experience",
    text: (s) =>
      s.experience.map((item) => `${item.title}\n${item.text}`).join("\n\n"),
  },
  { field: "url", title: "Custom URL", text: (s) => s.url },
  { field: "skills", title: "Top skills", text: (s) => s.skills.join(", ") },
];

/** The LinkedIn text for a field, or null for the image fields. */
export function linkedinText(
  field: LinkedinField,
  suggestions: LinkedinSuggestions,
): string | null {
  return (
    LINKEDIN_TEXT.find((item) => item.field === field)?.text(suggestions) ??
    null
  );
}

/**
 * Every suggestion still open, the areas worth the most points first.
 * LinkedIn text needs the AI's suggestions; until they arrive it is left out.
 */
export function pendingSuggestions(
  state: DemoState,
  linkedin: LinkedinSuggestions | null,
): Suggestion[] {
  const issues = consistencyIssues(state);
  const mismatch = (sourceId: string, field: ConsistencyField) =>
    issues.some(
      (issue) => issue.sourceId === sourceId && issue.field === field,
    );
  const list: Suggestion[] = [];

  // GitHub: the suggested bio (after a scan), then drafted repo proposals.
  if (state.github.scannedAt && state.github.bio === "proposed") {
    const bio = suggestedBio(state);
    list.push({
      id: "github-bio",
      areas: mismatch("github", "headline")
        ? ["github", "consistency"]
        : ["github"],
      where: "GitHub profile",
      title: "Profile bio",
      before: currentBio(state) || null,
      after: bio,
      why: "Based on your profile headline, top skills and city.",
      mode: "apply",
      editable: false,
      multiline: false,
      call: `PATCH /user { "bio": "${bio}" }`,
      target: { kind: "github-bio" },
    });
  }
  const repos = githubRepos(state, { all: true });
  for (const proposal of Object.values(state.github.proposals)) {
    if (proposal.status !== "pending") continue;
    const repo = repos.find((item) => item.name === proposal.name);
    list.push({
      id: `repo-${proposal.name}`,
      areas: ["github"],
      where: `GitHub · ${proposal.name}`,
      title: "Description, topics and README",
      before: repo?.description ?? null,
      after: proposal.description,
      why: proposal.reasoning,
      mode: "approve",
      editable: true,
      multiline: false,
      details: {
        topics: proposal.topics,
        readme: proposal.readme,
        homepage: proposal.homepage,
        confidence: proposal.confidence,
        unknowns: proposal.unknowns,
      },
      target: { kind: "repo", name: proposal.name },
    });
  }

  // LinkedIn: text fields not marked done. Apps cannot edit LinkedIn.
  if (linkedin) {
    for (const item of LINKEDIN_TEXT) {
      if (state.linkedin.done.includes(item.field)) continue;
      const after = item.text(linkedin);
      list.push({
        id: `linkedin-${item.field}`,
        areas:
          item.field === "headline" &&
          (mismatch("linkedin", "headline") || mismatch("linkedin", "location"))
            ? ["linkedin", "consistency"]
            : ["linkedin"],
        where: "LinkedIn",
        title: item.title,
        before:
          item.field === "headline"
            ? (state.sources.linkedin.headline ?? null)
            : null,
        after,
        why: "Built only from your profile. Paste it into LinkedIn.",
        mode: "copy",
        editable: false,
        multiline: after.includes("\n"),
        target: { kind: "linkedin", field: item.field },
      });
    }
  }

  // CV: bullets without a verb up front or without a result.
  const sections = [
    ...state.profile.experiences.map((item) => ({
      name: item.company || item.title,
      bullets: item.bullets,
    })),
    ...state.profile.projects.map((item) => ({
      name: item.name,
      bullets: item.bullets,
    })),
  ];
  for (const section of sections) {
    for (const bullet of section.bullets) {
      if (bullet.trim() === "") continue;
      const after = improveBullet(bullet);
      if (!after) continue;
      const needsResult = findPlaceholders(after).length > 0;
      const verbChanged = !after.startsWith(bullet.trim().replace(/\.$/, ""));
      list.push({
        id: `bullet-${bullet}`,
        areas: ["cv"],
        where: `CV · ${section.name}`,
        title:
          verbChanged && needsResult
            ? "Lead with the verb, add a result"
            : needsResult
              ? "Add a result"
              : "Lead with the verb",
        before: bullet,
        after,
        why: needsResult
          ? "Replace the [ADD: …] part with a real number. Only you know it."
          : "Recruiters skim for what you did.",
        mode: "apply",
        editable: true,
        multiline: false,
        target: { kind: "bullet", before: bullet },
      });
    }
  }

  // Mismatches no other suggestion already fixes. The GitHub headline is
  // fixed by the bio, which needs a scan first.
  const covered = new Set(
    list
      .filter((item) => item.areas.includes("consistency"))
      .map((item) =>
        item.target.kind === "github-bio" ? "github" : "linkedin",
      ),
  );
  if (state.github.bio === "proposed") covered.add("github");
  for (const issue of issues) {
    const sourceId = issue.sourceId as "linkedin" | "github";
    const coveredHere =
      covered.has(sourceId) &&
      (issue.field === "headline" ||
        (sourceId === "linkedin" && issue.field === "location"));
    if (coveredHere) continue;
    list.push({
      id: `mismatch-${sourceId}-${issue.field}`,
      areas: ["consistency"],
      where: issue.sourceLabel,
      title: `${FIELD_LABELS[issue.field]} differs from your profile`,
      before: issue.value,
      after: issue.expected,
      why: "Your profile is the reference.",
      mode: sourceId === "linkedin" ? "copy" : "apply",
      editable: false,
      multiline: false,
      target: { kind: "mismatch", sourceId, field: issue.field },
    });
  }

  // Most points first, by the area each suggestion is named after.
  const gain = new Map(
    evaluation(state).areas.map((area) => [area.id, area.max - area.points]),
  );
  const order = (item: Suggestion) => gain.get(item.areas[0]) ?? 0;
  return list
    .map((item, index) => ({ item, index }))
    .sort((a, b) => order(b.item) - order(a.item) || a.index - b.index)
    .map(({ item }) => item);
}

/** Text still holding a placeholder cannot be accepted yet. */
export function readyToAccept(suggestion: Suggestion, text: string): boolean {
  if (text.trim() === "") return false;
  if (findPlaceholders(text).length > 0) return false;
  if (suggestion.target.kind === "bullet" && text.trim() === suggestion.before)
    return false;
  if (suggestion.target.kind === "repo") {
    const length = text.trim().length;
    return length >= 10 && length <= DESCRIPTION_MAX;
  }
  return true;
}
