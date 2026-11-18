import type { ReactNode } from "react";

/*
 * Hero illustration: one profile card with the documents it produces fanned
 * out around it. Purely decorative, so it is hidden from assistive tech; the
 * headline says the same thing in words.
 *
 * Positions are the centre of each card, in percent of the box. The `data-hero`
 * attributes are the hooks the GSAP animation uses (see hero-motion.tsx).
 */

const PROFILE = { x: 50, y: 52 };

/** Example score shown in the badge. Illustrative, like the dashboard below. */
const EXAMPLE_SCORE = 72;

/** Skeleton line standing in for a line of text. */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`h-1.5 rounded-full bg-ink/10 ${className}`} />;
}

function DocLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[9px] tracking-[0.14em] text-ink-muted uppercase">
      {children}
    </p>
  );
}

type Doc = {
  key: string;
  x: number;
  y: number;
  /** Final rotation in degrees. Must match the `rotate-*` class in `tilt`. */
  tilt: number;
  tiltClass: string;
  /** How strongly the card follows the pointer. */
  depth: number;
  content: ReactNode;
};

const docs: Doc[] = [
  {
    key: "website",
    x: 21,
    y: 17,
    tilt: -7,
    tiltClass: "-rotate-7",
    depth: 1.4,
    content: (
      <>
        <div className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-ink/15" />
          <span className="size-1.5 rounded-full bg-ink/15" />
          <span className="size-1.5 rounded-full bg-ink/15" />
          <span className="ml-1.5 h-1.5 flex-1 rounded-full bg-ink/8" />
        </div>
        <div className="mt-2.5 rounded-md bg-accent-soft p-2.5">
          <Bar className="w-3/5 bg-accent/40" />
          <Bar className="mt-1.5 w-4/5 bg-accent/20" />
        </div>
        <div className="mt-2.5">
          <DocLabel>Website</DocLabel>
        </div>
      </>
    ),
  },
  {
    key: "cv",
    x: 80,
    y: 19,
    tilt: 6,
    tiltClass: "rotate-6",
    depth: 1,
    content: (
      <>
        <div className="flex items-center justify-between">
          <DocLabel>CV.pdf</DocLabel>
          <span className="rounded-full bg-success-soft px-1.5 py-0.5 font-mono text-[9px] font-medium text-success">
            ATS est. 86
          </span>
        </div>
        <Bar className="mt-3 h-2 w-1/2 bg-ink/25" />
        <Bar className="mt-2.5 w-full" />
        <Bar className="mt-1.5 w-11/12" />
        <Bar className="mt-1.5 w-4/5" />
        <Bar className="mt-3 w-full" />
        <Bar className="mt-1.5 w-2/3" />
      </>
    ),
  },
  {
    key: "cover-letter",
    x: 86,
    y: 57,
    tilt: -4,
    tiltClass: "-rotate-4",
    depth: 1.7,
    content: (
      <>
        <DocLabel>Cover letter</DocLabel>
        <p className="mt-2.5 text-xs leading-none font-medium text-ink">
          Dear hiring team,
        </p>
        <Bar className="mt-2.5 w-full" />
        <Bar className="mt-1.5 w-11/12" />
        <Bar className="mt-1.5 w-full" />
        <Bar className="mt-1.5 w-3/5" />
      </>
    ),
  },
  {
    key: "linkedin",
    x: 72,
    y: 88,
    tilt: 5,
    tiltClass: "rotate-5",
    depth: 1.2,
    content: (
      <>
        <div className="-mx-3 -mt-3 h-8 rounded-t-xl bg-linear-to-r from-glow-1 to-glow-3" />
        <div className="-mt-3.5 size-7 rounded-full border-2 border-surface bg-ink" />
        <Bar className="mt-2 h-2 w-1/2 bg-ink/25" />
        <Bar className="mt-1.5 w-4/5" />
        <div className="mt-2.5">
          <DocLabel>LinkedIn</DocLabel>
        </div>
      </>
    ),
  },
  {
    key: "github",
    x: 20,
    y: 84,
    tilt: -5,
    tiltClass: "-rotate-5",
    depth: 1.5,
    content: (
      <>
        <DocLabel>README.md</DocLabel>
        <p className="mt-2 font-mono text-[10px] text-ink">
          <span className="text-accent">#</span> ada-lovelace
        </p>
        <div className="mt-2.5 grid grid-cols-9 gap-1">
          {[2, 0, 1, 3, 1, 0, 2, 3, 1, 0, 2, 1, 3, 3, 0, 1, 2, 2].map(
            (level, index) => (
              <span
                key={index}
                className={`aspect-square rounded-xs ${
                  ["bg-ink/8", "bg-accent/25", "bg-accent/55", "bg-accent"][
                    level
                  ]
                }`}
              />
            ),
          )}
        </div>
      </>
    ),
  },
];

export function HeroArt() {
  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-[10/11] w-full max-w-md select-none"
    >
      {/* Lines from the profile to each document. viewBox matches the box. */}
      <svg
        viewBox="0 0 100 110"
        fill="none"
        className="absolute inset-0 size-full text-ink/25"
      >
        {docs.map((doc) => (
          <line
            key={doc.key}
            data-hero="link"
            x1={PROFILE.x}
            y1={PROFILE.y * 1.1}
            x2={doc.x}
            y2={doc.y * 1.1}
            stroke="currentColor"
            strokeWidth="0.3"
            strokeDasharray="1.2 1.4"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {docs.map((doc) => (
        <div
          key={doc.key}
          data-hero="doc"
          data-hero-hide
          className="absolute w-36 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${doc.x}%`, top: `${doc.y}%` }}
        >
          <div data-hero="parallax" data-depth={doc.depth}>
            <div
              data-hero="tilt"
              data-tilt={doc.tilt}
              className={`rounded-xl border border-line bg-surface p-3 shadow-lift ${doc.tiltClass}`}
            >
              {doc.content}
            </div>
          </div>
        </div>
      ))}

      {/* The profile: the single source of truth, on top of the pile. */}
      <div
        data-hero="profile"
        data-hero-hide
        className="absolute z-10 w-48 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${PROFILE.x}%`, top: `${PROFILE.y}%` }}
      >
        <div data-hero="parallax" data-depth={0.5}>
          <div className="rounded-2xl bg-ink p-4 text-paper shadow-float">
            <p className="font-mono text-[9px] tracking-[0.14em] text-paper/60 uppercase">
              Your profile
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-glow-1 text-xs font-semibold text-ink">
                AL
              </span>
              <div>
                <p className="text-sm leading-tight font-semibold">
                  Ada Lovelace
                </p>
                <p className="text-[11px] leading-tight text-paper/65">
                  Backend developer
                </p>
              </div>
            </div>
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {["Python", "Go", "PostgreSQL"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-paper/12 px-2 py-0.5 text-[10px] text-paper/85"
                >
                  {skill}
                </span>
              ))}
            </div>
            <p className="mt-3.5 border-t border-paper/15 pt-2.5 text-xs font-medium text-glow-1">
              one source of truth
            </p>
          </div>
        </div>
      </div>

      {/* Example readiness score. */}
      <div
        data-hero="badge"
        data-hero-hide
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: "11%", top: "50%" }}
      >
        <div data-hero="parallax" data-depth={2.2}>
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-3.5 pl-1.5 shadow-lift">
            <span className="relative grid size-9 place-items-center">
              <svg viewBox="0 0 36 36" className="absolute size-9 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  strokeWidth="4"
                  className="stroke-accent-soft"
                />
                <circle
                  data-hero="ring"
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray={`${EXAMPLE_SCORE} 100`}
                  className="stroke-accent"
                />
              </svg>
              <span
                data-hero="score"
                className="relative text-[11px] font-semibold"
              >
                {EXAMPLE_SCORE}
              </span>
            </span>
            <span className="text-[10px] leading-tight text-ink-muted">
              estimated
              <br />
              readiness
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
