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

describe("pendingSuggestions", () => {
  it("collects GitHub, LinkedIn and CV suggestions from the demo state", () => {
    const list = pendingSuggestions(initialDemoState(), linkedin);
    const count = (area: string) =>
      list.filter((item) => item.areas.includes(area as never)).length;
    expect(count("github")).toBe(5);
    // "skills" starts as done in the demo.
    expect(count("linkedin")).toBe(4);
    expect(count("cv")).toBe(2);
  });

  it("lets one suggestion fix a mismatch instead of listing it twice", () => {
    const list = pendingSuggestions(initialDemoState(), linkedin);
    expect(list.some((item) => item.target.kind === "mismatch")).toBe(false);
    const bio = list.find((item) => item.id === "gh-bio");
    expect(bio?.areas).toContain("consistency");
  });

  it("leaves LinkedIn out until the suggestions exist", () => {
    const list = pendingSuggestions(initialDemoState(), null);
    expect(list.some((item) => item.areas.includes("linkedin"))).toBe(false);
  });

  it("drops what is applied or skipped", () => {
    const state = initialDemoState();
    state.github = { "gh-bio": "applied", "gh-route-desc": "skipped" };
    const ids = pendingSuggestions(state, null).map((item) => item.id);
    expect(ids).not.toContain("gh-bio");
    expect(ids).not.toContain("gh-route-desc");
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
