"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { EASE, MenuButton } from "@/components/menu-button";
import { APP_NAME } from "@/lib/site";
import { type ContentItem, modules, principles, steps } from "./content";
import { container, Logo } from "./ui";

type Menu = {
  id: string;
  label: string;
  columns: string;
  items: ContentItem[];
};

const menus: Menu[] = [
  {
    id: "modules",
    label: "Modules",
    columns: "grid-cols-2 lg:grid-cols-4",
    items: modules,
  },
  {
    id: "how-it-works",
    label: "How it works",
    columns: "grid-cols-3",
    items: steps,
  },
  {
    id: "principles",
    label: "Principles",
    columns: "grid-cols-2 lg:grid-cols-4",
    items: principles,
  },
];

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** `openId` value while the phone menu is open. */
const MOBILE = "mobile";

/**
 * Transparent header. Each navigation item is a button that opens a panel of
 * cards below the bar. Once the page is scrolled, the bar condenses into a
 * floating glass capsule that stays readable over light and dark sections.
 * On phones the navigation collapses into a menu button.
 *
 * `account` is the right-hand slot: log in / sign up buttons or the avatar.
 * `mobileAccount` is what the phone menu shows below its links (log in and
 * sign up for visitors, nothing when signed in). Both are rendered on the
 * server and passed in (see account.tsx).
 */
export function SiteHeader({
  account,
  mobileAccount,
}: {
  account: ReactNode;
  mobileAccount?: ReactNode;
}) {
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 8,
    () => false,
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const header = useRef<HTMLElement>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  /** When hovering last switched panels, so a click right after is not a close. */
  const switchedAt = useRef(0);

  const mobileOpen = openId === MOBILE;

  // While the phone menu is open the page behind it does not scroll. Widening
  // the window past phone size closes the menu, since it is hidden there.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = () => wide.matches && setOpenId(null);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = previous;
      wide.removeEventListener("change", onWide);
    };
  }, [mobileOpen]);

  // Next keeps a page mounted but hidden after navigating away. Close the
  // panel then, so coming back does not show a menu that was left open.
  useLayoutEffect(() => {
    return () => setOpenId(null);
  }, []);

  useEffect(() => {
    if (openId === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      triggers.current.get(openId)?.focus();
      setOpenId(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpenId(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openId]);

  return (
    <header
      ref={header}
      onBlur={(event) => {
        // Phone menu: close when focus leaves the header and the menu.
        const next = event.relatedTarget as Node | null;
        if (mobileOpen && !event.currentTarget.contains(next)) {
          setOpenId(null);
        }
      }}
      className="sticky top-0 z-40 h-16"
    >
      {/* From tablet width, 1fr / auto / 1fr keeps the nav centred whatever
          the widths of the logo and the account buttons. On phones there is
          no centre nav, so the row is a simple space-between. */}
      <div
        className={`mx-auto flex items-center justify-between border transition-[width,max-width,height,margin,padding,border-radius,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:grid md:grid-cols-[1fr_auto_1fr] ${
          scrolled
            ? "mt-3 h-13 w-[calc(100%-1.5rem)] max-w-4xl rounded-[1.625rem] border-ink/10 bg-paper/88 pr-2 pl-5 shadow-pill backdrop-blur-xl backdrop-saturate-150 sm:pl-6"
            : "mt-0 h-16 w-full max-w-6xl rounded-none border-transparent px-5 sm:px-8"
        }`}
      >
        <a
          href="#top"
          aria-label={`${APP_NAME} home`}
          onClick={() => setOpenId(null)}
          className="justify-self-start rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {menus.map((menu) => {
              const isOpen = openId === menu.id;
              const panelId = `nav-${menu.id}`;
              return (
                <li
                  key={menu.id}
                  onBlur={(event) => {
                    // Close when focus leaves this item's button and panel.
                    const next = event.relatedTarget as Node | null;
                    if (isOpen && !event.currentTarget.contains(next)) {
                      setOpenId(null);
                    }
                  }}
                >
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) triggers.current.set(menu.id, node);
                      else triggers.current.delete(menu.id);
                    }}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={(event) => {
                      const justSwitched =
                        event.timeStamp - switchedAt.current < 400;
                      if (isOpen && justSwitched) return;
                      setOpenId(isOpen ? null : menu.id);
                    }}
                    onPointerEnter={(event) => {
                      // With a panel already open, hovering switches panels.
                      const mouse = event.pointerType === "mouse";
                      if (mouse && openId !== null && !isOpen) {
                        switchedAt.current = event.timeStamp;
                        setOpenId(menu.id);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors hover:bg-surface/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isOpen
                        ? "bg-surface/70 text-ink"
                        : openId === null
                          ? "text-ink"
                          : "text-ink/60"
                    }`}
                  >
                    {menu.label}
                    <ChevronDown
                      aria-hidden
                      strokeWidth={2.5}
                      className={`size-4 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen ? (
                    <div
                      id={panelId}
                      className="absolute inset-x-0 top-full pt-2"
                    >
                      <div className={container}>
                        <div
                          tabIndex={-1}
                          className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-3xl border border-line bg-sand p-3 shadow-float transition-[opacity,translate] duration-200 outline-none starting:-translate-y-2 starting:opacity-0"
                        >
                          <ul className={`grid gap-3 ${menu.columns}`}>
                            {menu.items.map((item) => (
                              <li key={item.id}>
                                <a
                                  href={`#${item.id}`}
                                  onClick={() => setOpenId(null)}
                                  className="group relative flex h-full min-h-48 flex-col overflow-hidden rounded-2xl bg-surface p-5 transition-colors duration-200 hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                                >
                                  <span className="text-xl leading-6 font-medium tracking-tight text-balance">
                                    {item.title}
                                  </span>
                                  <span className="mt-2 max-w-[21ch] text-sm leading-5 text-ink-muted transition-colors duration-200 group-hover:text-paper/70 group-focus-visible:text-paper/70">
                                    {item.summary}
                                  </span>
                                  <item.icon
                                    aria-hidden
                                    strokeWidth={1.25}
                                    className="absolute -right-3 -bottom-3 size-20 text-accent/25 transition-colors duration-200 group-hover:text-glow-1/40 group-focus-visible:text-glow-1/40"
                                  />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="col-start-3 flex shrink-0 items-center gap-1 justify-self-end">
          {account}
          <MenuButton
            ref={(node) => {
              if (node) triggers.current.set(MOBILE, node);
              else triggers.current.delete(MOBILE);
            }}
            open={mobileOpen}
            controls="nav-mobile"
            onClick={() => setOpenId(mobileOpen ? null : MOBILE)}
            className="ml-1 md:hidden"
          />
        </div>
      </div>

      {/* Phone menu: a dark sheet with large numbered links that arrive one
          after another, then the account links. A dimmed backdrop covers the
          page behind it and closes the menu when tapped. */}
      {mobileOpen ? (
        <>
          <div
            aria-hidden
            onClick={() => setOpenId(null)}
            className="fixed inset-0 -z-10 bg-ink/35 backdrop-blur-sm transition-opacity duration-300 md:hidden starting:opacity-0"
          />
          <div
            id="nav-mobile"
            className="absolute inset-x-0 top-full px-3 pt-2 md:hidden"
          >
            <nav
              aria-label="Menu"
              className={`max-h-[calc(100dvh-5.5rem)] origin-top overflow-y-auto rounded-4xl bg-ink p-3 text-paper shadow-float transition-[opacity,scale,translate] duration-500 ${EASE} starting:-translate-y-3 starting:scale-[0.96] starting:opacity-0`}
            >
              <ul>
                {menus.map((menu, index) => (
                  <li
                    key={menu.id}
                    style={{ transitionDelay: `${100 + index * 70}ms` }}
                    className={`border-b border-paper/10 transition-[opacity,translate] duration-500 ${EASE} last:border-b-0 starting:translate-y-5 starting:opacity-0`}
                  >
                    <a
                      href={`#${menu.id}`}
                      onClick={() => setOpenId(null)}
                      className="group flex min-h-18 items-center justify-between rounded-2xl px-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow-1 active:bg-paper/10"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="text-xs text-glow-1 tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[1.75rem] leading-none font-medium tracking-tight">
                          {menu.label}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-6 text-paper/50 transition-transform duration-300 group-active:translate-x-0.5 group-active:-translate-y-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
              <div
                style={{ transitionDelay: `${100 + menus.length * 70}ms` }}
                className={`transition-[opacity,translate] duration-500 ${EASE} starting:translate-y-5 starting:opacity-0`}
              >
                {mobileAccount}
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
