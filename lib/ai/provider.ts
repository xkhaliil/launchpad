import type { Evidence, RepoDraft } from "@/lib/core/github/types";
import type { Profile } from "@/lib/core/types";

/*
 * The AI layer (plan.md, section 6.0), written against this interface so the
 * model provider can be swapped (Anthropic, Gemini, Groq, OpenRouter, Mistral
 * or a local model) without touching the screens.
 *
 * Rules every implementation must follow:
 * - Use only the facts passed in. Never invent employers, dates, numbers or
 *   features. Unknown details become placeholders such as "[ADD: company]".
 * - Never send student data to a provider whose terms allow training on it.
 *
 * Today only the mock provider exists (mock.ts). It builds every draft from
 * templates and the profile, so the UI works with no API key and no cost.
 */

export type LinkedinSuggestions = {
  headline: string;
  about: string;
  experience: { title: string; text: string }[];
  skills: string[];
  url: string;
};

export type JobAdDetails = {
  company: string;
  title: string;
};

export interface AiProvider {
  readonly name: string;
  /**
   * A description, topics and README for one repo, from its evidence only
   * (plan.md, section 6.1). A real provider sends REPO_SYSTEM_PROMPT and
   * buildRepoMessage() from lib/core/github/prompt.ts, then checks the answer
   * with validateDraft() and normaliseDraft().
   */
  draftRepo(evidence: Evidence, hint?: string): Promise<RepoDraft>;
  draftCoverLetter(input: {
    profile: Profile;
    company?: string;
    role?: string;
    keywords?: string[];
  }): Promise<string>;
  suggestLinkedin(profile: Profile): Promise<LinkedinSuggestions>;
  readJobAd(text: string): Promise<JobAdDetails>;
}
