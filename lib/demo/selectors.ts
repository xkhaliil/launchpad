import { checkCv } from "@/lib/core/ats";
import { findIssues, type Source } from "@/lib/core/consistency";
import { findCliches, WORD_LIMIT, wordCount } from "@/lib/core/cover-letter";
import { evaluate } from "@/lib/core/evaluation";
import type { Profile } from "@/lib/core/types";
import {
  demoGithubChanges,
  demoHistory,
  demoRepos,
  docSpecs,
  LINKEDIN_FIELDS,
} from "./data";
import type { DemoState } from "./store";

/*
 * Everything the screens show that is derived from the demo state. Pure
 * functions over the state, so the dashboard, the evaluation page and each
 * module always agree.
 */

export function consistencySources(state: DemoState): Source[] {
  return [
    { id: "linkedin", label: "LinkedIn", values: state.sources.linkedin },
    { id: "github", label: "GitHub", values: state.sources.github },
  ];
}

export function consistencyIssues(state: DemoState) {
  const { fullName, headline, location, email } = state.profile;
  return findIssues(
    { fullName, headline, location, email },
    consistencySources(state),
  );
}

export function requiredDocs(state: DemoState) {
  return docSpecs.filter(
    (spec) => spec.required && (!spec.nonEuOnly || state.nonEu),
  );
}

export function githubProgress(state: DemoState) {
  const applied = demoGithubChanges.filter(
    (change) => state.github[change.id] === "applied",
  ).length;
  const counted = demoRepos.filter((repo) => !repo.isFork);
  const health =
    counted.reduce((sum, repo) => sum + repo.health, 0) / counted.length;
  return {
    applied,
    total: demoGithubChanges.length,
    health: Math.round(health),
    ratio: (health / 100) * 0.5 + (applied / demoGithubChanges.length) * 0.5,
  };
}

export function coverLetterRatio(text: string) {
  if (text.trim() === "") return 0;
  return (
    0.5 +
    (wordCount(text) <= WORD_LIMIT ? 0.25 : 0) +
    (findCliches(text).length === 0 ? 0.25 : 0)
  );
}

/** The plain text the generic CV contains, for keyword matching. */
export function cvText(profile: Profile, { allFacts = false } = {}) {
  const skills = allFacts ? profile.skills : profile.skills.slice(0, 6);
  return [
    profile.headline,
    profile.summary,
    skills.map((skill) => skill.name).join(", "),
    ...profile.experiences.flatMap((item) => item.bullets),
    ...(allFacts
      ? profile.projects.flatMap((item) => [...item.tech, ...item.bullets])
      : []),
  ].join("\n");
}

export function evaluation(state: DemoState) {
  const cv = checkCv(state.profile);
  const gh = githubProgress(state);
  const issues = consistencyIssues(state);
  const required = requiredDocs(state);
  const uploaded = required.filter((spec) => state.documents[spec.type]).length;
  const high = issues.filter((issue) => issue.severity === "high").length;
  const medium = issues.length - high;

  return evaluate([
    {
      id: "cv",
      label: "CV & ATS",
      ratio: cv.score / 100,
      fix: cv.checks.find((check) => !check.passed)?.fix ?? "Export your CV.",
      href: "/cv",
    },
    {
      id: "github",
      label: "GitHub",
      ratio: gh.ratio,
      fix: `Review ${gh.total - gh.applied} proposed GitHub changes.`,
      href: "/github",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      ratio: state.linkedin.done.length / LINKEDIN_FIELDS.length,
      fix: "Copy the suggested LinkedIn headline and About text.",
      href: "/linkedin",
    },
    {
      id: "coverLetters",
      label: "Cover letters",
      ratio: coverLetterRatio(state.coverLetter),
      fix:
        findCliches(state.coverLetter).length > 0
          ? "Replace the clichés in your cover letter."
          : "Keep your cover letter under 250 words.",
      href: "/cover-letters",
    },
    {
      id: "website",
      label: "Personal website",
      ratio: state.website.published ? 1 : 0.3,
      fix: "Publish your personal website.",
      href: "/website",
    },
    {
      id: "documents",
      label: "Documents",
      ratio: required.length === 0 ? 1 : uploaded / required.length,
      fix: `Upload ${required.length - uploaded} missing document${required.length - uploaded === 1 ? "" : "s"}.`,
      href: "/documents",
    },
    {
      id: "consistency",
      label: "Consistency",
      ratio: 1 - high * 0.4 - medium * 0.2,
      fix: `Fix ${issues.length} mismatch${issues.length === 1 ? "" : "es"} between your profile and other platforms.`,
      href: "/evaluation#consistency",
    },
  ]);
}

/** Share of the profile that is filled in, 0 to 100. */
export function profileCompleteness(profile: Profile): number {
  const checks = [
    profile.fullName,
    profile.headline,
    profile.summary.length >= 150,
    profile.location,
    profile.email,
    profile.phone,
    profile.links.github || profile.links.linkedin,
    profile.experiences.length > 0,
    profile.projects.length > 0,
    profile.educations.length > 0,
    profile.skills.length >= 5,
    profile.languages.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/**
 * The numbers the app chrome shows (sidebar, top bar, bottom bar), computed
 * once from the demo state so every place agrees.
 */
export function appMetrics(state: DemoState) {
  const result = evaluation(state);
  const points = (id: string) => {
    const area = result.areas.find((item) => item.id === id);
    return area ? Math.round((area.points / area.max) * 100) : 0;
  };
  const gh = githubProgress(state);
  const required = requiredDocs(state);
  const uploaded = required.filter((spec) => state.documents[spec.type]).length;
  return {
    readiness: result.total,
    readinessDelta: result.total - demoHistory[0].score,
    since: demoHistory[0].label,
    profile: profileCompleteness(state.profile),
    ats: checkCv(state.profile).score,
    letters: points("coverLetters"),
    jobs: state.jobAds.length,
    tailored: state.jobAds.filter((job) => job.tailored).length,
    linkedinDone: state.linkedin.done.length,
    linkedinTotal: LINKEDIN_FIELDS.length,
    toReview: gh.total - gh.applied,
    published: state.website.published,
    docsUploaded: uploaded,
    docsRequired: required.length,
    mismatches: consistencyIssues(state).length,
  };
}

export type AppMetrics = ReturnType<typeof appMetrics>;
