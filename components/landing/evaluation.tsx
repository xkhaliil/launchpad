import { Check, Sparkles } from "lucide-react";
import { container, SectionHeading, sheet } from "./ui";

/** Areas and maximum points match the full evaluation in plan.md, section 6.9. */
const exampleAreas = [
  { label: "CV & ATS", points: 21, max: 25 },
  { label: "GitHub", points: 14, max: 20 },
  { label: "LinkedIn", points: 9, max: 15 },
  { label: "Cover letters", points: 8, max: 10 },
  { label: "Personal website", points: 6, max: 10 },
  { label: "Documents", points: 7, max: 10 },
  { label: "Consistency", points: 7, max: 10 },
];

const exampleScore = exampleAreas.reduce((sum, area) => sum + area.points, 0);

const points = [
  "Seven areas, weighted by what matters most in an application.",
  "Your top five fixes, ordered by the points each one adds.",
  "Scores are estimates. ATS systems differ between companies.",
];

/**
 * The full evaluation on a smooth dark sheet: explanation on the left, an
 * example dashboard on the right with a warm glow behind it.
 */
export function Evaluation() {
  return (
    <section
      data-sheet
      className={`${sheet} relative isolate overflow-clip bg-ink text-paper`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          data-breathe
          className="absolute top-1/2 -right-40 size-184 -translate-y-1/2 bg-radial-[closest-side] from-accent/40 to-transparent"
        />
        <div className="absolute -top-40 -left-40 size-120 bg-radial-[closest-side] from-glow-3/12 to-transparent" />
      </div>
      <div
        className={`${container} grid items-center gap-12 py-20 sm:gap-14 sm:py-32 lg:grid-cols-12 lg:gap-10`}
      >
        <div className="lg:col-span-5">
          <SectionHeading
            title="One score. One next step."
            lead="One click scores everything you have built, from 0 to 100, and tells you which fix to make first."
            tone="dark"
          />
          <ul data-reveal className="mt-9 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex gap-3 leading-7 text-paper/85">
                <span
                  aria-hidden
                  className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-paper/12 text-glow-1"
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* `data-rise`: the dashboard tips up flat as it scrolls in.
            `data-meter` parts then count up and grow, once. */}
        <figure
          data-rise
          data-meter
          className="[perspective:1400px] lg:col-span-7"
        >
          <div
            data-rise-card
            className="overflow-hidden rounded-3xl border border-paper/10 bg-surface text-ink shadow-[0_40px_90px_-30px_rgb(0_0_0/0.6)]"
          >
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <span className="size-2.5 rounded-full bg-line" aria-hidden />
              <span className="size-2.5 rounded-full bg-line" aria-hidden />
              <span className="size-2.5 rounded-full bg-line" aria-hidden />
              <span className="ml-3 font-mono text-xs text-ink-muted">
                Dashboard
              </span>
            </div>

            <div className="grid sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="flex flex-col items-center gap-5 border-b border-line p-6 sm:border-r sm:border-b-0 sm:p-7">
                <div className="relative grid size-36 place-items-center">
                  <svg
                    viewBox="0 0 160 160"
                    className="size-36 -rotate-90"
                    aria-hidden
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r="66"
                      fill="none"
                      strokeWidth="12"
                      className="stroke-accent-soft"
                    />
                    <circle
                      data-meter-ring
                      cx="80"
                      cy="80"
                      r="66"
                      fill="none"
                      strokeWidth="12"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray={`${exampleScore} 100`}
                      className="stroke-accent"
                    />
                  </svg>
                  <p className="absolute text-center">
                    <span
                      data-meter-count
                      className="block text-4xl leading-none font-medium tracking-tight"
                    >
                      {exampleScore}
                    </span>
                    <span className="mt-1 block text-xs text-ink-muted">
                      out of 100
                    </span>
                  </p>
                </div>

                <p className="text-sm font-medium">Estimated readiness score</p>

                <div className="w-full rounded-2xl bg-accent-soft p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-accent-strong">
                    <Sparkles className="size-3.5" aria-hidden />
                    Next best step
                  </p>
                  <p className="mt-1.5 text-sm font-medium">
                    Add a results line to three CV bullets
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Adds up to 4 points to CV &amp; ATS
                  </p>
                </div>
              </div>

              <ul className="flex flex-col justify-center gap-3.5 p-6 sm:p-7">
                {exampleAreas.map((area) => (
                  <li key={area.label}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="font-medium">{area.label}</span>
                      <span className="font-mono text-xs text-ink-muted">
                        {area.points}/{area.max}
                      </span>
                    </div>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent-soft"
                      aria-hidden
                    >
                      <div
                        data-meter-bar
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(area.points / area.max) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <figcaption className="mt-4 text-center text-sm text-paper/60">
            Example dashboard with illustrative data.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
