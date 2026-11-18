"use client";

import { ArrowLeft, ArrowRight, Check, FileUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ExperienceLevel } from "@/lib/core/types";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { APP_NAME } from "@/lib/site";
import { btn, DemoNote, Field, inputClass } from "../ui";

const roles = [
  "Backend developer",
  "Frontend developer",
  "Full-stack developer",
  "Data engineer",
  "Mobile developer",
];
const steps = ["Your goal", "Import", "Review"];

export function OnboardingScreen() {
  const router = useRouter();
  const { profile } = useDemo();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(profile.targetRole);
  const [level, setLevel] = useState<ExperienceLevel>(profile.experienceLevel);
  const [location, setLocation] = useState(profile.location);
  const [file, setFile] = useState<string | null>(null);
  const [reading, setReading] = useState(false);

  const read = () => {
    setReading(true);
    // Stands in for AI extraction of the uploaded PDF (plan.md, section 3).
    setTimeout(() => {
      setReading(false);
      setStep(2);
    }, 1400);
  };

  const finish = () => {
    updateDemo((state) => ({
      ...state,
      onboarded: true,
      profile: {
        ...state.profile,
        targetRole: role.trim() || state.profile.targetRole,
        experienceLevel: level,
        location,
      },
    }));
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
        <Link
          href="/"
          className="text-[22px] leading-none font-medium tracking-tight"
        >
          {APP_NAME}
        </Link>
        <span className="text-sm text-ink-muted">
          Step {step + 1} of {steps.length}
        </span>
      </header>

      <main
        id="main"
        className="mx-auto w-full max-w-3xl flex-1 px-5 pt-6 pb-16"
      >
        <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Progress">
          {steps.map((label, index) => (
            <li key={label}>
              <span
                className={`block h-1 rounded-full ${index <= step ? "bg-accent" : "bg-ink/10"}`}
              />
              <span
                className={`mt-2 block text-xs ${index === step ? "font-medium" : "text-ink-muted"}`}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="rounded-4xl border border-line bg-surface p-6 shadow-float sm:p-10">
          {step === 0 ? (
            <>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                What are you aiming for?
              </h1>
              <p className="mt-2 text-ink-muted">
                This shapes your CV, your letters and how we score them.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <Field
                    label="Target role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {roles.map((item) => (
                      <li key={item}>
                        <button
                          type="button"
                          aria-pressed={role === item}
                          onClick={() => setRole(item)}
                          className={`min-h-10 rounded-full px-4 text-sm transition-colors ${role === item ? "bg-ink text-paper" : "ring-1 ring-line hover:ring-ink/30"}`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">Level</span>
                    <select
                      className={`${inputClass} mt-1.5 h-11`}
                      value={level}
                      onChange={(e) =>
                        setLevel(e.target.value as ExperienceLevel)
                      }
                    >
                      <option value="student">Final-year student</option>
                      <option value="graduate">Graduate</option>
                      <option value="junior">Junior (0–2 years)</option>
                    </select>
                  </label>
                  <Field
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-10 flex justify-end">
                <button
                  type="button"
                  className={btn.primary}
                  onClick={() => setStep(1)}
                  disabled={!role.trim()}
                >
                  Continue <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                Import what you already have
              </h1>
              <p className="mt-2 text-ink-muted">
                Upload your current CV or your LinkedIn &quot;Save to PDF&quot;
                export. We fill in your profile and you check it.
              </p>
              <label className="mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-paper px-6 py-12 text-center transition-colors hover:border-accent">
                <FileUp className="size-8 text-accent" aria-hidden />
                <span className="font-medium">{file ?? "Choose a PDF"}</span>
                <span className="text-sm text-ink-muted">
                  CV or LinkedIn export, up to 10 MB
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
                />
              </label>
              <div className="mt-4">
                <DemoNote>
                  Demo: the file is not read or sent anywhere. The example
                  profile is used instead.
                </DemoNote>
              </div>
              <div className="mt-10 flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  className={btn.ghost}
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft className="size-4" aria-hidden /> Back
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={btn.secondary}
                    onClick={read}
                    disabled={reading}
                  >
                    Use example data
                  </button>
                  <button
                    type="button"
                    className={btn.primary}
                    onClick={read}
                    disabled={!file || reading}
                  >
                    {reading ? "Reading your file…" : "Import"}
                  </button>
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                Check your profile
              </h1>
              <p className="mt-2 text-ink-muted">
                This is what we found. You can change anything later in Profile.
              </p>
              <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Name", profile.fullName],
                  ["Headline", profile.headline],
                  ["Target role", role],
                  ["Location", location],
                  ["Experience", `${profile.experiences.length} entries`],
                  ["Projects", `${profile.projects.length} entries`],
                  [
                    "Education",
                    profile.educations.map((e) => e.school).join(", "),
                  ],
                  ["Skills", `${profile.skills.length} skills`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-paper p-4">
                    <dt className="text-sm text-ink-muted">{label}</dt>
                    <dd className="mt-0.5 flex items-center gap-2 font-medium">
                      <Check
                        className="size-4 shrink-0 text-success"
                        aria-hidden
                      />
                      <span className="min-w-0 truncate">{value}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex flex-wrap justify-between gap-2">
                <button
                  type="button"
                  className={btn.ghost}
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-4" aria-hidden /> Back
                </button>
                <button type="button" className={btn.accent} onClick={finish}>
                  Go to my dashboard{" "}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
