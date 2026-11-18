"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  ImageUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { setLinkedinDone } from "@/lib/demo/actions";
import {
  ACCENT_COLOURS,
  type LinkedinField,
  LINKEDIN_FIELDS,
} from "@/lib/demo/data";
import { updateDemo, useDemo } from "@/lib/demo/store";
import { linkedinText } from "@/lib/demo/suggestions";
import { CopyButton } from "../copy-button";
import { ScreenMotion } from "../motion";
import { useReview } from "../review";
import {
  Badge,
  btn,
  Card,
  initials,
  listClass,
  PageHeader,
  Segmented,
} from "../ui";

const FIELD_NAMES: Record<LinkedinField, string> = {
  headline: "Headline",
  about: "About",
  experience: "Experience",
  skills: "Top skills",
  url: "Custom URL",
  banner: "Banner",
  photo: "Profile photo",
};

const LIMITS: Partial<Record<LinkedinField, number>> = {
  headline: 220,
  about: 2600,
};

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

const BANNER_STYLES = [
  { value: "0", label: "Warm" },
  { value: "1", label: "Dark" },
  { value: "2", label: "Colour" },
] as const;

function BannerTool() {
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
    <div className="space-y-3">
      <canvas
        ref={canvas}
        aria-label="Banner preview, 1584 by 396 pixels"
        className="aspect-[4/1] w-full rounded-xl ring-1 ring-line"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Banner style"
          value={String(linkedin.banner) as "0" | "1" | "2"}
          options={BANNER_STYLES}
          onChange={(value) =>
            updateDemo((s) => ({
              ...s,
              linkedin: { ...s.linkedin, banner: Number(value) },
            }))
          }
        />
        <div className="flex gap-1.5" role="radiogroup" aria-label="Colour">
          {ACCENT_COLOURS.map((colour) => (
            <button
              key={colour}
              type="button"
              role="radio"
              aria-label={`Colour ${colour}`}
              aria-checked={linkedin.colour === colour}
              onClick={() =>
                updateDemo((s) => ({
                  ...s,
                  linkedin: { ...s.linkedin, colour },
                }))
              }
              className={`size-7 rounded-full ring-offset-2 ring-offset-paper ${linkedin.colour === colour ? "ring-2 ring-ink" : ""}`}
              style={{ background: colour }}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        className={btn.primary}
        onClick={() => {
          if (!canvas.current) return;
          download(canvas.current, "linkedin-banner.png");
          setLinkedinDone("banner", true);
        }}
      >
        <Download className="size-4" aria-hidden />
        Download banner
      </button>
    </div>
  );
}

const PHOTO_BACKGROUNDS = [
  "#f4eee4",
  "#ffcfa3",
  "#d6e4ff",
  "#1a1613",
  "#ffffff",
];

function PhotoTool() {
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
      setLinkedinDone("photo", true);
    };
    image.src = source;
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div
        className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-line"
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
          <span className="text-2xl font-medium text-ink/60">
            {initials(profile.fullName)}
          </span>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Background">
          {PHOTO_BACKGROUNDS.map((colour) => (
            <button
              key={colour}
              type="button"
              role="radio"
              aria-checked={background === colour}
              aria-label={`Background ${colour}`}
              onClick={() => setBackground(colour)}
              className={`size-7 rounded-full ring-1 ring-line ring-offset-2 ring-offset-paper ${background === colour ? "ring-2 ring-ink" : ""}`}
              style={{ background: colour }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`${btn.secondary} cursor-pointer`}>
            <ImageUp className="size-4" aria-hidden />
            {source ? "Another photo" : "Choose a photo"}
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
          <button
            type="button"
            className={btn.primary}
            disabled={!source}
            onClick={exportPhoto}
          >
            <Download className="size-4" aria-hidden />
            Download
          </button>
        </div>
        <p className="text-xs text-ink-muted">
          Your photo stays in this browser.
        </p>
      </div>
    </div>
  );
}

export function LinkedinScreen() {
  const { profile, linkedin } = useDemo();
  const review = useReview();
  const suggestions = review.linkedin;
  const [open, setOpen] = useState<LinkedinField | null>(null);
  const left = review.countFor("linkedin");
  const isDone = (field: LinkedinField) => linkedin.done.includes(field);

  return (
    <ScreenMotion id="linkedin" className="space-y-8">
      <PageHeader
        title="LinkedIn"
        stat={`${linkedin.done.length}/${LINKEDIN_FIELDS.length}`}
        statLabel="fields done"
        actions={
          left > 0 ? (
            <button
              type="button"
              className={`${btn.accent} h-11 px-5`}
              onClick={() => review.open({ area: "linkedin" })}
            >
              Copy {left} text{left === 1 ? "" : "s"}
              <ArrowRight className="size-4" aria-hidden />
            </button>
          ) : null
        }
      >
        LinkedIn does not let apps edit profiles: you copy each field and paste
        it in.
      </PageHeader>

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:gap-10">
        {/* A LinkedIn-like preview, in our own styling. */}
        <Card pad="none" className="overflow-hidden xl:sticky xl:top-24">
          <div className="aspect-[4/1] bg-linear-to-r from-glow-2 via-glow-1 to-glow-3" />
          <div className="px-5 pb-6 sm:px-6">
            <div className="-mt-10 grid size-20 place-items-center rounded-full border-4 border-surface bg-ink text-xl font-medium text-paper">
              {initials(profile.fullName)}
            </div>
            <p className="mt-3 text-xl font-medium">{profile.fullName}</p>
            <p className="mt-1 text-sm">{suggestions?.headline ?? "…"}</p>
            <p className="mt-1 text-sm text-ink-muted">{profile.location}</p>
            <div className="mt-6 border-t border-line pt-5">
              <p className="font-medium">About</p>
              <p className="mt-2 line-clamp-5 text-sm leading-6 whitespace-pre-line text-ink-muted">
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

        {/* The checklist: one field open at a time. */}
        <ul
          className={listClass}
          data-motion="tile"
          data-motion-hide
          aria-label="LinkedIn fields"
        >
          {LINKEDIN_FIELDS.map((field) => {
            const done = isDone(field);
            const text = suggestions ? linkedinText(field, suggestions) : null;
            const expanded = open === field;
            const limit = LIMITS[field];
            return (
              <li key={field}>
                <div className="flex items-center gap-3 py-2.5">
                  <button
                    type="button"
                    aria-pressed={done}
                    aria-label={`${FIELD_NAMES[field]} done`}
                    onClick={() => setLinkedinDone(field, !done)}
                    className={`grid size-7 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      done
                        ? "bg-success text-surface"
                        : "ring-1 ring-ink/20 hover:ring-ink/45"
                    }`}
                  >
                    {done ? (
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    ) : null}
                  </button>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`field-${field}`}
                    onClick={() => setOpen(expanded ? null : field)}
                    className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span
                      className={`truncate text-[15px] font-medium ${done ? "text-ink-muted" : ""}`}
                    >
                      {FIELD_NAMES[field]}
                    </span>
                    <ChevronDown
                      aria-hidden
                      className={`size-4 shrink-0 text-ink/40 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {text ? (
                    <CopyButton
                      text={text}
                      size="small"
                      onCopied={() => setLinkedinDone(field, true)}
                    />
                  ) : null}
                </div>
                {expanded ? (
                  <div id={`field-${field}`} className="pb-5 pl-10">
                    {field === "banner" ? (
                      <BannerTool />
                    ) : field === "photo" ? (
                      <PhotoTool />
                    ) : text ? (
                      <>
                        <p className="rounded-2xl bg-surface p-4 text-sm leading-6 whitespace-pre-line ring-1 ring-line">
                          {text}
                        </p>
                        {limit ? (
                          <p
                            className={`mt-1.5 text-xs tabular-nums ${text.length > limit ? "text-danger" : "text-ink-muted"}`}
                          >
                            {text.length} / {limit} characters
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-sm text-ink-muted" aria-live="polite">
                        Drafting from your profile…
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </ScreenMotion>
  );
}
