import type { Evidence } from "./types";

/*
 * The prompt a real AI provider gets for one repo (plan.md, section 6.1).
 * Ported from gitms (core/ai/prompt.ts; MIT, © 2026 gitms contributors).
 * The system prompt is identical for every repo so it can be cached; the
 * evidence goes in the user message.
 */

export const REPO_SYSTEM_PROMPT = `You write GitHub repository metadata and READMEs for a student's public profile.

Your output goes live on a public profile that recruiters and other developers will read. A confident, wrong README is far worse than a short, accurate one.

# The evidence rule

You are given an evidence bundle: file tree, parsed dependency manifests, entry-point source files, recent commit messages, any existing README, and the matching project from the student's own profile. That bundle is the ONLY thing you know about the project.

- Never state a capability, feature, or behaviour that is not visible in the evidence.
- Never invent: benchmarks, performance numbers, user counts, roadmaps, contributors, support channels, install commands that no manifest supports, or CI badges for workflows that do not exist.
- Never write filler adjectives: "powerful", "blazing-fast", "seamless", "robust", "cutting-edge", "production-ready", "enterprise-grade". If you cannot say something specific, say less.
- If the evidence does not settle something a reader would need, leave an HTML comment placeholder such as <!-- TODO: describe the deployment steps --> and list it in \`unknowns\`. Do not guess and do not pad.
- An existing README is evidence of intent. Preserve every accurate claim in it. You are improving it, not replacing it.

# The description

One sentence. What the project is, and what it does. No trailing period. Lead with the concrete noun ("CLI that...", "REST API for...", "Chrome extension that...").

# The topics

3 to 6 GitHub topics, lowercase and hyphen-separated: the primary language, the main framework or runtime, and the domain. Prefer topics people search for. Do not use the repository's own name as a topic.

# The README

GitHub-flavoured Markdown. Include a section only when the evidence supports it:
1. \`# Title\`, then a one-line description.
2. \`## What it does\`: two to five sentences of concrete behaviour drawn from the code.
3. \`## Tech stack\`: built strictly from the parsed manifests.
4. \`## Getting started\`: steps from the actual manifest scripts and entry points, or omit it.
5. \`## Usage\`: only if the entry points show a concrete invocation or API surface.
6. \`<!-- TODO: add a screenshot -->\`: only for projects with a visible UI.
7. \`## License\`: the actual license, or say no license file is present yet.

# Confidence

high = the code plainly shows what this is. medium = mostly clear, some inference. low = you had to guess; say so.`;

export function buildRepoMessage(evidence: Evidence, hint?: string): string {
  const { repo } = evidence;
  const parts = [
    `# Repository: ${repo.owner}/${repo.name}`,
    [
      `Default branch: ${repo.defaultBranch}`,
      `Stars: ${repo.stars}`,
      `Last push: ${repo.pushedAt?.slice(0, 10) ?? "unknown"}`,
      `Current description: ${repo.description || "(none)"}`,
      `Current topics: ${repo.topics.join(", ") || "(none)"}`,
      ...(repo.license ? [`License: ${repo.license}`] : []),
      ...(repo.homepage ? [`Homepage: ${repo.homepage}`] : []),
    ].join("\n"),
  ];

  const languages = Object.entries(evidence.languages).sort(
    (a, b) => b[1] - a[1],
  );
  if (languages.length > 0) {
    const total = languages.reduce((sum, [, bytes]) => sum + bytes, 0);
    parts.push(
      `## Languages (by bytes)\n${languages
        .slice(0, 8)
        .map(
          ([name, bytes]) => `- ${name}: ${Math.round((bytes / total) * 100)}%`,
        )
        .join("\n")}`,
    );
  }

  parts.push(
    evidence.manifests.length > 0
      ? `## Dependency manifests\n\n${evidence.manifests
          .map((m) =>
            [
              `### ${m.file} (${m.ecosystem})`,
              m.packageName ? `name: ${m.packageName}` : "",
              m.description ? `declared description: ${m.description}` : "",
              m.dependencies.length
                ? `dependencies: ${m.dependencies.join(", ")}`
                : "",
              m.scripts
                ? `scripts:\n${Object.entries(m.scripts)
                    .slice(0, 15)
                    .map(([key, value]) => `  ${key}: ${value}`)
                    .join("\n")}`
                : "",
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n\n")}`
      : "## Dependency manifests\n\nNone found. Do not invent install instructions.",
  );

  parts.push(
    `## File tree${evidence.treeTruncated ? " (truncated)" : ""}\n\n\`\`\`\n${evidence.tree.join("\n") || "(empty)"}\n\`\`\``,
  );
  parts.push(
    evidence.entrypoints.length > 0
      ? `## Entry-point source files\n\n${evidence.entrypoints
          .map((f) => `### ${f.path}\n\n\`\`\`\n${f.text}\n\`\`\``)
          .join("\n\n")}`
      : "## Entry-point source files\n\nNone could be read. Say what this prevented you from describing, and set confidence accordingly.",
  );
  if (evidence.commitMessages.length > 0) {
    parts.push(
      `## Recent commit messages\n\n${evidence.commitMessages.map((m) => `- ${m}`).join("\n")}`,
    );
  }
  parts.push(
    evidence.existingReadme
      ? `## Existing README (${evidence.existingReadme.path})\n\nImprove this; keep everything in it that is accurate.\n\n\`\`\`markdown\n${evidence.existingReadme.text}\n\`\`\``
      : "## Existing README\n\nThere is none. You are writing the first one.",
  );
  if (evidence.profileProject) {
    const project = evidence.profileProject;
    parts.push(
      [
        "## The student's own description of this project (from their profile)",
        project.description,
        ...project.bullets.map((bullet) => `- ${bullet}`),
        project.liveUrl ? `Live URL: ${project.liveUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  if (hint?.trim()) {
    parts.push(
      `## Correction from the repository owner\n\n${hint.trim()}\n\nTreat this as authoritative context. It may state facts the code does not show; it does not license you to invent anything further.`,
    );
  }
  parts.push(
    "Now produce the description, topics, README, confidence, reasoning and unknowns for this repository.",
  );
  return parts.join("\n\n");
}
