"use client";

import { Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useState } from "react";
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
import {
  btn,
  Card,
  Field,
  inputClass,
  ScreenHero,
  SectionTitle,
  TextArea,
} from "../ui";
import { ScreenMotion } from "../motion";

/** Bullets are edited as one per line. */
const toLines = (bullets: string[]) => bullets.join("\n");
const fromLines = (text: string) =>
  text.split("\n").map((line) => line.trimStart());

function set<K extends keyof Profile>(key: K, value: Profile[K]) {
  updateProfile((profile) => ({ ...profile, [key]: value }));
}

function updateItem<T extends { id: string }>(
  key: "experiences" | "projects" | "educations",
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

function removeItem(
  key: "experiences" | "projects" | "educations",
  id: string,
) {
  updateProfile((profile) => ({
    ...profile,
    [key]: (profile[key] as { id: string }[]).filter((item) => item.id !== id),
  }));
}

function RemoveButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={btn.icon}
      aria-label={label}
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}

function ExperienceEditor({ item }: { item: Experience }) {
  const change = (patch: Partial<Experience>) =>
    updateItem<Experience>("experiences", item.id, patch);
  return (
    <div className="rounded-2xl border border-line p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{item.title || "New experience"}</p>
        <RemoveButton
          label={`Remove ${item.title || "experience"}`}
          onClick={() => removeItem("experiences", item.id)}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    </div>
  );
}

function ProjectEditor({ item }: { item: Project }) {
  const change = (patch: Partial<Project>) =>
    updateItem<Project>("projects", item.id, patch);
  return (
    <div className="rounded-2xl border border-line p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{item.name || "New project"}</p>
        <RemoveButton
          label={`Remove ${item.name || "project"}`}
          onClick={() => removeItem("projects", item.id)}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    </div>
  );
}

function EducationEditor({ item }: { item: Education }) {
  const change = (patch: Partial<Education>) =>
    updateItem<Education>("educations", item.id, patch);
  return (
    <div className="rounded-2xl border border-line p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{item.school || "New education"}</p>
        <RemoveButton
          label={`Remove ${item.school || "education"}`}
          onClick={() => removeItem("educations", item.id)}
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <span className="inline-flex h-9 items-center gap-1 rounded-full bg-paper pr-1 pl-3.5 text-sm ring-1 ring-line">
              {skill.name}
              <span className="text-xs text-ink-muted">· {skill.category}</span>
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
          className={`${inputClass} h-11 sm:w-40`}
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

export function ProfileScreen() {
  const { profile } = useDemo();

  return (
    <ScreenMotion id="profile" className="space-y-4">
      <ScreenHero
        title="Profile"
        description="The single source of truth. Your CV, letters, LinkedIn text, GitHub changes and website are all built from what you enter here. Changes save as you type."
        stat={profileCompleteness(profile)}
        statSuffix="%"
        statLabel="profile complete"
      />

      <div className="space-y-4">
        <Card>
          <SectionTitle>Basics</SectionTitle>
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
            <Field
              label="Website"
              value={profile.links.website ?? ""}
              onChange={(e) =>
                set("links", { ...profile.links, website: e.target.value })
              }
            />
            <TextArea
              className="sm:col-span-2"
              label="Summary"
              hint={`${profile.summary.length} characters · aim for 150–400`}
              rows={4}
              value={profile.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </div>
        </Card>

        <Card surface="sand">
          <SectionTitle
            action={
              <button
                type="button"
                className={btn.secondary}
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
              >
                <Plus className="size-4" aria-hidden /> Add
              </button>
            }
          >
            Experience
          </SectionTitle>
          <div className="space-y-3">
            {profile.experiences.map((item) => (
              <ExperienceEditor key={item.id} item={item} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            action={
              <button
                type="button"
                className={btn.secondary}
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
              >
                <Plus className="size-4" aria-hidden /> Add
              </button>
            }
          >
            Projects
          </SectionTitle>
          <div className="space-y-3">
            {profile.projects.map((item) => (
              <ProjectEditor key={item.id} item={item} />
            ))}
          </div>
        </Card>

        <Card surface="sand">
          <SectionTitle
            action={
              <button
                type="button"
                className={btn.secondary}
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
              >
                <Plus className="size-4" aria-hidden /> Add
              </button>
            }
          >
            Education
          </SectionTitle>
          <div className="space-y-3">
            {profile.educations.map((item) => (
              <EducationEditor key={item.id} item={item} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle>Skills</SectionTitle>
          <SkillsEditor profile={profile} />
        </Card>

        <Card>
          <SectionTitle>Languages</SectionTitle>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {profile.languages.map((language, index) => (
              <li
                key={index}
                className="grid grid-cols-[1fr_7rem_auto] items-end gap-2"
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
                <RemoveButton
                  label={`Remove ${language.name}`}
                  onClick={() =>
                    set(
                      "languages",
                      profile.languages.filter((_, i) => i !== index),
                    )
                  }
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`${btn.secondary} mt-4`}
            onClick={() =>
              set("languages", [...profile.languages, { name: "", level: "" }])
            }
          >
            <Plus className="size-4" aria-hidden /> Add language
          </button>
        </Card>
      </div>
    </ScreenMotion>
  );
}
