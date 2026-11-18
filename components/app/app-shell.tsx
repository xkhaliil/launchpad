"use client";

import {
  ChevronRight,
  ChevronsUpDown,
  FileText,
  Gauge,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
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
import { findNav, NAV, type NavEntry, type NavValue } from "./nav";
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
        className={`size-[18px] shrink-0 transition-colors ${
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
  const { plan } = useDemo();
  const shortcut = useShortcutLabel();
  const groups = ["Overview", "Build"] as const;
  const toggle = () => setUiPref("sidebarCollapsed", !collapsed);

  return (
    <aside
      className={`sticky top-0 z-40 hidden h-dvh shrink-0 flex-col border-r border-line bg-sand/70 transition-[width] duration-300 lg:flex print:hidden ${EASE} ${
        collapsed ? "w-[4.75rem]" : "w-[16.5rem]"
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
              className="size-[18px]"
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
              className="size-[18px]"
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
            collapsed
              ? "overflow-visible"
              : "[scrollbar-width:thin] overflow-y-auto"
          }`}
        >
          {groups.map((group, index) => (
            <div key={group} className={index > 0 ? "mt-5" : ""}>
              {collapsed ? (
                index > 0 ? (
                  <span
                    aria-hidden
                    className="mx-auto mb-3 block h-px w-8 bg-line"
                  />
                ) : null
              ) : (
                <p className="mb-1.5 px-2.5 text-[11px] font-medium text-ink/40">
                  {group}
                </p>
              )}
              <ul className="space-y-0.5">
                {NAV.filter((entry) => entry.group === group).map((entry) => (
                  <li key={entry.href}>
                    <SidebarItem
                      entry={entry}
                      active={isActive(pathname, entry.href)}
                      collapsed={collapsed}
                      metrics={metrics}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* A single dark accent in the sidebar: the plan. */}
        {!collapsed && plan === "free" ? (
          <Link
            href="/settings"
            className={`group relative isolate mb-2 block overflow-clip rounded-2xl bg-ink p-4 text-paper [@media(max-height:820px)]:hidden ${focusRing}`}
          >
            <span
              aria-hidden
              className="absolute -top-16 -right-10 -z-10 size-40 bg-radial-[closest-side] from-accent/50 to-transparent"
            />
            <span className="block text-xs text-glow-1">Free plan</span>
            <span className="mt-1 block text-sm leading-snug font-medium">
              Tailor every application with Pro
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-paper/70 group-hover:text-paper">
              See plans <ChevronRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        ) : null}

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

function Metric({
  href,
  label,
  children,
  className = "",
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 items-center gap-2 px-3.5 whitespace-nowrap transition-colors first:rounded-l-full last:rounded-r-full hover:bg-ink/[0.035] ${focusRing} ${className}`}
    >
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-sm font-medium tabular-nums">{children}</span>
    </Link>
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
  const shortcut = useShortcutLabel();
  const up = metrics.readinessDelta >= 0;
  const Trend = up ? TrendingUp : TrendingDown;

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
              <li className="text-ink-muted">{entry.group}</li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-ink/30" />
              </li>
              <li className="truncate font-medium" aria-current="page">
                {entry.label}
              </li>
            </ol>
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {/* Live numbers, each linking to where it comes from. */}
          <div className="hidden items-center divide-x divide-line rounded-full bg-surface ring-1 ring-line md:flex">
            <Metric href="/evaluation" label="Readiness">
              {metrics.readiness}
              <span
                className={`ml-1.5 inline-flex items-center gap-0.5 text-xs ${up ? "text-success" : "text-danger"}`}
                title={`Since ${metrics.since}`}
              >
                <Trend className="size-3.5" aria-hidden />
                {up ? "+" : ""}
                {metrics.readinessDelta}
                <span className="sr-only"> since {metrics.since}</span>
              </span>
            </Metric>
            <Metric href="/cv" label="ATS">
              {metrics.ats}
            </Metric>
            <Metric
              href="/jobs"
              label="Applications"
              className="hidden xl:flex"
            >
              {metrics.jobs}
            </Metric>
            <Metric href="/github" label="To review" className="hidden xl:flex">
              <span className="inline-flex items-center gap-1.5">
                {metrics.toReview > 0 ? (
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-accent"
                  />
                ) : null}
                {metrics.toReview}
              </span>
            </Metric>
            <Metric
              href="/documents"
              label="Documents"
              className="hidden 2xl:flex"
            >
              {metrics.docsUploaded}/{metrics.docsRequired}
            </Metric>
          </div>

          <button
            type="button"
            onClick={onSearch}
            aria-label="Search screens"
            className={`hidden h-10 items-center gap-2 rounded-full bg-surface pr-2 pl-3.5 text-sm text-ink-muted ring-1 ring-line transition-colors hover:text-ink sm:flex lg:hidden xl:flex ${focusRing}`}
          >
            <Search className="size-4" aria-hidden />
            <kbd className="rounded-md bg-ink/5 px-1.5 py-0.5 font-sans text-[11px] text-ink/50">
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
            <Search className="size-[18px]" aria-hidden />
          </button>
          <Link
            href="/evaluation"
            aria-label={`Readiness ${metrics.readiness} of 100`}
            className={`flex h-10 items-center gap-1.5 rounded-full bg-ink pr-3.5 pl-3 text-sm font-medium text-paper tabular-nums md:hidden ${focusRing}`}
          >
            <Gauge className="size-4 text-glow-1" aria-hidden />
            {metrics.readiness}
            <span className="text-paper/50">/100</span>
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
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/cv", label: "CV", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: Target },
  { href: "/evaluation", label: "Score", icon: Gauge },
];

function BottomBar({
  metrics,
  moreOpen,
  onMore,
}: {
  metrics: AppMetrics;
  moreOpen: boolean;
  onMore: () => void;
}) {
  const pathname = usePathname();
  const inMore = !TABS.some((tab) => isActive(pathname, tab.href));
  const waiting = metrics.toReview + metrics.mismatches;
  const badges: Record<string, number | undefined> = { "/jobs": metrics.jobs };

  const tabClass = (active: boolean) =>
    `relative flex h-full flex-col items-center justify-center gap-1 text-[11px] transition-colors ${focusRing} ${
      active ? "font-medium text-ink" : "text-ink/50"
    }`;
  const indicator = (
    <span
      aria-hidden
      className="absolute top-0 h-0.5 w-8 rounded-b-full bg-accent"
    />
  );

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden print:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          const badge = badges[tab.href];
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={tabClass(active)}
              >
                {active ? indicator : null}
                <span className="relative">
                  <tab.icon
                    aria-hidden
                    strokeWidth={1.75}
                    className={`size-[22px] ${active ? "text-accent" : ""}`}
                  />
                  {badge ? (
                    <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-medium text-paper tabular-nums">
                      {badge}
                      <span className="sr-only"> saved</span>
                    </span>
                  ) : null}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onMore}
            aria-expanded={moreOpen}
            aria-controls="more-sheet"
            className={`w-full ${tabClass(inMore || moreOpen)}`}
          >
            {inMore ? indicator : null}
            <span className="relative">
              <LayoutGrid
                aria-hidden
                strokeWidth={1.75}
                className={`size-[22px] ${inMore || moreOpen ? "text-accent" : ""}`}
              />
              {waiting > 0 ? (
                <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-medium text-surface tabular-nums">
                  {waiting}
                  <span className="sr-only"> things need your attention</span>
                </span>
              ) : null}
            </span>
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
            <X className="size-[18px]" aria-hidden />
          </button>
        </div>

        <nav
          aria-label="All screens"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
        >
          {(["Overview", "Build", "Account"] as const).map((group) => (
            <div key={group} className="mt-3">
              <p className="mb-1 px-3 text-xs font-medium text-ink/40">
                {group}
              </p>
              <ul className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
                {NAV.filter((entry) => entry.group === group).map((entry) => {
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
                })}
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
 * top bar with live numbers on desktop; on phones a top bar and a bottom tab
 * bar with a "More" sheet. Ctrl/Cmd + K opens search anywhere.
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
    <div className="flex min-h-dvh bg-paper print:block print:bg-white">
      <Sidebar metrics={metrics} onSearch={openPalette} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar metrics={metrics} onSearch={openPalette} />
        <main
          id="main"
          className="min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-6 lg:pb-16 print:p-0"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <BottomBar
        metrics={metrics}
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
  );
}
