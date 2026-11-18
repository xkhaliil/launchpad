import { hasResult } from "@/lib/core/ats";
import type { Profile } from "@/lib/core/types";
import type { AiProvider, JobAdDetails, LinkedinSuggestions } from "./provider";

/**
 * Mock AI provider: deterministic templates over the profile. It never adds
 * a fact that is not in its input; anything missing becomes a placeholder.
 * A short delay imitates a real call so loading states can be seen.
 */

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const lowerFirst = (text: string) =>
  text.charAt(0).toLowerCase() + text.slice(1);

/** The bullets that carry a measurable result, best evidence first. */
function strongestBullets(profile: Profile, count: number): string[] {
  return [
    ...profile.experiences.flatMap((item) =>
      item.bullets
        .filter(hasResult)
        .map((bullet) => ({ bullet, where: item.company })),
    ),
    ...profile.projects.flatMap((item) =>
      item.bullets
        .filter(hasResult)
        .map((bullet) => ({ bullet, where: item.name })),
    ),
  ]
    .slice(0, count)
    .map(
      ({ bullet, where }) =>
        `At ${where} I ${lowerFirst(bullet).replace(/\.$/, "")}.`,
    );
}

export const mockProvider: AiProvider = {
  name: "Mock (no API key)",

  async draftCoverLetter({ profile, company, role, keywords = [] }) {
    await wait(900);
    const target = role ?? profile.targetRole;
    const where = company ?? "[ADD: company]";
    const skills = profile.skills.map((skill) => skill.name);
    const shared = keywords.filter((keyword) => skills.includes(keyword));
    const evidence = strongestBullets(profile, 2).join(" ");
    const education = profile.educations[0];
    const studies = education
      ? `${education.degree} ${education.field} at ${education.school}`
      : "[ADD: your studies]";

    return [
      `Dear hiring team at ${where},`,
      `I would like to join ${where} as a ${target.toLowerCase()}. [ADD: one specific reason this team or product interests you.]`,
      `${evidence || "[ADD: one project or experience with a measurable result.]"} ${
        shared.length > 0
          ? `The role asks for ${shared.join(", ")}, which I use day to day.`
          : `I work mainly with ${skills.slice(0, 3).join(", ")}.`
      }`,
      `I am finishing my ${studies} and can start ${education?.end ? `after ${education.end}` : "[ADD: start date]"}. I would be glad to talk about how I can help.`,
      `Kind regards,\n${profile.fullName}`,
    ].join("\n\n");
  },

  async suggestLinkedin(profile): Promise<LinkedinSuggestions> {
    await wait(700);
    const skills = profile.skills.map((skill) => skill.name);
    const latest = profile.experiences[0];
    const education = profile.educations[0];
    const handle = profile.fullName.toLowerCase().trim().replace(/\s+/g, "-");

    return {
      headline: `${profile.headline} | ${skills.slice(0, 3).join(" · ")} | ${profile.location.split(",")[0]}`,
      about: [
        profile.summary,
        latest
          ? `Most recently I was ${latest.title.toLowerCase()} at ${latest.company}, where I ${lowerFirst(latest.bullets.find(hasResult) ?? latest.bullets[0] ?? "").replace(/\.$/, "")}.`
          : "",
        education ? `I study ${education.field} at ${education.school}.` : "",
        `Skills: ${skills.join(", ")}.`,
        `Looking for: ${profile.targetRole.toLowerCase()} roles. [ADD: preferred locations or remote]`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      experience: profile.experiences.map((item) => ({
        title: `${item.title}, ${item.company}`,
        text: item.bullets.map((bullet) => `• ${bullet}`).join("\n"),
      })),
      skills: skills.slice(0, 5),
      url: `linkedin.com/in/${handle}`,
    };
  },

  async readJobAd(text): Promise<JobAdDetails> {
    await wait(600);
    // "<Company> is hiring a <Title> …" or "<Company> is looking for a <title> …"
    const match = text.match(
      /^\s*([A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*)*)\s+is\s+(?:hiring|looking for)\s+an?\s+([^.,]+?)(?:\s+(?:in|to|for|who)\b|[.,])/,
    );
    return {
      company: match?.[1] ?? "[ADD: company]",
      title: match?.[2]
        ? match[2].replace(/\b\w/g, (c) => c.toUpperCase())
        : "[ADD: role]",
    };
  },
};

/** The provider the app uses. Swap this when a real provider is connected. */
export const ai: AiProvider = mockProvider;
