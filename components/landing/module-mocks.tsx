import { Check, CircleDashed } from "lucide-react";
import type { ReactNode } from "react";

/*
 * Small product mocks for the module tiles. They are illustrations, not
 * screenshots: every name and number is made up, and the tiles hide them from
 * assistive tech. The details follow the rules in plan.md, section 6 (for
 * example: scores are "estimated", skills someone lacks are listed as gaps
 * and never added, document files are renamed `Lastname_Firstname_Type.pdf`).
 */

/** `mock-card` is the hook the tile animation uses to stagger these in. */
const card = "mock-card rounded-xl border border-line bg-surface shadow-lift";

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.14em] text-ink-muted uppercase">
      {children}
    </p>
  );
}

/** Skeleton line standing in for a line of text. */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`h-1.5 rounded-full bg-ink/10 ${className}`} />;
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger";
}) {
  const tones = {
    neutral: "bg-paper text-ink-muted ring-1 ring-line",
    success: "bg-success-soft text-success",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function CvMock() {
  const passed = [
    "Text is selectable",
    "Standard headings found",
    "Contact details in the body",
    "Every date parsed",
  ];

  return (
    <div className="grid gap-4 @md:grid-cols-[1.1fr_1fr]">
      <div className={`${card} p-4`}>
        <Bar className="h-2.5 w-2/5 bg-ink/30" />
        <Bar className="mt-2 w-3/5" />
        {["Experience", "Projects", "Education"].map((section) => (
          <div key={section} className="mt-4">
            <Label>{section}</Label>
            <Bar className="mt-2 w-full" />
            <Bar className="mt-1.5 w-11/12" />
            <Bar className="mt-1.5 w-3/4" />
          </div>
        ))}
      </div>

      <div className={`${card} p-4`}>
        <div className="flex items-center justify-between gap-2">
          <Label>ATS check</Label>
          <Chip tone="success">Estimated</Chip>
        </div>
        <p className="mt-3 flex items-baseline gap-1.5">
          <span
            data-meter-count
            className="text-4xl leading-none font-semibold tracking-tight"
          >
            86
          </span>
          <span className="text-xs text-ink-muted">/ 100</span>
        </p>
        <ul className="mt-4 space-y-2 text-xs">
          {passed.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                <Check className="size-2.5" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
          <li className="flex items-center gap-2 text-accent-strong">
            <span className="grid size-4 shrink-0 place-items-center rounded-full bg-accent-soft text-[10px] font-semibold">
              !
            </span>
            Two bullets have no result
          </li>
        </ul>
      </div>
    </div>
  );
}

export function CoverLetterMock() {
  return (
    <div className={`${card} mx-auto max-w-xs p-4`}>
      <p className="text-sm leading-none font-medium">Dear hiring team,</p>
      <Bar className="mt-3.5 w-full" />
      <Bar className="mt-1.5 w-11/12" />
      <Bar className="mt-1.5 w-full" />
      <Bar className="mt-1.5 w-2/3" />
      <Bar className="mt-3.5 w-full" />
      <Bar className="mt-1.5 w-4/5" />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip>3 paragraphs</Chip>
        <Chip>214 / 250 words</Chip>
      </div>
    </div>
  );
}

export function GithubMock() {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between gap-2">
        <Label>Proposed change</Label>
        <Chip>Dry run</Chip>
      </div>
      <p className="mt-3 font-mono text-xs text-ink-muted">
        ada-lovelace/
        <span className="font-semibold text-ink">route-planner</span>
      </p>
      <div className="mt-3 space-y-1.5 text-xs leading-5">
        <p className="rounded-md bg-danger/8 px-2.5 py-1.5 text-ink-muted line-through decoration-danger/50">
          uni project, final version
        </p>
        <p className="rounded-md bg-success-soft px-2.5 py-1.5">
          Route planner for campus buses, built with Go and PostgreSQL.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["go", "postgresql", "rest-api"].map((topic) => (
          <span
            key={topic}
            className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent-strong"
          >
            {topic}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[11px] font-medium">
        <span className="rounded-full bg-ink px-3 py-1 text-paper">
          Approve
        </span>
        <span className="rounded-full border border-line px-3 py-1">Skip</span>
      </div>
    </div>
  );
}

function Keyword({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-accent-soft px-1 py-0.5 font-medium text-accent-strong">
      {children}
    </span>
  );
}

export function TailoredMock() {
  const scores = [
    { label: "Generic CV", value: 54, bar: "bg-ink/25" },
    { label: "Tailored CV", value: 81, bar: "bg-accent" },
  ];

  return (
    <div className="grid gap-4 @sm:grid-cols-2">
      <div className={`${card} p-4`}>
        <Label>Job ad</Label>
        <p className="mt-3 text-xs leading-6 text-ink-muted">
          We are looking for a developer with <Keyword>TypeScript</Keyword> and{" "}
          <Keyword>REST API</Keyword> experience who knows{" "}
          <Keyword>CI/CD</Keyword>.
        </p>
      </div>
      <div className={`${card} p-4`}>
        <Label>Estimated match</Label>
        <div className="mt-3 space-y-3">
          {scores.map((score) => (
            <div key={score.label}>
              <div className="flex items-baseline justify-between text-xs">
                <span>{score.label}</span>
                <span className="font-mono text-ink-muted">{score.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-ink/8">
                <div
                  data-meter-bar
                  className={`h-full rounded-full ${score.bar}`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3.5 text-[11px] leading-4 text-ink-muted">
          Gap listed, not added: Kubernetes
        </p>
      </div>
    </div>
  );
}

export function LinkedinMock() {
  const fields = [
    { name: "Headline", count: "118 / 220" },
    { name: "About", count: "1,240 / 2,600" },
  ];

  return (
    <div className="space-y-2.5">
      {fields.map((field) => (
        <div key={field.name} className={`${card} p-3.5`}>
          <div className="flex items-center justify-between gap-2">
            <Label>{field.name}</Label>
            <span className="font-mono text-[10px] text-ink-muted">
              {field.count}
            </span>
          </div>
          <Bar className="mt-2.5 w-full" />
          <Bar className="mt-1.5 w-4/5" />
          <div className="mt-3 flex justify-end">
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-medium text-paper">
              Copy
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WebsiteMock() {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <span className="size-2 rounded-full bg-ink/15" />
        <span className="size-2 rounded-full bg-ink/15" />
        <span className="size-2 rounded-full bg-ink/15" />
        <span className="ml-2 flex-1 rounded-full bg-paper px-2.5 py-0.5 font-mono text-[10px] text-ink-muted">
          ada-lovelace
        </span>
      </div>
      <div className="p-4">
        <Bar className="h-3 w-1/2 bg-ink/30" />
        <Bar className="mt-2 w-3/4" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <span className="aspect-[4/3] rounded-md bg-glow-1" />
          <span className="aspect-[4/3] rounded-md bg-glow-2" />
          <span className="aspect-[4/3] rounded-md bg-glow-3" />
        </div>
      </div>
    </div>
  );
}

export function DocumentsMock() {
  const documents = [
    { name: "Degree certificate", uploaded: true },
    { name: "Transcript", uploaded: true },
    { name: "Reference letter", uploaded: false },
  ];

  return (
    <div>
      <ul className="space-y-2">
        {documents.map((document) => (
          <li
            key={document.name}
            className={`${card} flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs`}
          >
            <span className="flex items-center gap-2">
              {document.uploaded ? (
                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
              ) : (
                <CircleDashed className="size-4 shrink-0 text-ink-muted" />
              )}
              {document.name}
            </span>
            <span
              className={`font-mono text-[10px] ${
                document.uploaded ? "text-success" : "text-ink-muted"
              }`}
            >
              {document.uploaded ? "uploaded" : "missing"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10px] text-ink-muted">
        Lovelace_Ada_Degree.pdf
      </p>
    </div>
  );
}

export function ConsistencyMock() {
  const rows = [
    {
      field: "Title",
      values: ["Software Engineer", "Software Engineer", "Full-stack dev"],
      mismatch: true,
    },
    { field: "Location", values: ["Berlin", "Berlin", "Berlin"] },
    { field: "Start date", values: ["Oct 2025", "Oct 2025", "Oct 2025"] },
  ];

  return (
    <div className={`${card} overflow-hidden text-xs`}>
      <div className="grid grid-cols-[0.8fr_1fr_1fr_1fr] gap-3 border-b border-line bg-paper/70 px-4 py-2.5">
        <Label>Field</Label>
        <Label>CV</Label>
        <Label>LinkedIn</Label>
        <Label>GitHub</Label>
      </div>
      {rows.map((row) => (
        <div
          key={row.field}
          className="grid grid-cols-[0.8fr_1fr_1fr_1fr] items-center gap-3 border-b border-line/70 px-4 py-3 last:border-b-0"
        >
          <span className="font-medium">{row.field}</span>
          {row.values.map((value, index) => {
            const flagged = row.mismatch && index === row.values.length - 1;
            return (
              <span
                key={index}
                className={
                  flagged
                    ? "flex flex-wrap items-center gap-1.5 text-danger"
                    : "text-ink-muted"
                }
              >
                {value}
                {flagged ? <Chip tone="danger">Mismatch</Chip> : null}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
