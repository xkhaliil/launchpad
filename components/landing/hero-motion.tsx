"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";
import { attachMagnetic } from "./motion-utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * True once the intro has played to the end. Next keeps this page mounted but
 * hidden after navigating away, and re-runs effects on return; this stops the
 * intro from replaying every time someone comes back.
 */
let introPlayed = false;

const centre = (node: Element) => {
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

/**
 * Runs the hero animations on its children. The markup stays server-rendered;
 * this wrapper only finds elements by their `data-hero` attribute:
 *
 * - intro: headline lines slide up, text fades in, the documents fan out from
 *   the profile card, the score counts up;
 * - idle: the documents float, and follow the pointer on devices with a mouse;
 * - scrolling away: the illustration and the text drift apart at different
 *   speeds, and `data-magnetic` buttons lean towards the pointer.
 *
 * Nothing runs for people who prefer reduced motion.
 */
export function HeroMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // From here on GSAP owns the hidden start states. Until this attribute
      // is set, CSS keeps `[data-hero-hide]` parts invisible (globals.css).
      el.setAttribute("data-hero-ready", "");

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

          const profile = q("[data-hero='profile']")[0] as
            HTMLElement | undefined;
          const art = q("[data-hero='art']")[0] as HTMLElement | undefined;
          const artVisible = !!profile && profile.offsetParent !== null;
          const tilts = q("[data-hero='tilt']");
          // On narrow phones the illustration is zoomed down in CSS. Distances
          // measured on screen have to be converted back to its own pixels.
          const zoom = (art && Number(getComputedStyle(art).zoom)) || 1;

          // Scrolling away: the two columns drift apart at different speeds.
          const leaving = {
            start: 0,
            end: () => `+=${el.offsetHeight}`,
            scrub: true,
            invalidateOnRefresh: true,
          };
          gsap.to(q("[data-hero='copy']"), {
            yPercent: 8,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: leaving,
          });
          if (art) {
            gsap.to(art, {
              yPercent: -12,
              ease: "none",
              scrollTrigger: leaving,
            });
          }

          if (!introPlayed) {
            const intro = gsap.timeline({
              defaults: { ease: "power3.out" },
              onComplete: () => {
                introPlayed = true;
              },
            });

            intro
              .from(
                q("[data-hero='line']"),
                {
                  yPercent: 115,
                  duration: 1,
                  ease: "power4.out",
                  stagger: 0.09,
                },
                0.05,
              )
              .from(
                q("[data-hero='fade']"),
                { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.12 },
                0.35,
              );

            if (artVisible) {
              const origin = centre(profile);
              // Every connecting line starts at the profile (x1, y1).
              const links = q("[data-hero='link']");
              const linkStart = {
                x2: Number(links[0]?.getAttribute("x1")),
                y2: Number(links[0]?.getAttribute("y1")),
              };
              intro
                .from(
                  profile,
                  {
                    scale: 0.82,
                    autoAlpha: 0,
                    duration: 0.7,
                    ease: "back.out(1.7)",
                  },
                  0.25,
                )
                // Each document starts stacked on the profile and flies out.
                .from(
                  q("[data-hero='doc']"),
                  {
                    x: (_index, node: Element) =>
                      (origin.x - centre(node).x) / zoom,
                    y: (_index, node: Element) =>
                      (origin.y - centre(node).y) / zoom,
                    scale: 0.5,
                    autoAlpha: 0,
                    duration: 0.9,
                    ease: "back.out(1.25)",
                    stagger: 0.07,
                  },
                  0.55,
                )
                // Cards carry their final tilt in CSS; start them level.
                .from(
                  tilts,
                  {
                    rotation: (_index, node: HTMLElement) =>
                      -Number(node.dataset.tilt),
                    duration: 0.9,
                    ease: "power2.out",
                    stagger: 0.07,
                  },
                  0.55,
                )
                .from(
                  links,
                  { attr: linkStart, duration: 0.9, stagger: 0.07 },
                  0.55,
                )
                .from(
                  q("[data-hero='badge']"),
                  {
                    scale: 0.6,
                    autoAlpha: 0,
                    duration: 0.6,
                    ease: "back.out(2)",
                  },
                  1.15,
                )
                .from(
                  q("[data-hero='score']"),
                  {
                    textContent: 0,
                    snap: { textContent: 1 },
                    duration: 1.2,
                    ease: "power1.out",
                  },
                  1.15,
                )
                .from(
                  q("[data-hero='ring']"),
                  {
                    attr: { "stroke-dasharray": "0 100" },
                    duration: 1.2,
                    ease: "power1.out",
                  },
                  1.15,
                );
            }
          }

          if (!artVisible) return;

          // Idle: each document drifts up and down at its own pace. One tween
          // per card, because the durations differ.
          tilts.forEach((node, index) => {
            gsap.to(node, {
              y: index % 2 === 0 ? -7 : 7,
              duration: 2.6 + index * 0.4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: introPlayed ? 0 : 1.6,
            });
          });

          if (!mouse) return;

          const detachMagnetic = attachMagnetic(
            q("[data-magnetic]") as HTMLElement[],
          );

          // Pointer: cards shift a little, nearer ones more than farther ones.
          const layers = q("[data-hero='parallax']").map(
            (node: HTMLElement) => ({
              depth: Number(node.dataset.depth),
              x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3" }),
              y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3" }),
            }),
          );
          const onMove = (event: PointerEvent) => {
            const box = el.getBoundingClientRect();
            const dx = (event.clientX - box.left) / box.width - 0.5;
            const dy = (event.clientY - box.top) / box.height - 0.5;
            for (const layer of layers) {
              layer.x(dx * layer.depth * 22);
              layer.y(dy * layer.depth * 22);
            }
          };
          const onLeave = () => {
            for (const layer of layers) {
              layer.x(0);
              layer.y(0);
            }
          };

          el.addEventListener("pointermove", onMove);
          el.addEventListener("pointerleave", onLeave);
          return () => {
            detachMagnetic();
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} data-hero-root className={className}>
      {children}
    </div>
  );
}
