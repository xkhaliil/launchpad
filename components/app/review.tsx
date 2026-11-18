"use client";

import { ArrowRight, Check, Info, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LinkedinSuggestions } from "@/lib/ai/provider";
import { ai } from "@/lib/ai/mock";
import {
  matchProfileValue,
  replaceBullet,
  setLinkedinDone,
} from "@/lib/demo/actions";
import { setBioStatus, updateProposal } from "@/lib/demo/github";
import { evaluation } from "@/lib/demo/selectors";
import { useDemo } from "@/lib/demo/store";
import {
  pendingSuggestions,
  readyToAccept,
  REVIEW_AREAS,
  REVIEW_FOR,
  type ReviewArea,
  type Suggestion,
} from "@/lib/demo/suggestions";
import { Markdown } from "./markdown";
import { CountUp } from "./motion";
import { btn, Disclosure } from "./ui";

/*
 * Review: the one way to act on what the app proposes. One suggestion at a
 * time, with Accept / Skip, and the next one appears by itself. Opened from
 * the top bar, the phone tab bar, Home's next step and each screen.
 */

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type OpenOptions = { area?: ReviewArea; first?: string };

type ReviewApi = {
  open: (options?: OpenOptions) => void;
  /** Suggestions still open, everywhere or in one area. */
  count: number;
  countFor: (area: ReviewArea) => number;
  /** The AI's LinkedIn text, shared with the LinkedIn screen. */
  linkedin: LinkedinSuggestions | null;
};

const ReviewContext = createContext<ReviewApi | null>(null);

export function useReview(): ReviewApi {
  const api = useContext(ReviewContext);
  if (!api) throw new Error("useReview() needs <ReviewProvider>.");
  return api;
}

type Session = {
  area?: ReviewArea;
  first?: string;
  /** How many there were when it opened, for "2 of 5". */
  total: number;
  startScore: number;
};

function acceptLabel(suggestion: Suggestion) {
  if (suggestion.mode === "copy") return "Copy and mark done";
  if (suggestion.mode === "approve") return "Approve";
  if (suggestion.target.kind === "github-bio") return "Apply on GitHub";
  if (suggestion.target.kind === "mismatch") return "Use profile value";
  return "Use this";
}

export function ReviewProvider({ children }: { children: ReactNode }) {
  const state = useDemo();
  const pathname = usePathname();
  const [linkedin, setLinkedin] = useState<LinkedinSuggestions | null>(null);
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(new Set());
  const [session, setSession] = useState<Session | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  // LinkedIn text comes from the AI provider, once per profile version.
  useEffect(() => {
    let cancelled = false;
    ai.suggestLinkedin(state.profile).then((result) => {
      if (!cancelled) setLinkedin(result);
    });
    return () => {
      cancelled = true;
    };
  }, [state.profile]);

  const pending = useMemo(
    () =>
      pendingSuggestions(state, linkedin).filter(
        (item) => !skipped.has(item.id),
      ),
    [state, linkedin, skipped],
  );

  const countFor = useCallback(
    (area: ReviewArea) =>
      pending.filter((item) => item.areas.includes(area)).length,
    [pending],
  );

  const open = useCallback(
    ({ area, first }: OpenOptions = {}) => {
      opener.current = document.activeElement as HTMLElement | null;
      if (first) {
        setSkipped((previous) => {
          const next = new Set(previous);
          next.delete(first);
          return next;
        });
      }
      setFlash(null);
      setSession({
        area,
        first,
        total: pending.filter((item) => !area || item.areas.includes(area))
          .length,
        startScore: evaluation(state).total,
      });
    },
    [pending, state],
  );

  const close = useCallback(() => {
    setSession(null);
    opener.current?.focus?.();
  }, []);

  // Next keeps pages mounted after navigating; close on the way out.
  useEffect(() => {
    return () => setSession(null);
  }, [pathname]);

  // The page behind does not scroll.
  useEffect(() => {
    if (!session) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [session]);

  const api = useMemo<ReviewApi>(
    () => ({ open, count: pending.length, countFor, linkedin }),
    [open, pending.length, countFor, linkedin],
  );

  const queue = session
    ? (() => {
        const list = pending.filter(
          (item) => !session.area || item.areas.includes(session.area),
        );
        const index = list.findIndex((item) => item.id === session.first);
        return index > 0
          ? [list[index], ...list.slice(0, index), ...list.slice(index + 1)]
          : list;
      })()
    : [];

  const accept = async (suggestion: Suggestion, text: string) => {
    if (suggestion.mode === "copy") {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Clipboard blocked: the text was on screen to select by hand.
      }
    }
    const { target } = suggestion;
    if (target.kind === "github-bio") setBioStatus("applied");
    if (target.kind === "repo") {
      // Approved now; written to GitHub later, after a dry run.
      updateProposal(target.name, {
        description: text.trim(),
        status: "approved",
      });
    }
    if (target.kind === "linkedin") setLinkedinDone(target.field, true);
    if (target.kind === "bullet") replaceBullet(target.before, text.trim());
    if (target.kind === "mismatch")
      matchProfileValue(target.sourceId, target.field, suggestion.after);
    setFlash(
      suggestion.mode === "copy"
        ? "Copied"
        : suggestion.mode === "approve"
          ? "Approved"
          : "Applied",
    );
  };

  const skip = (suggestion: Suggestion) => {
    // GitHub keeps "skipped" so the GitHub screen can show it and undo it.
    const { target } = suggestion;
    if (target.kind === "github-bio") setBioStatus("skipped");
    else if (target.kind === "repo") {
      updateProposal(target.name, { status: "skipped" });
    } else {
      setSkipped((previous) => new Set(previous).add(suggestion.id));
    }
    setFlash("Skipped");
  };

  return (
    <ReviewContext.Provider value={api}>
      {children}
      {session ? (
        <ReviewPanel
          session={session}
          queue={queue}
          flash={flash}
          onAccept={accept}
          onSkip={skip}
          onClose={close}
          onArea={(area) => open({ area })}
        />
      ) : null}
    </ReviewContext.Provider>
  );
}

/* ------------------------------------------------------------------ */

function ReviewPanel({
  session,
  queue,
  flash,
  onAccept,
  onSkip,
  onClose,
  onArea,
}: {
  session: Session;
  queue: Suggestion[];
  flash: string | null;
  onAccept: (suggestion: Suggestion, text: string) => void;
  onSkip: (suggestion: Suggestion) => void;
  onClose: () => void;
  onArea: (area: ReviewArea) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const current = queue[0];
  const total = Math.max(session.total, queue.length);
  const done = total - queue.length;
  const title = session.area
    ? `Review · ${REVIEW_AREAS[session.area].label}`
    : "Review";

  // Escape closes, wherever focus is (it can drop to the page when an
  // accepted suggestion is replaced by the next one).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep keyboard focus inside the panel.
  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key !== "Tab" || !panel.current) return;
    const items = [
      ...panel.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea, input, summary",
      ),
    ];
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-300 starting:opacity-0"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onKeyDown={onKeyDown}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[1.75rem] bg-paper pb-[env(safe-area-inset-bottom)] shadow-float transition-transform duration-500 ${EASE} lg:inset-y-3 lg:right-3 lg:left-auto lg:max-h-none lg:w-120 lg:rounded-[1.75rem] lg:pb-0 starting:translate-y-full lg:starting:translate-x-[110%] lg:starting:translate-y-0`}
      >
        {/* Header and progress */}
        <div className="px-5 pt-5 lg:px-7 lg:pt-6">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p id="review-title" className="font-medium">
                {title}
              </p>
              <p className="text-sm text-ink-muted tabular-nums">
                {current ? `${done + 1} of ${total}` : "Nothing left"}
                {flash ? (
                  <span
                    key={`${flash}-${done}`}
                    className="ml-2 inline-flex items-center gap-1 text-success transition-opacity duration-300 starting:opacity-0"
                  >
                    <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    {flash}
                  </span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close review"
              className={`grid size-10 place-items-center rounded-full bg-ink/5 text-ink transition-colors hover:bg-ink/10 ${focusRing}`}
            >
              <X className="size-4.5" aria-hidden />
            </button>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink/8">
            <div
              className={`h-full rounded-full bg-accent transition-[width] duration-500 ${EASE}`}
              style={{ width: `${total ? (done / total) * 100 : 100}%` }}
            />
          </div>
          <p className="sr-only" aria-live="polite">
            {flash ? `${flash}. ${queue.length} left.` : ""}
          </p>
        </div>

        {current ? (
          <SuggestionView
            key={current.id}
            suggestion={current}
            onAccept={onAccept}
            onSkip={onSkip}
          />
        ) : (
          <Finished session={session} onClose={onClose} onArea={onArea} />
        )}
      </div>
    </div>
  );
}

function SuggestionView({
  suggestion,
  onAccept,
  onSkip,
}: {
  suggestion: Suggestion;
  onAccept: (suggestion: Suggestion, text: string) => void;
  onSkip: (suggestion: Suggestion) => void;
}) {
  const [text, setText] = useState(suggestion.after);
  const field = useRef<HTMLTextAreaElement>(null);
  const acceptButton = useRef<HTMLButtonElement>(null);
  const ready = readyToAccept(suggestion, text);
  const placeholder = /\[ADD:[^\]]*\]/.test(text);

  // Editable text: select the part to fill in, so typing replaces it.
  useEffect(() => {
    const element = field.current;
    if (!element) {
      acceptButton.current?.focus();
      return;
    }
    element.focus();
    const start = element.value.indexOf("[ADD:");
    if (start >= 0) {
      element.setSelectionRange(start, element.value.indexOf("]", start) + 1);
    }
  }, []);

  const accept = () => {
    if (ready) onAccept(suggestion, text);
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-7 pb-6 transition-[opacity,translate] duration-300 lg:px-7 starting:translate-x-3 starting:opacity-0">
        <p className="text-sm text-ink-muted">{suggestion.where}</p>
        <h2 className="mt-1 text-2xl leading-tight font-medium tracking-tight text-balance">
          {suggestion.title}
        </h2>

        {suggestion.before !== null ? (
          <div className="mt-6">
            <p className="text-xs font-medium text-ink-muted">Now</p>
            <p className="mt-1.5 text-[15px] leading-6 wrap-break-word text-ink-muted">
              {suggestion.before}
            </p>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-xs font-medium text-accent-strong">
            {suggestion.mode === "copy"
              ? "To paste"
              : suggestion.target.kind === "repo"
                ? "Suggested description"
                : "Suggested"}
          </p>
          {suggestion.editable ? (
            <>
              <label htmlFor="review-text" className="sr-only">
                Suggested text, you can change it
              </label>
              <textarea
                id="review-text"
                ref={field}
                rows={3}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.metaKey || event.ctrlKey)
                  ) {
                    event.preventDefault();
                    accept();
                  }
                }}
                className="mt-1.5 block w-full resize-none rounded-2xl bg-surface p-4 text-[15px] leading-6 ring-1 ring-line focus:ring-2 focus:ring-accent/50 focus:outline-none"
              />
              {placeholder ? (
                <p className="mt-2 text-sm text-accent-strong">
                  Type over the highlighted [ADD: …] part to continue.
                </p>
              ) : null}
            </>
          ) : suggestion.multiline ? (
            <pre className="mt-1.5 max-h-80 overflow-auto rounded-2xl bg-surface p-4 font-sans text-sm leading-6 whitespace-pre-wrap ring-1 ring-line">
              {suggestion.after}
            </pre>
          ) : (
            <p className="mt-1.5 rounded-2xl bg-surface p-4 text-[15px] leading-6 wrap-break-word ring-1 ring-line">
              {suggestion.after}
            </p>
          )}
        </div>

        {suggestion.details ? (
          <ProposalDetails details={suggestion.details} />
        ) : null}

        <p className="mt-4 flex gap-2 text-sm leading-6 text-ink-muted">
          <Info className="mt-1 size-4 shrink-0" aria-hidden />
          {suggestion.why}
        </p>
        {suggestion.call ? (
          <p className="mt-3 rounded-xl bg-ink/4 px-3 py-2 font-mono text-xs leading-5 break-all text-ink-muted">
            <span className="font-sans font-medium text-ink">Dry run: </span>
            {suggestion.call}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-5 py-4 lg:px-7">
        <button
          type="button"
          className={btn.ghost}
          onClick={() => onSkip(suggestion)}
        >
          Skip
        </button>
        <span className="ml-auto hidden text-xs text-ink-muted sm:inline">
          {suggestion.editable ? "Ctrl + Enter" : "Enter"}
        </span>
        <button
          ref={acceptButton}
          type="button"
          disabled={!ready}
          onClick={accept}
          className={`${btn.primary} h-11 px-5`}
        >
          <Check className="size-4" aria-hidden />
          {acceptLabel(suggestion)}
        </button>
      </div>
    </>
  );
}

const CONFIDENCE_TONE = {
  high: "bg-success-soft text-success",
  medium: "bg-accent-soft text-accent-strong",
  low: "bg-danger/10 text-danger",
} as const;

/** The rest of a repo proposal: topics, README, confidence, what is unknown. */
function ProposalDetails({
  details,
}: {
  details: NonNullable<Suggestion["details"]>;
}) {
  return (
    <div className="mt-5 space-y-4">
      <div>
        <p className="text-xs font-medium text-ink-muted">Topics</p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {details.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-ink/5 px-2.5 py-0.5 font-mono text-xs"
            >
              {topic}
            </li>
          ))}
        </ul>
      </div>
      {details.homepage ? (
        <p className="text-sm">
          <span className="text-xs font-medium text-ink-muted">Homepage </span>
          {details.homepage}
        </p>
      ) : null}
      <Disclosure summary="Read the README">
        <div className="max-h-96 overflow-y-auto rounded-2xl bg-surface p-4 ring-1 ring-line">
          <Markdown source={details.readme} />
        </div>
      </Disclosure>
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CONFIDENCE_TONE[details.confidence]}`}
        >
          {details.confidence} confidence
        </span>
        {details.confidence === "low" ? (
          <span className="text-ink-muted">Read it closely.</span>
        ) : null}
      </p>
      {details.unknowns.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-ink-muted">Left out</p>
          <ul className="mt-1 space-y-1 text-sm text-ink-muted">
            {details.unknowns.map((unknown) => (
              <li key={unknown}>· {unknown}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Shown when the queue is empty: what changed, and what to do next. */
function Finished({
  session,
  onClose,
  onArea,
}: {
  session: Session;
  onClose: () => void;
  onArea: (area: ReviewArea) => void;
}) {
  const state = useDemo();
  const { countFor } = useReview();
  const result = evaluation(state);
  const gained = result.total - session.startScore;
  // First what continues this area outside review (approved GitHub drafts
  // still need applying), then the best fix elsewhere.
  const sameArea = session.area
    ? result.topFixes.find(
        (fix) =>
          REVIEW_FOR[fix.areaId] === session.area &&
          countFor(session.area as ReviewArea) === 0,
      )
    : undefined;
  const next =
    sameArea ??
    result.topFixes.find(
      (fix) => !session.area || REVIEW_FOR[fix.areaId] !== session.area,
    );
  const nextArea = next ? REVIEW_FOR[next.areaId] : undefined;
  const canReview = nextArea !== undefined && countFor(nextArea) > 0;
  const nextButton = `${btn.primary} h-12 w-full justify-between px-5`;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center transition-opacity duration-500 lg:px-8 starting:opacity-0">
      <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
        <Check className="size-7" strokeWidth={2.5} aria-hidden />
      </span>
      <h2 className="mt-5 text-2xl font-medium tracking-tight">
        {session.area
          ? `${REVIEW_AREAS[session.area].label} is done`
          : "All caught up"}
      </h2>
      <p className="mt-2 text-ink-muted">
        Readiness{" "}
        <CountUp
          value={result.total}
          className="font-medium text-ink tabular-nums"
        />
        /100
        {gained > 0 ? (
          <span className="ml-1.5 text-success">+{gained}</span>
        ) : null}
      </p>

      {next ? (
        <div className="mt-10 w-full max-w-sm text-left">
          <p className="mb-2 text-sm text-ink-muted">
            Next step · +{next.gain} points
          </p>
          {canReview && nextArea ? (
            <button
              type="button"
              className={nextButton}
              onClick={() => onArea(nextArea)}
              autoFocus
            >
              <span className="truncate">{next.fix}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </button>
          ) : (
            <Link
              href={next.href}
              className={nextButton}
              onClick={onClose}
              autoFocus
            >
              <span className="truncate">{next.fix}</span>
              <ArrowRight className="size-4 shrink-0" aria-hidden />
            </Link>
          )}
        </div>
      ) : null}
      <button
        type="button"
        className={`${btn.ghost} mt-3`}
        onClick={onClose}
        autoFocus={!next}
      >
        Close
      </button>
    </div>
  );
}
