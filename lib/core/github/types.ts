/*
 * The GitHub module's vocabulary (plan.md, section 6.1). Ported from gitms
 * (github.com/xkhaliil/github-ms, MIT, © 2026 gitms contributors) and trimmed
 * to what Launchpad uses.
 */

export interface RepoFileFacts {
  hasReadme: boolean;
  hasLicenseFile: boolean;
  hasGitignore: boolean;
  hasCi: boolean;
  /** Config files that imply the project is deployed somewhere public. */
  deployHints: string[];
  /** True when the tree could not be read in full (empty repo or truncated). */
  incomplete: boolean;
}

export interface RepoSummary {
  name: string;
  owner: string;
  description: string | null;
  topics: string[];
  language: string | null;
  stars: number;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  isEmpty: boolean;
  defaultBranch: string;
  homepage: string | null;
  license: string | null;
  createdAt: string;
  pushedAt: string | null;
  sizeKb: number;
  /** Derived from one file-tree read during the scan. */
  files: RepoFileFacts;
}

export type IssueSeverity = "high" | "medium" | "low";

export interface HygieneIssue {
  code: string;
  severity: IssueSeverity;
  title: string;
  fix: string;
  /** True when the tool can fix it itself; false when a person must decide. */
  automatable: boolean;
}

export interface RepoAudit {
  name: string;
  /** 0 to 100. Higher is healthier. */
  score: number;
  issues: HygieneIssue[];
}

export interface AccountAudit {
  scannedAt: string;
  owner: string;
  totals: {
    repos: number;
    missingDescription: number;
    missingTopics: number;
    missingReadme: number;
    missingLicense: number;
    stale: number;
  };
  averageScore: number;
  /** Worst first. */
  repos: RepoAudit[];
}

export interface ParsedManifest {
  file: string;
  ecosystem: string;
  packageName?: string;
  version?: string;
  description?: string;
  dependencies: string[];
  scripts?: Record<string, string>;
  /** Entry point or binary the manifest names, if any. */
  entry?: string;
}

/**
 * Everything the model may know about a repo. Kept next to the proposal so a
 * wrong answer can always be traced back to what it was shown.
 */
export interface Evidence {
  repo: Pick<
    RepoSummary,
    | "name"
    | "owner"
    | "description"
    | "topics"
    | "homepage"
    | "license"
    | "stars"
    | "createdAt"
    | "pushedAt"
    | "defaultBranch"
    | "isFork"
    | "isArchived"
  >;
  languages: Record<string, number>;
  tree: string[];
  treeTruncated: boolean;
  manifests: ParsedManifest[];
  existingReadme: { path: string; text: string } | null;
  entrypoints: { path: string; text: string }[];
  commitMessages: string[];
  /**
   * Launchpad addition: the matching project from the student's profile, so
   * a live URL or a result they entered can be used without guessing.
   */
  profileProject: {
    name: string;
    description: string;
    bullets: string[];
    liveUrl?: string;
  } | null;
  bytes: number;
}

export type Confidence = "high" | "medium" | "low";

/** What a model returns for one repo, before review. */
export interface RepoDraft {
  description: string;
  topics: string[];
  readme: string;
  /** Launchpad addition: the live URL, only when the profile gives one. */
  homepage?: string;
  confidence: Confidence;
  /** What in the evidence the description is based on. Shown in review. */
  reasoning: string;
  /** What could not be determined and was left out. */
  unknowns: string[];
}

export type ProposalStatus =
  "pending" | "approved" | "skipped" | "applied" | "failed";

export interface RepoProposal extends RepoDraft {
  name: string;
  status: ProposalStatus;
  generatedAt: string;
  model: string;
  /** Set once applied, so applying again skips it. */
  applied?: { at: string };
  error?: string;
}

export interface PlannedCall {
  repo: string;
  method: string;
  path: string;
  summary: string;
}

export interface ScanSettings {
  includeForks: boolean;
  includeArchived: boolean;
  includePrivate: boolean;
  /** Regenerate a README that already exists, instead of skipping the repo. */
  overwriteExistingReadme: boolean;
}

export const DEFAULT_SCAN_SETTINGS: ScanSettings = {
  includeForks: false,
  includeArchived: false,
  includePrivate: false,
  overwriteExistingReadme: false,
};
