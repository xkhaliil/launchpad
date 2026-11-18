import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { CountUp } from "./motion";

/* Building blocks shared by every app screen. Same tokens as the landing page. */

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const buttonBase = `inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;

export const btn = {
  primary: `${buttonBase} h-10 bg-ink px-4 text-sm text-paper hover:bg-ink/85`,
  accent: `${buttonBase} h-10 bg-accent px-4 text-sm text-surface hover:bg-accent-strong`,
  secondary: `${buttonBase} h-10 border border-ink/15 bg-surface px-4 text-sm text-ink hover:border-ink/35`,
  ghost: `${buttonBase} h-10 px-3 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink`,
  icon: `${buttonBase} size-10 text-ink-muted hover:bg-ink/5 hover:text-ink`,
};

/** Buttons for dark surfaces (the screen header, dark tiles). */
export const btnDark = {
  primary: `${buttonBase} h-10 bg-paper px-4 text-sm text-ink hover:bg-paper/85`,
  accent: `${buttonBase} h-10 bg-accent px-4 text-sm text-surface hover:bg-accent-strong`,
  secondary: `${buttonBase} h-10 px-4 text-sm text-paper ring-1 ring-white/20 hover:bg-white/10`,
};

export type Surface = "white" | "sand" | "ink" | "accent";

const surfaces: Record<Surface, string> = {
  white: "border border-line bg-surface",
  sand: "overflow-clip bg-sand",
  ink: "bg-ink text-paper",
  accent: "overflow-clip bg-accent text-surface",
};

const paddings = {
  default: "p-6 sm:p-7",
  tight: "p-3",
  none: "",
};

/**
 * A tile of a screen. Surfaces vary on purpose (white, textured sand, dark,
 * textured orange). Inside a `ScreenMotion`, tiles arrive one after another.
 */
export function Card({
  children,
  className = "",
  surface = "white",
  pad = "default",
  ...rest
}: ComponentProps<"div"> & { surface?: Surface; pad?: keyof typeof paddings }) {
  return (
    <div
      data-motion="tile"
      data-motion-hide
      className={`relative isolate rounded-[1.75rem] ${surfaces[surface]} ${paddings[pad]} ${className}`}
      {...rest}
    >
      {surface === "sand" || surface === "accent" ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-texture"
        />
      ) : null}
      {children}
    </div>
  );
}

/**
 * The header of every app screen: a dark sheet with the title, what the
 * screen is for, its main actions and its key number, which counts up.
 */
export function ScreenHero({
  title,
  description,
  actions,
  stat,
  statSuffix,
  statLabel,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** A number counts up; text is shown as is. */
  stat?: number | string;
  statSuffix?: string;
  statLabel?: ReactNode;
  /** Shown under the header row, full width (a progress bar, for example). */
  children?: ReactNode;
}) {
  const big =
    "text-7xl leading-[0.85] font-medium tracking-[-0.05em] tabular-nums sm:text-8xl";
  return (
    <section
      data-motion="tile"
      data-motion-hide
      className="relative isolate overflow-clip rounded-[2rem] bg-ink p-6 text-paper sm:p-9 print:hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -right-40 size-152 bg-radial-[closest-side] from-accent/40 to-transparent" />
        <div className="absolute -bottom-56 -left-32 size-120 bg-radial-[closest-side] from-glow-3/10 to-transparent" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="min-w-0">
          <h1 className="text-4xl leading-[1.05] font-medium tracking-tight sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-xl text-pretty text-paper/70 sm:text-lg sm:leading-7">
              {description}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-6 flex flex-wrap gap-2">{actions}</div>
          ) : null}
        </div>
        {stat !== undefined ? (
          <div className="md:text-right">
            <p className="flex items-end gap-2 md:justify-end">
              {typeof stat === "number" ? (
                <CountUp value={stat} className={big} />
              ) : (
                <span className={big}>{stat}</span>
              )}
              {statSuffix ? (
                <span className="mb-1 text-xl text-paper/50">{statSuffix}</span>
              ) : null}
            </p>
            {statLabel ? (
              <p className="mt-3 text-sm text-paper/60">{statLabel}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}

/** A tile's title row with a link on the right. */
export function TileTitle({
  children,
  href,
  action = "Open",
  tone = "light",
}: {
  children: ReactNode;
  href: string;
  action?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-medium tracking-tight">{children}</h2>
      <Link
        href={href}
        className={`group inline-flex min-h-9 items-center gap-1 rounded-full pr-1 pl-3 text-sm transition-colors ${
          tone === "dark"
            ? "text-current/70 hover:bg-white/10 hover:text-current"
            : "text-ink-muted hover:bg-ink/5 hover:text-ink"
        }`}
      >
        {action}
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-medium tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export type Tone =
  "neutral" | "success" | "warning" | "danger" | "accent" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-paper text-ink-muted ring-1 ring-line",
  success: "bg-success-soft text-success",
  warning: "bg-accent-soft text-accent-strong",
  danger: "bg-danger/10 text-danger",
  accent: "bg-accent text-surface",
  dark: "bg-ink text-paper",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** A score from 0 to 100 as a ring with the number inside. */
export function ScoreRing({
  value,
  size = 128,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 36 36"
        className="absolute inset-0 -rotate-90"
        aria-hidden
      >
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          strokeWidth="3"
          className="stroke-accent-soft"
        />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${Math.max(0, Math.min(100, value))} 100`}
          className="stroke-accent transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <p className="relative text-center leading-none">
        <span
          className="block font-medium tracking-tight tabular-nums"
          style={{ fontSize: size * 0.28 }}
        >
          {value}
        </span>
        {label ? (
          <span className="mt-1 block text-xs text-ink-muted">{label}</span>
        ) : null}
      </p>
    </div>
  );
}

/** A thin progress bar from 0 to 1. */
export function Bar({
  value,
  className = "bg-accent",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-ink/8" aria-hidden>
      <div
        data-motion="fill"
        className={`h-full rounded-full transition-[width] duration-700 ${className}`}
        style={{
          width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`,
        }}
      />
    </div>
  );
}

export const inputClass =
  "block w-full rounded-xl border border-line bg-paper px-3.5 text-[15px] text-ink transition-colors placeholder:text-ink-muted/60 hover:border-ink/25 focus:border-accent focus:bg-surface focus:outline-2 focus:outline-offset-0 focus:outline-accent/25";

export function Field({
  label,
  hint,
  className = "",
  ...input
}: { label: string; hint?: ReactNode } & ComponentProps<"input">) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium">
        {label}
        {hint ? (
          <span className="text-xs font-normal text-ink-muted">{hint}</span>
        ) : null}
      </span>
      <input className={`${inputClass} mt-1.5 h-11`} {...input} />
    </label>
  );
}

export function TextArea({
  label,
  hint,
  className = "",
  ...input
}: { label: string; hint?: ReactNode } & ComponentProps<"textarea">) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline justify-between gap-3 text-sm font-medium">
        {label}
        {hint ? (
          <span className="text-xs font-normal text-ink-muted">{hint}</span>
        ) : null}
      </span>
      <textarea
        className={`${inputClass} mt-1.5 py-2.5 leading-6`}
        {...input}
      />
    </label>
  );
}

/** Says plainly that something only works in the demo. */
export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-accent-soft px-4 py-3 text-sm leading-6 text-accent-strong">
      {children}
    </p>
  );
}

/** "2025-03" → "Mar 2025"; null → "Present". */
export function formatMonth(value: string | null): string {
  if (!value) return "Present";
  const [year, month] = value.split("-").map(Number);
  const names = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return month >= 1 && month <= 12 ? `${names[month - 1]} ${year}` : value;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return (
    (words[0][0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "")
  ).toUpperCase();
}
