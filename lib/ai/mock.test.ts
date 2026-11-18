import { describe, expect, it, vi } from "vitest";
import { demoJobAds, demoProfile } from "@/lib/demo/data";
import { mockProvider } from "./mock";

vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 1000 });

describe("mock AI provider", () => {
  it("leaves placeholders instead of inventing a company", async () => {
    const letter = await mockProvider.draftCoverLetter({
      profile: demoProfile,
    });
    expect(letter).toContain("[ADD: company]");
    expect(letter).toContain("Northwind Logistics");
    expect(letter).toContain(demoProfile.fullName);
  });

  it("only mentions job-ad keywords the profile actually has", async () => {
    const letter = await mockProvider.draftCoverLetter({
      profile: demoProfile,
      company: "Helio Payments",
      keywords: ["Go", "Kubernetes", "PostgreSQL"],
    });
    expect(letter).toContain("Go, PostgreSQL");
    expect(letter).not.toContain("Kubernetes");
  });

  it("reads company and title from a job ad", async () => {
    expect(await mockProvider.readJobAd(demoJobAds[0].text)).toEqual({
      company: "Helio Payments",
      title: "Junior Backend Engineer",
    });
    expect(await mockProvider.readJobAd("We need someone.")).toEqual({
      company: "[ADD: company]",
      title: "[ADD: role]",
    });
  });

  it("builds LinkedIn suggestions from profile facts", async () => {
    const suggestions = await mockProvider.suggestLinkedin(demoProfile);
    expect(suggestions.headline).toBe(
      "Backend developer | Go · Python · TypeScript | Berlin",
    );
    expect(suggestions.url).toBe("linkedin.com/in/ada-lovelace");
    expect(suggestions.skills).toHaveLength(5);
    expect(suggestions.about).toContain(
      "Most recently I was software engineering intern at Northwind Logistics, where I built a REST API in Go that serves 40k shipment lookups a day.",
    );
  });
});
