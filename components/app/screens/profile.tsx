"use client";

import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import type {
  Education,
  Experience,
  ExperienceLevel,
  Profile,
  Project,
  SkillCategory,
} from "@/lib/core/types";
import { profileCompleteness } from "@/lib/demo/selectors";
import { newId, updateProfile, useDemo } from "@/lib/demo/store";
import { ScreenMotion } from "../motion";
import {
  btn,
  Field,
  formatMonth,
  inputClass,
  listClass,
  PageHeader,
  TextArea,
} from "../ui";

/** Bullets are edited as one per line. */
const toLines = (bullets: string[]) => bullets.join("\n");
const fromLines = (text: string) =>
  text.split("\n").map((line) => line.trimStart());

function set<K extends keyof Profile>(key: K, value: Profile[K]) {
  updateProfile((profile) => ({ ...profile, [key]: value }));
}

type ListKey = "experiences" | "projects" | "educations";

function updateItem<T extends { id: string }>(
  key: ListKey,
  id: string,
  change: Partial<T>,
) {
  updateProfile((profile) => ({
    ...profile,
    [key]: (profile[key] as unknown as T[]).map((item) =>
      item.id === id ? { ...item, ...change } : item,
    ),
  }));
}

function removeItem(key: ListKey, id: string) {
  updateProfile((profile) => ({
    ...profile,
    [key]: (profile[key] as { id: string }[]).filter((item) => item.id !== id),
  }));
}

/**
 * One item of a list as a single line; it opens into its form. New, empty
 * items start open.
 */
function ItemRow({
  title,
  meta,
  startOpen,
  onRemove,
  removeLabel,
  children,
}: {
  title: string;
  meta: string;
  startOpen: boolean;
  onRemove: () => void;
  removeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(startOpen);
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-center gap-3 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium">
            {title}
          </span>
          <span className="block truncate text-sm text-ink-muted">{meta}</span>
        </span>
        <span className="text-sm text-ink-muted group-hover:text-ink">
          {open ? "Close" : "Edit"}
        </span>
        <ChevronDown
          aria-hidden
          className={`size-4 shrink-0 text-ink/40 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="pb-5">
          {children}
          <button
            type="button"
            onClick={onRemove}
            className={`${btn.ghost} mt-3 -ml-3 hover:text-danger`}
          >
            <Trash2 className="size-4" aria-hidden />
            {removeLabel}
          </button>
        </div>
      ) : null}
    </li>
  );
}

const dates = (start: string, end: string | null) =>
  start ? `${formatMonth(start)} – ${formatMonth(end)}` : "";

function ExperienceFields({ item }: { item: Experience }) {
  const change = (patch: Partial<Experience>) =>
    updateItem<Experience>("experiences", item.id, patch);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Job title"
        value={item.title}
        onChange={(e) => change({ title: e.target.value })}
      />
      <Field
        label="Company"
        value={item.company}
        onChange={(e) => change({ company: e.target.value })}
      />
      <Field
        label="Location"
        value={item.location}
        onChange={(e) => change({ location: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Start"
          type="month"
          value={item.start}
          onChange={(e) => change({ start: e.target.value })}
        />
        <Field
          label="End"
          type="month"
          hint="Empty = now"
          value={item.end ?? ""}
          onChange={(e) => change({ end: e.target.value || null })}
        />
      </div>
      <TextArea
        className="sm:col-span-2"
        label="Bullets"
        hint="One per line. Start with a verb, add a result."
        rows={4}
        value={toLines(item.bullets)}
        onChange={(e) => change({ bullets: fromLines(e.target.value) })}
      />
    </div>
  );
}

function ProjectFields({ item }: { item: Project }) {
  const change = (patch: Partial<Project>) =>
    updateItem<Project>("projects", item.id, patch);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="Name"
        value={item.name}
        onChange={(e) => change({ name: e.target.value })}
      />
      <Field
        label="Tech"
        hint="Comma separated"
        value={item.tech.join(", ")}
        onChange={(e) =>
          change({
            tech: e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
      />
      <Field
        label="Repository"
        value={item.repoUrl ?? ""}
        onChange={(e) => change({ repoUrl: e.target.value })}
      />
      <Field
        label="Live demo"
        value={item.liveUrl ?? ""}
        onChange={(e) => change({ liveUrl: e.target.value })}
      />
      <Field
        className="sm:col-span-2"
        label="One-line description"
        value={item.description}
        onChange={(e) => change({ description: e.target.value })}
      />
      <TextArea
        className="sm:col-span-2"
        label="Bullets"
        hint="One per line"
        rows={3}
        value={toLines(item.bullets)}
        onChange={(e) => change({ bullets: fromLines(e.target.value) })}
      />
    </div>
  );
}

function EducationFields({ item }: { item: Education }) {
  const change = (patch: Partial<Education>) =>
    updateItem<Education>("educations", item.id, patch);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label="School"
        value={item.school}
        onChange={(e) => change({ school: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Degree"
          value={item.degree}
          onChange={(e) => change({ degree: e.target.value })}
        />
        <Field
          label="Grade"
          value={item.grade ?? ""}
          onChange={(e) => change({ grade: e.target.value })}
        />
      </div>
      <Field
        label="Field of study"
        value={item.field}
        onChange={(e) => change({ field: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Start"
          type="month"
          value={item.start}
          onChange={(e) => change({ start: e.target.value })}
        />
        <Field
          label="End"
          type="month"
          hint="Expected is fine"
          value={item.end ?? ""}
          onChange={(e) => change({ end: e.target.value || null })}
        />
      </div>
    </div>
  );
}

const categories: SkillCategory[] = [
  "language",
  "framework",
  "tool",
  "cloud",
  "other",
];

function SkillsEditor({ profile }: { profile: Profile }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("language");

  const add = (event: FormEvent) => {
    event.preventDefault();
    const value = name.trim();
    if (
      !value ||
      profile.skills.some(
        (skill) => skill.name.toLowerCase() === value.toLowerCase(),
      )
    )
      return;
    set("skills", [...profile.skills, { name: value, category }]);
    setName("");
  };

  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {profile.skills.map((skill) => (
          <li key={skill.name}>
            <span className="inline-flex h-9 items-center gap-1 rounded-full bg-surface pr-1 pl-3.5 text-sm ring-1 ring-line">
              {skill.name}
              <button
                type="button"
                aria-label={`Remove ${skill.name}`}
                onClick={() =>
                  set(
                    "skills",
                    profile.skills.filter((s) => s.name !== skill.name),
                  )
                }
                className="grid size-7 place-items-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="new-skill">
          New skill
        </label>
        <input
          id="new-skill"
          className={`${inputClass} h-11 sm:max-w-xs`}
          placeholder="Add a skill, e.g. Kubernetes"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="sr-only" htmlFor="new-skill-category">
          Category
        </label>
        <select
          id="new-skill-category"
          className={`${inputClass} h-11 sm:w-36`}
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" className={btn.secondary}>
          <Plus className="size-4" aria-hidden />
          Add
        </button>
      </form>
    </>
  );
}

const SECTIONS = [
  ["basics", "Basics"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["education", "Education"],
  ["skills", "Skills"],
  ["languages", "Languages"],
] as const;

/** A titled part of the page, separated by space and a hairline. */
function Section({
  id,
  title,
  action,
  children,
}: {
  id: (typeof SECTIONS)[number][0];
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-motion="tile"
      data-motion-hide
      className="scroll-mt-24"
    >
      <div className="mb-2 flex min-h-10 items-center justify-between gap-3">
        <h2 id={`${id}-title`} className="text-lg font-medium tracking-tight">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={btn.small} onClick={onClick}>
      <Plus className="size-4" aria-hidden />
      {label}
    </button>
  );
}

export function ProfileScreen() {
  const { profile } = useDemo();

  return (
    <ScreenMotion id="profile" className="space-y-8">
      <PageHeader
        title="Profile"
        stat={`${profileCompleteness(profile)}%`}
        statLabel="complete"
      >
        Your CV, letters, LinkedIn text and website are all built from this.
        Changes save as you type.
      </PageHeader>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[10rem_minmax(0,1fr)]">
        <nav
          aria-label="Profile sections"
          className="hidden xl:sticky xl:top-24 xl:block xl:h-fit"
        >
          <ul className="space-y-0.5 text-sm">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="block rounded-lg px-2.5 py-1.5 text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl min-w-0 space-y-12">
          <Section id="basics" title="Basics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                autoComplete="name"
                value={profile.fullName}
                onChange={(e) => set("fullName", e.target.value)}
              />
              <Field
                label="Headline"
                value={profile.headline}
                onChange={(e) => set("headline", e.target.value)}
              />
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                value={profile.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <Field
                label="Phone"
                type="tel"
                autoComplete="tel"
                value={profile.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
              <Field
                label="Location"
                value={profile.location}
                onChange={(e) => set("location", e.target.value)}
              />
              <Field
                label="Target role"
                value={profile.targetRole}
                onChange={(e) => set("targetRole", e.target.value)}
              />
              <TextArea
                className="sm:col-span-2"
                label="Summary"
                hint={`${profile.summary.length} characters · aim for 150–400`}
                rows={3}
                value={profile.summary}
                onChange={(e) => set("summary", e.target.value)}
              />
            </div>
            <details className="group/more mt-3">
              <summary className="flex min-h-10 w-fit cursor-pointer list-none items-center gap-1.5 text-sm text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
                <ChevronDown
                  aria-hidden
                  className="size-4 transition-transform group-open/more:rotate-180"
                />
                Links and level
              </summary>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="GitHub"
                  value={profile.links.github ?? ""}
                  onChange={(e) =>
                    set("links", { ...profile.links, github: e.target.value })
                  }
                />
                <Field
                  label="LinkedIn"
                  value={profile.links.linkedin ?? ""}
                  onChange={(e) =>
                    set("links", { ...profile.links, linkedin: e.target.value })
                  }
                />
                <Field
                  label="Website"
                  value={profile.links.website ?? ""}
                  onChange={(e) =>
                    set("links", { ...profile.links, website: e.target.value })
                  }
                />
                <label className="block">
                  <span className="text-sm font-medium">Level</span>
                  <select
                    className={`${inputClass} mt-1.5 h-11`}
                    value={profile.experienceLevel}
                    onChange={(e) =>
                      set("experienceLevel", e.target.value as ExperienceLevel)
                    }
                  >
                    <option value="student">Final-year student</option>
                    <option value="graduate">Graduate</option>
                    <option value="junior">Junior (0–2 years)</option>
                  </select>
                </label>
              </div>
            </details>
          </Section>

          <Section
            id="experience"
            title="Experience"
            action={
              <AddButton
                label="Add"
                onClick={() =>
                  set("experiences", [
                    ...profile.experiences,
                    {
                      id: newId("exp"),
                      company: "",
                      title: "",
                      location: "",
                      start: "",
                      end: null,
                      bullets: [],
                    },
                  ])
                }
              />
            }
          >
            <ul className={listClass}>
              {profile.experiences.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title || "New experience"}
                  meta={[item.company, dates(item.start, item.end)]
                    .filter(Boolean)
                    .join(" · ")}
                  startOpen={!item.title}
                  removeLabel="Remove this experience"
                  onRemove={() => removeItem("experiences", item.id)}
                >
                  <ExperienceFields item={item} />
                </ItemRow>
              ))}
            </ul>
          </Section>

          <Section
            id="projects"
            title="Projects"
            action={
              <AddButton
                label="Add"
                onClick={() =>
                  set("projects", [
                    ...profile.projects,
                    {
                      id: newId("proj"),
                      name: "",
                      description: "",
                      tech: [],
                      bullets: [],
                    },
                  ])
                }
              />
            }
          >
            <ul className={listClass}>
              {profile.projects.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.name || "New project"}
                  meta={item.tech.join(" · ") || item.description}
                  startOpen={!item.name}
                  removeLabel="Remove this project"
                  onRemove={() => removeItem("projects", item.id)}
                >
                  <ProjectFields item={item} />
                </ItemRow>
              ))}
            </ul>
          </Section>

          <Section
            id="education"
            title="Education"
            action={
              <AddButton
                label="Add"
                onClick={() =>
                  set("educations", [
                    ...profile.educations,
                    {
                      id: newId("edu"),
                      school: "",
                      degree: "",
                      field: "",
                      start: "",
                      end: null,
                    },
                  ])
                }
              />
            }
          >
            <ul className={listClass}>
              {profile.educations.map((item) => (
                <ItemRow
                  key={item.id}
                  title={
                    [item.degree, item.field].filter(Boolean).join(" ") ||
                    "New education"
                  }
                  meta={[item.school, dates(item.start, item.end)]
                    .filter(Boolean)
                    .join(" · ")}
                  startOpen={!item.school}
                  removeLabel="Remove this education"
                  onRemove={() => removeItem("educations", item.id)}
                >
                  <EducationFields item={item} />
                </ItemRow>
              ))}
            </ul>
          </Section>

          <Section id="skills" title="Skills">
            <SkillsEditor profile={profile} />
          </Section>

          <Section
            id="languages"
            title="Languages"
            action={
              <AddButton
                label="Add"
                onClick={() =>
                  set("languages", [
                    ...profile.languages,
                    { name: "", level: "" },
                  ])
                }
              />
            }
          >
            <ul className="space-y-3">
              {profile.languages.map((language, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-2"
                >
                  <Field
                    label="Language"
                    value={language.name}
                    onChange={(e) =>
                      set(
                        "languages",
                        profile.languages.map((l, i) =>
                          i === index ? { ...l, name: e.target.value } : l,
                        ),
                      )
                    }
                  />
                  <Field
                    label="Level"
                    value={language.level}
                    onChange={(e) =>
                      set(
                        "languages",
                        profile.languages.map((l, i) =>
                          i === index ? { ...l, level: e.target.value } : l,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className={btn.icon}
                    aria-label={`Remove ${language.name || "language"}`}
                    onClick={() =>
                      set(
                        "languages",
                        profile.languages.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </ScreenMotion>
  );
}
