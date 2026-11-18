"use client";

import type { Ref } from "react";

/** Shared easing for menus: quick start, long soft landing. */
export const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * The phone menu button: a dark pill whose label rolls from "Menu" to
 * "Close" while its two lines cross into an X. Used by the landing navbar
 * and the app shell.
 */
export function MenuButton({
  open,
  onClick,
  controls,
  ref,
  className = "",
}: {
  open: boolean;
  onClick: () => void;
  controls: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
      className={`relative inline-flex h-10 shrink-0 items-center gap-2.5 overflow-hidden rounded-full bg-ink pr-3.5 pl-4 text-sm font-medium text-paper transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95 ${className}`}
    >
      <span aria-hidden className="relative block h-5 shrink-0 overflow-hidden">
        <span
          className={`block transition-transform duration-500 ${EASE} ${
            open ? "-translate-y-5" : ""
          }`}
        >
          <span className="block h-5 leading-5">Menu</span>
          <span className="block h-5 leading-5">Close</span>
        </span>
      </span>
      <span aria-hidden className="relative block size-4">
        <span
          className={`absolute left-0 h-[1.5px] w-4 rounded-full bg-current transition-all duration-500 ${EASE} ${
            open ? "top-1.75 rotate-45" : "top-1"
          }`}
        />
        <span
          className={`absolute left-0 h-[1.5px] rounded-full bg-current transition-all duration-500 ${EASE} ${
            open ? "top-1.75 w-4 -rotate-45" : "top-2.5 w-2.5"
          }`}
        />
      </span>
    </button>
  );
}
