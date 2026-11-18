/**
 * The profile: the single source of truth every module builds from
 * (plan.md, section 5). Dates are "YYYY-MM"; `end: null` means "present".
 */

export type Experience = {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string;
  end: string | null;
  bullets: string[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  tech: string[];
  repoUrl?: string;
  liveUrl?: string;
  bullets: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string | null;
  grade?: string;
};

export type SkillCategory =
  "language" | "framework" | "tool" | "cloud" | "other";

export type Skill = { name: string; category: SkillCategory };

export type Language = { name: string; level: string };

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type ExperienceLevel = "student" | "graduate" | "junior";

export type Profile = {
  fullName: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  links: { github?: string; linkedin?: string; website?: string };
  targetRole: string;
  experienceLevel: ExperienceLevel;
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
};

export type Severity = "high" | "medium" | "low";
