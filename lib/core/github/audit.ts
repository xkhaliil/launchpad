import type {
  AccountAudit,
  Evidence,
  HygieneIssue,
  RepoAudit,
  RepoFileFacts,
  RepoSummary,
  ScanSettings,
} from "./types";

/*
 * Rule-based repo audit, no AI involved. Ported from gitms
 * (core/analyze/hygiene.ts, core/github/repos.ts, core/analyze/fingerprint.ts;
 * MIT, © 2026 gitms contributors).
 */

const DAY = 24 * 60 * 60 * 1000;
const STALE_DAYS = 365;

/**
 * Penalties subtracted from a perfect 100. They encode what a visitor sees:
 * an unlabelled repo in the grid hurts more than a missing .gitignore.
 */
const WEIGHTS: Record<string, number> = {
  "missing-description": 25,
  "missing-readme": 25,
  "missing-topics": 15,
  "missing-license": 10,
  "missing-homepage": 8,
  "missing-gitignore": 5,
  stale: 5,
  "near-empty": 10,
  "legacy-default-branch": 3,
};

function issue(
  code: keyof typeof WEIGHTS,
  severity: HygieneIssue["severity"],
  title: string,
  fix: string,
  automatable: boolean,
): HygieneIssue {
  return { code, severity, title, fix, automatable };
}

export function auditRepo(repo: RepoSummary, now = Date.now()): RepoAudit {
  const issues: HygieneIssue[] = [];

  if (!repo.description || repo.description.trim().length === 0) {
    issues.push(
      issue(
        "missing-description",
        "high",
        "No description",
        "Generate a one-line description from the code.",
        true,
      ),
    );
  }
  if (repo.topics.length === 0) {
    issues.push(
      issue(
        "missing-topics",
        "high",
        "No topics",
        "Add 3 to 6 topics so the repo can be found.",
        true,
      ),
    );
  }
  if (!repo.files.hasReadme) {
    issues.push(
      issue(
        "missing-readme",
        "high",
        "No README",
        "Generate a README from the actual code and dependencies.",
        true,
      ),
    );
  }
  if (!repo.files.hasLicenseFile && !repo.license) {
    issues.push(
      issue(
        "missing-license",
        "medium",
        "No license",
        "Add a LICENSE file. Without one, nobody may legally reuse the code.",
        false,
      ),
    );
  }
  // A homepage link only makes sense when something is deployed.
  if (!repo.homepage && repo.files.deployHints.length > 0) {
    issues.push(
      issue(
        "missing-homepage",
        "medium",
        "Deployable but no homepage link",
        `Found ${repo.files.deployHints.join(", ")}: add the live URL to the repo's homepage field.`,
        false,
      ),
    );
  }
  if (!repo.files.hasGitignore && !repo.isEmpty) {
    issues.push(
      issue(
        "missing-gitignore",
        "low",
        "No .gitignore",
        "Add one for the project's language.",
        false,
      ),
    );
  }
  const pushed = repo.pushedAt ? Date.parse(repo.pushedAt) : 0;
  if (pushed && now - pushed > STALE_DAYS * DAY) {
    const years = ((now - pushed) / (365 * DAY)).toFixed(1);
    issues.push(
      issue(
        "stale",
        "low",
        `No commits in ${years} years`,
        "Still worth a README, or archive it to show it is finished.",
        false,
      ),
    );
  }
  if (repo.isEmpty || repo.sizeKb < 5) {
    issues.push(
      issue(
        "near-empty",
        "medium",
        "Almost no content",
        "Consider making it private or archiving it: empty repos dilute the profile.",
        false,
      ),
    );
  }
  if (repo.defaultBranch === "master") {
    issues.push(
      issue(
        "legacy-default-branch",
        "low",
        "Default branch is master",
        "Rename it to main in the repo settings.",
        false,
      ),
    );
  }

  const penalty = issues.reduce((sum, i) => sum + (WEIGHTS[i.code] ?? 0), 0);
  return { name: repo.name, score: Math.max(0, 100 - penalty), issues };
}

export function auditAccount(
  owner: string,
  repos: RepoSummary[],
  scannedAt: string,
  now = Date.now(),
): AccountAudit {
  const audits = repos.map((repo) => auditRepo(repo, now));
  const count = (code: string) =>
    audits.filter((audit) => audit.issues.some((i) => i.code === code)).length;

  return {
    scannedAt,
    owner,
    totals: {
      repos: repos.length,
      missingDescription: count("missing-description"),
      missingTopics: count("missing-topics"),
      missingReadme: count("missing-readme"),
      missingLicense: count("missing-license"),
      stale: count("stale"),
    },
    averageScore:
      audits.length === 0
        ? 100
        : Math.round(audits.reduce((s, a) => s + a.score, 0) / audits.length),
    repos: [...audits].sort((a, b) => a.score - b.score),
  };
}

/**
 * "Fix these first": worst scores first, but only repos the tool can actually
 * improve. Stars break ties, since a visible repo is worth more.
 */
export function prioritise(
  audit: AccountAudit,
  repos: RepoSummary[],
  limit = 10,
): string[] {
  const stars = new Map(repos.map((r) => [r.name, r.stars]));
  return audit.repos
    .filter((a) => a.issues.some((i) => i.automatable))
    .sort(
      (a, b) =>
        a.score - b.score ||
        (stars.get(b.name) ?? 0) - (stars.get(a.name) ?? 0),
    )
    .slice(0, limit)
    .map((a) => a.name);
}

export function applyScanFilters(
  repos: RepoSummary[],
  settings: Pick<
    ScanSettings,
    "includeForks" | "includeArchived" | "includePrivate"
  >,
): RepoSummary[] {
  return repos.filter(
    (r) =>
      (settings.includeForks || !r.isFork) &&
      (settings.includeArchived || !r.isArchived) &&
      (settings.includePrivate || !r.isPrivate),
  );
}

/* ------------------------------------------------------------ file tree --- */

const README_RE = /^readme(\.(md|markdown|rst|txt))?$/i;
const LICENSE_RE = /^(license|licence|copying)(\.(md|txt))?$/i;
const DEPLOY_FILES = [
  "vercel.json",
  "netlify.toml",
  "now.json",
  "render.yaml",
  "fly.toml",
  "Dockerfile",
  "docker-compose.yml",
  "CNAME",
];

/** What one recursive tree read tells us without opening any file. */
export function deriveFileFacts(tree: {
  paths: string[];
  truncated: boolean;
  ok: boolean;
}): RepoFileFacts {
  const root = tree.paths.filter((p) => !p.includes("/"));
  const deployHints = DEPLOY_FILES.filter((f) =>
    root.some((p) => p.toLowerCase() === f.toLowerCase()),
  );
  if (tree.paths.some((p) => p.startsWith("docs/") || p === "docs")) {
    deployHints.push("docs/");
  }
  return {
    hasReadme: root.some((p) => README_RE.test(p)),
    hasLicenseFile: root.some((p) => LICENSE_RE.test(p)),
    hasGitignore: root.includes(".gitignore"),
    hasCi: tree.paths.some((p) => p.startsWith(".github/workflows/")),
    deployHints,
    incomplete: !tree.ok || tree.truncated,
  };
}

const MAX_TREE_ENTRIES = 300;
const MAX_TREE_DEPTH = 2;
const MAX_ENTRYPOINTS = 5;

/** Folders that say nothing about what a project does. */
const NOISE = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  "vendor/",
  "target/",
  "__pycache__/",
  ".venv/",
  "venv/",
  ".next/",
  "coverage/",
  ".idea/",
  ".vscode/",
];

const ENTRY_PATTERNS = [
  /^(src\/)?(index|main|app|cli|server)\.(ts|tsx|js|jsx|mjs|py|go|rs|rb|java|php)$/i,
  /^(src\/)?__main__\.py$/i,
  /^(src\/)?main\/.*\.(java|kt)$/i,
  /^app\.(py|js|ts)$/i,
  /^cmd\/[^/]+\/main\.go$/i,
];

export function trimTree(paths: string[], truncated = false) {
  const kept = paths
    .filter((p) => !NOISE.some((n) => p.startsWith(n) || p.includes(`/${n}`)))
    .filter((p) => p.split("/").length <= MAX_TREE_DEPTH + 1)
    .sort();
  return {
    paths: kept.slice(0, MAX_TREE_ENTRIES),
    truncated: truncated || kept.length > MAX_TREE_ENTRIES,
  };
}

/** The files most likely to show what a project does. */
export function pickEntrypoints(paths: string[]): string[] {
  const matched = paths.filter((p) => ENTRY_PATTERNS.some((re) => re.test(p)));
  if (matched.length >= MAX_ENTRYPOINTS)
    return matched.slice(0, MAX_ENTRYPOINTS);
  // Fall back to shallow source files: shallower paths are usually central.
  const fallback = paths
    .filter((p) =>
      /\.(ts|tsx|js|jsx|py|go|rs|rb|java|php|c|cpp|cs|swift|kt)$/i.test(p),
    )
    .filter((p) => !matched.includes(p))
    .sort(
      (a, b) =>
        a.split("/").length - b.split("/").length || a.length - b.length,
    );
  return [...matched, ...fallback].slice(0, MAX_ENTRYPOINTS);
}

/**
 * True when there is too little to describe honestly. Writing a README from
 * nothing is how invented content reaches a profile, so these are skipped.
 */
export function isTooThin(evidence: Evidence): boolean {
  const hasCode =
    evidence.entrypoints.length > 0 || evidence.manifests.length > 0;
  return !hasCode && evidence.tree.length <= 2;
}
