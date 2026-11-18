"use client";

import { Check, Download, FileDown, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { checkCv } from "@/lib/core/ats";
import { useDemo } from "@/lib/demo/store";
import { CvDocument, type CvOptions, defaultCvOptions } from "../cv-document";
import {
  Badge,
  btn,
  Card,
  DemoNote,
  ScreenHero,
  btnDark,
  SectionTitle,
} from "../ui";
import { ScreenMotion } from "../motion";

const sectionToggles: {
  key: keyof Omit<CvOptions, "template">;
  label: string;
}[] = [
  { key: "summary", label: "Summary" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
];

const severityTone = {
  high: "danger",
  medium: "warning",
  low: "neutral",
} as const;

export function CvScreen() {
  const { profile } = useDemo();
  const [options, setOptions] = useState<CvOptions>(defaultCvOptions);
  const [docxNote, setDocxNote] = useState(false);
  const report = checkCv(profile);
  const failed = report.checks.filter((check) => !check.passed);
  const fileName = `${profile.fullName.trim().split(/\s+/).join("_")}_CV.pdf`;

  return (
    <ScreenMotion id="cv" className="space-y-4">
      <div className="space-y-4 print:hidden">
        <ScreenHero
          title="CV builder"
          description="Built from your profile on an ATS-safe template, then checked the way an ATS reads it."
          stat={report.score}
          statSuffix="/100"
          statLabel="estimated ATS score · target 85"
          actions={
            <>
              <button
                type="button"
                className={btnDark.primary}
                onClick={() => window.print()}
              >
                <Download className="size-4" aria-hidden />
                Download PDF
              </button>
              <button
                type="button"
                className={btnDark.secondary}
                onClick={() => setDocxNote(true)}
              >
                <FileDown className="size-4" aria-hidden />
                DOCX
              </button>
              <Link href="/profile" className={btnDark.secondary}>
                <Pencil className="size-4" aria-hidden />
                Edit profile
              </Link>
            </>
          }
        />
        {docxNote ? (
          <div>
            <DemoNote>
              DOCX export comes with the backend. For now, Download PDF saves
              the CV through your browser&apos;s print dialog as {fileName},
              with real, selectable text.
            </DemoNote>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* The page. On print, only this is output. */}
        <div
          data-motion="tile"
          data-motion-hide
          className="relative isolate overflow-hidden rounded-[1.75rem] bg-sand p-3 sm:p-6 print:overflow-visible print:rounded-none print:border-0 print:bg-transparent print:p-0"
        >
          <div className="mx-auto max-w-[44rem] bg-white p-6 shadow-lift sm:p-10 print:max-w-none print:p-0 print:shadow-none">
            <CvDocument profile={profile} options={options} />
          </div>
        </div>

        <div className="space-y-4 print:hidden">
          <Card>
            <div>
              <div>
                <p className="text-lg font-medium tracking-tight">ATS check</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {failed.length === 0
                    ? "Every check passes."
                    : `${failed.length} of ${report.checks.length} checks need work. Target: 85.`}
                </p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              {report.checks.map((check) => (
                <li key={check.id} className="flex gap-3">
                  <span
                    aria-hidden
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                      check.passed
                        ? "bg-success-soft text-success"
                        : "bg-accent-soft text-accent-strong"
                    }`}
                  >
                    {check.passed ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      <span className="text-[11px] font-medium">!</span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`text-sm ${check.passed ? "text-ink-muted" : "font-medium"}`}
                    >
                      {check.label}
                      {!check.passed ? (
                        <span className="ml-2 align-middle">
                          <Badge tone={severityTone[check.severity]}>
                            {check.severity}
                          </Badge>
                        </span>
                      ) : null}
                    </p>
                    {check.fix ? (
                      <p className="mt-1 text-sm break-words text-ink-muted">
                        {check.fix}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            {failed.length > 0 ? (
              <Link href="/profile" className={`${btn.primary} mt-6 w-full`}>
                Fix in your profile
              </Link>
            ) : null}
          </Card>

          <Card surface="sand">
            <SectionTitle>Template</SectionTitle>
            <div
              className="grid grid-cols-2 gap-2"
              role="radiogroup"
              aria-label="Template"
            >
              {(["classic", "compact"] as const).map((template) => (
                <button
                  key={template}
                  type="button"
                  role="radio"
                  aria-checked={options.template === template}
                  onClick={() => setOptions({ ...options, template })}
                  className={`min-h-11 rounded-xl border text-sm font-medium capitalize transition-colors ${
                    options.template === template
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink/30"
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
            <p className="mt-5 mb-2 text-sm font-medium">Sections</p>
            <ul className="space-y-1">
              {sectionToggles.map(({ key, label }) => (
                <li key={key}>
                  <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--color-accent)]"
                      checked={options[key]}
                      onChange={(e) =>
                        setOptions({ ...options, [key]: e.target.checked })
                      }
                    />
                    {label}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-ink-muted">
              One column, standard headings, Arial, no tables or icons, so an
              ATS reads every line.
            </p>
          </Card>
        </div>
      </div>
    </ScreenMotion>
  );
}
