import Link from "next/link";
import type { ReactNode } from "react";
import { container, Logo } from "@/components/landing/ui";
import { APP_NAME } from "@/lib/site";

/** Shared frame for the log in and sign up pages: logo, then a centred card. */
export function AuthShell({
  title,
  lead,
  children,
}: {
  title: string;
  lead: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className={`${container} flex h-16 items-center`}>
        <Link
          href="/"
          aria-label={`${APP_NAME} home`}
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Logo />
        </Link>
      </header>

      <main
        id="main"
        className={`${container} flex flex-1 flex-col items-center justify-center pt-6 pb-20`}
      >
        <div className="w-full max-w-md rounded-4xl border border-line bg-surface p-7 shadow-float sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 leading-7 text-pretty text-ink-muted">{lead}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </>
  );
}
