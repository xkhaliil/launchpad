import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

/**
 * Every signed-in screen. There is no sign-in yet, so these run on demo data
 * kept in the browser (lib/demo/store.ts).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
