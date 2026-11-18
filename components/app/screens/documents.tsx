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
import { ScreenMotion } from "../motion";
import { btn, DemoNote, Disclosure, listClass, PageHeader } from "../ui";

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
    <ScreenMotion id="documents" className="space-y-8">
      <PageHeader
        title="Documents"
        stat={`${uploadedRequired}/${required.length}`}
        statLabel="required uploaded"
        actions={
          <button
            type="button"
            className={btn.secondary}
            onClick={() => setMergedNote(true)}
          >
            Create merged PDF
          </button>
        }
      />

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}
      {mergedNote ? (
        <DemoNote>
          Merging needs the backend. In the demo only file names are kept.
        </DemoNote>
      ) : null}

      <section data-motion="tile" data-motion-hide aria-label="Documents">
        <ul className={listClass}>
          {specs.map((spec) => {
            const file = documents[spec.type];
            return (
              <li
                key={spec.type}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4"
              >
                <span
                  aria-hidden
                  className={`grid size-9 shrink-0 place-items-center rounded-full ${
                    file
                      ? "bg-success-soft text-success"
                      : "bg-ink/5 text-ink-muted"
                  }`}
                >
                  {file ? (
                    <Check className="size-4" strokeWidth={2.5} />
                  ) : (
                    <CircleDashed className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1 basis-48">
                  <span className="block text-[15px] font-medium">
                    {spec.label}
                    {!spec.required ? (
                      <span className="ml-2 text-sm font-normal text-ink-muted">
                        optional
                      </span>
                    ) : null}
                  </span>
                  <span className="block truncate text-sm text-ink-muted">
                    {file ? (
                      <>
                        Saved as{" "}
                        <span className="font-mono text-xs text-ink">
                          {standardFileName(profile.fullName, spec.label)}
                        </span>
                      </>
                    ) : (
                      spec.description
                    )}
                  </span>
                </span>
                <span className="ml-auto flex items-center gap-1">
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
                  <label
                    className={`${file || !spec.required ? btn.small : `${btn.primary} h-9`} cursor-pointer`}
                  >
                    <FileUp className="size-4" aria-hidden />
                    {file ? "Replace" : "Upload"}
                    <span className="sr-only"> {spec.label}</span>
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
                </span>
              </li>
            );
          })}
        </ul>

        <label className="mt-4 flex min-h-10 w-fit cursor-pointer items-center gap-3 text-sm text-ink-muted">
          <input
            type="checkbox"
            className="size-4 accent-[var(--color-accent)]"
            checked={nonEu}
            onChange={(e) =>
              updateDemo((s) => ({ ...s, nonEu: e.target.checked }))
            }
          />
          I need a visa or work permit (non-EU)
        </label>
      </section>

      <Disclosure summary={`Order in the merged PDF · ${ordered.length} files`}>
        <ol className="max-w-md space-y-1 pl-6">
          {ordered.map((part, index) => (
            <li key={part} className="flex items-center gap-2 text-sm">
              <span className="w-5 text-ink-muted tabular-nums">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{part}</span>
              <button
                type="button"
                className={`${btn.icon} size-8`}
                aria-label={`Move ${part} up`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                className={`${btn.icon} size-8`}
                aria-label={`Move ${part} down`}
                disabled={index === ordered.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ol>
      </Disclosure>
    </ScreenMotion>
  );
}
