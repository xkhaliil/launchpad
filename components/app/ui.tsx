import { ChevronRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/*
 * Building blocks shared by every app screen. Same tokens as the landing page.
 *
 * Layout rules (plan.md, section 7, "UX architecture"):
 * - every screen starts with a `PageHeader`: title, one number, main actions;
 * - content sits on the page, separated by space and hairlines (`listClass`),
 *   not boxed in cards; a `Card` is for the one object a screen is about;
 * - anything secondary goes behind a `Disclosure`.
 */

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const buttonBase = `inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focus}`;

export const btn = {
  primary: `${buttonBase} h-10 bg-ink px-4 text-sm text-paper hover:bg-ink/85`,
  accent: `${buttonBase} h-10 bg-accent px-4 text-sm text-surface hover:bg-accent-strong`,
  secondary: `${buttonBase} h-10 border border-ink/15 bg-surface px-4 text-sm text-ink hover:border-ink/35`,
  ghost: `${buttonBase} h-10 px-3 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink`,
  icon: `${buttonBase} size-10 text-ink-muted hover:bg-ink/5 hover:text-ink`,
  small: `${buttonBase} h-8 border border-ink/15 bg-surface px-3 text-[13px] text-ink hover:border-ink/35`,
};

/** A list on the page: rows divided by hairlines, no boxes. */
export const listClass = "divide-y divide-line border-y border-line";

/**
 * The top of every screen except Home: the title, the screen's one number
 * and its main actions. No paragraph: if a screen needs explaining, the
 * screen is the problem.
 */
export function PageHeader({
  title,
  stat,
  statLabel,
  actions,
  children,
}: {
  title: string;
  stat?: ReactNode;
  statLabel?: ReactNode;
  actions?: ReactNode;
  /** One short line under the header, if needed. */
  children?: ReactNode;
}) {
  return (
    <header data-motion="tile" data-motion-hide className="print:hidden">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-3xl leading-tight font-medium tracking-tight sm:text-[2.5rem]">
            {title}
          </h1>
          {stat !== undefined ? (
            <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-ink-muted">
              <span className="text-lg font-medium text-ink tabular-nums">
                {stat}
              </span>
              {statLabel ? <span className="text-sm">{statLabel}</span> : null}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children ? (
        <div className="mt-3 text-sm text-ink-muted">{children}</div>
      ) : null}
    </header>
  );
}

/** Hides what most people do not need until they ask for it. */
export function Disclosure({
  summary,
  children,
  className = "",
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`group/disclosure ${className}`}>
      <summary
        className={`flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg text-sm text-ink-muted transition-colors select-none hover:text-ink [&::-webkit-details-marker]:hidden ${focus}`}
      >
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 transition-transform group-open/disclosure:rotate-90"
        />
        {summary}
      </summary>
      <div className="pt-1 pb-2">{children}</div>
    </details>
  );
}

/** A small set of choices, one selected. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full [scrollbar-width:none] overflow-x-auto rounded-full bg-ink/5 p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-8 shrink-0 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors ${focus} ${
            value === option.value
              ? "bg-surface text-ink shadow-sm ring-1 ring-line"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type Surface = "white" | "sand" | "ink";

const surfaces: Record<Surface, string> = {
  white: "border border-line bg-surface",
  sand: "bg-sand",
  ink: "bg-ink text-paper",
};

const paddings = {
  default: "p-6 sm:p-7",
  tight: "p-3",
  none: "",
};

/** The one object a screen is about (a document, a preview). */
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
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
  id,
}: {
  children: ReactNode;
  action?: ReactNode;
  id?: string;
}) {
  return (
    <div className="mb-3 flex min-h-10 items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-medium tracking-tight">
        {children}
      </h2>
      {action}
    </div>
  );
}

export type Tone = "neutral" | "success" | "warning" | "danger" | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-ink/5 text-ink-muted",
  success: "bg-success-soft text-success",
  warning: "bg-accent-soft text-accent-strong",
  danger: "bg-danger/10 text-danger",
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
  "block w-full rounded-xl border border-line bg-surface px-3.5 text-[15px] text-ink transition-colors placeholder:text-ink-muted/60 hover:border-ink/25 focus:border-accent focus:outline-2 focus:outline-offset-0 focus:outline-accent/25";

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
