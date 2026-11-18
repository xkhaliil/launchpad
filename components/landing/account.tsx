import Link from "next/link";
import { getCurrentUser, initials, type SessionUser } from "@/lib/auth/session";
import { buttonPrimary } from "./ui";

/** Right-hand side of the navbar: an avatar when signed in, buttons when not. */
export async function Account() {
  const user = await getCurrentUser();
  return user ? <UserAvatar user={user} /> : <AuthButtons />;
}

/**
 * Log in and sign up. Also what the navbar shows while the signed-in state is
 * being looked up, so the links are in the page's HTML even before (or
 * without) scripts. Once real sign-in exists, a signed-in person would see
 * these for a moment before their avatar; revisit this default then.
 */
export function AuthButtons() {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/login"
        className="hidden rounded-full px-3.5 py-2 text-[15px] font-medium text-ink transition-colors hover:bg-surface/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:block"
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={`${buttonPrimary} h-10 shrink-0 px-4 text-sm whitespace-nowrap sm:h-9`}
      >
        Sign up
      </Link>
    </div>
  );
}

/** Bottom of the phone menu: nothing when signed in, the links when not. */
export async function MobileAccount() {
  const user = await getCurrentUser();
  return user ? null : <MobileAuthLinks />;
}

/** Log in and sign up as two full-width buttons, for the dark phone menu. */
export function MobileAuthLinks() {
  const base =
    "inline-flex h-12 items-center justify-center rounded-full text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow-1";
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Link
        href="/login"
        className={`${base} border border-paper/25 text-paper active:bg-paper/10`}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={`${base} bg-paper text-ink active:bg-paper/85`}
      >
        Sign up
      </Link>
    </div>
  );
}

function UserAvatar({ user }: { user: SessionUser }) {
  return (
    <span
      role="img"
      aria-label={`Signed in as ${user.name}`}
      title={user.name}
      className="grid size-9 place-items-center rounded-full bg-ink text-sm font-semibold text-paper ring-2 ring-surface/70"
    >
      {initials(user.name)}
    </span>
  );
}
