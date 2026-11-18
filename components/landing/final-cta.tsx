import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/site";
import { buttonPrimary, buttonSecondary, container } from "./ui";

/** Closing call to action on a textured gradient card with a slow drifting glow. */
export function FinalCta() {
  return (
    <section className={`${container} py-20 sm:py-32`}>
      <div
        data-sheet
        className="relative isolate overflow-clip rounded-4xl border border-line px-6 py-16 text-center sm:px-12 sm:py-24"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-b from-glow-2 to-glow-1" />
          <div
            data-drift
            className="absolute -right-40 -bottom-60 size-160 bg-radial-[closest-side] from-glow-3 to-transparent"
          />
          <div className="absolute inset-0 bg-texture" />
        </div>

        <h2
          data-split
          className="mx-auto max-w-3xl text-[2.75rem] leading-[1.04] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          Start with <span className="text-accent">one profile.</span>
        </h2>
        <p
          data-reveal
          className="mx-auto mt-6 max-w-xl text-lg leading-8 text-pretty text-ink/75"
        >
          Fill it in once. {APP_NAME} builds the rest and tells you what to fix
          first.
        </p>
        <div
          data-reveal
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/signup"
            data-magnetic
            className={`${buttonPrimary} h-12 w-full px-6 text-base sm:w-auto`}
          >
            Get started
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/login"
            className={`${buttonSecondary} h-12 w-full px-6 text-base sm:w-auto`}
          >
            Log in
          </Link>
        </div>
      </div>
    </section>
  );
}
