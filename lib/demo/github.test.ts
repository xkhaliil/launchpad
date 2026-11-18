import { beforeEach, describe, expect, it } from "vitest";
import { draftRepoFromEvidence } from "@/lib/ai/mock";
import { isTooThin } from "@/lib/core/github/audit";
import { normaliseDraft, validateDraft } from "@/lib/core/github/proposal";
import {
  applyApproved,
  buildEvidence,
  githubAudit,
  githubRepos,
  markScanned,
  setScanSetting,
  skipReason,
  undoApply,
} from "./github";
import { getDemo, resetDemo, updateDemo } from "./store";

const NOW = Date.parse("2026-11-18T12:00:00Z");

beforeEach(() => resetDemo());

describe("the demo account", () => {
  it("scans 6 public repos by default and audits them with gitms's rules", () => {
    const { repos, audit, priority } = githubAudit(getDemo(), NOW);
    expect(repos).toHaveLength(6);
    expect(audit.averageScore).toBe(56);
    expect(priority).toEqual([
      "algo-exercises",
      "hello-world",
      "study-buddy",
      "route-planner",
    ]);
  });

  it("follows the scan settings", () => {
    setScanSetting("includeForks", true);
    setScanSetting("includePrivate", true);
    expect(githubRepos(getDemo())).toHaveLength(8);
  });
});

describe("drafting", () => {
  it("builds a proposal from the evidence and the profile only", () => {
    const evidence = buildEvidence(getDemo(), "study-buddy");
    expect(evidence?.profileProject?.liveUrl).toBe(
      "https://study-buddy.example.com",
    );
    const { value } = normaliseDraft(draftRepoFromEvidence(evidence!));
    expect(validateDraft(value)).toEqual([]);
    expect(value.confidence).toBe("high");
    expect(value.topics).toEqual(["typescript", "supabase", "react", "vite"]);
    expect(value.homepage).toBe("https://study-buddy.example.com");
    expect(value.readme).toContain("npm run dev");
  });

  it("leaves unknowns as TODOs instead of guessing", () => {
    const evidence = buildEvidence(getDemo(), "algo-exercises");
    const value = draftRepoFromEvidence(evidence!);
    expect(value.confidence).toBe("medium");
    expect(value.readme).toContain("<!-- TODO");
    expect(value.unknowns.length).toBeGreaterThan(0);
  });

  it("skips what it cannot describe honestly, or must not overwrite", () => {
    const state = getDemo();
    expect(isTooThin(buildEvidence(state, "hello-world")!)).toBe(true);
    const route = githubRepos(state).find((r) => r.name === "route-planner")!;
    expect(skipReason(state, route)).toContain("Already has a README");
    expect(skipReason(state, route, "It was a course project")).toBeNull();
  });
});

describe("applying", () => {
  it("dry-runs first, applies only approved, and can undo", () => {
    markScanned();
    const evidence = buildEvidence(getDemo(), "study-buddy")!;
    const { value } = normaliseDraft(draftRepoFromEvidence(evidence));
    updateDemo((state) => ({
      ...state,
      github: {
        ...state.github,
        proposals: {
          "study-buddy": {
            ...value,
            name: "study-buddy",
            status: "approved",
            generatedAt: "",
            model: "test",
          },
        },
      },
    }));
    const score = () =>
      githubAudit(getDemo(), NOW).audit.repos.find(
        (repo) => repo.name === "study-buddy",
      )?.score;

    expect(score()).toBe(42);
    const dry = applyApproved(true);
    expect(dry.calls).toHaveLength(3);
    expect(score()).toBe(42);

    applyApproved(false);
    expect(score()).toBe(100);
    expect(getDemo().github.backups["study-buddy"]?.readme).toBeNull();
    expect(getDemo().github.proposals["study-buddy"].status).toBe("applied");

    undoApply("study-buddy");
    expect(score()).toBe(42);
    expect(getDemo().github.proposals["study-buddy"].status).toBe("approved");
  });
});
