import { describe, expect, it } from "vitest";
import type { LinkedinSuggestions } from "@/lib/ai/provider";
import { initialDemoState } from "./store";
import { pendingSuggestions, readyToAccept } from "./suggestions";

const linkedin: LinkedinSuggestions = {
  headline: "Backend developer | Go · Python | Berlin",
  about: "About text",
  experience: [{ title: "Intern, Northwind", text: "• Built an API" }],
  skills: ["Go", "Python"],
  url: "linkedin.com/in/ada-lovelace",
};

const scanned = () => {
  const state = initialDemoState();
  state.github.scannedAt = "2026-11-18T10:00:00Z";
  return state;
};

const count = (list: ReturnType<typeof pendingSuggestions>, area: string) =>
  list.filter((item) => item.areas.includes(area as never)).length;

describe("pendingSuggestions", () => {
  it("collects LinkedIn and CV suggestions; GitHub waits for a scan", () => {
    const list = pendingSuggestions(initialDemoState(), linkedin);
    expect(count(list, "github")).toBe(0);
    // "skills" starts as done in the demo.
    expect(count(list, "linkedin")).toBe(4);
    expect(count(list, "cv")).toBe(2);
  });

  it("offers the GitHub bio once scanned, and it fixes the mismatch", () => {
    const list = pendingSuggestions(scanned(), linkedin);
    const bio = list.find((item) => item.id === "github-bio");
    expect(bio?.areas).toEqual(["github", "consistency"]);
    expect(bio?.call).toContain("PATCH /user");
    expect(list.some((item) => item.target.kind === "mismatch")).toBe(false);
  });

  it("asks to approve drafted repo proposals, with their details", () => {
    const state = scanned();
    state.github.proposals["algo-exercises"] = {
      name: "algo-exercises",
      status: "pending",
      description: "Python solutions to algorithm exercises",
      topics: ["python", "algorithms", "pytest"],
      readme: "# Algo",
      confidence: "medium",
      reasoning: "Based on requirements.txt.",
      unknowns: [],
      generatedAt: "",
      model: "test",
    };
    const item = pendingSuggestions(state, null).find(
      (entry) => entry.id === "repo-algo-exercises",
    );
    expect(item?.mode).toBe("approve");
    expect(item?.details?.topics).toEqual(["python", "algorithms", "pytest"]);
    expect(readyToAccept(item!, "short")).toBe(false);
    expect(readyToAccept(item!, item!.after)).toBe(true);
  });

  it("leaves LinkedIn out until the suggestions exist", () => {
    const list = pendingSuggestions(initialDemoState(), null);
    expect(list.some((item) => item.areas.includes("linkedin"))).toBe(false);
  });
});

describe("readyToAccept", () => {
  it("waits until the placeholder is replaced", () => {
    const [bullet] = pendingSuggestions(initialDemoState(), null).filter(
      (item) => item.target.kind === "bullet",
    );
    expect(readyToAccept(bullet, bullet.after)).toBe(false);
    expect(
      readyToAccept(bullet, "Wrote 40 integration tests for billing"),
    ).toBe(true);
  });
});
