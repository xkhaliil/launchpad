import { hasResult, startsWithActionVerb } from "./ats";

/**
 * Rule-based fixes for CV bullets (plan.md, section 6.2). They only reorder
 * the student's own words; a missing result becomes a placeholder the
 * student fills in, because only they know the number.
 */

export const RESULT_PLACEHOLDER = "[ADD: a result, e.g. a number]";

const IRREGULAR: Record<string, string> = {
  bringing: "brought",
  building: "built",
  buying: "bought",
  choosing: "chose",
  cutting: "cut",
  doing: "did",
  drawing: "drew",
  driving: "drove",
  finding: "found",
  getting: "got",
  giving: "gave",
  growing: "grew",
  holding: "held",
  keeping: "kept",
  leading: "led",
  making: "made",
  meeting: "met",
  putting: "put",
  running: "ran",
  selling: "sold",
  sending: "sent",
  setting: "set",
  speaking: "spoke",
  spending: "spent",
  taking: "took",
  teaching: "taught",
  telling: "told",
  thinking: "thought",
  writing: "wrote",
};

/** "grading" → "graded", "planning" → "planned", "writing" → "wrote". */
export function pastTense(gerund: string): string | null {
  const word = gerund.toLowerCase();
  if (!/^[a-z]+ing$/.test(word) || word.length < 5) return null;
  if (IRREGULAR[word]) return IRREGULAR[word];
  const stem = word.slice(0, -3);
  // "applying" → "applied", but "deploying" → "deployed".
  if (/[^aeiou]y$/.test(stem)) return `${stem.slice(0, -1)}ied`;
  // A doubled consonant ("plann", "debugg") already has its final letter.
  if (/([^aeiou])\1$/.test(stem)) return `${stem}ed`;
  // "grad" (grade), "creat" (create), "manag" (manage): add "ed".
  return `${stem}ed`;
}

const LEAD_INS =
  /^(?:responsible for|in charge of|tasked with|worked on|involved in|helped with)\s+/i;

/**
 * Starts a bullet with a past-tense verb when the verb is already in it:
 * "Responsible for grading assignments" → "Graded assignments".
 * Returns null when there is no verb to move to the front.
 */
export function withActionVerb(bullet: string): string | null {
  const text = bullet.trim().replace(LEAD_INS, "");
  const [first, ...rest] = text.split(/\s+/);
  const past = first ? pastTense(first) : null;
  if (!past || rest.length === 0) return null;
  return [past.charAt(0).toUpperCase() + past.slice(1), ...rest].join(" ");
}

/**
 * The suggested version of a bullet, or null when it already starts with a
 * verb and has a result.
 */
export function improveBullet(bullet: string): string | null {
  const verb = startsWithActionVerb(bullet);
  const result = hasResult(bullet);
  if (verb && result) return null;
  let text = bullet.trim().replace(/\.$/, "");
  if (!verb) text = withActionVerb(text) ?? text;
  if (!result) text = `${text} ${RESULT_PLACEHOLDER}`;
  return text;
}
