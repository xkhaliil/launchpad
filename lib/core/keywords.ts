/**
 * Keyword extraction and matching for job ads (plan.md, section 6.4).
 * A fixed dictionary for now; the AI layer will add extraction of terms that
 * are not in it.
 */

type Term = { term: string; aliases?: string[]; caseSensitive?: boolean };

export const TERMS: Term[] = [
  { term: "Go", aliases: ["Golang"], caseSensitive: true },
  { term: "Python" },
  { term: "TypeScript" },
  { term: "JavaScript", aliases: ["JS"] },
  { term: "Java" },
  { term: "C++" },
  { term: "C#" },
  { term: "Rust" },
  { term: "React" },
  { term: "Next.js" },
  { term: "Node.js", aliases: ["Node"] },
  { term: "PostgreSQL", aliases: ["Postgres"] },
  { term: "MySQL" },
  { term: "SQL" },
  { term: "MongoDB" },
  { term: "Redis" },
  { term: "Kafka" },
  { term: "GraphQL" },
  { term: "REST API", aliases: ["REST APIs", "RESTful", "REST"] },
  { term: "Docker" },
  { term: "Kubernetes", aliases: ["k8s"] },
  { term: "Terraform" },
  { term: "AWS" },
  { term: "Azure" },
  { term: "GCP", aliases: ["Google Cloud"] },
  { term: "CI/CD", aliases: ["continuous integration", "CI"] },
  { term: "Git" },
  { term: "Linux" },
  { term: "Microservices", aliases: ["microservice"] },
  { term: "Machine learning", aliases: ["ML"] },
  { term: "Supabase" },
];

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

function pattern(word: string, caseSensitive?: boolean): RegExp {
  // Not part of a longer word on either side ("SQL" must not match "PostgreSQL").
  return new RegExp(
    `(?<![A-Za-z0-9+#.])${escape(word)}(?![A-Za-z0-9+#])`,
    caseSensitive ? "" : "i",
  );
}

/** Dictionary terms that appear in the text, in dictionary order. */
export function extractKeywords(text: string): string[] {
  return TERMS.filter(({ term, aliases = [], caseSensitive }) =>
    [term, ...aliases].some((word) => pattern(word, caseSensitive).test(text)),
  ).map(({ term }) => term);
}

export type KeywordMatch = {
  matched: string[];
  missing: string[];
  /** Share of the keywords found, 0 to 100. */
  score: number;
};

export function matchKeywords(keywords: string[], text: string): KeywordMatch {
  const found = new Set(extractKeywords(text));
  const matched = keywords.filter((keyword) => found.has(keyword));
  const missing = keywords.filter((keyword) => !found.has(keyword));
  return {
    matched,
    missing,
    score:
      keywords.length === 0
        ? 0
        : Math.round((matched.length / keywords.length) * 100),
  };
}
