import type { Profile } from "@/lib/core/types";
import { formatMonth } from "./ui";

export type CvOptions = {
  template: "classic" | "compact";
  summary: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
};

export const defaultCvOptions: CvOptions = {
  template: "classic",
  summary: true,
  projects: true,
  certifications: true,
  languages: true,
};

/**
 * The CV itself, following the ATS-safe rules in plan.md, section 6.2: one
 * column, no tables or icons, contact details in the body, standard section
 * headings, a standard font, one date format, plain bullets.
 */
export function CvDocument({
  profile,
  options = defaultCvOptions,
}: {
  profile: Profile;
  options?: CvOptions;
}) {
  const compact = options.template === "compact";
  const heading = `${compact ? "mt-4" : "mt-5"} border-b border-black/70 pb-0.5 text-[11px] font-bold tracking-[0.08em] uppercase`;
  const contact = [
    profile.email,
    profile.phone,
    profile.location,
    profile.links.github,
    profile.links.linkedin,
    profile.links.website,
  ].filter(Boolean);

  return (
    <article
      aria-label="CV preview"
      className={`bg-white text-black ${compact ? "text-[11.5px] leading-[1.4]" : "text-[12px] leading-normal"}`}
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <h2 className="text-[22px] leading-tight font-bold">
        {profile.fullName}
      </h2>
      <p className="text-[13px]">{profile.headline}</p>
      <p className="mt-1 text-[11px] wrap-break-word">{contact.join(" | ")}</p>

      {options.summary && profile.summary ? (
        <section>
          <h3 className={heading}>Summary</h3>
          <p className="mt-1.5">{profile.summary}</p>
        </section>
      ) : null}

      {profile.skills.length > 0 ? (
        <section>
          <h3 className={heading}>Skills</h3>
          <p className="mt-1.5">
            {profile.skills.map((skill) => skill.name).join(", ")}
          </p>
        </section>
      ) : null}

      {profile.experiences.length > 0 ? (
        <section>
          <h3 className={heading}>Experience</h3>
          {profile.experiences.map((item) => (
            <div key={item.id} className="mt-2">
              <p className="flex flex-wrap justify-between gap-x-3">
                <span className="font-bold">
                  {item.title}, {item.company}
                </span>
                <span>
                  {formatMonth(item.start)} – {formatMonth(item.end)}
                </span>
              </p>
              <ul className="mt-0.5 list-disc pl-4">
                {item.bullets
                  .filter((b) => b.trim())
                  .map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {options.projects && profile.projects.length > 0 ? (
        <section>
          <h3 className={heading}>Projects</h3>
          {profile.projects.map((item) => (
            <div key={item.id} className="mt-2">
              <p>
                <span className="font-bold">{item.name}</span>
                {item.tech.length > 0 ? ` (${item.tech.join(", ")})` : ""}
                {item.repoUrl ? ` | ${item.repoUrl}` : ""}
              </p>
              {item.description ? <p>{item.description}</p> : null}
              <ul className="mt-0.5 list-disc pl-4">
                {item.bullets
                  .filter((b) => b.trim())
                  .map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {profile.educations.length > 0 ? (
        <section>
          <h3 className={heading}>Education</h3>
          {profile.educations.map((item) => (
            <p
              key={item.id}
              className="mt-2 flex flex-wrap justify-between gap-x-3"
            >
              <span>
                <span className="font-bold">
                  {item.degree} {item.field}
                </span>
                , {item.school}
                {item.grade ? ` (grade ${item.grade})` : ""}
              </span>
              <span>
                {formatMonth(item.start)} – {formatMonth(item.end)}
              </span>
            </p>
          ))}
        </section>
      ) : null}

      {options.certifications && profile.certifications.length > 0 ? (
        <section>
          <h3 className={heading}>Certifications</h3>
          {profile.certifications.map((item) => (
            <p key={item.id} className="mt-1.5">
              {item.name}, {item.issuer}, {formatMonth(item.date)}
            </p>
          ))}
        </section>
      ) : null}

      {options.languages && profile.languages.length > 0 ? (
        <section>
          <h3 className={heading}>Languages</h3>
          <p className="mt-1.5">
            {profile.languages
              .map((language) => `${language.name} (${language.level})`)
              .join(", ")}
          </p>
        </section>
      ) : null}
    </article>
  );
}
