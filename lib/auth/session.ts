export type SessionUser = {
  name: string;
};

/**
 * The signed-in user, or `null` for a visitor.
 *
 * Sign-in is not built yet (plan.md, Phase 1: Supabase Auth), so this returns
 * `null` for everyone. This function is the one place the rest of the app asks
 * "who is signed in?", so real sign-in only has to change this file.
 *
 * Development only: set `MOCK_USER_NAME` in `.env.local` to preview the
 * signed-in state. It is ignored in production.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const mockName = process.env.MOCK_USER_NAME?.trim();
  if (process.env.NODE_ENV !== "production" && mockName) {
    return { name: mockName };
  }
  return null;
}

/** Up to two initials for an avatar: first and last word of the name. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return (first + last).toUpperCase();
}
