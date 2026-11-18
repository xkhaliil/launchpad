import { hasResult } from "@/lib/core/ats";
import type { Evidence, RepoDraft } from "@/lib/core/github/types";
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

/* -------------------------------------------------- repos (GitHub) --- */

/** Dependencies that are worth naming as a topic, and what to call them. */
const DEP_TOPICS: [RegExp, string][] = [
  [/^react$/, "react"],
  [/^next$/, "nextjs"],
  [/^vue$/, "vue"],
  [/^vite$/, "vite"],
  [/^@supabase\/supabase-js$/, "supabase"],
  [/^express$/, "express"],
  [/^fastapi$/, "fastapi"],
  [/^flask$/, "flask"],
  [/^django$/, "django"],
  [/jackc\/pgx/, "postgresql"],
  [/^psycopg/, "postgresql"],
  [/go-chi\/chi/, "rest-api"],
  [/gin-gonic\/gin/, "gin"],
  [/^spring-boot/, "spring-boot"],
  [/^flutter$/, "flutter"],
  [/^pandas$/, "pandas"],
  [/^scikit-learn$/, "scikit-learn"],
  [/^pytest$/, "pytest"],
];

const UI_DEPS = /^(react|next|vue|svelte|flutter|@angular\/core)$/;
const ALGORITHM_FOLDERS =
  /^(sorting|graphs|trees|dynamic-programming|search)\//;

const sentence = (text: string) => {
  const trimmed = text.trim().replace(/\.?$/, ".");
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};
const title = (name: string) =>
  name.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * A repo draft built only from the evidence: the student's own project
 * description, the manifests, folder names and any existing README. Anything
 * else is left as a <!-- TODO --> and listed as unknown, as gitms does.
 */
export function draftRepoFromEvidence(
  evidence: Evidence,
  hint?: string,
): RepoDraft {
  const { repo, manifests, profileProject: project } = evidence;
  const languages = Object.entries(evidence.languages).sort(
    (a, b) => b[1] - a[1],
  );
  const primary = languages[0]?.[0] ?? null;
  const deps = manifests.flatMap((m) => m.dependencies);
  const folders = [
    ...new Set(
      evidence.tree
        .filter((path) => path.includes("/"))
        .map((path) => path.split("/")[0]),
    ),
  ];
  const usedFiles: string[] = [];
  const unknowns: string[] = [];

  // Topics: language, frameworks from the manifests, a few tree facts.
  const topics: string[] = [];
  const add = (topic: string) => {
    if (topic && !topics.includes(topic)) topics.push(topic);
  };
  if (primary) add(primary.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  for (const dep of deps) {
    for (const [pattern, topic] of DEP_TOPICS)
      if (pattern.test(dep)) add(topic);
  }
  if (evidence.tree.includes("Dockerfile")) add("docker");
  if (evidence.tree.some((path) => ALGORITHM_FOLDERS.test(path))) {
    add("algorithms");
    add("data-structures");
  }
  if (evidence.tree.some((path) => path.endsWith(".ipynb")))
    add("jupyter-notebook");

  // The description: the student's own words first, then the manifest.
  const stack = topics
    .filter((topic) => topic !== primary?.toLowerCase())
    .slice(0, 2);
  let description: string;
  let confidence: RepoDraft["confidence"];
  if (project) {
    const base = project.description.trim().replace(/\.$/, "");
    description = primary
      ? `${base}, written in ${primary}${stack.includes("postgresql") ? " with PostgreSQL" : stack.includes("supabase") ? " with Supabase" : ""}`
      : base;
    usedFiles.push(`your profile project "${project.name}"`);
  } else if (manifests.find((m) => m.description)?.description) {
    description = manifests.find((m) => m.description)?.description ?? "";
  } else if (evidence.tree.some((path) => ALGORITHM_FOLDERS.test(path))) {
    const groups = folders.filter((folder) =>
      ALGORITHM_FOLDERS.test(`${folder}/`),
    );
    description = `${primary ?? "Code"} solutions to algorithm exercises, grouped by topic: ${groups.join(", ")}`;
  } else {
    description = `${primary ?? "Code"} project with ${folders.slice(0, 3).join(", ") || "a few files"}`;
    unknowns.push("What the project is for: nothing in the code says it.");
  }

  // README sections, each only when the evidence supports it.
  const whatItDoes: string[] = [];
  if (hint?.trim()) whatItDoes.push(sentence(hint));
  if (project?.bullets.length) {
    whatItDoes.push(...project.bullets.map(sentence));
  }
  const existing = evidence.existingReadme?.text
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .join(" ")
    .trim();
  if (existing) {
    whatItDoes.push(sentence(existing));
    usedFiles.push(evidence.existingReadme?.path ?? "README");
  }
  if (whatItDoes.length === 0) {
    unknowns.push("What it does in detail: describe it in your own words.");
  }

  const notable = deps.filter((dep) => !/^@types\/|eslint|prettier/.test(dep));
  const start: string[] = [];
  for (const manifest of manifests) {
    usedFiles.push(manifest.file);
    if (manifest.ecosystem === "npm") {
      start.push("npm install");
      const script = ["dev", "start"].find((key) => manifest.scripts?.[key]);
      if (script) start.push(`npm run ${script}`);
    }
    if (manifest.ecosystem === "go") {
      start.push(
        evidence.tree.includes("main.go") ? "go run ." : "go run ./...",
      );
    }
    if (manifest.file === "requirements.txt") {
      start.push("pip install -r requirements.txt");
    }
  }
  if (evidence.tree.includes("docker-compose.yml")) {
    start.push("docker compose up");
  }
  usedFiles.push(...evidence.entrypoints.map((file) => file.path));
  if (start.length === 0) {
    unknowns.push("How to run it: no manifest says.");
  }

  const homepage = repo.homepage ? undefined : project?.liveUrl;
  const readme = [
    `# ${title(repo.name)}`,
    "",
    description,
    "",
    "## What it does",
    "",
    whatItDoes.length
      ? whatItDoes.join(" ")
      : "<!-- TODO: describe what it does -->",
    "",
    "## Tech stack",
    "",
    ...(notable.length
      ? notable.slice(0, 8).map((dep) => `- ${dep}`)
      : languages.slice(0, 3).map(([name]) => `- ${name}`)),
    "",
    ...(start.length
      ? ["## Getting started", "", "```bash", ...start, "```", ""]
      : ["## Getting started", "", "<!-- TODO: how to run it -->", ""]),
    ...(deps.some((dep) => UI_DEPS.test(dep))
      ? ["<!-- TODO: add a screenshot -->", ""]
      : []),
    ...(homepage || repo.homepage
      ? ["## Live demo", "", homepage ?? repo.homepage ?? "", ""]
      : []),
    "## License",
    "",
    repo.license ? repo.license : "No license file yet.",
  ].join("\n");

  confidence =
    project && manifests.length > 0
      ? "high"
      : manifests.length > 0 || evidence.entrypoints.length > 0
        ? "medium"
        : "low";
  if (unknowns.length > 1 && confidence === "high") confidence = "medium";

  return {
    description,
    topics: topics.slice(0, 6),
    readme,
    ...(homepage ? { homepage } : {}),
    confidence,
    reasoning: `Based on ${[...new Set(usedFiles)].slice(0, 6).join(", ") || "the file tree"}${hint?.trim() ? ", and your correction" : ""}.`,
    unknowns,
  };
}

export const mockProvider: AiProvider = {
  name: "Mock (no API key)",

  async draftRepo(evidence, hint) {
    await wait(700);
    return draftRepoFromEvidence(evidence, hint);
  },

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
