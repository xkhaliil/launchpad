import {
  FileText,
  FolderCheck,
  Gauge,
  GitBranch,
  Globe,
  IdCard,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  Settings,
  Target,
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

export type NavEntry = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: "Overview" | "Build" | "Account";
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
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserRound,
    group: "Overview",
    value: (m) => percent(m.profile, "complete"),
  },
  {
    href: "/evaluation",
    label: "Evaluation",
    icon: Gauge,
    group: "Overview",
    value: (m) => ({
      text: String(m.readiness),
      label: `readiness ${m.readiness} of 100`,
    }),
  },
  {
    href: "/cv",
    label: "CV & ATS check",
    icon: FileText,
    group: "Build",
    value: (m) => ({
      text: String(m.ats),
      tone: m.ats >= 85 ? "done" : undefined,
      label: `ATS score ${m.ats}`,
    }),
  },
  {
    href: "/cover-letters",
    label: "Cover letters",
    icon: Mail,
    group: "Build",
    value: (m) => percent(m.letters, "done"),
  },
  {
    href: "/jobs",
    label: "Job ads",
    icon: Target,
    group: "Build",
    value: (m) => ({ text: String(m.jobs), label: `${m.jobs} job ads saved` }),
  },
  {
    href: "/linkedin",
    label: "LinkedIn studio",
    icon: IdCard,
    group: "Build",
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
    group: "Build",
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
    group: "Build",
    value: (m) =>
      m.published
        ? { text: "Live", tone: "done", label: "published" }
        : { text: "Draft", label: "not published" },
  },
  {
    href: "/documents",
    label: "Documents",
    icon: FolderCheck,
    group: "Build",
    value: (m) => ({
      text: `${m.docsUploaded}/${m.docsRequired}`,
      tone: m.docsUploaded === m.docsRequired ? "done" : undefined,
      label: `${m.docsUploaded} of ${m.docsRequired} required documents uploaded`,
    }),
  },
  { href: "/settings", label: "Settings", icon: Settings, group: "Account" },
];

export function findNav(pathname: string): NavEntry | undefined {
  return NAV.find(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  );
}
