/**
 * The demo's "now": the real time in the browser. While Next pre-renders a
 * page on the server the demo state is always empty (nothing scanned or
 * dated is shown), so a fixed date is used there instead of reading the
 * clock, which would make every app page dynamic.
 */
const PRERENDER_NOW = Date.parse("2026-11-18T00:00:00Z");

export function demoNow(): number {
  return typeof window === "undefined" ? PRERENDER_NOW : Date.now();
}
