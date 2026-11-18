"use client";

import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { AppMetrics } from "@/lib/demo/selectors";
import { NAV } from "./nav";

type Command = {
  id: string;
  label: string;
  group: string;
  href: string;
  hint?: string;
  icon?: (typeof NAV)[number]["icon"];
};

/**
 * Search and jump: a keyboard-first list of every screen (Ctrl/Cmd + K).
 * Type to filter, arrows to move, Enter to open, Escape to close.
 */
export function CommandPalette({
  open,
  onClose,
  metrics,
}: {
  open: boolean;
  onClose: () => void;
  metrics: AppMetrics;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const input = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(
    () => [
      ...NAV.map((entry) => ({
        id: entry.href,
        label: entry.label,
        group: entry.group === "Account" ? "Account" : "Go to",
        href: entry.href,
        hint: entry.value?.(metrics)?.text,
        icon: entry.icon,
      })),
      { id: "home", label: "Back to the website", group: "Other", href: "/" },
    ],
    [metrics],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? commands.filter((item) => item.label.toLowerCase().includes(term))
      : commands;
  }, [commands, query]);

  // Focus the field when the palette opens.
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  if (!open) return null;

  const go = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    router.push(command.href);
  };
  const current = Math.min(active, Math.max(results.length - 1, 0));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 starting:opacity-0"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search and jump"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-float transition-[opacity,translate,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] starting:-translate-y-2 starting:scale-[0.98] starting:opacity-0"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((current + 1) % Math.max(results.length, 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive(
              (current - 1 + results.length) % Math.max(results.length, 1),
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            go(results[current]);
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <Search className="size-5 shrink-0 text-ink-muted" aria-hidden />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={
              results[current] ? `${listId}-${current}` : undefined
            }
            aria-label="Search screens"
            placeholder="Search screens…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-muted/70"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-xs text-ink-muted">
            Esc
          </kbd>
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-label="Screens"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-ink-muted">
              Nothing matches “{query}”.
            </li>
          ) : (
            results.map((command, index) => {
              const first =
                index === 0 || results[index - 1].group !== command.group;
              const selected = index === current;
              const Icon = command.icon ?? ArrowUpRight;
              return (
                <li key={command.id} role="presentation">
                  {first ? (
                    <p className="px-3 pt-3 pb-1.5 text-xs text-ink-muted">
                      {command.group}
                    </p>
                  ) : null}
                  <div
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={selected}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(command)}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-[15px] ${
                      selected ? "bg-ink text-paper" : "text-ink"
                    }`}
                  >
                    <Icon
                      aria-hidden
                      strokeWidth={1.75}
                      className={`size-[18px] shrink-0 ${selected ? "text-glow-1" : "text-ink-muted"}`}
                    />
                    <span className="flex-1 truncate">{command.label}</span>
                    {command.hint ? (
                      <span
                        className={`text-xs tabular-nums ${selected ? "text-paper/60" : "text-ink-muted"}`}
                      >
                        {command.hint}
                      </span>
                    ) : null}
                    {selected ? (
                      <CornerDownLeft
                        aria-hidden
                        className="size-4 text-paper/60"
                      />
                    ) : null}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
