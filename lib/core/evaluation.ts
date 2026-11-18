/**
 * Full evaluation (plan.md, section 6.9). Each area reports how complete it
 * is (0 to 1); this turns that into points and the top fixes.
 */

export type AreaId =
  | "cv"
  | "github"
  | "linkedin"
  | "coverLetters"
  | "website"
  | "documents"
  | "consistency";

/** Points per area. They will be tuned, so they live here in one place. */
export const AREA_WEIGHTS: Record<AreaId, number> = {
  cv: 25,
  github: 20,
  linkedin: 15,
  coverLetters: 10,
  website: 10,
  documents: 10,
  consistency: 10,
};

export type AreaInput = {
  id: AreaId;
  label: string;
  /** How complete the area is, 0 to 1. Values outside are clamped. */
  ratio: number;
  /** The single most useful thing to do next in this area. */
  fix: string;
  href: string;
};

export type AreaResult = AreaInput & { points: number; max: number };

export type Fix = {
  areaId: AreaId;
  label: string;
  fix: string;
  href: string;
  /** Points gained by completing the area. */
  gain: number;
};

export type Evaluation = {
  total: number;
  areas: AreaResult[];
  /** Up to five fixes, most points first. */
  topFixes: Fix[];
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function evaluate(inputs: AreaInput[]): Evaluation {
  const areas = inputs.map((input) => {
    const max = AREA_WEIGHTS[input.id];
    return { ...input, max, points: Math.round(clamp(input.ratio) * max) };
  });

  const topFixes = areas
    .filter((area) => area.points < area.max)
    .map((area) => ({
      areaId: area.id,
      label: area.label,
      fix: area.fix,
      href: area.href,
      gain: area.max - area.points,
    }))
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 5);

  return {
    total: areas.reduce((sum, area) => sum + area.points, 0),
    areas,
    topFixes,
  };
}
