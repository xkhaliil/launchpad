import type { ConsistencyField } from "@/lib/core/consistency";
import type { Profile } from "@/lib/core/types";

/*
 * Demo data for the app UI. Every person, company and number here is made
 * up. It stands in for what the database and the APIs will return once they
 * are connected (plan.md, Phase 1).
 */

export const demoProfile: Profile = {
  fullName: "Ada Lovelace",
  headline: "Backend developer",
  summary:
    "Final-year computer science student who builds backend services in Go and Python. Interned on a logistics API used by 40k lookups a day, and enjoys making slow systems fast.",
  location: "Berlin, Germany",
  email: "ada.lovelace@example.com",
  phone: "+49 30 1234 5678",
  links: {
    github: "github.com/ada-lovelace",
    linkedin: "linkedin.com/in/ada-lovelace",
  },
  targetRole: "Backend developer",
  experienceLevel: "student",
  experiences: [
    {
      id: "exp-northwind",
      company: "Northwind Logistics",
      title: "Software Engineering Intern",
      location: "Berlin",
      start: "2025-03",
      end: "2025-09",
      bullets: [
        "Built a REST API in Go that serves 40k shipment lookups a day",
        "Cut report generation from 12 to 3 minutes by moving queries to PostgreSQL views",
        "Wrote integration tests for the billing service",
      ],
    },
    {
      id: "exp-tutor",
      company: "TU Berlin",
      title: "Teaching Assistant, Algorithms",
      location: "Berlin",
      start: "2024-10",
      end: "2025-02",
      bullets: [
        "Ran weekly tutorials for 30 students",
        "Responsible for grading assignments",
      ],
    },
  ],
  projects: [
    {
      id: "proj-route",
      name: "route-planner",
      description: "Route planner for campus buses.",
      tech: ["Go", "PostgreSQL", "Docker"],
      repoUrl: "github.com/ada-lovelace/route-planner",
      bullets: ["Designed a routing service that answers in under 50 ms"],
    },
    {
      id: "proj-study",
      name: "study-buddy",
      description: "Shared study plans for student groups.",
      tech: ["TypeScript", "React", "Supabase"],
      repoUrl: "github.com/ada-lovelace/study-buddy",
      liveUrl: "study-buddy.example.com",
      bullets: ["Shipped to 120 classmates in the first term"],
    },
  ],
  educations: [
    {
      id: "edu-tu",
      school: "TU Berlin",
      degree: "BSc",
      field: "Computer Science",
      start: "2022-10",
      end: "2026-03",
      grade: "1.7",
    },
  ],
  skills: [
    { name: "Go", category: "language" },
    { name: "Python", category: "language" },
    { name: "TypeScript", category: "language" },
    { name: "PostgreSQL", category: "tool" },
    { name: "Docker", category: "tool" },
    { name: "Git", category: "tool" },
    { name: "React", category: "framework" },
    { name: "REST API", category: "other" },
  ],
  languages: [
    { name: "English", level: "C1" },
    { name: "German", level: "B2" },
  ],
  certifications: [
    {
      id: "cert-aws",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2025-06",
    },
  ],
};

/** What LinkedIn and GitHub show today, before any fix (consistency checker). */
export const demoSources: Record<
  "linkedin" | "github",
  Partial<Record<ConsistencyField, string>>
> = {
  linkedin: {
    fullName: "Ada Lovelace",
    headline: "Full-stack dev | Go & Python",
    location: "Berlin",
  },
  github: {
    fullName: "Ada Lovelace",
    headline: "Full-stack dev",
    location: "Berlin",
  },
};

export type Repo = {
  name: string;
  description: string;
  topics: string[];
  languages: string[];
  hasReadme: boolean;
  isFork: boolean;
  lastPush: string;
  /** 0 to 100, from the rule-based audit. */
  health: number;
  issues: string[];
};

export const demoRepos: Repo[] = [
  {
    name: "route-planner",
    description: "uni project, final version",
    topics: [],
    languages: ["Go", "PLpgSQL", "Dockerfile"],
    hasReadme: true,
    isFork: false,
    lastPush: "2026-10-02",
    health: 58,
    issues: ["Vague description", "No topics"],
  },
  {
    name: "study-buddy",
    description: "",
    topics: ["react"],
    languages: ["TypeScript", "CSS"],
    hasReadme: false,
    isFork: false,
    lastPush: "2026-09-14",
    health: 41,
    issues: ["No description", "No README", "No live demo link"],
  },
  {
    name: "ml-notebook",
    description: "Experiments from the machine learning course",
    topics: ["python", "jupyter"],
    languages: ["Jupyter Notebook", "Python"],
    hasReadme: true,
    isFork: false,
    lastPush: "2025-02-20",
    health: 72,
    issues: ["Not updated in 21 months"],
  },
  {
    name: "dotfiles",
    description: "",
    topics: [],
    languages: ["Shell"],
    hasReadme: false,
    isFork: true,
    lastPush: "2024-05-01",
    health: 0,
    issues: ["Fork: excluded by default"],
  },
];

export type ChangeKind =
  "bio" | "description" | "topics" | "readme" | "homepage";

export type GithubChange = {
  id: string;
  /** The repo, or `null` for the profile itself. */
  repo: string | null;
  kind: ChangeKind;
  title: string;
  before: string;
  after: string;
  /** Where the facts in `after` come from. */
  evidence: string[];
  confidence: "high" | "medium" | "low";
  /** The API call a dry run shows before applying. */
  call: string;
};

export const demoGithubChanges: GithubChange[] = [
  {
    id: "gh-bio",
    repo: null,
    kind: "bio",
    title: "Profile bio",
    before: "Full-stack dev",
    after: "Backend developer · Go, Python, PostgreSQL · Berlin",
    evidence: [
      "Profile headline",
      "Top skills in your profile",
      "Profile location",
    ],
    confidence: "high",
    call: 'PATCH /user { "bio": "Backend developer · Go, Python, PostgreSQL · Berlin" }',
  },
  {
    id: "gh-route-desc",
    repo: "route-planner",
    kind: "description",
    title: "Description",
    before: "uni project, final version",
    after:
      "Route planner for campus buses, written in Go with a PostgreSQL backend.",
    evidence: [
      "main.go",
      "go.mod",
      "migrations/001_routes.sql",
      "Profile project: route-planner",
    ],
    confidence: "high",
    call: 'PATCH /repos/ada-lovelace/route-planner { "description": "Route planner for campus buses, …" }',
  },
  {
    id: "gh-route-topics",
    repo: "route-planner",
    kind: "topics",
    title: "Topics",
    before: "(none)",
    after: "go, postgresql, docker, rest-api",
    evidence: [
      "go.mod",
      "Dockerfile",
      "docker-compose.yml",
      "internal/http/router.go",
    ],
    confidence: "high",
    call: 'PUT /repos/ada-lovelace/route-planner/topics { "names": ["go", "postgresql", "docker", "rest-api"] }',
  },
  {
    id: "gh-study-readme",
    repo: "study-buddy",
    kind: "readme",
    title: "README",
    before: "(no README)",
    after:
      "# study-buddy\n\nShared study plans for student groups.\n\n## Stack\nTypeScript, React, Supabase\n\n## Run locally\n<!-- TODO: add the commands you use to start the app -->\n\n## Demo\nhttps://study-buddy.example.com",
    evidence: [
      "package.json",
      "src/App.tsx",
      "supabase/config.toml",
      "Profile project: study-buddy",
    ],
    confidence: "medium",
    call: "Open pull request: add README.md to ada-lovelace/study-buddy",
  },
  {
    id: "gh-study-homepage",
    repo: "study-buddy",
    kind: "homepage",
    title: "Website link",
    before: "(none)",
    after: "https://study-buddy.example.com",
    evidence: ["Profile project: study-buddy (live URL)"],
    confidence: "high",
    call: 'PATCH /repos/ada-lovelace/study-buddy { "homepage": "https://study-buddy.example.com" }',
  },
];

export type JobAd = {
  id: string;
  company: string;
  title: string;
  text: string;
  addedOn: string;
  tailored: boolean;
  /** The tailored cover letter, once drafted. */
  letter?: string;
};

export const demoJobAds: JobAd[] = [
  {
    id: "job-helio",
    company: "Helio Payments",
    title: "Junior Backend Engineer",
    text: "Helio Payments is hiring a Junior Backend Engineer in Berlin. You will build payment services in Go, store data in PostgreSQL and ship with Docker and Kubernetes. Experience with REST APIs and CI/CD is a plus. You know your way around Git and Linux.",
    addedOn: "2026-11-10",
    tailored: true,
  },
  {
    id: "job-kite",
    company: "Kite Mobility",
    title: "Graduate Software Engineer",
    text: "Kite Mobility is looking for a graduate software engineer to join our platform team. We work in Python and TypeScript with React on the front end, run on AWS and use Terraform for infrastructure. Bonus: Kafka or Redis.",
    addedOn: "2026-11-14",
    tailored: false,
  },
];

export type DocType =
  "degree" | "transcript" | "reference" | "certificate" | "language" | "visa";

export type DocSpec = {
  type: DocType;
  label: string;
  description: string;
  required: boolean;
  /** Only shown when the student marks themselves as non-EU. */
  nonEuOnly?: boolean;
};

export const docSpecs: DocSpec[] = [
  {
    type: "degree",
    label: "Degree certificate",
    description: "Or proof of enrolment if you have not graduated yet.",
    required: true,
  },
  {
    type: "transcript",
    label: "Transcript of records",
    description: "Your latest grades.",
    required: true,
  },
  {
    type: "reference",
    label: "Reference letter",
    description: "Arbeitszeugnis from an internship or job.",
    required: true,
  },
  {
    type: "certificate",
    label: "Certificates",
    description: "Courses and certifications.",
    required: false,
  },
  {
    type: "language",
    label: "Language certificate",
    description: "For example Goethe, TestDaF or IELTS.",
    required: false,
  },
  {
    type: "visa",
    label: "Visa or work permit",
    description: "Only needed outside the EU.",
    required: true,
    nonEuOnly: true,
  },
];

/** Standard file name: Lastname_Firstname_Type.pdf (plan.md, section 6.7). */
export function standardFileName(fullName: string, label: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  const type = label.split(" ")[0];
  return `${[last, first, type].filter(Boolean).join("_")}.pdf`;
}

export const LINKEDIN_FIELDS = [
  "headline",
  "about",
  "experience",
  "skills",
  "url",
  "banner",
  "photo",
] as const;

export type LinkedinField = (typeof LINKEDIN_FIELDS)[number];

export const WEBSITE_TEMPLATES = [
  { id: "minimal", name: "Minimal", description: "Text first, lots of space." },
  { id: "developer", name: "Developer", description: "Dark, code style." },
  { id: "classic", name: "Classic", description: "Light, project grid." },
  { id: "timeline", name: "Timeline", description: "Experience-led." },
  { id: "cards", name: "Cards", description: "Projects as cards." },
] as const;

export type WebsiteTemplate = (typeof WEBSITE_TEMPLATES)[number]["id"];

export const ACCENT_COLOURS = [
  "#c2410c",
  "#1d4ed8",
  "#047857",
  "#7c3aed",
  "#1a1613",
];

/** Scores from earlier evaluations, oldest first (for the progress chart). */
export const demoHistory = [
  { label: "Oct 28", score: 41 },
  { label: "Nov 3", score: 52 },
  { label: "Nov 9", score: 58 },
];

export const initialCoverLetter = `I am writing to apply for the backend role at [ADD: company].

During my internship at Northwind Logistics I built a REST API in Go that serves 40k shipment lookups a day, and cut report generation from 12 to 3 minutes by moving queries to PostgreSQL views. In my own time I built route-planner, a routing service that answers in under 50 ms.

I am a hard-working team player and would like to bring the same focus on fast, reliable services to [ADD: team or product]. I can start in March 2026.`;
