import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/site";
import { container, Logo, sheet } from "./ui";

const columns = [
  {
    title: "Product",
    links: [
      { href: "#modules", label: "Modules" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#principles", label: "Principles" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Sign up" },
      { href: "/login", label: "Log in" },
    ],
  },
];

const linkStyle =
  "inline-flex min-h-10 items-center rounded transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glow-1";

/** The line that scrolls across the top of the footer. */
const marqueeLine = "One profile. Every application, ready.";

function MarqueeGroup({ hidden }: { hidden?: boolean }) {
  return (
    <div
      aria-hidden={hidden}
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-16 sm:pr-16"
    >
      {[0, 1].map((copy) => (
        <span key={copy} className="flex items-center gap-10 sm:gap-16">
          <span>{marqueeLine}</span>
          <span
            aria-hidden
            className="size-3 rounded-full bg-accent sm:size-5"
          />
        </span>
      ))}
    </div>
  );
}

/**
 * A smooth dark sheet that closes the page. A large line of text scrolls
 * across its top (`data-marquee`); it speeds up with the scroll.
 */
export function SiteFooter() {
  return (
    <footer className={`${sheet} mb-2 overflow-clip bg-ink text-paper sm:mb-4`}>
      {/* Two identical groups side by side; the track moves by one group's
          width and loops. Only the first is read by assistive tech. */}
      <div
        data-marquee
        className="flex overflow-hidden border-b border-paper/15 py-8 text-5xl font-medium tracking-tight whitespace-nowrap text-paper/90 select-none sm:py-12 sm:text-8xl"
      >
        <div data-marquee-track className="flex">
          <MarqueeGroup />
          <MarqueeGroup hidden />
        </div>
      </div>

      <div
        className={`${container} grid gap-10 pt-14 pb-12 sm:grid-cols-[1.6fr_1fr_1fr] sm:pt-16 sm:pb-14`}
      >
        <div>
          <Logo className="text-[28px]" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-paper/65">
            {APP_TAGLINE}. One profile behind every application you send.
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-medium text-paper/55">
              {column.title}
            </h2>
            <ul className="mt-3 text-paper/80">
              {column.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("/") ? (
                    <Link href={link.href} className={linkStyle}>
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className={linkStyle}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={container}>
        <p className="border-t border-paper/15 py-6 text-sm text-paper/55">
          © 2026 {APP_NAME}
        </p>
      </div>
    </footer>
  );
}
