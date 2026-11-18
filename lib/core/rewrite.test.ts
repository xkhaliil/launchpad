import { describe, expect, it } from "vitest";
import { findPlaceholders } from "./cover-letter";
import {
  improveBullet,
  pastTense,
  RESULT_PLACEHOLDER,
  withActionVerb,
} from "./rewrite";

describe("pastTense", () => {
  it.each([
    ["grading", "graded"],
    ["planning", "planned"],
    ["debugging", "debugged"],
    ["deploying", "deployed"],
    ["applying", "applied"],
    ["writing", "wrote"],
    ["mentoring", "mentored"],
  ])("%s → %s", (gerund, past) => {
    expect(pastTense(gerund)).toBe(past);
  });

  it("ignores words that are not gerunds", () => {
    expect(pastTense("tests")).toBeNull();
    expect(pastTense("king")).toBeNull();
  });
});

describe("withActionVerb", () => {
  it("moves the verb to the front", () => {
    expect(withActionVerb("Responsible for grading assignments")).toBe(
      "Graded assignments",
    );
    expect(withActionVerb("Building a CLI for students")).toBe(
      "Built a CLI for students",
    );
  });

  it("returns null when there is no verb to use", () => {
    expect(withActionVerb("Team lead of the robotics club")).toBeNull();
  });
});

describe("improveBullet", () => {
  it("leaves strong bullets alone", () => {
    expect(improveBullet("Built a REST API that serves 40k lookups")).toBe(
      null,
    );
  });

  it("asks for a result instead of inventing one", () => {
    const text = improveBullet("Wrote integration tests for billing");
    expect(text).toBe(
      `Wrote integration tests for billing ${RESULT_PLACEHOLDER}`,
    );
    expect(findPlaceholders(text ?? "")).toHaveLength(1);
  });

  it("fixes the verb and asks for the result together", () => {
    expect(improveBullet("Responsible for grading assignments.")).toBe(
      `Graded assignments ${RESULT_PLACEHOLDER}`,
    );
  });
});
