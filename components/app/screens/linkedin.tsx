"use client";

import { Check, Download, ImageUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LinkedinSuggestions } from "@/lib/ai/provider";
import { ai } from "@/lib/ai/mock";
import {
  ACCENT_COLOURS,
  type LinkedinField,
  LINKEDIN_FIELDS,
} from "@/lib/demo/data";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { Badge, btn, Card, ScreenHero, SectionTitle, initials } from "../ui";
import { ScreenMotion } from "../motion";
import { CopyButton } from "./cover-letters";

const LIMITS: Partial<Record<LinkedinField, number>> = {
  headline: 220,
  about: 2600,
};

function toggleDone(field: LinkedinField, done: boolean) {
  updateDemo((state) => {
    const list = done
      ? [...new Set([...state.linkedin.done, field])]
      : state.linkedin.done.filter((item) => item !== field);
    // Copying the suggested headline makes LinkedIn match the profile.
    const sources =
      field === "headline" && done
        ? {
            ...state.sources,
            linkedin: {
              ...state.sources.linkedin,
              headline: state.profile.headline,
              location: state.profile.location,
            },
          }
        : state.sources;
    return { ...state, sources, linkedin: { ...state.linkedin, done: list } };
  });
}

function DoneToggle({ field, done }: { field: LinkedinField; done: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => toggleDone(field, !done)}
      className={done ? btn.primary : btn.secondary}
    >
      <Check className="size-4" aria-hidden />
      {done ? "Done" : "Mark as done"}
    </button>
  );
}

function FieldCard({
  field,
  title,
  text,
  done,
}: {
  field: LinkedinField;
  title: string;
  text: string;
  done: boolean;
}) {
  const limit = LIMITS[field];
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        {limit ? (
          <span
            className={`text-xs tabular-nums ${text.length > limit ? "text-danger" : "text-ink-muted"}`}
          >
            {text.length} / {limit}
          </span>
        ) : null}
      </div>
      <p className="mt-3 rounded-2xl bg-paper p-4 text-sm leading-6 whitespace-pre-line">
        {text}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <CopyButton text={text} />
        <DoneToggle field={field} done={done} />
      </div>
    </Card>
  );
}

/** Draws the banner (1584 × 396, LinkedIn's size) on a canvas. */
function drawBanner(
  canvas: HTMLCanvasElement,
  {
    name,
    role,
    skills,
    colour,
    template,
  }: {
    name: string;
    role: string;
    skills: string;
    colour: string;
    template: number;
  },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1584;
  const H = 396;
  canvas.width = W;
  canvas.height = H;
  const font = getComputedStyle(document.body).fontFamily;

  if (template === 0) {
    const gradient = ctx.createLinearGradient(0, 0, W, H);
    gradient.addColorStop(0, "#ffe6ad");
    gradient.addColorStop(0.55, "#ffcfa3");
    gradient.addColorStop(1, "#ffd3dc");
    ctx.fillStyle = gradient;
  } else if (template === 1) {
    ctx.fillStyle = "#1a1613";
  } else {
    ctx.fillStyle = colour;
  }
  ctx.fillRect(0, 0, W, H);

  // A soft circle of the accent colour as decoration (away from the photo area).
  ctx.globalAlpha = template === 2 ? 0.18 : 0.35;
  ctx.fillStyle = template === 2 ? "#ffffff" : colour;
  ctx.beginPath();
  ctx.arc(W - 120, 60, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Text sits centre-right: the profile photo covers the bottom left.
  const light = template !== 0;
  ctx.fillStyle = light ? "#fdfaf5" : "#1a1613";
  ctx.textBaseline = "alphabetic";
  ctx.font = `500 76px ${font}`;
  ctx.fillText(name, 560, 180);
  ctx.font = `400 40px ${font}`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(role, 560, 240);
  ctx.font = `400 30px ${font}`;
  ctx.globalAlpha = 0.65;
  ctx.fillText(skills, 560, 300);
  ctx.globalAlpha = 1;
}

function download(canvas: HTMLCanvasElement, fileName: string) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function BannerTool({ done }: { done: boolean }) {
  const { profile, linkedin } = useDemo();
  const canvas = useRef<HTMLCanvasElement>(null);
  const skills = profile.skills
    .slice(0, 4)
    .map((skill) => skill.name)
    .join("  ·  ");

  useEffect(() => {
    if (!canvas.current) return;
    drawBanner(canvas.current, {
      name: profile.fullName,
      role: profile.headline,
      skills,
      colour: linkedin.colour,
      template: linkedin.banner,
    });
  }, [
    profile.fullName,
    profile.headline,
    skills,
    linkedin.colour,
    linkedin.banner,
  ]);

  return (
    <Card surface="sand">
      <SectionTitle
        action={done ? <Badge tone="success">Done</Badge> : undefined}
      >
        Banner · 1584 × 396
      </SectionTitle>
      <canvas
        ref={canvas}
        aria-label="Banner preview"
        className="aspect-[4/1] w-full rounded-2xl ring-1 ring-line"
      />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {["Warm", "Dark", "Colour"].map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={linkedin.banner === index}
            onClick={() =>
              updateDemo((s) => ({
                ...s,
                linkedin: { ...s.linkedin, banner: index },
              }))
            }
            className={`min-h-10 rounded-full px-4 text-sm font-medium ${
              linkedin.banner === index
                ? "bg-ink text-paper"
                : "ring-1 ring-line hover:ring-ink/30"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-line" aria-hidden />
        {ACCENT_COLOURS.map((colour) => (
          <button
            key={colour}
            type="button"
            aria-label={`Colour ${colour}`}
            aria-pressed={linkedin.colour === colour}
            onClick={() =>
              updateDemo((s) => ({ ...s, linkedin: { ...s.linkedin, colour } }))
            }
            className={`size-8 rounded-full ring-offset-2 ${linkedin.colour === colour ? "ring-2 ring-ink" : ""}`}
            style={{ background: colour }}
          />
        ))}
      </div>
      <button
        type="button"
        className={`${btn.primary} mt-4`}
        onClick={() => {
          if (!canvas.current) return;
          download(canvas.current, "linkedin-banner.png");
          toggleDone("banner", true);
        }}
      >
        <Download className="size-4" aria-hidden />
        Download PNG
      </button>
    </Card>
  );
}

const PHOTO_BACKGROUNDS = [
  "#f4eee4",
  "#ffcfa3",
  "#d6e4ff",
  "#1a1613",
  "#ffffff",
];

function PhotoTool({ done }: { done: boolean }) {
  const { profile } = useDemo();
  const [source, setSource] = useState<string | null>(null);
  const [background, setBackground] = useState(PHOTO_BACKGROUNDS[0]);

  const exportPhoto = () => {
    if (!source) return;
    const image = new Image();
    image.onload = () => {
      const size = 400;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);
      // Centre-crop to a square.
      const side = Math.min(image.width, image.height);
      ctx.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size,
      );
      download(canvas, "profile-photo-400.png");
      toggleDone("photo", true);
    };
    image.src = source;
  };

  return (
    <Card surface="sand">
      <SectionTitle
        action={done ? <Badge tone="success">Done</Badge> : undefined}
      >
        Profile photo · 400 × 400
      </SectionTitle>
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div
          className="grid size-36 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-line"
          style={{ background }}
        >
          {source ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local preview of the user's own file
            <img
              src={source}
              alt="Your photo, cropped to a circle"
              className="size-full object-cover"
            />
          ) : (
            <span className="text-3xl font-medium text-ink/60">
              {initials(profile.fullName)}
            </span>
          )}
        </div>
        <div className="w-full space-y-3">
          <label className={`${btn.secondary} cursor-pointer`}>
            <ImageUp className="size-4" aria-hidden />
            {source ? "Choose another photo" : "Choose a photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setSource(String(reader.result));
                reader.readAsDataURL(file);
              }}
            />
          </label>
          <div
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Background colour"
          >
            {PHOTO_BACKGROUNDS.map((colour) => (
              <button
                key={colour}
                type="button"
                role="radio"
                aria-checked={background === colour}
                aria-label={`Background ${colour}`}
                onClick={() => setBackground(colour)}
                className={`size-8 rounded-full ring-1 ring-line ring-offset-2 ${background === colour ? "ring-2 ring-ink" : ""}`}
                style={{ background: colour }}
              />
            ))}
          </div>
          <p className="text-xs leading-5 text-ink-muted">
            Your photo stays in this browser. Automatic background removal comes
            with the backend; the colour shows behind transparent photos.
          </p>
          <button
            type="button"
            className={btn.primary}
            disabled={!source}
            onClick={exportPhoto}
          >
            <Download className="size-4" aria-hidden />
            Download PNG
          </button>
        </div>
      </div>
    </Card>
  );
}

export function LinkedinScreen() {
  const { profile, linkedin } = useDemo();
  const [suggestions, setSuggestions] = useState<LinkedinSuggestions | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    ai.suggestLinkedin(profile).then((result) => {
      if (!cancelled) setSuggestions(result);
    });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const done = (field: LinkedinField) => linkedin.done.includes(field);

  return (
    <ScreenMotion id="linkedin" className="space-y-4">
      <ScreenHero
        title="LinkedIn studio"
        description="Suggested text for each field, ready to copy, plus a banner and a profile photo. LinkedIn does not let apps edit profiles, so you paste these in yourself."
        stat={linkedin.done.length}
        statSuffix={`/${LINKEDIN_FIELDS.length}`}
        statLabel="fields done"
      >
        <div className="flex gap-1.5" aria-hidden>
          {LINKEDIN_FIELDS.map((field) => (
            <span
              key={field}
              className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10"
            >
              <span
                data-motion="fill"
                className={`block h-full rounded-full ${linkedin.done.includes(field) ? "bg-glow-1" : ""}`}
              />
            </span>
          ))}
        </div>
      </ScreenHero>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        {/* A LinkedIn-like preview, in our own styling. */}
        <Card pad="none" className="overflow-hidden xl:sticky xl:top-6">
          <div className="aspect-[4/1] bg-linear-to-r from-glow-2 via-glow-1 to-glow-3" />
          <div className="px-5 pb-6 sm:px-6">
            <div className="-mt-10 grid size-20 place-items-center rounded-full border-4 border-surface bg-ink text-xl font-medium text-paper">
              {initials(profile.fullName)}
            </div>
            <p className="mt-3 text-xl font-medium">{profile.fullName}</p>
            <p className="mt-1 text-sm">{suggestions?.headline ?? "…"}</p>
            <p className="mt-1 text-sm text-ink-muted">{profile.location}</p>
            <p className="mt-1 text-sm text-ink-muted">{suggestions?.url}</p>
            <div className="mt-6 border-t border-line pt-5">
              <p className="font-medium">About</p>
              <p className="mt-2 line-clamp-6 text-sm leading-6 whitespace-pre-line text-ink-muted">
                {suggestions?.about}
              </p>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="font-medium">Top skills</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {suggestions?.skills.map((skill) => (
                  <li key={skill}>
                    <Badge>{skill}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <div className="min-w-0 space-y-4">
          {suggestions ? (
            <>
              <FieldCard
                field="headline"
                title="Headline"
                text={suggestions.headline}
                done={done("headline")}
              />
              <FieldCard
                field="url"
                title="Custom URL"
                text={suggestions.url}
                done={done("url")}
              />
              <FieldCard
                field="about"
                title="About"
                text={suggestions.about}
                done={done("about")}
              />
              <FieldCard
                field="experience"
                title="Experience"
                text={suggestions.experience
                  .map((item) => `${item.title}\n${item.text}`)
                  .join("\n\n")}
                done={done("experience")}
              />
              <FieldCard
                field="skills"
                title="Top 5 skills"
                text={suggestions.skills.join(", ")}
                done={done("skills")}
              />
            </>
          ) : (
            <Card>
              <p className="text-sm text-ink-muted" aria-live="polite">
                Drafting suggestions from your profile…
              </p>
            </Card>
          )}
          <BannerTool done={done("banner")} />
          <PhotoTool done={done("photo")} />
        </div>
      </div>
    </ScreenMotion>
  );
}
