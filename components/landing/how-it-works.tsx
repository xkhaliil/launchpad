import { steps } from "./content";
import { container, SectionHeading } from "./ui";

/**
 * Three steps as an editorial list. The heading stays put while they scroll,
 * a rail on the left fills as you read down (`data-rail`), and each number
 * lights up as its step arrives (`data-step`).
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={`${container} scroll-mt-16 py-20 sm:py-32`}
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              title="From sign-up to a finished CV in one sitting."
              lead="The goal is a finished ATS-friendly CV in under 30 minutes, then one module at a time until everything is ready."
            />
          </div>
        </div>

        <div data-rail className="relative lg:col-span-7">
          {/* The rail: a faint track with a fill that grows with the scroll. */}
          <div
            aria-hidden
            className="absolute top-2 bottom-2 left-0 w-px bg-ink/12"
          >
            <div
              data-rail-fill
              className="h-full w-full origin-top bg-accent"
            />
          </div>

          <ol>
            {steps.map((step, index) => (
              <li
                key={step.id}
                id={step.id}
                data-step
                className="group scroll-mt-28 py-9 pl-7 first:pt-0 last:pb-0 sm:pl-12"
              >
                <span
                  aria-hidden
                  data-step-number
                  className="block text-6xl leading-none font-medium tracking-[-0.04em] text-accent sm:text-7xl"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-2xl font-medium tracking-tight transition-colors group-target:text-accent sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-md text-lg leading-8 text-pretty text-ink-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
