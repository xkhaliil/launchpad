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
import { ScreenMotion } from "../motion";
import { btn, formatMonth, PageHeader, Segmented } from "../ui";

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

const TEMPLATE_OPTIONS = WEBSITE_TEMPLATES.map((template) => ({
  value: template.id,
  label: template.name,
}));

export function WebsiteScreen() {
  const { profile, website } = useDemo();
  const valid = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/.test(website.subdomain);
  const url = `${website.subdomain}.${SITES_ROOT_DOMAIN}`;

  return (
    <ScreenMotion id="website" className="space-y-8">
      <PageHeader
        title="Website"
        stat={website.published ? "Live" : "Draft"}
        statLabel={website.published ? `at ${url} (demo)` : "not published yet"}
        actions={
          website.published ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-sm text-success">
                <ExternalLink className="size-4" aria-hidden />
                Live
              </span>
              <button
                type="button"
                className={btn.secondary}
                onClick={() => setWebsite({ published: false })}
              >
                Unpublish
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${btn.accent} h-11 px-5`}
              disabled={!valid}
              onClick={() => setWebsite({ published: true })}
            >
              <Rocket className="size-4" aria-hidden />
              Publish
            </button>
          )
        }
      >
        It updates by itself when your profile changes. Publishing is simulated
        in the demo.
      </PageHeader>

      {/* Every choice in one row above the preview. */}
      <div
        data-motion="tile"
        data-motion-hide
        className="flex flex-wrap items-center gap-x-5 gap-y-3"
      >
        <Segmented
          label="Template"
          value={website.template}
          options={TEMPLATE_OPTIONS}
          onChange={(template: WebsiteTemplate) => setWebsite({ template })}
        />
        <div className="flex gap-1.5" role="radiogroup" aria-label="Colour">
          {ACCENT_COLOURS.map((colour) => (
            <button
              key={colour}
              type="button"
              role="radio"
              aria-checked={website.colour === colour}
              aria-label={`Colour ${colour}`}
              onClick={() => setWebsite({ colour })}
              className={`size-7 rounded-full ring-offset-2 ring-offset-paper ${website.colour === colour ? "ring-2 ring-ink" : ""}`}
              style={{ background: colour }}
            />
          ))}
        </div>
        <label className="flex min-w-0 items-center gap-1 text-sm text-ink-muted">
          <span className="sr-only">Address</span>
          <input
            className={`h-9 w-40 min-w-0 rounded-full bg-surface px-3 text-ink ring-1 transition-colors focus:ring-2 focus:outline-none ${
              valid ? "ring-line focus:ring-accent/50" : "ring-danger"
            }`}
            value={website.subdomain}
            aria-invalid={!valid}
            aria-describedby={valid ? undefined : "subdomain-error"}
            onChange={(e) =>
              setWebsite({
                subdomain: e.target.value.toLowerCase(),
                published: false,
              })
            }
          />
          .{SITES_ROOT_DOMAIN}
        </label>
      </div>
      {!valid ? (
        <p id="subdomain-error" className="-mt-5 text-sm text-danger">
          The address needs 3–32 characters: lowercase letters, numbers and
          hyphens.
        </p>
      ) : null}

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
    </ScreenMotion>
  );
}
