import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/site";

export const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

/**
 * A "sheet": a full-width band with rounded corners and a small margin, so the
 * textured page shows around it. Sections alternate between the page itself
 * and sheets in different colours (white, dark, orange), some smooth and some
 * textured. Add the background colour next to this class.
 */
export const sheet = "mx-2 rounded-[2rem] sm:mx-4 sm:rounded-[2.5rem]";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const buttonPrimary = `${buttonBase} bg-ink text-paper hover:bg-ink/85`;
export const buttonSecondary = `${buttonBase} border border-ink/20 bg-surface/50 text-ink hover:border-ink/45 hover:bg-surface/80`;

/** For cards the navigation menu links to: clear the header, mark the target. */
export const targetHighlight =
  "scroll-mt-28 target:border-accent target:shadow-lift";

/** The logo: the product name set as a wordmark. Takes its colour from its parent. */
export function Logo({ className = "text-[22px]" }: { className?: string }) {
  return (
    <span className={`leading-none font-medium tracking-tight ${className}`}>
      {APP_NAME}
    </span>
  );
}

/** What a heading sits on: the light page, a dark sheet, or the orange sheet. */
export type Tone = "light" | "dark" | "accent";

const leadTones: Record<Tone, string> = {
  light: "text-ink-muted",
  dark: "text-paper/70",
  // White at full strength: anything fainter fails contrast on the orange.
  accent: "text-surface",
};

/**
 * Section heading. `data-split` makes its lines slide up one after another
 * when it scrolls into view (see scroll-motion.tsx).
 */
export function SectionHeading({
  title,
  lead,
  tone = "light",
}: {
  title: ReactNode;
  lead?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="max-w-2xl">
      <h2
        data-split
        className="text-4xl leading-[1.08] font-medium tracking-tight text-balance sm:text-5xl lg:text-[3.5rem]"
      >
        {title}
      </h2>
      {lead ? (
        <p
          data-reveal
          className={`mt-6 max-w-xl text-lg leading-8 text-pretty ${leadTones[tone]}`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
