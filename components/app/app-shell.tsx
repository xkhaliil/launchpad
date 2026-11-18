"use client";

import {
  ChevronRight,
  ChevronsUpDown,
  FileText,
  House,
  LayoutGrid,
  ListChecks,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Send,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { type AppMetrics, appMetrics } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/store";
import { setUiPref, useUiPrefs } from "@/lib/demo/ui-prefs";
import { APP_NAME } from "@/lib/site";
import { CommandPalette } from "./command-palette";
import { findNav, NAV, NAV_GROUPS, type NavEntry, type NavValue } from "./nav";
import { ReviewProvider, useReview } from "./review";
import { initials } from "./ui";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/** "Cmd K" on Apple devices, "Ctrl K" elsewhere. */
function useShortcutLabel() {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K"),
    () => "Ctrl K",
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

/** The number shown next to a nav item. */
function ValueBadge({ value, active }: { value: NavValue; active: boolean }) {
  const look =
    value.tone === "attention"
      ? "grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-surface"
      : value.tone === "done"
        ? "text-xs font-medium text-success"
        : `text-xs ${active ? "text-ink/60" : "text-ink/40"}`;
  return (
    <span className={`shrink-0 tabular-nums ${look}`}>
      <span aria-hidden>{value.text}</span>
      <span className="sr-only">, {value.label}</span>
    </span>
  );
}

function Avatar({ name, size = "size-9" }: { name: string; size?: string }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-paper ${size}`}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar (desktop)                                                   */
/* ------------------------------------------------------------------ */

function SidebarItem({
  entry,
  active,
  collapsed,
  metrics,
}: {
  entry: NavEntry;
  active: boolean;
  collapsed: boolean;
  metrics: AppMetrics;
}) {
  const value = entry.value?.(metrics);
  return (
    <Link
      href={entry.href}
      aria-current={active ? "page" : undefined}
      aria-label={
        collapsed
          ? `${entry.label}${value ? `, ${value.label}` : ""}`
          : undefined
      }
      className={`group relative flex h-9 items-center gap-3 rounded-xl text-sm font-medium transition-colors ${focusRing} ${
        collapsed ? "mx-auto w-11 justify-center" : "px-2.5"
      } ${
        active
          ? "bg-surface text-ink shadow-[0_1px_2px_rgb(26_22_19/0.06),0_0_0_1px_var(--color-line)]"
          : "text-ink/65 hover:bg-ink/[0.045] hover:text-ink"
      }`}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-accent"
        />
      ) : null}
      <entry.icon
        aria-hidden
        strokeWidth={1.75}
        className={`size-4.5 shrink-0 transition-colors ${
          active ? "text-accent" : "text-ink/45 group-hover:text-ink/70"
        }`}
      />
      {collapsed ? (
        <>
          {value?.tone === "attention" ? (
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent ring-2 ring-sand"
            />
          ) : null}
          <span
            aria-hidden
            className="pointer-events-none absolute left-full z-50 ml-3 rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-paper opacity-0 shadow-lift transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {entry.label}
            {value ? (
              <span className="ml-1.5 text-paper/60">{value.text}</span>
            ) : null}
          </span>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate">{entry.label}</span>
          {value ? <ValueBadge value={value} active={active} /> : null}
        </>
      )}
    </Link>
  );
}

/** The person at the bottom of the sidebar, with a small menu. */
function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { profile, plan } = useDemo();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-ink/80 hover:bg-ink/5 hover:text-ink ${focusRing}`;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="user-menu"
        aria-label={collapsed ? `${profile.fullName}, account menu` : undefined}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-ink/[0.045] ${focusRing} ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <Avatar name={profile.fullName} />
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {profile.fullName}
              </span>
              <span className="block truncate text-xs text-ink-muted">
                {plan === "pro" ? "Pro" : "Free"} plan · {profile.email}
              </span>
            </span>
            <ChevronsUpDown
              aria-hidden
              className="size-4 shrink-0 text-ink/40"
            />
          </>
        )}
      </button>
      {open ? (
        <div
          id="user-menu"
          className={`absolute bottom-full z-50 mb-2 w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-float transition-[opacity,translate] duration-200 starting:translate-y-1 starting:opacity-0 ${
            collapsed ? "left-0" : "inset-x-0 w-auto"
          }`}
        >
          <p className="px-3 pt-2 pb-2.5 text-xs text-ink-muted">
            Signed in to the demo
          </p>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={item}
          >
            <Settings aria-hidden className="size-4" strokeWidth={1.75} />{" "}
            Settings
          </Link>
          {plan === "free" ? (
            <Link
              href="/settings#plan"
              onClick={() => setOpen(false)}
              className={item}
            >
              <Sparkles
                aria-hidden
                className="size-4 text-accent"
                strokeWidth={1.75}
              />{" "}
              Upgrade to Pro
            </Link>
          ) : null}
          <Link href="/" onClick={() => setOpen(false)} className={item}>
            <LogOut aria-hidden className="size-4" strokeWidth={1.75} /> Back to
            the website
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({
  metrics,
  onSearch,
}: {
  metrics: AppMetrics;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const { sidebarCollapsed: collapsed } = useUiPrefs();
  const shortcut = useShortcutLabel();
  const toggle = () => setUiPref("sidebarCollapsed", !collapsed);

  return (
    <aside
      className={`sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-line bg-sand/70 transition-[width] duration-300 lg:flex print:hidden ${EASE} ${
        collapsed ? "w-19" : "w-66"
      }`}
    >
      {/* Brand and collapse */}
      <div
        className={`flex h-16 shrink-0 items-center ${collapsed ? "justify-center" : "justify-between pr-2 pl-5"}`}
      >
        <Link
          href="/dashboard"
          aria-label={`${APP_NAME} dashboard`}
          className={`rounded-lg ${focusRing}`}
        >
          {collapsed ? (
            <span className="grid size-9 place-items-center rounded-xl bg-ink text-base font-medium text-paper">
              {APP_NAME[0]}
            </span>
          ) : (
            <span className="text-xl leading-none font-medium tracking-tight">
              {APP_NAME}
            </span>
          )}
        </Link>
        {collapsed ? null : (
          <button
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar"
            className={`grid size-9 place-items-center rounded-lg text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink ${focusRing}`}
          >
            <PanelLeftClose
              className="size-4.5"
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        )}
      </div>

      <div
        className={`flex min-h-0 flex-1 flex-col ${collapsed ? "px-3" : "px-3"}`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className={`mx-auto mb-2 grid size-11 place-items-center rounded-xl text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink ${focusRing}`}
          >
            <PanelLeftOpen
              className="size-4.5"
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSearch}
            className={`mb-3 flex h-9 w-full items-center gap-2.5 rounded-xl bg-surface/70 px-2.5 text-sm text-ink-muted ring-1 ring-line transition-colors hover:bg-surface hover:text-ink ${focusRing}`}
          >
            <Search className="size-4" aria-hidden />
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-sans text-[11px] text-ink/50">
              {shortcut}
            </kbd>
          </button>
        )}

        <nav
          aria-label="App"
          // Collapsed, the rail is short and must not scroll: a scroll area
          // would clip the tooltips that stick out to the right.
          className={`-mx-3 min-h-0 flex-1 px-3 pb-3 ${
            collapsed ? "overflow-visible" : "scrollbar-thin overflow-y-auto"
          }`}
        >
          {NAV_GROUPS.map((group, index) => (
            <div key={group.id} className={index > 0 ? "mt-5" : ""}>
              {collapsed ? (
                index > 0 ? (
                  <span
                    aria-hidden
                    className="mx-auto mb-3 block h-px w-8 bg-line"
                  />
                ) : null
              ) : group.label ? (
                <p className="mb-1.5 px-2.5 text-[11px] font-medium text-ink/40">
                  {group.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {NAV.filter((entry) => entry.group === group.id).map(
                  (entry) => (
                    <li key={entry.href}>
                      <SidebarItem
                        entry={entry}
                        active={isActive(pathname, entry.href)}
                        collapsed={collapsed}
                        metrics={metrics}
                      />
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line py-2">
          <UserMenu collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Top bar                                                             */
/* ------------------------------------------------------------------ */

/** Readiness as a small meter. Links to Home, where it is explained. */
function Readiness({ metrics }: { metrics: AppMetrics }) {
  const up = metrics.readinessDelta >= 0;
  return (
    <Link
      href="/dashboard"
      aria-label={`Readiness ${metrics.readiness} of 100, ${up ? "up" : "down"} ${Math.abs(metrics.readinessDelta)} since ${metrics.since}`}
      className={`hidden h-10 items-center gap-3 rounded-full bg-surface pr-3.5 pl-4 ring-1 ring-line transition-colors hover:ring-ink/25 md:flex ${focusRing}`}
    >
      <span className="text-xs text-ink-muted">Readiness</span>
      <span
        aria-hidden
        className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/8 xl:w-24"
      >
        <span
          className="block h-full rounded-full bg-accent transition-[width] duration-700"
          style={{ width: `${metrics.readiness}%` }}
        />
      </span>
      <span aria-hidden className="text-sm font-medium tabular-nums">
        {metrics.readiness}
        <span className="font-normal text-ink-muted">/100</span>
      </span>
      <span
        aria-hidden
        className={`text-xs tabular-nums ${up ? "text-success" : "text-danger"}`}
      >
        {up ? "+" : ""}
        {metrics.readinessDelta}
      </span>
    </Link>
  );
}

/** The app's main action: go through what it proposes. */
function ReviewButton() {
  const { open, count } = useReview();
  return (
    <button
      type="button"
      onClick={() => open()}
      className={`hidden h-10 items-center gap-2 rounded-full bg-ink pr-2 pl-3.5 text-sm font-medium text-paper transition-colors hover:bg-ink/85 lg:flex ${focusRing}`}
    >
      <ListChecks className="size-4 text-glow-1" aria-hidden />
      Review
      <span
        className={`grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-xs tabular-nums ${
          count > 0 ? "bg-accent text-surface" : "bg-white/10 text-paper/70"
        }`}
      >
        {count}
        <span className="sr-only"> suggestions</span>
      </span>
    </button>
  );
}

function TopBar({
  metrics,
  onSearch,
}: {
  metrics: AppMetrics;
  onSearch: () => void;
}) {
  const pathname = usePathname();
  const entry = findNav(pathname);
  const group = NAV_GROUPS.find((item) => item.id === entry?.group)?.label;
  const shortcut = useShortcutLabel();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md print:hidden">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className={`rounded-md text-xl leading-none font-medium tracking-tight lg:hidden ${focusRing}`}
        >
          {APP_NAME}
        </Link>

        {entry ? (
          <nav aria-label="Breadcrumb" className="hidden min-w-0 lg:block">
            <ol className="flex items-center gap-1.5 text-sm">
              {group ? (
                <>
                  <li className="text-ink-muted">{group}</li>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5 text-ink/30" />
                  </li>
                </>
              ) : null}
              <li className="truncate font-medium" aria-current="page">
                {entry.label}
              </li>
            </ol>
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <Readiness metrics={metrics} />
          <ReviewButton />

          <button
            type="button"
            onClick={onSearch}
            aria-label="Search screens"
            className={`hidden h-10 items-center gap-2 rounded-full bg-surface pr-2 pl-3.5 text-sm text-ink-muted ring-1 ring-line transition-colors hover:text-ink sm:flex ${focusRing}`}
          >
            <Search className="size-4" aria-hidden />
            <kbd className="hidden rounded-md bg-ink/5 px-1.5 py-0.5 font-sans text-[11px] text-ink/50 xl:inline">
              {shortcut}
            </kbd>
          </button>

          {/* Phones: search and the score, as compact buttons. */}
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search screens"
            className={`grid size-10 place-items-center rounded-full text-ink/70 hover:bg-ink/5 sm:hidden ${focusRing}`}
          >
            <Search className="size-4.5" aria-hidden />
          </button>
          <Link
            href="/dashboard"
            aria-label={`Readiness ${metrics.readiness} of 100`}
            className={`flex h-10 items-center rounded-full bg-surface px-3.5 text-sm font-medium tabular-nums ring-1 ring-line md:hidden ${focusRing}`}
          >
            {metrics.readiness}
            <span className="font-normal text-ink-muted">/100</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Phones: bottom tab bar and the "More" sheet                         */
/* ------------------------------------------------------------------ */

const TABS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/jobs", label: "Apply", icon: Send },
];

function BottomBar({
  moreOpen,
  onMore,
}: {
  moreOpen: boolean;
  onMore: () => void;
}) {
  const pathname = usePathname();
  const { open, count } = useReview();
  const inMore = !TABS.some((tab) => isActive(pathname, tab.href));

  const tabClass = (active: boolean) =>
    `relative flex h-full w-full flex-col items-center justify-center gap-1 text-[11px] transition-colors ${focusRing} ${
      active ? "font-medium text-ink" : "text-ink/50"
    }`;
  const indicator = (
    <span
      aria-hidden
      className="absolute top-0 h-0.5 w-8 rounded-b-full bg-accent"
    />
  );
  const tab = (item: (typeof TABS)[number]) => {
    const active = isActive(pathname, item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={tabClass(active)}
        >
          {active ? indicator : null}
          <item.icon
            aria-hidden
            strokeWidth={1.75}
            className={`size-5.5 ${active ? "text-accent" : ""}`}
          />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden print:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {tab(TABS[0])}
        {tab(TABS[1])}
        {/* The main action sits in the middle, within reach of a thumb. */}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={() => open()}
            className={`relative -mt-6 flex flex-col items-center gap-1 text-[11px] font-medium text-ink ${focusRing} rounded-2xl`}
          >
            <span className="grid size-13 place-items-center rounded-full bg-ink text-paper shadow-lift ring-4 ring-paper">
              <ListChecks className="size-5.5 text-glow-1" aria-hidden />
            </span>
            {count > 0 ? (
              <span className="absolute top-0 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-medium text-surface tabular-nums ring-2 ring-paper">
                {count}
              </span>
            ) : null}
            Review
            <span className="sr-only">, {count} suggestions</span>
          </button>
        </li>
        {tab(TABS[2])}
        <li>
          <button
            type="button"
            onClick={onMore}
            aria-expanded={moreOpen}
            aria-controls="more-sheet"
            className={tabClass(inMore || moreOpen)}
          >
            {inMore ? indicator : null}
            <LayoutGrid
              aria-hidden
              strokeWidth={1.75}
              className={`size-5.5 ${inMore || moreOpen ? "text-accent" : ""}`}
            />
            More
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MoreSheet({
  open,
  onClose,
  metrics,
}: {
  open: boolean;
  onClose: () => void;
  metrics: AppMetrics;
}) {
  const pathname = usePathname();
  const { profile, plan } = useDemo();
  if (!open) return null;
  const groups = [...NAV_GROUPS, { id: "Account" as const, label: "Account" }];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 starting:opacity-0"
      />
      <div
        id="more-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="All screens"
        className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[1.75rem] bg-paper pb-[env(safe-area-inset-bottom)] shadow-float transition-transform duration-400 ${EASE} starting:translate-y-full`}
        onKeyDown={(event) => event.key === "Escape" && onClose()}
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span
            aria-hidden
            className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/15"
          />
          <p className="mt-2 text-lg font-medium tracking-tight">All screens</p>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close"
            className={`mt-2 grid size-10 place-items-center rounded-full bg-ink/5 text-ink ${focusRing}`}
          >
            <X className="size-4.5" aria-hidden />
          </button>
        </div>

        <nav
          aria-label="All screens"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
        >
          {groups.map((group) => (
            <div key={group.id} className="mt-3">
              {group.label ? (
                <p className="mb-1 px-3 text-xs font-medium text-ink/40">
                  {group.label}
                </p>
              ) : null}
              <ul className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
                {NAV.filter((entry) => entry.group === group.id).map(
                  (entry) => {
                    const active = isActive(pathname, entry.href);
                    const value = entry.value?.(metrics);
                    return (
                      <li
                        key={entry.href}
                        className="border-b border-line last:border-b-0"
                      >
                        <Link
                          href={entry.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-13 items-center gap-3 px-4 text-[15px] ${focusRing} ${
                            active ? "bg-accent-soft font-medium" : ""
                          }`}
                        >
                          <entry.icon
                            aria-hidden
                            strokeWidth={1.75}
                            className={`size-5 ${active ? "text-accent" : "text-ink/50"}`}
                          />
                          <span className="flex-1">{entry.label}</span>
                          {value ? (
                            <ValueBadge value={value} active={active} />
                          ) : null}
                        </Link>
                      </li>
                    );
                  },
                )}
              </ul>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
            <Avatar name={profile.fullName} size="size-10" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {profile.fullName}
              </span>
              <span className="block truncate text-xs text-ink-muted">
                {plan === "pro" ? "Pro" : "Free"} plan · Demo data
              </span>
            </span>
            <Link
              href="/"
              onClick={onClose}
              className={`text-sm text-ink-muted ${focusRing}`}
            >
              Website
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The shell                                                           */
/* ------------------------------------------------------------------ */

/**
 * Layout for every app screen: a light sidebar (collapsible to icons) and a
 * top bar with readiness and the Review button on desktop; on phones a top
 * bar and a bottom tab bar with Review in the middle and a "More" sheet.
 * Ctrl/Cmd + K opens search anywhere.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const state = useDemo();
  const metrics = appMetrics(state);
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const openPalette = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setMoreOpen(false);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => {
    setPaletteOpen(false);
    opener.current?.focus?.();
  }, []);

  // Ctrl/Cmd + K toggles search from anywhere in the app.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (paletteOpen) closePalette();
        else openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, openPalette, closePalette]);

  // The page behind an open sheet or search does not scroll.
  const locked = paletteOpen || moreOpen;
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [locked]);

  // Next keeps pages mounted after navigating; close overlays on the way out.
  useEffect(() => {
    return () => {
      setMoreOpen(false);
      setPaletteOpen(false);
    };
  }, [pathname]);

  return (
    <ReviewProvider>
      <div className="flex min-h-dvh bg-paper print:block print:bg-white">
        <Sidebar metrics={metrics} onSearch={openPalette} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar metrics={metrics} onSearch={openPalette} />
          <main
            id="main"
            className="min-w-0 flex-1 px-4 pt-6 pb-32 sm:px-6 lg:px-10 lg:pt-10 lg:pb-20 print:p-0"
          >
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>

        <BottomBar
          moreOpen={moreOpen}
          onMore={() => setMoreOpen((value) => !value)}
        />
        <MoreSheet
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          metrics={metrics}
        />
        <CommandPalette
          open={paletteOpen}
          onClose={closePalette}
          metrics={metrics}
        />
      </div>
    </ReviewProvider>
  );
}
