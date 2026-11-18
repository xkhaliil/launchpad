"use client";

import { useSyncExternalStore } from "react";

/*
 * Interface preferences kept in this browser (not app data): for now only
 * whether the sidebar is collapsed to an icon rail.
 */

type UiPrefs = { sidebarCollapsed: boolean };

const KEY = "launchpad-ui";
const DEFAULTS: UiPrefs = { sidebarCollapsed: false };

let prefs: UiPrefs | null = null;
const listeners = new Set<() => void>();

function current(): UiPrefs {
  if (prefs) return prefs;
  try {
    const raw = window.localStorage.getItem(KEY);
    prefs = raw
      ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<UiPrefs>) }
      : DEFAULTS;
  } catch {
    prefs = DEFAULTS;
  }
  return prefs;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setUiPref<K extends keyof UiPrefs>(key: K, value: UiPrefs[K]) {
  prefs = { ...current(), [key]: value };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
  for (const listener of listeners) listener();
}

export function useUiPrefs(): UiPrefs {
  return useSyncExternalStore(subscribe, current, () => DEFAULTS);
}
