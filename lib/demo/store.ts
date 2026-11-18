"use client";

import { useSyncExternalStore } from "react";
import type { ConsistencyField } from "@/lib/core/consistency";
import {
  DEFAULT_SCAN_SETTINGS,
  type PlannedCall,
  type RepoProposal,
  type ScanSettings,
} from "@/lib/core/github/types";
import type { Profile } from "@/lib/core/types";
import {
  ACCENT_COLOURS,
  type DocType,
  demoJobAds,
  demoProfile,
  demoSources,
  initialCoverLetter,
  type JobAd,
  type LinkedinField,
  type WebsiteTemplate,
} from "./data";

/*
 * The demo's state, kept in this browser (localStorage) so edits survive a
 * reload. It stands in for the database until Supabase is connected; nothing
 * here is sent anywhere. Screens read it with `useDemo()` and change it with
 * `updateDemo()`.
 */

export type ChangeStatus = "proposed" | "applied" | "skipped";

/** A repo's description, topics, README and homepage at one moment. */
export type RepoFields = {
  description: string | null;
  topics: string[];
  readme: string | null;
  homepage: string | null;
};

/** One dry run or real apply, for the history list. */
export type ApplyRun = {
  at: string;
  dryRun: boolean;
  repos: string[];
  calls: PlannedCall[];
};

/** The GitHub module (plan.md, section 6.1), as gitms keeps it. */
export type DemoGithub = {
  /** null until the first scan. */
  scannedAt: string | null;
  settings: ScanSettings;
  proposals: Record<string, RepoProposal>;
  /** What GitHub shows now for repos changed in the demo. */
  applied: Record<string, RepoFields>;
  /** What was there before each apply, for Undo. */
  backups: Record<string, RepoFields>;
  /** The suggested profile bio (PATCH /user). */
  bio: ChangeStatus;
  /** Most recent first. */
  runs: ApplyRun[];
};

export function initialGithub(): DemoGithub {
  return {
    scannedAt: null,
    settings: { ...DEFAULT_SCAN_SETTINGS },
    proposals: {},
    applied: {},
    backups: {},
    bio: "proposed",
    runs: [],
  };
}

export type DemoState = {
  version: 2;
  onboarded: boolean;
  profile: Profile;
  sources: Record<
    "linkedin" | "github",
    Partial<Record<ConsistencyField, string>>
  >;
  github: DemoGithub;
  linkedin: { done: LinkedinField[]; banner: number; colour: string };
  coverLetter: string;
  jobAds: JobAd[];
  website: {
    template: WebsiteTemplate;
    colour: string;
    subdomain: string;
    published: boolean;
  };
  documents: Partial<Record<DocType, string>>;
  nonEu: boolean;
  plan: "free" | "pro";
};

const KEY = "launchpad-demo";

export function initialDemoState(): DemoState {
  return {
    version: 2,
    onboarded: false,
    profile: structuredClone(demoProfile),
    sources: structuredClone(demoSources),
    github: initialGithub(),
    linkedin: { done: ["skills"], banner: 0, colour: ACCENT_COLOURS[0] },
    coverLetter: initialCoverLetter,
    jobAds: structuredClone(demoJobAds),
    website: {
      template: "minimal",
      colour: ACCENT_COLOURS[0],
      subdomain: "ada-lovelace",
      published: false,
    },
    documents: {
      degree: "Enrolment_TU_Berlin.pdf",
      transcript: "transcript-2026.pdf",
    },
    nonEu: false,
    plan: "free",
  };
}

/** Used for the server render and the first client render, so they match. */
const SERVER_STATE = initialDemoState();

let state: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as
        DemoState | (Omit<DemoState, "version" | "github"> & { version: 1 });
      if (parsed?.version === 2) return parsed;
      // Version 1 kept GitHub as a list of fixed changes; start that part over.
      if (parsed?.version === 1) {
        return { ...parsed, version: 2, github: initialGithub() };
      }
    }
  } catch {
    // Storage blocked or corrupt: start from the demo data.
  }
  return initialDemoState();
}

function current(): DemoState {
  state ??= load();
  return state;
}

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep several open tabs in step.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    state = load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function updateDemo(change: (draft: DemoState) => DemoState) {
  state = change(current());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the change still applies for this visit.
  }
  emit();
}

export function updateProfile(change: (profile: Profile) => Profile) {
  updateDemo((draft) => ({ ...draft, profile: change(draft.profile) }));
}

export function resetDemo() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Nothing stored.
  }
  state = initialDemoState();
  emit();
}

/** The latest state, for async work that must not use a stale render. */
export function getDemo(): DemoState {
  return current();
}

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, current, () => SERVER_STATE);
}

/** A short unique id for new items. */
export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
