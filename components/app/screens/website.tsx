"use client";

import { ExternalLink, Rocket } from "lucide-react";
import type { CSSProperties } from "react";
import type { Profile } from "@/lib/core/types";
import {
  ACCENT_COLOURS,
  WEBSITE_TEMPLATES,
  type WebsiteTemplate,
} from "@/lib/demo/data";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { SITES_ROOT_DOMAIN } from "@/lib/site";
import {
  btn,
  Card,
  DemoNote,
  inputClass,
  ScreenHero,
  SectionTitle,
  formatMonth,
} from "../ui";
import { ScreenMotion } from "../motion";

type DemoWebsite = ReturnType<typeof useDemo>["website"];

function setWebsite(change: Partial<DemoWebsite>) {
  updateDemo((state) => ({
    ...state,
    website: { ...state.website, ...change },
  }));
}

/** The personal site, rendered from the profile in the chosen template. */
function SitePreview({
  profile,
  template,
  colour,
}: {
  profile: Profile;
  template: WebsiteTemplate;
  colour: string;
}) {
  const dark = template === "developer";
  const style = { "--site": colour } as CSSProperties;
  const projectGrid =
    template === "cards" || template === "classic" ? "sm:grid-cols-2" : "";

  return (
    <div
      style={style}
      className={`min-h-[34rem] p-6 sm:p-10 ${dark ? "bg-[#111] font-mono text-[#e8e6e3]" : "bg-white text-[#1a1613]"}`}
    >
      <p
        className={`text-sm ${dark ? "text-[var(--site)]" : "text-[var(--site)]"}`}
      >
        {dark ? "~/" : ""}
        {profile.fullName.toLowerCase().replace(/\s+/g, "-")}
      </p>
      <h2
        className={`mt-6 font-medium tracking-tight ${template === "minimal" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}
      >
        {profile.fullName}
      </h2>
      <p className="mt-2 text-lg opacity-75">
        {profile.headline} · {profile.location}
      </p>
      <p className="mt-6 max-w-xl leading-7 opacity-85">{profile.summary}</p>
      <span className="mt-6 inline-block rounded-full bg-[var(--site)] px-4 py-2 text-sm font-medium text-white">
        Download CV
      </span>

      <h3 className="mt-12 text-sm font-medium tracking-wide uppercase opacity-60">
        Projects
      </h3>
      <ul className={`mt-4 grid gap-3 ${projectGrid}`}>
        {profile.projects.map((project) => (
          <li
            key={project.id}
            className={`rounded-2xl p-4 ${
              template === "cards"
                ? "bg-[var(--site)]/10"
                : dark
                  ? "border border-white/15"
                  : "border border-black/10"
            }`}
          >
            <p className="font-medium">{project.name}</p>
            <p className="mt-1 text-sm opacity-75">{project.description}</p>
            <p className="mt-2 text-xs opacity-60">
              {project.tech.join(" · ")}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-sm font-medium tracking-wide uppercase opacity-60">
        Experience
      </h3>
      <ul
        className={`mt-4 space-y-5 ${template === "timeline" ? "border-l-2 border-[var(--site)] pl-5" : ""}`}
      >
        {profile.experiences.map((item) => (
          <li key={item.id}>
            <p className="font-medium">
              {item.title}, {item.company}
            </p>
            <p className="text-sm opacity-60">
              {formatMonth(item.start)} – {formatMonth(item.end)}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-sm font-medium tracking-wide uppercase opacity-60">
        Contact
      </h3>
      <p className="mt-3 text-[var(--site)] underline underline-offset-4">
        {profile.email}
      </p>
    </div>
  );
}

export function WebsiteScreen() {
  const { profile, website } = useDemo();
  const valid = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(website.subdomain);
  const url = `${website.subdomain}.${SITES_ROOT_DOMAIN}`;

  return (
    <ScreenMotion id="website" className="space-y-4">
      <ScreenHero
        title="Personal website"
        description="Your profile on a one-page site. Pick a template and a colour; it updates as your profile changes."
        stat={website.published ? "Live" : "Draft"}
        statLabel={url}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="space-y-4">
          <Card>
            <SectionTitle>Template</SectionTitle>
            <div
              className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2"
              role="radiogroup"
              aria-label="Template"
            >
              {WEBSITE_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  role="radio"
                  aria-checked={website.template === template.id}
                  onClick={() => setWebsite({ template: template.id })}
                  className={`rounded-2xl border p-3 text-left transition-colors ${
                    website.template === template.id
                      ? "border-ink bg-ink text-paper"
                      : "border-line hover:border-ink/30"
                  }`}
                >
                  <p className="text-sm font-medium">{template.name}</p>
                  <p
                    className={`mt-0.5 text-xs ${website.template === template.id ? "text-paper/70" : "text-ink-muted"}`}
                  >
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
            <p className="mt-5 mb-2 text-sm font-medium">Accent colour</p>
            <div
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Accent colour"
            >
              {ACCENT_COLOURS.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  role="radio"
                  aria-checked={website.colour === colour}
                  aria-label={`Colour ${colour}`}
                  onClick={() => setWebsite({ colour })}
                  className={`size-9 rounded-full ring-offset-2 ${website.colour === colour ? "ring-2 ring-ink" : ""}`}
                  style={{ background: colour }}
                />
              ))}
            </div>
          </Card>

          <Card surface="sand">
            <SectionTitle>Publish</SectionTitle>
            <label htmlFor="subdomain" className="text-sm font-medium">
              Address
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="subdomain"
                className={`${inputClass} h-11 min-w-0`}
                value={website.subdomain}
                aria-invalid={!valid}
                onChange={(e) =>
                  setWebsite({
                    subdomain: e.target.value.toLowerCase(),
                    published: false,
                  })
                }
              />
              <span className="shrink-0 text-sm text-ink-muted">
                .{SITES_ROOT_DOMAIN}
              </span>
            </div>
            {!valid ? (
              <p className="mt-1.5 text-sm text-danger">
                3–32 characters: lowercase letters, numbers and hyphens.
              </p>
            ) : null}
            <button
              type="button"
              className={`${btn.accent} mt-4 w-full`}
              disabled={!valid}
              onClick={() => setWebsite({ published: !website.published })}
            >
              <Rocket className="size-4" aria-hidden />
              {website.published ? "Unpublish" : "Publish"}
            </button>
            {website.published ? (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
                <ExternalLink className="size-4" aria-hidden />
                Live at {url} (demo)
              </p>
            ) : null}
            <div className="mt-4">
              <DemoNote>
                Demo: publishing is simulated. Custom domains and GitHub Pages
                come with the backend. The site domain is not chosen yet.
              </DemoNote>
            </div>
          </Card>
        </div>

        <div
          data-motion="tile"
          data-motion-hide
          className="min-w-0 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-lift"
        >
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-2.5 rounded-full bg-line" aria-hidden />
            <span className="size-2.5 rounded-full bg-line" aria-hidden />
            <span className="size-2.5 rounded-full bg-line" aria-hidden />
            <span className="ml-2 min-w-0 truncate rounded-full bg-paper px-3 py-1 text-xs text-ink-muted">
              {url}
            </span>
          </div>
          <SitePreview
            profile={profile}
            template={website.template}
            colour={website.colour}
          />
        </div>
      </div>
    </ScreenMotion>
  );
}
