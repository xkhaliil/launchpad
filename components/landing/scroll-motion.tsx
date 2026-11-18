"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { type ReactNode, useRef } from "react";
import { attachMagnetic, attachTilt, belowFold } from "./motion-utils";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

// Many selectors here match nothing in some sections (a panel without a ring,
// the footer without any looping glow). That is expected, not an error.
gsap.config({ nullTargetWarn: false });

/**
 * Scroll animations for everything below the hero. The sections stay
 * server-rendered; this wrapper finds elements by data attribute.
 *
 * Tied to the scroll position (they follow the scrollbar):
 * - `data-sheet`: a section settles into place, growing slightly as it arrives.
 * - `data-words` with `data-word` children: words go from faint to full.
 * - `data-rise` with `data-rise-card`: a card tips up from a tilt until flat.
 * - `data-rail` with `data-rail-fill`, `data-step`, `data-step-number`: a rail
 *   fills and step numbers light up as the steps are read.
 * - `data-marquee` with `data-marquee-track`: a line of text loops, faster
 *   while the page is being scrolled.
 *
 * Played once when they scroll into view:
 * - `data-split`: a heading's lines slide up one after another.
 * - `data-reveal`: fades up; elements arriving together are staggered.
 * - `data-deal`: children are dealt in like cards.
 * - `data-pop`: children pop in one by one.
 * - `data-draw`: a line draws itself from the left.
 * - `data-mock`: the `.mock-card`s inside stagger in.
 * - `data-meter` with `data-meter-ring`, `data-meter-count`, `data-meter-bar`:
 *   a ring draws, numbers count up and bars grow.
 *
 * Always running: `data-pulse`, `data-breathe`, `data-drift` (slow loops).
 * With a mouse only: `data-tilt` inside `data-mock`, and `data-magnetic`.
 *
 * Everything is visible without scripts: start states are only set here, and
 * only for elements still below the fold, so nothing on screen ever flashes.
 * Nothing runs for people who prefer reduced motion.
 */
export function ScrollMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          mouse: "(hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { motion, mouse } = context.conditions as {
            motion: boolean;
            mouse: boolean;
          };
          if (!motion) return;

          const once = (trigger: Element, start = "top 85%") => ({
            trigger,
            start,
            once: true,
          });

          // Sections settle into place. Created first so that the triggers
          // inside them are measured against their resting position.
          for (const section of q("[data-sheet]")) {
            gsap.fromTo(
              section,
              { scale: 0.94, y: 70, transformOrigin: "50% 0%" },
              {
                scale: 1,
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top 60%",
                  scrub: 0.5,
                },
              },
            );
          }

          // Headings: lines slide up from behind a mask. SplitText re-splits
          // on resize and once web fonts load, and keeps the animation in step.
          for (const heading of q("[data-split]")) {
            SplitText.create(heading, {
              type: "lines",
              mask: "lines",
              linesClass: "split-line",
              autoSplit: true,
              onSplit: (split) =>
                gsap.from(split.lines, {
                  yPercent: 115,
                  duration: 1,
                  ease: "power4.out",
                  stagger: 0.1,
                  scrollTrigger: once(heading, "top 88%"),
                }),
            });
          }

          const reveals = q("[data-reveal]").filter(belowFold);
          if (reveals.length > 0) {
            gsap.set(reveals, { autoAlpha: 0, y: 28 });
            ScrollTrigger.batch(reveals, {
              start: "top 88%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.9,
                  ease: "power3.out",
                  stagger: 0.08,
                  overwrite: true,
                }),
            });
          }

          const lines = q("[data-draw]").filter(belowFold);
          if (lines.length > 0) {
            gsap.set(lines, { scaleX: 0 });
            ScrollTrigger.batch(lines, {
              start: "top 90%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  scaleX: 1,
                  duration: 1.1,
                  ease: "power3.inOut",
                  stagger: 0.12,
                  overwrite: true,
                }),
            });
          }

          for (const block of q("[data-words]")) {
            gsap.fromTo(
              block.querySelectorAll("[data-word]"),
              { opacity: 0.16 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: {
                  trigger: block,
                  start: "top 78%",
                  end: "bottom 55%",
                  scrub: 0.4,
                },
              },
            );
          }

          for (const group of q("[data-deal]").filter(belowFold)) {
            gsap.from(group.children, {
              y: 90,
              rotation: (index) => [-5, 0, 5][index % 3],
              autoAlpha: 0,
              duration: 1.1,
              ease: "back.out(1.3)",
              stagger: 0.12,
              scrollTrigger: once(group, "top 82%"),
            });
          }

          for (const group of q("[data-pop]").filter(belowFold)) {
            gsap.from(group.children, {
              scale: 0,
              duration: 0.5,
              ease: "back.out(2.2)",
              stagger: 0.05,
              delay: 0.35,
              scrollTrigger: once(group, "top 82%"),
            });
          }

          for (const panel of q("[data-mock]").filter(belowFold)) {
            gsap.from(panel.querySelectorAll(".mock-card"), {
              y: 18,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.09,
              scrollTrigger: once(panel, "top 80%"),
            });
          }

          for (const panel of q("[data-meter]").filter(belowFold)) {
            gsap
              .timeline({
                defaults: { ease: "power2.out" },
                scrollTrigger: once(panel, "top 75%"),
              })
              .from(
                panel.querySelectorAll("[data-meter-ring]"),
                { attr: { "stroke-dasharray": "0 100" }, duration: 1.4 },
                0,
              )
              .from(
                panel.querySelectorAll("[data-meter-count]"),
                { textContent: 0, snap: { textContent: 1 }, duration: 1.4 },
                0,
              )
              .from(
                panel.querySelectorAll("[data-meter-bar]"),
                {
                  scaleX: 0,
                  transformOrigin: "left center",
                  duration: 0.9,
                  stagger: 0.07,
                },
                0.15,
              );
          }

          // A card that tips up from a tilt until it lies flat.
          for (const stage of q("[data-rise]")) {
            const card = stage.querySelector("[data-rise-card]");
            if (!card) continue;
            gsap.fromTo(
              card,
              { rotateX: 24, scale: 0.9, y: 50, transformOrigin: "50% 100%" },
              {
                rotateX: 0,
                scale: 1,
                y: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: stage,
                  start: "top 95%",
                  end: "top 40%",
                  scrub: 0.5,
                },
              },
            );
          }

          // Steps: the rail fills, each number lights up, each text fades up.
          for (const rail of q("[data-rail]")) {
            const fill = rail.querySelector("[data-rail-fill]");
            if (fill) {
              gsap.fromTo(
                fill,
                { scaleY: 0 },
                {
                  scaleY: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: rail,
                    start: "top 70%",
                    end: "bottom 65%",
                    scrub: 0.4,
                  },
                },
              );
            }
            for (const step of rail.querySelectorAll("[data-step]")) {
              const number = step.querySelector("[data-step-number]");
              if (number) {
                gsap.fromTo(
                  number,
                  { opacity: 0.2 },
                  {
                    opacity: 1,
                    ease: "none",
                    scrollTrigger: {
                      trigger: step,
                      start: "top 80%",
                      end: "top 50%",
                      scrub: 0.4,
                    },
                  },
                );
              }
              if (belowFold(step)) {
                gsap.from(step.querySelectorAll("h3, p"), {
                  y: 26,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: "power3.out",
                  stagger: 0.08,
                  scrollTrigger: once(step, "top 82%"),
                });
              }
            }
          }

          // A looping line of text that speeds up while the page scrolls.
          for (const marquee of q("[data-marquee]")) {
            const track = marquee.querySelector("[data-marquee-track]");
            if (!track) continue;
            const loop = gsap.to(track, {
              xPercent: -50,
              duration: 30,
              ease: "none",
              repeat: -1,
            });
            let settle: gsap.core.Tween | undefined;
            ScrollTrigger.create({
              trigger: marquee,
              start: "top bottom",
              end: "bottom top",
              onUpdate: (self) => {
                settle?.kill();
                loop.timeScale(
                  1 + Math.min(5, Math.abs(self.getVelocity()) / 300),
                );
                settle = gsap.to(loop, {
                  timeScale: 1,
                  duration: 1.2,
                  ease: "power2.out",
                });
              },
            });
          }

          // Slow loops that keep the page alive between scrolls.
          gsap.to(q("[data-pulse]"), {
            scale: 1.07,
            opacity: 0.5,
            svgOrigin: "160 160",
            duration: 2.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: 0.3,
          });
          gsap.to(q("[data-breathe]"), {
            scale: 1.2,
            opacity: 0.7,
            duration: 5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
          gsap.to(q("[data-drift]"), {
            xPercent: -14,
            yPercent: 10,
            duration: 9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });

          if (!mouse) return;

          const cleanups = [
            attachMagnetic(q("[data-magnetic]") as HTMLElement[]),
            ...q("[data-mock]").map((panel: HTMLElement) => {
              const target = panel.querySelector<HTMLElement>("[data-tilt]");
              return target ? attachTilt(panel, target) : () => {};
            }),
          ];
          return () => cleanups.forEach((cleanup) => cleanup());
        },
      );

      // Web fonts can change text height after the triggers were measured.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
