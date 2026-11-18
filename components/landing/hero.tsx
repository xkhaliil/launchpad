import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/lib/site";
import { HeroArt } from "./hero-art";
import { HeroMotion } from "./hero-motion";
import { buttonPrimary, buttonSecondary, container } from "./ui";

/**
 * One headline line. The outer span is a mask and the inner one slides up into
 * it during the intro. The padding keeps descenders from being clipped by
 * the mask.
 */
function Line({ children }: { children: ReactNode }) {
  return (
    <span className="-mb-[0.14em] block overflow-hidden pr-[0.1em] pb-[0.14em]">
      <span data-hero="line" data-hero-hide className="block">
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  return (
    // The warm wash and texture behind this section are the page background
    // (see `body` in app/globals.css), so they also show behind the header.
    <section id="top" className="overflow-x-clip">
      {/* Without scripts nothing animates, so nothing may stay hidden. */}
      <noscript>
        <style>{`[data-hero-hide]{opacity:1!important;animation:none!important}`}</style>
      </noscript>

      <HeroMotion
        className={`${container} flex min-h-[calc(100svh-4rem)] flex-col justify-center py-10 sm:py-14`}
      >
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
          <div data-hero="copy" className="lg:col-span-7">
            <h1 className="text-[2.75rem] leading-[1.04] font-medium tracking-tight sm:text-6xl lg:text-[4.25rem]">
              <Line>One profile.</Line>
              <Line>Every application,</Line>
              <Line>
                <span className="text-accent">ready.</span>
              </Line>
            </h1>

            <p
              data-hero="fade"
              data-hero-hide
              className="mt-7 max-w-lg text-lg leading-8 text-pretty text-ink/75"
            >
              {APP_NAME} builds your ATS-friendly CV, cover letters, LinkedIn,
              GitHub and personal website from a single profile. Then it scores
              them and tells you what to fix next.
            </p>

            <div
              data-hero="fade"
              data-hero-hide
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href="/signup"
                data-magnetic
                className={`${buttonPrimary} h-12 px-6 text-base`}
              >
                Get started
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href="#how-it-works"
                className={`${buttonSecondary} h-12 px-6 text-base`}
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Drawn for a 28rem box. On narrow phones the whole illustration is
              zoomed down so its cards keep their proportions. */}
          <div data-hero="art" className="max-[26rem]:[zoom:0.8] lg:col-span-5">
            <HeroArt />
          </div>
        </div>
      </HeroMotion>
    </section>
  );
}
