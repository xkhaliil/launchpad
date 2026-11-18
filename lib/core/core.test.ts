import { describe, expect, it } from "vitest";
import { checkCv, hasResult, startsWithActionVerb } from "./ats";
import { findIssues, normalise } from "./consistency";
import {
  findCliches,
  findPlaceholders,
  paragraphCount,
  wordCount,
} from "./cover-letter";
import { evaluate } from "./evaluation";
import { extractKeywords, matchKeywords } from "./keywords";
import type { Profile } from "./types";

const profile: Profile = {
  fullName: "Ada Lovelace",
  headline: "Backend developer",
  summary: "x".repeat(200),
  location: "Berlin, Germany",
  email: "ada@example.com",
  phone: "+49 30 000000",
  links: { github: "github.com/ada" },
  targetRole: "Backend developer",
  experienceLevel: "graduate",
  experiences: [
    {
      id: "e1",
      company: "Northwind",
      title: "Intern",
      location: "Berlin",
      start: "2025-03",
      end: "2025-09",
      bullets: [
        "Built an API serving 40k lookups a day",
        "Cut report time by 75%",
      ],
    },
  ],
  projects: [],
  educations: [
    {
      id: "d1",
      school: "TU Berlin",
      degree: "BSc",
      field: "CS",
      start: "2022-10",
      end: null,
    },
  ],
  skills: ["Go", "Python", "SQL", "Docker", "Git"].map((name) => ({
    name,
    category: "language" as const,
  })),
  languages: [],
  certifications: [],
};

describe("checkCv", () => {
  it("scores a complete profile 100", () => {
    const report = checkCv(profile);
    expect(report.score).toBe(100);
    expect(report.checks.every((check) => check.passed)).toBe(true);
  });

  it("flags missing contact details with the fields named", () => {
    const report = checkCv({ ...profile, phone: "", location: " " });
    const contact = report.checks.find((check) => check.id === "contact");
    expect(contact?.passed).toBe(false);
    expect(contact?.fix).toBe("Add your phone, location to your profile.");
    expect(report.score).toBeLessThan(100);
  });

  it("flags bullets without a verb or a result", () => {
    const report = checkCv({
      ...profile,
      experiences: [
        {
          ...profile.experiences[0],
          bullets: ["Responsible for testing", "Wrote docs"],
        },
      ],
    });
    expect(report.checks.find((check) => check.id === "verbs")?.passed).toBe(
      false,
    );
    expect(report.checks.find((check) => check.id === "results")?.passed).toBe(
      false,
    );
  });

  it("flags dates in the wrong format or order", () => {
    const report = checkCv({
      ...profile,
      experiences: [
        { ...profile.experiences[0], start: "2025-09", end: "2025-03" },
      ],
    });
    expect(report.checks.find((check) => check.id === "dates")?.passed).toBe(
      false,
    );
  });

  it("recognises verbs and results", () => {
    expect(startsWithActionVerb("  Shipped a release")).toBe(true);
    expect(startsWithActionVerb("Team work on X")).toBe(false);
    expect(hasResult("Saved 3 hours")).toBe(true);
    expect(hasResult("Saved hours")).toBe(false);
  });
});

describe("keywords", () => {
  it("finds terms and aliases without matching inside other words", () => {
    expect(
      extractKeywords(
        "We use Golang, Postgres and k8s. PostgreSQL only, no MySQL.",
      ),
    ).toEqual(["Go", "PostgreSQL", "MySQL", "Kubernetes"]);
    expect(extractKeywords("Let's go to the cloud")).toEqual([]);
    expect(extractKeywords("Experience with C++ and C#")).toEqual([
      "C++",
      "C#",
    ]);
  });

  it("scores the share of keywords found", () => {
    expect(
      matchKeywords(["Go", "Docker", "AWS", "Kafka"], "Go and Docker"),
    ).toEqual({
      matched: ["Go", "Docker"],
      missing: ["AWS", "Kafka"],
      score: 50,
    });
    expect(matchKeywords([], "anything").score).toBe(0);
  });
});

describe("cover letter", () => {
  it("counts words and paragraphs", () => {
    expect(wordCount("  one two\nthree ")).toBe(3);
    expect(wordCount("")).toBe(0);
    expect(paragraphCount("a\n\nb\n\n\nc")).toBe(3);
  });

  it("finds clichés and placeholders", () => {
    const text =
      "I am writing to apply. I am a hard-working [ADD: company] fan.";
    expect(findCliches(text).map((cliche) => cliche.phrase)).toEqual([
      "I am writing to apply",
      "hard-working",
    ]);
    expect(findPlaceholders(text)).toEqual(["[ADD: company]"]);
  });
});

describe("consistency", () => {
  const base = {
    fullName: "Ada Lovelace",
    headline: "Full-stack developer",
    location: "Berlin, Germany",
    email: "ada@example.com",
  };

  it("treats common abbreviations and partial locations as the same", () => {
    expect(normalise("Full stack dev")).toBe("full-stack developer");
    expect(
      findIssues(base, [
        {
          id: "li",
          label: "LinkedIn",
          values: { headline: "fullstack dev", location: "Berlin" },
        },
      ]),
    ).toEqual([]);
  });

  it("flags real mismatches, names and emails as high", () => {
    const issues = findIssues(base, [
      {
        id: "gh",
        label: "GitHub",
        values: { fullName: "Ada L.", headline: "Data scientist" },
      },
    ]);
    expect(issues.map((issue) => [issue.field, issue.severity])).toEqual([
      ["fullName", "high"],
      ["headline", "medium"],
    ]);
  });
});

describe("evaluate", () => {
  it("turns ratios into points and orders fixes by points gained", () => {
    const result = evaluate([
      { id: "cv", label: "CV", ratio: 0.8, fix: "a", href: "/cv" },
      { id: "github", label: "GitHub", ratio: 0.5, fix: "b", href: "/github" },
      {
        id: "website",
        label: "Website",
        ratio: 1.4,
        fix: "c",
        href: "/website",
      },
    ]);
    expect(result.areas.map((area) => area.points)).toEqual([20, 10, 10]);
    expect(result.total).toBe(40);
    expect(result.topFixes.map((fix) => [fix.areaId, fix.gain])).toEqual([
      ["github", 10],
      ["cv", 5],
    ]);
  });
});
