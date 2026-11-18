import { ai } from "@/lib/ai/mock";
import {
  applyScanFilters,
  auditAccount,
  deriveFileFacts,
  isTooThin,
  pickEntrypoints,
  prioritise,
  trimTree,
} from "@/lib/core/github/audit";
import { MANIFEST_FILES, parseManifest } from "@/lib/core/github/manifests";
import {
  mergeTopics,
  normaliseDraft,
  planCalls,
  validateDraft,
} from "@/lib/core/github/proposal";
import type {
  Evidence,
  PlannedCall,
  RepoProposal,
  RepoSummary,
  ScanSettings,
} from "@/lib/core/github/types";
import { demoNow } from "./clock";
import { demoSources } from "./data";
import { DEMO_GITHUB_LOGIN, type DemoRepo, demoAccount } from "./github-data";
import {
  type ApplyRun,
  type ChangeStatus,
  type DemoState,
  getDemo,
  type RepoFields,
  updateDemo,
} from "./store";

/*
 * The GitHub module on demo data: gitms's scan → audit → generate → review →
 * apply pipeline (plan.md, section 6.1), reading the example account in
 * github-data.ts instead of the GitHub API. Nothing is sent anywhere. The
 * rules (audit, evidence, limits, dry run) are the real ones in
 * lib/core/github; only the data source and the AI are stand-ins.
 */

const README_FILE = /^readme(\.(md|markdown|rst|txt))?$/i;

/** A repo as GitHub shows it now: the example account plus anything applied. */
function live(repo: DemoRepo, state: DemoState): DemoRepo {
  const change = state.github.applied[repo.name];
  if (!change) return repo;
  const hasReadme = repo.tree.some((path) => README_FILE.test(path));
  return {
    ...repo,
    description: change.description,
    topics: change.topics,
    homepage: change.homepage,
    tree:
      change.readme !== null && !hasReadme
        ? [...repo.tree, "README.md"].sort()
        : repo.tree,
    contents:
      change.readme !== null
        ? { ...repo.contents, "README.md": change.readme }
        : repo.contents,
  };
}

function summary(repo: DemoRepo): RepoSummary {
  return {
    name: repo.name,
    owner: DEMO_GITHUB_LOGIN,
    description: repo.description,
    topics: repo.topics,
    language: repo.language,
    stars: repo.stars,
    isFork: repo.isFork,
    isArchived: repo.isArchived,
    isPrivate: repo.isPrivate,
    isEmpty: repo.isEmpty,
    defaultBranch: repo.defaultBranch,
    homepage: repo.homepage,
    license: repo.license,
    createdAt: repo.createdAt,
    pushedAt: repo.pushedAt,
    sizeKb: repo.sizeKb,
    files: deriveFileFacts({ paths: repo.tree, truncated: false, ok: true }),
  };
}

/** Every repo the scan sees, after the scan settings. */
export function githubRepos(
  state: DemoState,
  { all = false }: { all?: boolean } = {},
): RepoSummary[] {
  const repos = demoAccount.map((repo) => summary(live(repo, state)));
  return all ? repos : applyScanFilters(repos, state.github.settings);
}

export function githubAudit(state: DemoState, now = demoNow()) {
  const repos = githubRepos(state);
  const audit = auditAccount(
    DEMO_GITHUB_LOGIN,
    repos,
    state.github.scannedAt ?? "",
    now,
  );
  return { repos, audit, priority: prioritise(audit, repos) };
}

/** What the model would be shown for one repo (plan.md, section 6.1). */
export function buildEvidence(state: DemoState, name: string): Evidence | null {
  const source = demoAccount.find((repo) => repo.name === name);
  if (!source) return null;
  const repo = live(source, state);
  const trimmed = trimTree(repo.tree);
  const manifests = repo.tree
    .filter((path) => (MANIFEST_FILES as readonly string[]).includes(path))
    .map((path) =>
      repo.contents[path] ? parseManifest(path, repo.contents[path]) : null,
    )
    .filter((manifest) => manifest !== null);
  const readmePath = repo.tree.find((path) => README_FILE.test(path));
  const project = state.profile.projects.find(
    (item) => item.name.toLowerCase() === repo.name.toLowerCase(),
  );

  const evidence: Evidence = {
    repo: {
      name: repo.name,
      owner: DEMO_GITHUB_LOGIN,
      description: repo.description,
      topics: repo.topics,
      homepage: repo.homepage,
      license: repo.license,
      stars: repo.stars,
      createdAt: repo.createdAt,
      pushedAt: repo.pushedAt,
      defaultBranch: repo.defaultBranch,
      isFork: repo.isFork,
      isArchived: repo.isArchived,
    },
    languages: repo.languages,
    tree: trimmed.paths,
    treeTruncated: trimmed.truncated,
    manifests,
    existingReadme:
      readmePath && repo.contents[readmePath]
        ? { path: readmePath, text: repo.contents[readmePath] }
        : null,
    entrypoints: pickEntrypoints(trimmed.paths)
      .filter((path) => repo.contents[path])
      .map((path) => ({ path, text: repo.contents[path] })),
    commitMessages: repo.commits,
    profileProject: project
      ? {
          name: project.name,
          description: project.description,
          bullets: project.bullets.filter((bullet) => bullet.trim()),
          ...(project.liveUrl
            ? {
                liveUrl: project.liveUrl.startsWith("http")
                  ? project.liveUrl
                  : `https://${project.liveUrl}`,
              }
            : {}),
        }
      : null,
    bytes: 0,
  };
  evidence.bytes = JSON.stringify(evidence).length;
  return evidence;
}

/* ---------------------------------------------------------- profile --- */

/** The suggested GitHub bio, from the profile only. GitHub allows 160. */
export function suggestedBio(state: DemoState): string {
  const { headline, skills, location } = state.profile;
  return [
    headline,
    skills
      .slice(0, 3)
      .map((skill) => skill.name)
      .join(", "),
    location.split(",")[0],
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 160);
}

export function currentBio(state: DemoState): string {
  return state.sources.github.headline ?? "";
}

export function setBioStatus(status: ChangeStatus) {
  updateDemo((state) => ({
    ...state,
    github: { ...state.github, bio: status },
    // The bio is where the consistency checker reads the GitHub headline.
    sources: {
      ...state.sources,
      github: {
        ...state.sources.github,
        headline:
          status === "applied"
            ? state.profile.headline
            : demoSources.github.headline,
      },
    },
  }));
}

/* ----------------------------------------------------------- counts --- */

export function githubCounts(state: DemoState) {
  const scanned = state.github.scannedAt !== null;
  const proposals = Object.values(state.github.proposals);
  const count = (status: RepoProposal["status"]) =>
    proposals.filter((proposal) => proposal.status === status).length;
  const bioPending = scanned && state.github.bio === "proposed";
  return {
    scanned,
    bioPending,
    pendingRepos: count("pending"),
    /** Everything waiting for a decision, bio included. */
    pending: count("pending") + (bioPending ? 1 : 0),
    approved: count("approved"),
    applied: count("applied"),
  };
}

/* ---------------------------------------------------------- actions --- */

export function markScanned() {
  updateDemo((state) => ({
    ...state,
    github: { ...state.github, scannedAt: new Date().toISOString() },
  }));
}

export function setScanSetting<K extends keyof ScanSettings>(
  key: K,
  value: ScanSettings[K],
) {
  updateDemo((state) => ({
    ...state,
    github: {
      ...state.github,
      settings: { ...state.github.settings, [key]: value },
    },
  }));
}

export function updateProposal(name: string, patch: Partial<RepoProposal>) {
  updateDemo((state) => {
    const proposal = state.github.proposals[name];
    if (!proposal) return state;
    return {
      ...state,
      github: {
        ...state.github,
        proposals: {
          ...state.github.proposals,
          [name]: { ...proposal, ...patch },
        },
      },
    };
  });
}

/** Approve every pending proposal at or above a confidence level. */
export function approveAll(min: "high" | "medium") {
  const ok = min === "high" ? ["high"] : ["high", "medium"];
  updateDemo((state) => ({
    ...state,
    github: {
      ...state.github,
      proposals: Object.fromEntries(
        Object.entries(state.github.proposals).map(([name, proposal]) => [
          name,
          proposal.status === "pending" && ok.includes(proposal.confidence)
            ? { ...proposal, status: "approved" as const }
            : proposal,
        ]),
      ),
    },
  }));
}

/** Why generation would skip a repo, or null when it can go ahead. */
export function skipReason(
  state: DemoState,
  repo: RepoSummary,
  hint?: string,
): string | null {
  if (state.github.proposals[repo.name]?.status === "applied") {
    return "Already applied. Undo it first to draft again.";
  }
  if (
    repo.files.hasReadme &&
    !state.github.settings.overwriteExistingReadme &&
    !hint?.trim()
  ) {
    return "Already has a README. Allow regenerating READMEs, or add a correction.";
  }
  return null;
}

export type StepResult = {
  state: "done" | "skipped" | "failed";
  message: string;
};

/** Drafts one repo: evidence → AI → GitHub's limits → pending proposal. */
export async function generateOne(
  name: string,
  hint?: string,
): Promise<StepResult> {
  const state = getDemo();
  const repo = githubRepos(state, { all: true }).find((r) => r.name === name);
  if (!repo) return { state: "failed", message: "Not in the last scan." };
  const evidence = buildEvidence(state, name);
  if (!evidence) return { state: "failed", message: "Could not read it." };
  // Checked before the README rule: for a near-empty repo this is the
  // useful answer.
  if (isTooThin(evidence)) {
    return {
      state: "skipped",
      message:
        "Not enough code to describe honestly. Consider archiving it or making it private.",
    };
  }
  const reason = skipReason(state, repo, hint);
  if (reason) return { state: "skipped", message: reason };

  const { value, notes } = normaliseDraft(await ai.draftRepo(evidence, hint));
  const problems = validateDraft(value);
  if (problems.length > 0) return { state: "failed", message: problems[0] };

  const proposal: RepoProposal = {
    ...value,
    unknowns: [...value.unknowns, ...notes],
    name,
    status: "pending",
    generatedAt: new Date().toISOString(),
    model: ai.name,
  };
  updateDemo((current) => ({
    ...current,
    github: {
      ...current.github,
      proposals: { ...current.github.proposals, [name]: proposal },
    },
  }));
  return { state: "done", message: `Drafted, ${value.confidence} confidence` };
}

/** The calls applying every approved proposal would make. */
export function plannedCalls(state: DemoState): PlannedCall[] {
  const repos = githubRepos(state, { all: true });
  return Object.values(state.github.proposals)
    .filter((proposal) => proposal.status === "approved")
    .flatMap((proposal) => {
      const repo = repos.find((r) => r.name === proposal.name);
      return repo ? planCalls(repo, proposal) : [];
    });
}

function fieldsOf(repo: DemoRepo): RepoFields {
  const readmePath = repo.tree.find((path) => README_FILE.test(path));
  return {
    description: repo.description,
    topics: repo.topics,
    readme: readmePath ? (repo.contents[readmePath] ?? null) : null,
    homepage: repo.homepage,
  };
}

/**
 * Applies every approved proposal, or with `dryRun` only lists the calls.
 * The README in place is backed up first, and an applied repo is skipped
 * next time (gitms's safety rules).
 */
export function applyApproved(dryRun: boolean): ApplyRun {
  const state = getDemo();
  const approved = Object.values(state.github.proposals).filter(
    (proposal) => proposal.status === "approved",
  );
  const run: ApplyRun = {
    at: new Date().toISOString(),
    dryRun,
    repos: approved.map((proposal) => proposal.name),
    calls: plannedCalls(state),
  };

  updateDemo((current) => {
    const github = {
      ...current.github,
      proposals: { ...current.github.proposals },
      applied: { ...current.github.applied },
      backups: { ...current.github.backups },
      runs: [run, ...current.github.runs].slice(0, 5),
    };
    if (!dryRun) {
      for (const proposal of approved) {
        const source = demoAccount.find((repo) => repo.name === proposal.name);
        if (!source) continue;
        const before = live(source, current);
        github.backups[proposal.name] ??= fieldsOf(before);
        github.applied[proposal.name] = {
          description: proposal.description,
          topics: mergeTopics(before.topics, proposal.topics),
          readme: proposal.readme,
          homepage: before.homepage ?? proposal.homepage ?? null,
        };
        github.proposals[proposal.name] = {
          ...proposal,
          status: "applied",
          applied: { at: run.at },
        };
      }
    }
    return { ...current, github };
  });
  return run;
}

/** Launchpad addition: put a repo back as it was before the apply. */
export function undoApply(name: string) {
  updateDemo((state) => {
    const applied = { ...state.github.applied };
    const backups = { ...state.github.backups };
    delete applied[name];
    delete backups[name];
    const proposal = state.github.proposals[name];
    return {
      ...state,
      github: {
        ...state.github,
        applied,
        backups,
        proposals: proposal
          ? {
              ...state.github.proposals,
              [name]: { ...proposal, status: "approved", applied: undefined },
            }
          : state.github.proposals,
      },
    };
  });
}
