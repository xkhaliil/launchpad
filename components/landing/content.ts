import {
  BadgeCheck,
  FileText,
  FolderCheck,
  Gauge,
  GitBranch,
  GitCompareArrows,
  Globe,
  IdCard,
  ListChecks,
  Lock,
  type LucideIcon,
  Mail,
  PenLine,
  ShieldCheck,
  Target,
  Upload,
} from "lucide-react";
import { APP_NAME } from "@/lib/site";

/**
 * One entry of landing-page content. The page sections show `description`;
 * the navigation menu shows the shorter `summary` and links to `#id`.
 */
export type ContentItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  description: string;
};

/** The eight modules from plan.md, section 2, in the same order. */
export const modules: ContentItem[] = [
  {
    id: "module-github",
    icon: GitBranch,
    title: "GitHub profile manager",
    summary: "Audit and polish your profile and repos.",
    description:
      "Audits your profile and repos, then drafts READMEs, descriptions and topics. Nothing changes until you approve it.",
  },
  {
    id: "module-cv",
    icon: FileText,
    title: "CV builder and ATS checker",
    summary: "An ATS-friendly CV, checked the way an ATS reads it.",
    description:
      "Builds an ATS-friendly CV as PDF and DOCX, then checks the real file the way an ATS reads it.",
  },
  {
    id: "module-cover-letter",
    icon: Mail,
    title: "Cover letter",
    summary: "A focused letter drafted from your profile.",
    description:
      "Drafts a focused letter from your profile: three paragraphs, under 250 words, without the clichés.",
  },
  {
    id: "module-tailored",
    icon: Target,
    title: "Tailored versions",
    summary: "A CV and letter matched to each job ad.",
    description:
      "Paste a job ad to get a matching CV and letter, with a match score before and after.",
  },
  {
    id: "module-linkedin",
    icon: IdCard,
    title: "LinkedIn studio",
    summary: "Text for every field, plus a banner and photo.",
    description:
      "Suggested text for every field with copy buttons, plus a banner generator and a profile photo tool.",
  },
  {
    id: "module-website",
    icon: Globe,
    title: "Personal website",
    summary: "Your profile as a published site.",
    description:
      "Your profile in a professional template, published on a subdomain, your own domain or GitHub Pages.",
  },
  {
    id: "module-documents",
    icon: FolderCheck,
    title: "Documents pack",
    summary: "A checklist, clean file names and one merged PDF.",
    description:
      "A checklist for degrees, transcripts and references, standard file names and one merged application PDF.",
  },
  {
    id: "module-consistency",
    icon: GitCompareArrows,
    title: "Consistency checker",
    summary: "Flags mismatches across everything you send.",
    description:
      "Compares names, titles, dates and skills across every output and flags what does not match.",
  },
];

export const steps: ContentItem[] = [
  {
    id: "step-import",
    icon: Upload,
    title: "Import what you already have",
    summary: "Upload your CV or LinkedIn PDF to fill in your profile.",
    description: `Upload your current CV or your LinkedIn PDF export. ${APP_NAME} fills in your profile, and you review and complete it.`,
  },
  {
    id: "step-draft",
    icon: PenLine,
    title: "Let AI draft, then approve",
    summary: "You edit and approve every output before it goes anywhere.",
    description:
      "Each module drafts from your profile. You edit and approve every output before it goes anywhere.",
  },
  {
    id: "step-fix",
    icon: ListChecks,
    title: "Fix what matters most",
    summary: "One estimated score and one next step.",
    description:
      "Your dashboard shows an estimated score and one next step: the fix that adds the most points.",
  },
];

/** Product rules from plan.md, sections 0 and 8. */
export const principles: ContentItem[] = [
  {
    id: "principle-facts",
    icon: BadgeCheck,
    title: "Only your facts",
    summary: "No invented details, only clear placeholders.",
    description:
      "AI writes from your profile, your files and your code. Missing details become clear placeholders, never guesses.",
  },
  {
    id: "principle-approval",
    icon: ShieldCheck,
    title: "You approve every change",
    summary: "Nothing touches your GitHub without your approval.",
    description:
      "Nothing is written to your GitHub without your explicit approval, and you see a preview first.",
  },
  {
    id: "principle-scores",
    icon: Gauge,
    title: "Honest scores",
    summary: "Estimates, never a guaranteed pass.",
    description:
      "ATS systems differ between companies, so every score is an estimate. We never promise a guaranteed pass.",
  },
  {
    id: "principle-data",
    icon: Lock,
    title: "Your data stays yours",
    summary: "Stored in the EU and never used to train AI.",
    description:
      "Stored in the EU and never used to train AI models. Export or delete everything whenever you want.",
  },
];
