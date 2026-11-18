import { describe, expect, it } from "vitest";
import {
  auditAccount,
  auditRepo,
  deriveFileFacts,
  isTooThin,
  pickEntrypoints,
  prioritise,
  trimTree,
} from "./audit";
import { parseManifest } from "./manifests";
import { buildRepoMessage } from "./prompt";
import {
  describeApplyError,
  mergeTopics,
  normaliseDraft,
  planCalls,
  toTopic,
  validateDraft,
} from "./proposal";
import type { Evidence, RepoDraft, RepoSummary } from "./types";

const NOW = Date.parse("2026-11-18T12:00:00Z");

const facts = (paths: string[]) =>
  deriveFileFacts({ paths, truncated: false, ok: true });

const repo = (patch: Partial<RepoSummary> = {}): RepoSummary => ({
  name: "demo",
  owner: "ada",
  description: "CLI that converts CSV files to JSON",
  topics: ["cli", "python", "csv"],
  language: "Python",
  stars: 0,
  isFork: false,
  isArchived: false,
  isPrivate: false,
  isEmpty: false,
  defaultBranch: "main",
  homepage: null,
  license: "MIT",
  createdAt: "2026-01-01T00:00:00Z",
  pushedAt: "2026-11-01T00:00:00Z",
  sizeKb: 120,
  files: facts(["README.md", "LICENSE", ".gitignore", "main.py"]),
  ...patch,
});

const draft = (patch: Partial<RepoDraft> = {}): RepoDraft => ({
  description: "CLI that converts CSV files to JSON",
  topics: ["python", "cli", "csv"],
  readme: `# Demo\n\n${"Converts CSV files to JSON. ".repeat(6)}`,
  confidence: "high",
  reasoning: "Based on main.py.",
  unknowns: [],
  ...patch,
});

describe("audit (gitms rules)", () => {
  it("scores a complete repo 100", () => {
    expect(auditRepo(repo(), NOW)).toEqual({
      name: "demo",
      score: 100,
      issues: [],
    });
  });

  it("subtracts the weighted penalties", () => {
    const audit = auditRepo(
      repo({
        description: null,
        topics: [],
        license: null,
        defaultBranch: "master",
        pushedAt: "2024-01-01T00:00:00Z",
        files: facts(["main.py", "Dockerfile"]),
      }),
      NOW,
    );
    const codes = audit.issues.map((issue) => issue.code);
    expect(codes).toEqual([
      "missing-description",
      "missing-topics",
      "missing-readme",
      "missing-license",
      "missing-homepage",
      "missing-gitignore",
      "stale",
      "legacy-default-branch",
    ]);
    // 100 - 25 - 15 - 25 - 10 - 8 - 5 - 5 - 3
    expect(audit.score).toBe(4);
  });

  it("totals the account and lists what to fix first", () => {
    const repos = [
      repo({ name: "good" }),
      repo({ name: "bad", description: null, stars: 1 }),
      repo({ name: "worse", description: null, topics: [] }),
      // Only a license is missing: not something the tool can fix.
      repo({ name: "manual", license: null, files: facts(["README.md"]) }),
    ];
    const audit = auditAccount("ada", repos, "", NOW);
    expect(audit.totals.missingDescription).toBe(2);
    expect(audit.repos[0].name).toBe("worse");
    expect(prioritise(audit, repos)).toEqual(["worse", "bad"]);
  });
});

describe("file facts and evidence", () => {
  it("reads facts from the tree alone", () => {
    expect(
      facts([
        "readme.md",
        "LICENSE.txt",
        ".github/workflows/ci.yml",
        "vercel.json",
        "docs/index.md",
      ]),
    ).toMatchObject({
      hasReadme: true,
      hasLicenseFile: true,
      hasGitignore: false,
      hasCi: true,
      deployHints: ["vercel.json", "docs/"],
    });
  });

  it("drops noise folders and deep paths", () => {
    expect(
      trimTree(["node_modules/x/index.js", "a/b/c/d.ts", "src/app.ts"]).paths,
    ).toEqual(["src/app.ts"]);
  });

  it("finds entry points first, then shallow source files", () => {
    expect(
      pickEntrypoints(["lib/deep/util.ts", "helpers.ts", "src/main.ts"]),
    ).toEqual(["src/main.ts", "helpers.ts", "lib/deep/util.ts"]);
  });

  it("calls a repo with no code and almost no files too thin", () => {
    const evidence = {
      tree: ["README.md"],
      manifests: [],
      entrypoints: [],
    } as unknown as Evidence;
    expect(isTooThin(evidence)).toBe(true);
  });
});

describe("manifests", () => {
  it("reads package.json", () => {
    const manifest = parseManifest(
      "package.json",
      JSON.stringify({
        name: "x",
        description: "A thing",
        scripts: { dev: "vite" },
        dependencies: { react: "1" },
        devDependencies: { vite: "1" },
      }),
    );
    expect(manifest).toMatchObject({
      ecosystem: "npm",
      packageName: "x",
      description: "A thing",
      dependencies: ["react", "vite"],
      scripts: { dev: "vite" },
    });
  });

  it("reads go.mod, requirements.txt and pyproject.toml", () => {
    expect(
      parseManifest(
        "go.mod",
        "module example.com/x\n\ngo 1.22\n\nrequire (\n\tgithub.com/go-chi/chi/v5 v5.0.12\n)\n",
      ),
    ).toMatchObject({
      packageName: "example.com/x",
      version: "go 1.22",
      dependencies: ["github.com/go-chi/chi/v5"],
    });
    expect(
      parseManifest(
        "requirements.txt",
        "# deps\nnumpy>=1.0\npandas\n-r dev.txt",
      )?.dependencies,
    ).toEqual(["numpy", "pandas"]);
    expect(
      parseManifest(
        "pyproject.toml",
        '[project]\nname = "x"\ndependencies = ["fastapi>=0.1", "uvicorn"]\n',
      )?.dependencies,
    ).toEqual(["fastapi", "uvicorn"]);
  });

  it("ignores broken and unknown files", () => {
    expect(parseManifest("package.json", "{not json")).toBeNull();
    expect(parseManifest("Makefile", "all:")).toBeNull();
  });
});

describe("proposals", () => {
  it("normalises topics and the description, and says so", () => {
    const { value, notes } = normaliseDraft(
      draft({
        description: "  CLI that converts CSV files to JSON.  ",
        topics: ["Python", "C L I", "python", "csv"],
      }),
    );
    expect(value.description).toBe("CLI that converts CSV files to JSON");
    expect(value.topics).toEqual(["python", "c-l-i", "csv"]);
    expect(notes.length).toBe(2);
  });

  it("checks GitHub's limits", () => {
    expect(validateDraft(draft())).toEqual([]);
    expect(
      validateDraft(draft({ description: "x".repeat(351), topics: ["a"] })),
    ).toHaveLength(3);
  });

  it("keeps existing topics when merging", () => {
    expect(mergeTopics(["react"], ["typescript", "react"])).toEqual([
      "react",
      "typescript",
    ]);
    expect(toTopic("React Native!")).toBe("react-native");
  });

  it("plans the exact calls for a dry run", () => {
    const calls = planCalls(
      repo({ topics: ["react"], files: facts(["main.py"]) }),
      draft({ homepage: "https://x.example.com" }),
    );
    expect(calls.map((call) => `${call.method} ${call.path}`)).toEqual([
      "PATCH /repos/ada/demo",
      "PUT /repos/ada/demo/topics",
      "PUT /repos/ada/demo/contents/README.md",
    ]);
    expect(calls[0].summary).toContain("homepage");
    expect(calls[2].summary).toContain("create README.md on main");
  });

  it("explains failed writes in plain words", () => {
    expect(describeApplyError(409)).toContain("changed on GitHub");
  });
});

describe("prompt", () => {
  it("tells the model when there is nothing to install from", () => {
    const message = buildRepoMessage({
      repo: repo(),
      languages: { Python: 100 },
      tree: ["main.py"],
      treeTruncated: false,
      manifests: [],
      existingReadme: null,
      entrypoints: [],
      commitMessages: [],
      profileProject: null,
      bytes: 0,
    });
    expect(message).toContain("# Repository: ada/demo");
    expect(message).toContain("Do not invent install instructions.");
  });
});
