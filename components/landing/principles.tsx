import { principles } from "./content";
import { container, SectionHeading, sheet } from "./ui";

/**
 * The product rules on a textured orange sheet. Text here is white at full
 * strength: anything fainter does not have enough contrast on the orange.
 * Each rule's top line draws itself in (`data-draw`) before its text appears.
 */
export function Principles() {
  return (
    <section
      id="principles"
      data-sheet
      className={`${sheet} relative isolate scroll-mt-20 overflow-clip bg-accent text-surface`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          data-drift
          className="absolute -top-56 -right-40 size-184 bg-radial-[closest-side] from-glow-1/45 to-transparent"
        />
        <div className="absolute inset-0 bg-texture" />
      </div>

      <div className={`${container} py-20 sm:py-32`}>
        <SectionHeading
          title="Built so you can trust what it writes."
          lead="Your applications carry your name, so these rules are part of the product, not the small print."
          tone="accent"
        />

        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle) => (
            <li
              key={principle.id}
              id={principle.id}
              className="group scroll-mt-28"
            >
              <span
                aria-hidden
                data-draw
                className="block h-px origin-left bg-surface/45"
              />
              <div data-reveal className="pt-6">
                <principle.icon
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-6"
                />
                <h3 className="mt-5 text-lg font-medium decoration-2 underline-offset-4 group-target:underline">
                  {principle.title}
                </h3>
                <p className="mt-2 leading-7 text-pretty">
                  {principle.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
