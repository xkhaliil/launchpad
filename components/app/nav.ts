import {
  FileText,
  FolderCheck,
  GitBranch,
  Globe,
  House,
  IdCard,
  type LucideIcon,
  Send,
  Settings,
  UserRound,
} from "lucide-react";
import type { AppMetrics } from "@/lib/demo/selectors";

/** How a number next to a nav item should read. */
export type NavValue = {
  text: string;
  /** "done": complete; "attention": something is waiting for you. */
  tone?: "done" | "attention";
  /** Spoken instead of the short text, for screen readers. */
  label: string;
};

/**
 * Screens are grouped by what the student is trying to do, not by module:
 * get their basics right, apply for jobs, and be found online.
 */
export type NavGroup = "Start" | "Apply" | "Get found" | "Account";

export const NAV_GROUPS: { id: NavGroup; label: string | null }[] = [
  { id: "Start", label: null },
  { id: "Apply", label: "Apply" },
  { id: "Get found", label: "Get found" },
];

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  value?: (m: AppMetrics) => NavValue | undefined;
};

const percent = (value: number, what: string): NavValue => ({
  text: `${value}%`,
  tone: value >= 100 ? "done" : undefined,
  label: `${value}% ${what}`,
});

/** Every app screen, in sidebar order. Shared by the sidebar, the phone
 * "More" sheet, the bottom bar and the search palette. */
export const NAV: NavEntry[] = [
  { href: "/dashboard", label: "Home", icon: House, group: "Start" },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
    group: "Start",
    value: (m) => percent(m.profile, "complete"),
  },
  {
    href: "/cv",
    label: "CV",
    icon: FileText,
    group: "Apply",
    value: (m) => ({
      text: String(m.ats),
      tone: m.ats >= 85 ? "done" : undefined,
      label: `ATS score ${m.ats}`,
    }),
  },
  {
    href: "/jobs",
    label: "Applications",
    icon: Send,
    group: "Apply",
    value: (m) => ({ text: String(m.jobs), label: `${m.jobs} job ads saved` }),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderCheck,
    group: "Apply",
    value: (m) => ({
      text: `${m.docsUploaded}/${m.docsRequired}`,
      tone: m.docsUploaded === m.docsRequired ? "done" : undefined,
      label: `${m.docsUploaded} of ${m.docsRequired} required documents uploaded`,
    }),
  },
  {
    href: "/linkedin",
    label: "LinkedIn",
    icon: IdCard,
    group: "Get found",
    value: (m) => ({
      text: `${m.linkedinDone}/${m.linkedinTotal}`,
      tone: m.linkedinDone === m.linkedinTotal ? "done" : undefined,
      label: `${m.linkedinDone} of ${m.linkedinTotal} fields done`,
    }),
  },
  {
    href: "/github",
    label: "GitHub",
    icon: GitBranch,
    group: "Get found",
    value: (m) =>
      m.toReview > 0
        ? {
            text: String(m.toReview),
            tone: "attention",
            label: `${m.toReview} changes to review`,
          }
        : { text: "Done", tone: "done", label: "all changes reviewed" },
  },
  {
    href: "/website",
    label: "Website",
    icon: Globe,
    group: "Get found",
    value: (m) =>
      m.published
        ? { text: "Live", tone: "done", label: "published" }
        : { text: "Draft", label: "not published" },
  },
  { href: "/settings", label: "Settings", icon: Settings, group: "Account" },
];

export function findNav(pathname: string): NavEntry | undefined {
  return NAV.find(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  );
}
