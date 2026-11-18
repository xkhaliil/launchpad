import type { Severity } from "./types";

/**
 * Consistency checker (plan.md, section 6.8): compares the same facts across
 * every place they appear and flags what does not match.
 */

export type ConsistencyField = "fullName" | "headline" | "location" | "email";

export const FIELD_LABELS: Record<ConsistencyField, string> = {
  fullName: "Full name",
  headline: "Headline",
  location: "Location",
  email: "Email",
};

/** Exact match for these; normalised match for the rest. */
const EXACT: ConsistencyField[] = ["fullName", "email"];

const SYNONYMS: [RegExp, string][] = [
  [/\bdev\b/g, "developer"],
  [/\beng\b/g, "engineer"],
  [/\bjs\b/g, "javascript"],
  [/\bts\b/g, "typescript"],
  [/\bfullstack\b/g, "full-stack"],
  [/\bfull stack\b/g, "full-stack"],
  [/\bsr\b/g, "senior"],
  [/\bjr\b/g, "junior"],
];

export function normalise(value: string): string {
  let text = value
    .toLowerCase()
    .replace(/[|·•,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const [pattern, replacement] of SYNONYMS) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

export type Source = {
  id: string;
  label: string;
  values: Partial<Record<ConsistencyField, string>>;
};

export type ConsistencyIssue = {
  field: ConsistencyField;
  sourceId: string;
  sourceLabel: string;
  value: string;
  expected: string;
  severity: Severity;
};

function same(field: ConsistencyField, a: string, b: string): boolean {
  if (EXACT.includes(field)) return a.trim() === b.trim();
  const left = normalise(a);
  const right = normalise(b);
  // "Berlin" and "Berlin, Germany" describe the same place.
  return (
    left === right ||
    (field === "location" && (left.startsWith(right) || right.startsWith(left)))
  );
}

/** Every value in `sources` that does not match the profile. */
export function findIssues(
  profile: Record<ConsistencyField, string>,
  sources: Source[],
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  for (const source of sources) {
    for (const field of Object.keys(FIELD_LABELS) as ConsistencyField[]) {
      const value = source.values[field];
      if (value === undefined || value.trim() === "") continue;
      if (!same(field, value, profile[field])) {
        issues.push({
          field,
          sourceId: source.id,
          sourceLabel: source.label,
          value,
          expected: profile[field],
          severity: EXACT.includes(field) ? "high" : "medium",
        });
      }
    }
  }
  return issues;
}
