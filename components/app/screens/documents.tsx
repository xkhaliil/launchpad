"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleDashed,
  FileUp,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { type DocType, docSpecs, standardFileName } from "@/lib/demo/data";
import { requiredDocs } from "@/lib/demo/selectors";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { Badge, btn, Card, DemoNote, ScreenHero, SectionTitle } from "../ui";
import { ScreenMotion } from "../motion";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ["application/pdf", "image/jpeg", "image/png"];

export function DocumentsScreen() {
  const state = useDemo();
  const { profile, documents, nonEu } = state;
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [mergedNote, setMergedNote] = useState(false);

  const specs = docSpecs.filter((spec) => !spec.nonEuOnly || nonEu);
  const required = requiredDocs(state);
  const uploadedRequired = required.filter(
    (spec) => documents[spec.type],
  ).length;

  // The merged PDF: cover letter, CV, then every uploaded document.
  const parts = [
    "Cover letter",
    "CV",
    ...specs.filter((spec) => documents[spec.type]).map((spec) => spec.label),
  ];
  const ordered = [
    ...order.filter((part) => parts.includes(part)),
    ...parts.filter((part) => !order.includes(part)),
  ];
  const move = (index: number, by: number) => {
    const next = [...ordered];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    setOrder(next);
  };

  const upload = (type: DocType, file: File | undefined) => {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      setError(`${file.name}: only PDF, JPG and PNG files.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`${file.name} is larger than 10 MB.`);
      return;
    }
    setError(null);
    updateDemo((s) => ({
      ...s,
      documents: { ...s.documents, [type]: file.name },
    }));
  };

  return (
    <ScreenMotion id="documents" className="space-y-4">
      <ScreenHero
        title="Documents"
        description="Everything a German application usually asks for, with standard file names and one merged application PDF."
        stat={uploadedRequired}
        statSuffix={`/${required.length}`}
        statLabel="required documents uploaded"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="block h-2.5 min-w-56 flex-1 overflow-hidden rounded-full bg-white/10">
            <span
              data-motion="fill"
              className="block h-full rounded-full bg-glow-1 transition-[width] duration-700"
              style={{
                width: `${required.length ? (uploadedRequired / required.length) * 100 : 100}%`,
              }}
            />
          </span>
          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm text-paper/80">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-glow-1)]"
              checked={nonEu}
              onChange={(e) =>
                updateDemo((s) => ({ ...s, nonEu: e.target.checked }))
              }
            />
            I need a visa or work permit (non-EU)
          </label>
        </div>
      </ScreenHero>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {specs.map((spec) => {
            const file = documents[spec.type];
            return (
              <li key={spec.type}>
                <Card className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      aria-hidden
                      className={`grid size-9 shrink-0 place-items-center rounded-full ${file ? "bg-success-soft text-success" : "bg-paper text-ink-muted"}`}
                    >
                      {file ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : (
                        <CircleDashed className="size-4" />
                      )}
                    </span>
                    <Badge
                      tone={
                        file ? "success" : spec.required ? "warning" : "neutral"
                      }
                    >
                      {file
                        ? "Uploaded"
                        : spec.required
                          ? "Required"
                          : "Optional"}
                    </Badge>
                  </div>
                  <p className="mt-4 font-medium">{spec.label}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    {spec.description}
                  </p>
                  {file ? (
                    <p className="mt-3 rounded-xl bg-paper px-3 py-2 font-mono text-xs break-all">
                      {standardFileName(profile.fullName, spec.label)}
                      <span className="mt-0.5 block font-sans text-ink-muted">
                        from {file}
                      </span>
                    </p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <label className={`${btn.secondary} cursor-pointer`}>
                      <FileUp className="size-4" aria-hidden />
                      {file ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="sr-only"
                        onChange={(e) => {
                          upload(spec.type, e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {file ? (
                      <button
                        type="button"
                        className={btn.icon}
                        aria-label={`Remove ${spec.label}`}
                        onClick={() =>
                          updateDemo((s) => {
                            const next = { ...s.documents };
                            delete next[spec.type];
                            return { ...s, documents: next };
                          })
                        }
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>

        <Card surface="sand" className="h-fit">
          <SectionTitle>Merged application PDF</SectionTitle>
          <p className="mb-4 text-sm text-ink-muted">
            One file in this order, with bookmarks.
          </p>
          <ol className="space-y-2">
            {ordered.map((part, index) => (
              <li
                key={part}
                className="flex items-center gap-2 rounded-xl bg-paper py-1 pr-1 pl-3 text-sm"
              >
                <span className="w-5 text-ink-muted tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">{part}</span>
                <button
                  type="button"
                  className={btn.icon}
                  aria-label={`Move ${part} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className={btn.icon}
                  aria-label={`Move ${part} down`}
                  disabled={index === ordered.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className={`${btn.primary} mt-4 w-full`}
            onClick={() => setMergedNote(true)}
          >
            Create merged PDF
          </button>
          {mergedNote ? (
            <div className="mt-3">
              <DemoNote>
                Merging files needs the backend. Your uploads stay in this
                browser; only their names are kept in the demo.
              </DemoNote>
            </div>
          ) : null}
        </Card>
      </div>
    </ScreenMotion>
  );
}
