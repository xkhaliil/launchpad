import { APP_NAME } from "@/lib/site";
import { modules } from "./content";
import { container, sheet } from "./ui";

/** The problem and the answer, as one paragraph. `accent` marks the key phrase. */
const sentences: { text: string; accent?: boolean }[] = [
  {
    text: "A CV, cover letters, a LinkedIn profile, a GitHub profile, a personal site and a folder of documents.",
  },
  {
    text: "Today that takes four to six tools, with the same facts typed into each one.",
  },
  { text: `${APP_NAME} keeps` },
  { text: "one profile", accent: true },
  { text: "and builds everything else from it." },
];

const words = sentences.flatMap((sentence) =>
  sentence.text.split(" ").map((word) => ({ word, accent: sentence.accent })),
);

const card =
  "relative isolate flex min-h-64 flex-col justify-between overflow-clip rounded-4xl p-7 sm:min-h-72 sm:p-8";
const figure =
  "text-[5rem] leading-[0.9] font-medium tracking-[-0.04em] sm:text-[5.5rem]";
const caption = "max-w-[15ch] text-lg leading-6 font-medium text-balance";

/** Example score marked on the scale. Illustrative, like the dashboard below. */
const EXAMPLE_SCORE = 72;

/**
 * Three figures about the product, each on its own surface: smooth dark,
 * textured orange and a textured warm gradient.
 *
 * Animation hooks (scroll-motion.tsx): `data-deal` deals the cards in one
 * after another, `data-pulse` rings breathe, `data-pop` tiles pop in, and the
 * `data-meter` parts count up and grow.
 */
function Facts() {
  return (
    <ul data-deal className="mt-14 grid gap-5 sm:mt-20 md:grid-cols-3">
      {/* 1 profile: one point, rings spreading out from it. */}
      <li className={`${card} bg-ink text-paper`}>
        <svg
          aria-hidden
          viewBox="0 0 320 320"
          fill="none"
          className="absolute -right-24 -bottom-24 -z-10 size-80 text-paper/15"
        >
          {[40, 80, 120, 160].map((radius) => (
            <circle
              key={radius}
              data-pulse
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
            />
          ))}
          <circle cx="160" cy="160" r="7" className="fill-glow-1" />
        </svg>
        <p className={`${figure} text-glow-1`}>1</p>
        <p className={caption}>profile to keep up to date</p>
      </li>

      {/* 8 modules: one tile per module. */}
      <li data-meter className={`${card} bg-accent text-surface`}>
        <div aria-hidden className="absolute inset-0 -z-10 bg-texture" />
        <div
          aria-hidden
          data-pop
          className="absolute top-7 right-7 grid grid-cols-4 gap-2 sm:top-8 sm:right-8"
        >
          {modules.map((item) => (
            <span
              key={item.id}
              className="grid size-9 place-items-center rounded-xl bg-surface/15"
            >
              <item.icon className="size-4.5" strokeWidth={1.75} />
            </span>
          ))}
        </div>
        <p className={figure}>
          <span data-meter-count>{modules.length}</span>
        </p>
        <p className={caption}>modules built from it</p>
      </li>

      {/* 0–100: a scale with an example score marked on it. */}
      <li data-meter className={`${card} text-ink`}>
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-glow-2 via-glow-1 to-glow-3" />
          <div className="absolute inset-0 bg-texture" />
        </div>
        <div>
          <p className={figure}>
            0–<span data-meter-count>100</span>
          </p>
          <div aria-hidden className="mt-7">
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/12">
              <div
                data-meter-bar
                className="h-full rounded-full bg-ink"
                style={{ width: `${EXAMPLE_SCORE}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between">
              {Array.from({ length: 21 }, (_, tick) => (
                <span
                  key={tick}
                  className={`w-px bg-ink/40 ${tick % 5 === 0 ? "h-2.5" : "h-1.5"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className={caption}>one estimated readiness score</p>
      </li>
    </ul>
  );
}

/** White, smooth sheet: the statement that lights up on scroll, then the figures. */
export function Statement() {
  return (
    <section data-sheet className={`${sheet} bg-surface`}>
      <div className={`${container} py-20 sm:py-32`}>
        {/* Each word is its own span so it can light up as the page scrolls. */}
        <p
          data-words
          className="max-w-5xl text-[1.75rem] leading-[1.25] font-medium tracking-tight sm:text-4xl sm:leading-[1.2] lg:text-5xl lg:leading-[1.16]"
        >
          {words.map(({ word, accent }, index) => (
            <span
              key={index}
              data-word
              className={accent ? "text-accent" : undefined}
            >
              {word}{" "}
            </span>
          ))}
        </p>

        <Facts />
      </div>
    </section>
  );
}
