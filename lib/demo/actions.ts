"use client";

import type { ConsistencyField } from "@/lib/core/consistency";
import type { LinkedinField } from "./data";
import { updateDemo, updateProfile } from "./store";

/*
 * Changes to the demo state that more than one place makes (a screen and the
 * review panel), kept here so both do exactly the same thing.
 */

export function setLinkedinDone(field: LinkedinField, done: boolean) {
  updateDemo((state) => {
    const list = done
      ? [...new Set([...state.linkedin.done, field])]
      : state.linkedin.done.filter((item) => item !== field);
    // Pasting the suggested headline makes LinkedIn match the profile.
    const sources =
      field === "headline" && done
        ? {
            ...state.sources,
            linkedin: {
              ...state.sources.linkedin,
              headline: state.profile.headline,
              location: state.profile.location,
            },
          }
        : state.sources;
    return { ...state, sources, linkedin: { ...state.linkedin, done: list } };
  });
}

/** Records that another platform now shows the profile's value. */
export function matchProfileValue(
  sourceId: "linkedin" | "github",
  field: ConsistencyField,
  value: string,
) {
  updateDemo((state) => ({
    ...state,
    sources: {
      ...state.sources,
      [sourceId]: { ...state.sources[sourceId], [field]: value },
    },
  }));
}

/** Replaces one CV bullet, wherever it is in the profile. */
export function replaceBullet(before: string, after: string) {
  const swap = (bullets: string[]) =>
    bullets.map((bullet) => (bullet === before ? after : bullet));
  updateProfile((profile) => ({
    ...profile,
    experiences: profile.experiences.map((item) => ({
      ...item,
      bullets: swap(item.bullets),
    })),
    projects: profile.projects.map((item) => ({
      ...item,
      bullets: swap(item.bullets),
    })),
  }));
}
