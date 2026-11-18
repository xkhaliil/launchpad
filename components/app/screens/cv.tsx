"use client";

import { ArrowRight, Check, Download, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { checkCv } from "@/lib/core/ats";
import { useDemo } from "@/lib/demo/store";
import { CvDocument, type CvOptions, defaultCvOptions } from "../cv-document";
import { ScreenMotion } from "../motion";
import { useReview } from "../review";
import {
  btn,
  DemoNote,
  Disclosure,
  listClass,
  PageHeader,
  Segmented,
} from "../ui";

const sectionToggles: {
  key: keyof Omit<CvOptions, "template">;
  label: string;
}[] = [
  { key: "summary", label: "Summary" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
];

const TEMPLATES = [
  { value: "classic", label: "Classic" },
  { value: "compact", label: "Compact" },
] as const;

export function CvScreen() {
  const { profile } = useDemo();
  const review = useReview();
  const [options, setOptions] = useState<CvOptions>(defaultCvOptions);
  const [docxNote, setDocxNote] = useState(false);
  const report = checkCv(profile);
  const failed = report.checks.filter((check) => !check.passed);
  const passed = report.checks.filter((check) => check.passed);
  const suggestions = review.countFor("cv");
  const fileName = `${profile.fullName.trim().split(/\s+/).join("_")}_CV.pdf`;

  return (
    <ScreenMotion id="cv" className="space-y-8">
      <PageHeader
        title="CV"
        stat={`${report.score}/100`}
        statLabel="ATS score · aim for 85"
        actions={
          <>
            <button
              type="button"
              className={btn.secondary}
              onClick={() => setDocxNote(true)}
            >
              DOCX
            </button>
            <button
              type="button"
              className={btn.primary}
              onClick={() => window.print()}
            >
              <Download className="size-4" aria-hidden />
              Download PDF
            </button>
          </>
        }
      />
      {docxNote ? (
        <div className="print:hidden">
          <DemoNote>
            DOCX comes with the backend. Download PDF saves {fileName} with
            real, selectable text.
          </DemoNote>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          {/* Layout options, in one row above the page. */}
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 print:hidden">
            <Segmented
              label="Template"
              value={options.template}
              options={TEMPLATES}
              onChange={(template) => setOptions({ ...options, template })}
            />
            <ul className="flex flex-wrap gap-1.5" aria-label="Sections">
              {sectionToggles.map(({ key, label }) => (
                <li key={key}>
                  <button
                    type="button"
                    aria-pressed={options[key]}
                    onClick={() =>
                      setOptions({ ...options, [key]: !options[key] })
                    }
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      options[key]
                        ? "bg-ink/5 text-ink"
                        : "text-ink-muted line-through decoration-ink/30 hover:text-ink"
                    }`}
                  >
                    {options[key] ? (
                      <Check className="size-3.5" aria-hidden />
                    ) : null}
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* The page. On print, only this is output. */}
          <div
            data-motion="tile"
            data-motion-hide
            className="rounded-[1.75rem] bg-sand p-3 sm:p-6 print:rounded-none print:bg-transparent print:p-0"
          >
            <div className="mx-auto max-w-176 bg-white p-6 shadow-lift sm:p-10 print:max-w-none print:p-0 print:shadow-none">
              <CvDocument profile={profile} options={options} />
            </div>
          </div>
        </div>

        {/* Only what needs doing. */}
        <aside
          data-motion="tile"
          data-motion-hide
          aria-labelledby="cv-fixes"
          className="h-fit xl:sticky xl:top-24 print:hidden"
        >
          <h2 id="cv-fixes" className="text-lg font-medium tracking-tight">
            {failed.length === 0
              ? "Ready to send"
              : `${failed.length} thing${failed.length === 1 ? "" : "s"} to fix`}
          </h2>

          {suggestions > 0 ? (
            <button
              type="button"
              className={`${btn.accent} mt-4 h-11 w-full justify-between px-5`}
              onClick={() => review.open({ area: "cv" })}
            >
              Fix {suggestions} bullet{suggestions === 1 ? "" : "s"} now
              <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null}

          {failed.length > 0 ? (
            <ul className={`mt-4 ${listClass}`}>
              {failed.map((check) => (
                <li key={check.id} className="py-3.5">
                  <p className="text-sm font-medium">{check.label}</p>
                  {check.fix ? (
                    <p className="mt-1 line-clamp-3 text-sm text-ink-muted">
                      {check.fix}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          <Disclosure
            className="mt-2"
            summary={`${passed.length} check${passed.length === 1 ? "" : "s"} passed`}
          >
            <ul className="space-y-2 pl-6 text-sm text-ink-muted">
              {passed.map((check) => (
                <li key={check.id} className="flex gap-2">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-success"
                    aria-hidden
                  />
                  {check.label}
                </li>
              ))}
            </ul>
          </Disclosure>

          <Link href="/profile" className={`${btn.ghost} mt-2 -ml-3 text-ink`}>
            <Pencil className="size-4" aria-hidden />
            Edit the facts in your profile
          </Link>
        </aside>
      </div>
    </ScreenMotion>
  );
}
