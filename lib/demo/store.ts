"use client";

import { useSyncExternalStore } from "react";
import type { ConsistencyField } from "@/lib/core/consistency";
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

export type DemoState = {
  version: 1;
  onboarded: boolean;
  profile: Profile;
  sources: Record<
    "linkedin" | "github",
    Partial<Record<ConsistencyField, string>>
  >;
  github: Record<string, ChangeStatus>;
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
    version: 1,
    onboarded: false,
    profile: structuredClone(demoProfile),
    sources: structuredClone(demoSources),
    github: {},
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
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.version === 1) return parsed;
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

export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, current, () => SERVER_STATE);
}

/** A short unique id for new items. */
export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
