/** Cover letter checks (plan.md, section 6.3). */

export const WORD_LIMIT = 250;

export function wordCount(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function paragraphCount(text: string): number {
  return text.split(/\n\s*\n/).filter((part) => part.trim() !== "").length;
}

export type Cliche = { phrase: string; suggestion: string };

const CLICHES: Cliche[] = [
  {
    phrase: "I am writing to apply",
    suggestion: "Open with the role and one specific reason this team.",
  },
  {
    phrase: "hard-working",
    suggestion: "Show the work instead: name a project and what it achieved.",
  },
  {
    phrase: "team player",
    suggestion: "Describe one thing you built or fixed with other people.",
  },
  {
    phrase: "passionate about",
    suggestion:
      "Say what you have done in the area, not how you feel about it.",
  },
  {
    phrase: "think outside the box",
    suggestion: "Give the unusual approach you actually took.",
  },
  {
    phrase: "fast learner",
    suggestion: "Name something you learned quickly and what you did with it.",
  },
  {
    phrase: "to whom it may concern",
    suggestion: "Address the team or the hiring manager by name.",
  },
];

/** Clichés found in the text, in the order of the list above. */
export function findCliches(text: string): Cliche[] {
  const lower = text.toLowerCase();
  return CLICHES.filter((cliche) =>
    lower.includes(cliche.phrase.toLowerCase()),
  );
}

/** Placeholders like [ADD: company] that still need filling in. */
export function findPlaceholders(text: string): string[] {
  return [...text.matchAll(/\[ADD:[^\]]*\]/g)].map((match) => match[0]);
}
