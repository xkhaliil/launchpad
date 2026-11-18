"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type ReactNode, useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

/** Screens whose entrance has already played (Next keeps pages mounted). */
const played = new Set<string>();

/**
 * Entrance animation for an app screen. Children are found by attribute:
 * - `data-motion="tile"`: fades and rises in, one after another;
 * - `data-motion="fill"`: a bar that grows from the left;
 * - `data-motion="draw"`: an SVG path that draws itself.
 *
 * Parts marked `data-motion-hide` stay invisible until this takes over
 * (globals.css), so nothing flashes before the animation. Nothing moves for
 * people who prefer reduced motion.
 */
export function ScreenMotion({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (played.has(id)) return;
        const tiles = q("[data-motion='tile']");
        const fills = q("[data-motion='fill']");
        const timeline = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            played.add(id);
          },
        });
        if (tiles.length > 0) {
          timeline.from(tiles, {
            y: 28,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.07,
          });
        }
        if (fills.length > 0) {
          timeline.from(
            fills,
            {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 1.1,
              ease: "power2.out",
              stagger: 0.05,
            },
            0.25,
          );
        }

        for (const path of el.querySelectorAll<SVGPathElement>(
          "[data-motion='draw']",
        )) {
          const length = path.getTotalLength();
          timeline.fromTo(
            path,
            { strokeDasharray: length, strokeDashoffset: length },
            { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" },
            0.4,
          );
        }
      });

      // From here GSAP owns the start states (see globals.css).
      el.setAttribute("data-motion-ready", "");
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} data-motion-root className={className}>
      {children}
    </div>
  );
}

/** A number that counts up to `value`, and glides when `value` changes. */
export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const proxy = { value: current.current };
    const tween = gsap.to(proxy, {
      value,
      duration: reduce ? 0 : 1.4,
      ease: "power3.out",
      onUpdate: () => {
        current.current = proxy.value;
        setShown(Math.round(proxy.value));
      },
    });
    return () => {
      tween.kill();
    };
  }, [value]);

  return (
    <span className={className}>
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
