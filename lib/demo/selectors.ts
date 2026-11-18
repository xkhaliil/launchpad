import { checkCv } from "@/lib/core/ats";
import { findIssues, type Source } from "@/lib/core/consistency";
import { findCliches, WORD_LIMIT, wordCount } from "@/lib/core/cover-letter";
import { evaluate } from "@/lib/core/evaluation";
import type { Profile } from "@/lib/core/types";
import { demoHistory, docSpecs, LINKEDIN_FIELDS } from "./data";
import { githubAudit, githubCounts } from "./github";
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

/**
 * GitHub's share of the score: unknown until scanned, then repo health
 * (80%) and the profile bio (20%). The next step follows the pipeline:
 * scan → review → apply → improve what is left.
 */
export function githubProgress(state: DemoState) {
  const counts = githubCounts(state);
  const { audit, priority } = githubAudit(state);
  const health = counts.scanned ? audit.averageScore : 0;
  const bioDone = state.github.bio === "applied";
  const undrafted = priority.filter((name) => !state.github.proposals[name]);
  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;

  let fix: string;
  let href = "/github";
  if (!counts.scanned) {
    fix = "Scan your GitHub repositories.";
  } else if (counts.pending > 0) {
    fix = `Review ${plural(counts.pending, "GitHub proposal")}.`;
  } else if (counts.approved > 0) {
    fix = `Apply ${plural(counts.approved, "approved change")} to GitHub.`;
    href = "/github#apply";
  } else if (undrafted.length > 0) {
    fix = `Draft fixes for ${plural(undrafted.length, "repo")} that need them.`;
  } else {
    fix = `Improve your weakest repo, ${audit.repos[0]?.name ?? "on GitHub"}.`;
  }

  return {
    ...counts,
    health,
    bioDone,
    fix,
    href,
    ratio: counts.scanned ? 0.8 * (health / 100) + (bioDone ? 0.2 : 0) : 0.1,
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

  const linkedinLeft = LINKEDIN_FIELDS.filter(
    (field) => !state.linkedin.done.includes(field),
  );
  const linkedinText = linkedinLeft.filter(
    (field) => field !== "banner" && field !== "photo",
  );

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
      fix: gh.fix,
      href: gh.href,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      ratio: state.linkedin.done.length / LINKEDIN_FIELDS.length,
      fix:
        linkedinText.length > 0
          ? `Copy ${linkedinText.length} suggested LinkedIn text${linkedinText.length === 1 ? "" : "s"}.`
          : "Make your LinkedIn banner and photo.",
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
      href: "/jobs?ad=generic",
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
      href: "/dashboard",
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
    github: {
      scanned: gh.scanned,
      health: gh.health,
      toReview: gh.pending,
      toApply: gh.approved,
    },
    published: state.website.published,
    docsUploaded: uploaded,
    docsRequired: required.length,
    mismatches: consistencyIssues(state).length,
  };
}

export type AppMetrics = ReturnType<typeof appMetrics>;
