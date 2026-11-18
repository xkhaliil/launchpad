import type { Profile, Severity } from "./types";

/**
 * Rule-based ATS check of the CV content (plan.md, section 6.2). The real
 * checker will also parse the exported PDF back to text; these rules are the
 * content half of it and run on the profile directly.
 */

export type CvCheck = {
  id: string;
  label: string;
  passed: boolean;
  severity: Severity;
  /** What to do about it. Only set when the check failed. */
  fix?: string;
};

export type CvReport = { score: number; checks: CvCheck[] };

const WEIGHT: Record<Severity, number> = { high: 20, medium: 12, low: 6 };

/** Verbs a CV bullet can start with. Lowercase, compared case-insensitively. */
export const ACTION_VERBS = new Set([
  "achieved",
  "added",
  "analysed",
  "analyzed",
  "automated",
  "built",
  "championed",
  "configured",
  "contributed",
  "coordinated",
  "created",
  "cut",
  "debugged",
  "delivered",
  "deployed",
  "designed",
  "developed",
  "documented",
  "drove",
  "enabled",
  "engineered",
  "established",
  "fixed",
  "graded",
  "grew",
  "guided",
  "implemented",
  "improved",
  "increased",
  "integrated",
  "introduced",
  "launched",
  "led",
  "maintained",
  "managed",
  "mentored",
  "migrated",
  "modelled",
  "modeled",
  "monitored",
  "optimised",
  "optimized",
  "organised",
  "organized",
  "planned",
  "presented",
  "prototyped",
  "published",
  "ran",
  "rebuilt",
  "reduced",
  "refactored",
  "released",
  "replaced",
  "researched",
  "resolved",
  "reviewed",
  "rewrote",
  "scaled",
  "secured",
  "shipped",
  "simplified",
  "solved",
  "streamlined",
  "supported",
  "taught",
  "tested",
  "trained",
  "tutored",
  "upgraded",
  "wrote",
]);

const DATE = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Every bullet on the CV: experience first, then projects. */
export function allBullets(profile: Profile): string[] {
  return [
    ...profile.experiences.flatMap((item) => item.bullets),
    ...profile.projects.flatMap((item) => item.bullets),
  ].filter((bullet) => bullet.trim() !== "");
}

export function startsWithActionVerb(bullet: string): boolean {
  const first = bullet
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .replace(/[^a-z]/g, "");
  return !!first && ACTION_VERBS.has(first);
}

/** A result is anything measurable: a number, a percentage, a duration. */
export function hasResult(bullet: string): boolean {
  return /\d/.test(bullet);
}

function datesValid(profile: Profile): boolean {
  const ranges = [...profile.experiences, ...profile.educations];
  return ranges.every(
    (range) =>
      DATE.test(range.start) &&
      (range.end === null ||
        (DATE.test(range.end) && range.start <= range.end)),
  );
}

export function checkCv(profile: Profile): CvReport {
  const bullets = allBullets(profile);
  const noVerb = bullets.filter((bullet) => !startsWithActionVerb(bullet));
  const noResult = bullets.filter((bullet) => !hasResult(bullet));
  const missingContact = (
    [
      ["name", profile.fullName],
      ["email", profile.email],
      ["phone", profile.phone],
      ["location", profile.location],
    ] as const
  )
    .filter(([, value]) => value.trim() === "")
    .map(([name]) => name);
  const maxBullets = profile.experienceLevel === "junior" ? 22 : 14;

  const checks: CvCheck[] = [
    {
      id: "contact",
      label: "Name, email, phone and location are on the CV",
      passed: missingContact.length === 0,
      severity: "high",
      fix: `Add your ${missingContact.join(", ")} to your profile.`,
    },
    {
      id: "sections",
      label: "Experience or projects, education and skills are filled in",
      passed:
        profile.experiences.length + profile.projects.length > 0 &&
        profile.educations.length > 0 &&
        profile.skills.length >= 5,
      severity: "high",
      fix: "Add at least one experience or project, your education and five skills.",
    },
    {
      id: "dates",
      label: "Every date is in one format and in the right order",
      passed: datesValid(profile),
      severity: "high",
      fix: "Use month and year for every start and end date.",
    },
    {
      id: "verbs",
      label: "Every bullet starts with an action verb",
      passed: noVerb.length === 0,
      severity: "medium",
      fix: `Start these with a verb: ${noVerb.map((bullet) => `“${bullet}”`).join(", ")}.`,
    },
    {
      id: "results",
      label: "Most bullets include a measurable result",
      passed: bullets.length > 0 && noResult.length / bullets.length <= 0.25,
      severity: "medium",
      fix: `Add a result (a number, a percentage, a time saved) to ${noResult.length} bullet${noResult.length === 1 ? "" : "s"}.`,
    },
    {
      id: "links",
      label: "GitHub or LinkedIn link included",
      passed: !!(profile.links.github || profile.links.linkedin),
      severity: "low",
      fix: "Add your GitHub or LinkedIn URL.",
    },
    {
      id: "summary",
      label: "Summary is between 150 and 400 characters",
      passed:
        profile.summary.trim().length >= 150 &&
        profile.summary.trim().length <= 400,
      severity: "low",
      fix: `Your summary has ${profile.summary.trim().length} characters. Aim for 150 to 400.`,
    },
    {
      id: "length",
      label: "Fits on one page for your level",
      passed: bullets.length <= maxBullets,
      severity: "low",
      fix: `Cut to ${maxBullets} bullets or fewer (you have ${bullets.length}).`,
    },
  ];

  const total = checks.reduce((sum, check) => sum + WEIGHT[check.severity], 0);
  const earned = checks
    .filter((check) => check.passed)
    .reduce((sum, check) => sum + WEIGHT[check.severity], 0);

  return {
    score: Math.round((earned / total) * 100),
    checks: checks.map((check) =>
      check.passed ? { ...check, fix: undefined } : check,
    ),
  };
}
