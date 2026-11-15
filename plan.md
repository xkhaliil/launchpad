# plan.md — Launchpad: Job-Ready Platform for CS Graduates

> **For the AI agent building this project.** Read this whole file before writing code.
> It is the single source of truth for what to build, in what order, and which rules
> must never be broken. When something here conflicts with your own assumptions, this
> file wins. When this file is silent or ambiguous, ask the owner before building
> anything expensive or irreversible.

- **Product name:** Launchpad (working name; keep it in one constant so it can change)
- **Owner:** Khalil Ltaief (GitHub: `xkhaliil`)
- **Existing asset to reuse:** [gitms](https://github.com/xkhaliil/github-ms) (GitHub repo describer)
- **Plan version:** 1.0, 2026-11-15
- **Language of the product:** English only (v1)

---

## 0. How to work on this project (agent rules)

1. **Work phase by phase** (section 12). Do not start a phase before the previous phase's
   acceptance criteria pass.
2. **Before each task:** restate the task in one line, list the files you will touch,
   then build. After each task: run lint, type-check and tests; update the checklist
   in section 12 (`- [ ]` → `- [x]`).
3. **Never invent facts about a student.** Every AI output must be built only from the
   student's profile, uploaded files, job ads they pasted, or code in their repos.
   Unknown details become explicit placeholders (`<!-- TODO: ... -->` or `[ADD: ...]`),
   never guesses. This is the most important product rule.
4. **Never write to a student's GitHub without an explicit approval** recorded in the
   database for that exact change. Dry run is the default everywhere.
5. **Never promise "100% ATS pass".** UI copy says "ATS-friendly" and "estimated score".
6. **Secrets:** never log tokens, API keys, or uploaded document contents. Never commit
   `.env` files.
7. **Small, reviewable commits** with clear messages. One feature per pull request.
8. **Tests are part of done:** unit tests for logic (scoring, parsing, validation),
   integration tests for API routes, Playwright for the main user flows.
9. **Ask the owner first** before: changing the stack, adding a paid third-party
   service, changing database schema after Phase 2, or anything touching billing.
10. **Keep this file current.** If a decision changes, update the relevant section and
    add a line to the Decision log (section 15).

---

## 1. Product summary

CS graduates must prepare an ATS-friendly CV, cover letters, a LinkedIn profile, a GitHub
profile, a personal website and a set of documents. Today that takes 4–6 separate tools,
and the same facts are re-typed in each, so they drift apart.

**Launchpad** gives each student **one profile** (the single source of truth) and
**eight AI-powered modules** that generate and check every output from it, plus a
**one-click full evaluation** that scores everything at once (0–100) and lists the top fixes.

### Target users
- Primary: final-year CS students and graduates with 0–2 years of experience.
- Secondary: bootcamp graduates and career changers into software roles.
- B2B: university career services (one licence covers many students).

### Goals for v1
1. Sign-up to a finished ATS-friendly CV in under 30 minutes.
2. Every student can complete all eight modules and end with consistent outputs.
3. Measure interview outcomes (self-reported) to prove the product works.

### Non-goals for v1 (do NOT build)
- Auto-applying to jobs.
- Editing LinkedIn directly (API is restricted; see section 6.5).
- Scraping LinkedIn or any other site.
- Interview practice, salary data, job tracker, German-language CVs (later phases).
- Mobile apps (responsive web only).

---

## 2. The eight modules (overview)

| # | Module | What it does | Output |
|---|---|---|---|
| 1 | GitHub profile manager | Audits and edits the whole GitHub profile: profile README, bio, links, repo descriptions, topics, repo READMEs; suggests pins and clean-up | Changes applied on GitHub after approval |
| 2 | CV builder + ATS checker | Builds an ATS-friendly PDF CV from profile + GitHub, then checks it with a built-in ATS checker, fix loop until target score | PDF + DOCX CV with score |
| 3 | Cover letter | Writes a cover letter from the profile | Editable letter, PDF/DOCX |
| 4 | Generic and tailored versions | Generic CV + letter, or a pair tailored to a pasted job description | Saved pair per job ad, match score before/after |
| 5 | LinkedIn studio | LinkedIn-style mockup filled with suggested text + Copy buttons; banner generator; profile photo tool | Text per field, 1584×396 banner, 400×400 PNG photo |
| 6 | Personal website | Puts the profile into one of 3–5 professional templates | Hosted site, custom domain, or GitHub Pages |
| 7 | Documents pack | Checklist, uploads, standard file names, one merged application PDF | Status list + merged PDF |
| 8 | Consistency checker | Compares names, titles, dates, skills, projects across all outputs | Mismatch list with one-click fixes |
| + | Full evaluation | Scores all modules in one run | Report: score 0–100 + top 5 fixes |

Detailed rules for each module are in section 6.

---

## 3. User journey

```
Sign up (email / GitHub / Google)
  → Onboarding: target role, location, level; upload existing CV or LinkedIn PDF export
  → Profile auto-filled from import; student reviews and completes it
  → Dashboard: evaluation score + 8 module cards + "next best step"
  → Loop: open next module → AI drafts → student edits/approves → score updates
  → All 8 done → Consistency check → no mismatches
  → Ready to apply: tailor CV + letter per job ad
```

The dashboard must always show exactly **one** recommended next step (the fix that adds
the most evaluation points).

---

## 4. Tech stack (decided — ask before changing)

| Layer | Choice | Notes |
|---|---|---|
| App | Next.js (App Router), React, TypeScript (strict) | One codebase for public pages, app, and API routes |
| UI | Tailwind CSS + shadcn/ui | Clean, accessible defaults |
| Database | PostgreSQL on Supabase, **EU region (Frankfurt)** | Use Drizzle ORM + SQL migrations |
| Auth | Supabase Auth: email magic link, Google, GitHub OAuth | Sign-in only; GitHub write access is separate (GitHub App) |
| GitHub write access | GitHub App (fine-grained permissions) + Octokit (`@octokit/rest`, retry + throttling plugins), REST + GraphQL | Core logic ported from gitms |
| AI | Anthropic Claude API via `@anthropic-ai/sdk`; `zod` schemas for every AI output | Larger model for writing, smaller model for scoring/extraction; model IDs in config, not hard-coded |
| File storage | Supabase Storage, private buckets, short-lived signed URLs | Uploads, generated PDFs, images |
| CV PDF | HTML/CSS template → PDF with headless Chrome (Playwright/Puppeteer) | Must produce real selectable text |
| DOCX | `docx` npm library | Same content as PDF |
| ATS checker | PDF text extraction (`pdfjs-dist` or `pdf-parse`) on the generated file | Checks the real file, the way an ATS reads it |
| Images | Background removal model (self-hosted, e.g. rembg/U²-Net in a worker, or a paid API if owner approves) + `sharp` for crop/resize/PNG; banners via Satori (`@vercel/og`) | |
| Websites | Wildcard subdomain on Vercel (`*.readydev.app`), custom domains, or deploy to GitHub Pages via the GitHub App | |
| Background jobs | Supabase queue table + worker, or Inngest/Trigger.dev (ask owner) | AI generation, PDF render, image processing, repo scans |
| Payments | Stripe (subscriptions, coupons, invoices for universities) | Phase 4 |
| Email | Resend or Postmark | |
| Analytics | PostHog EU cloud | |
| Testing | Vitest (unit/integration), Playwright (E2E) | |
| Hosting | Vercel (EU functions where possible) | |

### Repository layout

```
/apps/web                 Next.js app (public site + app + API routes)
  /app/(public)           landing, pricing, free ATS check, blog, auth
  /app/(app)              dashboard and all modules (auth required)
  /app/api                route handlers
  /components             UI components
/packages/core            pure TypeScript logic, no framework imports
  /github                 ported from gitms core/: scan, audit, evidence, prompts, apply
  /cv                     CV model, ATS rules, checker, keyword extraction
  /ai                     Anthropic client, prompts, zod schemas, cost tracking
  /evaluation             scoring for every module + full evaluation
  /consistency            cross-platform comparison
  /linkedin               field suggestions, banner + photo specs
/packages/templates       CV templates, website templates, banner templates
/packages/db              Drizzle schema, migrations, seed data
/workers                  background jobs (PDF, images, AI, scans)
/tests                    e2e (Playwright)
plan.md                   this file
```

### Environment variables (`.env.example`, never commit real values)

```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ANTHROPIC_API_KEY=
AI_MODEL_WRITER=claude-sonnet-5-5
AI_MODEL_SCORER=claude-haiku-5-5
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_WEBHOOK_SECRET=
TOKEN_ENCRYPTION_KEY=          # 32-byte key for AES-256-GCM
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
POSTHOG_KEY=
SITES_ROOT_DOMAIN=readydev.app
```

---

## 5. Data model

Every table has `id uuid pk`, `created_at`, `updated_at`. All user-owned tables have
`user_id` and **Row Level Security** so a user can only read/write their own rows.

| Table | Key columns | Relation |
|---|---|---|
| `users` | email, auth_provider, plan (`free`/`pro`/`university`), university_id (nullable), onboarding_done | — |
| `profiles` | full_name, headline, summary, location, email_public, phone, links (jsonb: github, linkedin, website, other), target_role, experience_level | users 1:1 |
| `experiences` | company, title, location, start_date, end_date (null = current), bullets (text[]), order | profiles 1:n |
| `projects` | name, description, tech (text[]), repo_url, live_url, bullets (text[]), screenshot_path, github_repo_id (nullable), order | profiles 1:n |
| `educations` | school, degree, field, start_date, end_date, grade, order | profiles 1:n |
| `skills` | name, category (`language`/`framework`/`tool`/`cloud`/`other`), level | profiles 1:n |
| `certifications` | name, issuer, date, credential_url | profiles 1:n |
| `languages` | name, level (CEFR) | profiles 1:n |
| `github_connections` | installation_id, github_user_id, username, encrypted_user_token, granted_permissions (jsonb), last_scan_at | users 1:1 |
| `github_repos` | github_repo_id, name, description, topics, languages (jsonb), is_fork, is_archived, is_private, has_readme, health_score, last_pushed_at | users 1:n |
| `github_changes` | target (`profile`/`repo`), repo_id (nullable), field (`bio`/`readme`/`description`/`topics`/`homepage`/`profile_readme`/...), old_value, new_value, evidence (jsonb), confidence, status (`proposed`/`approved`/`applied`/`failed`/`undone`), applied_sha, error | users 1:n |
| `job_ads` | company, title, url, raw_text, keywords (jsonb: required, nice_to_have), seniority | users 1:n |
| `documents` | type (`cv`/`cover_letter`/`linkedin_text`), mode (`generic`/`tailored`), job_ad_id (nullable), version, content (jsonb), pdf_path, docx_path, ats_score, ats_report (jsonb) | users 1:n |
| `image_assets` | type (`profile_photo`/`banner`), source_path, output_path, bg_color, width, height, settings (jsonb) | users 1:n |
| `uploaded_files` | type (`degree`/`transcript`/`reference`/`certificate`/`language_cert`/`visa`/`other`), original_name, storage_path, standard_name, status (`missing`/`uploaded`/`verified`), expires_on | users 1:n |
| `websites` | template, colors (jsonb), subdomain, custom_domain, github_pages_repo, published, published_at | users 1:1 |
| `consistency_issues` | field, values (jsonb: per platform), severity (`high`/`medium`/`low`), suggested_value, resolved | users 1:n |
| `evaluations` | total_score, area_scores (jsonb), top_fixes (jsonb), created_at | users 1:n |
| `ai_usage` | feature, model, input_tokens, output_tokens, cost_usd | users 1:n |
| `universities` | name, domain, licence_seats, licence_ends | — |

**The profile is the source of truth.** Generated documents store a snapshot of the
content used, so an old CV stays reproducible even after the profile changes.

---

## 6. Module specifications

### 6.0 Shared rules for all AI generation
- Input = structured facts only (profile JSON, repo evidence bundle, job ad text).
- Output = JSON validated by a `zod` schema. On validation failure: retry once with the
  error message, then show an error; never show unvalidated text.
- Every generated item carries `confidence` (`high`/`medium`/`low`) and `unknowns[]`.
- System prompts must state: "Use only the facts provided. If a fact is missing, insert a
  placeholder. Do not invent numbers, employers, dates, metrics, or features."
- Log token usage to `ai_usage` for every call.
- Cache: same input hash → reuse the previous result.
- Use the scorer model for extraction/scoring, the writer model for prose.

### 6.1 GitHub profile manager (built on gitms)

**Reuse from gitms (`core/`):** repo scan via Octokit, rule-based audit (missing
description, topics, README, license, staleness → 0–100 health score), evidence bundle
(file tree, parsed dependency manifests, entry-point source, recent commit messages,
existing README), Claude prompts, zod schemas (description ≤ 350 chars, 3–6 lowercase
topics), side-by-side review, dry run, README commits with current file `sha`
(conflict → 409, never overwrite), backup of existing README, idempotent apply,
exclude forks/archived/private by default, `<!-- TODO -->` placeholders.

**Change from gitms:**
| gitms today | Launchpad |
|---|---|
| User pastes a personal access token | GitHub App install (one click); user-to-server token stored encrypted (AES-256-GCM) |
| Data in browser IndexedDB | Data in Postgres (`github_repos`, `github_changes`) |
| User's own Anthropic key or Claude Code CLI | Platform's API key; cost tracked in `ai_usage` |
| Local README backup | `github_changes.old_value` keeps the previous value; one-click Undo |

**Add (not in gitms):**
1. **Profile README** (`username/username` repo): create the repo if missing (ask first),
   generate README from profile: name, headline, location, links, current role,
   short about, featured projects (3–4, linking repos and demos), tech stack icons.
2. **Profile fields** via `PATCH /user`: name, bio (≤ 160 chars), company, location,
   blog (website URL), twitter_username, hireable. Social accounts via the
   social-accounts endpoints.
3. **Repo homepage** field = live demo URL from the profile project.
4. **Pins:** recommend 4–6 repos (score = completeness + recency + relevance to target
   role). There is no documented public API for pinning — show a guided step with a
   direct link to the profile and the exact list. Re-check GitHub's GraphQL schema
   during the build; if a supported mutation exists, ask the owner before using it.
5. **Profile photo:** no documented API — offer the photo from LinkedIn studio as a
   download + guided upload step.
6. **Clean-up suggestions:** empty repos, tutorial copies, duplicates → suggest archive
   or make private. Each requires its own approval. Never delete repos.
7. **Alignment:** headline/bio must match the profile headline; project tech in CV must
   match repo languages + topics (feeds the consistency checker).

**GitHub App permissions (request the minimum; verify names against GitHub docs):**
- Repository: Metadata (read), Contents (write), Administration (write — needed for
  topics/description per gitms), Pull requests (write — for README PRs), Pages (write —
  only if the student chooses GitHub Pages deployment).
- Account: Profile (write) for bio/name/location fields.

**Apply flow:** proposed → student reviews (diff view, evidence, confidence) →
approve (per item or "approve all selected") → dry-run preview of exact API calls →
apply → record `applied_sha` → show result. README changes default to a **pull request**;
direct commit is an opt-in setting.

**Example (owner's profile, for tests and demo copy):** `xkhaliil` profile README
already has name, "Full-stack dev · Barcelona", links (website, LinkedIn, email), a
current-role line ("Software Engineer @ Hounder AI · Co-Founder @ Devoxys") and skill
icons. Expected suggestions: add a featured-projects section; flag the title mismatch
"Full-stack dev" vs "Software Engineer" for the consistency checker.

### 6.2 CV builder (PDF) + ATS checker

**Pipeline:** collect → build → check → fix → export.

1. **Collect** profile + GitHub data (projects, languages, topics, repo/demo links).
2. **Build** from an ATS-safe template. Template rules (enforce in code, test them):
   - One column. No tables, text boxes, columns, icons, images, charts, or skill bars.
   - Contact details in the body, not in header/footer.
   - Standard section headings, exactly: `Summary`, `Skills`, `Experience`, `Projects`,
     `Education`, `Certifications`, `Languages`.
   - Standard fonts (e.g. Arial, Calibri, Helvetica, Georgia), body 10.5–12 pt.
   - Dates in one consistent format (`MMM YYYY – MMM YYYY` or `Present`).
   - Bullets: plain `•` or `-`, start with an action verb, include a result where the
     profile provides one.
   - 1 page for < 3 years experience, max 2 pages.
   - File name: `Firstname_Lastname_CV.pdf`.
   - Optional photo: off by default (on only if the student enables it).
3. **Check** — the ATS checker parses the generated PDF back to text and verifies:
   - Text extractable and in the right reading order.
   - All standard headings detected.
   - Name, email, phone, location, links found.
   - Every date parsed; no overlaps that look like errors.
   - Length within limit.
   - If a job ad is attached: keyword coverage (required vs nice-to-have), exact-term
     matches, and acronym + full form both present (e.g. "CI/CD" and "continuous integration").
   - Output: score 0–100 + list of issues (severity, message, fix suggestion).
4. **Fix:** AI proposes fixes for each issue; student accepts; rebuild + recheck until
   the score ≥ target (default 85) or the student stops.
5. **Export:** PDF + DOCX. Both must pass the same checker.

**GitHub alignment rules:** every CV project with a repo links to it; CV project tech ⊆
repo languages ∪ topics (warn on mismatch); CV headline = profile headline = GitHub bio core.

**Free public ATS check page:** upload any CV PDF → score + top 3 issues without sign-up
(rate-limited; file deleted after 1 hour).

### 6.3 Cover letter
- 3 paragraphs, under 250 words: (1) role + why this company, (2) 1–2 relevant projects
  or experiences using job-ad keywords, (3) short confident close with availability.
- Generic version: no company named; placeholders for company/role.
- Flags clichés ("I am writing to apply…", "hard-working team player") and suggests
  specific alternatives from the profile.
- Export PDF/DOCX; plain text copy.

### 6.4 Generic and tailored versions
- **Generic:** CV + cover letter from the profile only.
- **Tailored:** student pastes a job description →
  1. Scorer model extracts: title, company, seniority, required skills, nice-to-have
     skills, keywords (zod schema).
  2. Match score of the generic CV against the ad.
  3. Writer model reorders sections/bullets and rephrases using the ad's terms —
     **only facts from the profile**. Skills the student lacks are listed as "gaps",
     never added to the CV.
  4. Tailored cover letter naming the company and role.
  5. Match score after; show before/after.
- Saved per `job_ads` row; list view shows which version went to which company.

### 6.5 LinkedIn studio
LinkedIn's Profile Edit API is restricted to developers LinkedIn approves, and photo
changes need a private permission. **Do not call LinkedIn APIs to edit, and never scrape.**

1. **Import:** student uploads the LinkedIn "Save to PDF" export or pastes sections.
2. **Mockup screen:** a layout that resembles a LinkedIn profile (generic styling, no
   LinkedIn logo or trademarks) showing suggested content for: headline (≤ 220 chars),
   About (≤ 2,600 chars), experience entries, education, skills (top 5 highlighted),
   projects, featured, certifications, custom URL suggestion, Open to Work settings.
   Each field: suggested text, character count, **Copy** button, and a link to the
   matching LinkedIn edit page. "Mark as done" per field.
3. **Banner generator:** 1584 × 396 px PNG; inputs: name, role, tech stack, colours,
   template; keep all text in the centre-right safe zone, clear of the bottom-left
   (profile photo overlap). 3–5 templates.
4. **Profile photo tool:** upload → background removal → face detection, centre and
   crop square → background colour picker (solid colours + presets) → export
   400 × 400 px PNG (also offer 800 × 800). Reused by GitHub and website modules.
5. **Profile score:** filled fields, headline quality, About length, skills count,
   banner + photo done.

### 6.6 Personal website
- 3–5 one-page templates: **Minimal** (text first), **Developer** (dark, code style),
  **Classic** (light, project grid), **Timeline** (experience-led), **Cards**.
- Content from the profile: intro, about, projects (screenshot, description, tech, repo
  and demo links), skills, experience, education, CV download (latest generic CV),
  contact (email link, no public form in v1).
- Requirements: responsive, WCAG AA contrast, Lighthouse ≥ 90 on performance and
  accessibility, Open Graph tags, favicon from initials.
- Publish options: `username.readydev.app`, custom domain (DNS instructions + check),
  or GitHub Pages (create repo + push static build via the GitHub App, with approval).
- Free plan shows a small "Made with Launchpad" badge.

### 6.7 Documents pack
- Checklist types: degree, transcript, references (Arbeitszeugnisse), certificates,
  language certificates, visa/work permit (only if the student marks non-EU).
- Upload PDF/JPG/PNG (max 10 MB); images converted to PDF.
- Standard rename: `Lastname_Firstname_<Type>.pdf`.
- Merged application PDF: cover letter + CV + selected documents, in order, with
  bookmarks.
- Expiry reminders (e.g. visa).
- Files are encrypted at rest, private, accessed by signed URLs (≤ 5 minutes).

### 6.8 Consistency checker
Compare across: profile, CV(s), cover letters, LinkedIn suggested/imported text, GitHub
(bio, profile README, repo topics), website.
- Fields: full name, headline/title, current employer + title, employment dates,
  education dates, location, email, links, skills, project names and tech.
- Rules: exact match for name/email/links; normalized match for titles and skills
  (case, synonyms: "JS" = "JavaScript"); date ranges must be identical.
- Output: `consistency_issues` with severity and a suggested value; "Fix" updates the
  profile and regenerates/queues the affected outputs (GitHub changes still need approval).

### 6.9 Full evaluation (one click)
| Area | Checks | Points |
|---|---|---|
| CV & ATS | Checker score, keyword match (if job ad), length, results in bullets | 25 |
| GitHub | Profile README, bio, pins, topics, repo READMEs, demo links, health score average | 20 |
| LinkedIn | Fields done, headline, About, banner + photo | 15 |
| Cover letters | Generic ready; tailored letters < 250 words | 10 |
| Personal website | Published, all sections filled, mobile check | 10 |
| Documents | Required files uploaded + named; merged PDF ready | 10 |
| Consistency | No open high/medium issues | 10 |

- Each area scorer is a pure function in `packages/core/evaluation` with unit tests.
- Report: total, per-area scores, **top 5 fixes ordered by points gained**, each with a
  "Fix it" deep link. Store each run in `evaluations` for a progress chart.
- Weights live in config (they will be tuned).

---

## 7. Pages and screens

**Public:** Landing · Pricing · Free ATS check · Blog/guides (MDX) · Sign up / Log in ·
Privacy policy · Terms · Imprint (required in Germany).

**App (auth required):**
1. Onboarding (target role, location, level, CV/LinkedIn PDF import)
2. Dashboard (evaluation score, 8 module cards, next best step)
3. Profile (single source of truth editor)
4. CV builder (editor left, live PDF preview right, ATS check panel, export)
5. Job ads (generic vs tailored pairs, match scores)
6. Cover letters
7. LinkedIn studio (mockup + copy buttons, banner generator, photo tool)
8. GitHub manager (audit, proposals with diff + evidence, approve/apply/undo)
9. Personal website (template picker, colours, preview, publish)
10. Documents (checklist, uploads, merged PDF)
11. Consistency + full evaluation report
12. Settings (account, plan/billing, connected accounts, data export, delete account)

---

## 8. Security, privacy and GDPR (mandatory)
- All data and files in the EU. Data processing agreements with every provider.
- Student data is **never** used to train models. State it in the privacy policy.
- Row Level Security on every user table; server routes verify ownership again.
- GitHub tokens encrypted with AES-256-GCM; key from env; rotate-able.
- Private storage buckets; signed URLs ≤ 5 min; no public file listing.
- One-click data export (JSON + all files as ZIP) and account deletion (hard delete
  within 30 days, including storage and GitHub App uninstall link).
- Rate limits on AI endpoints and the public ATS check.
- Audit log for every GitHub write (who, what, when, result).
- No tracking cookies before consent; PostHog EU with consent banner.

---

## 9. Pricing and plans (for feature gating)
| Plan | Price (proposal) | Limits |
|---|---|---|
| Free | €0 | Full profile, 1 CV, 3 ATS checks/month, documents checklist, basic consistency check, GitHub audit (read-only) + 3 repo proposals, website with badge |
| Pro | €9/month or €49/year | Unlimited tailored CVs/letters and ATS checks, full GitHub manager, LinkedIn studio, website without badge, merged PDF |
| University | Per-student licence | Pro for all students + career-service dashboard |

Implement gating with one `can(user, feature)` helper; limits in config.
AI cost target: < 20% of Pro revenue per active user (gitms README estimates ~$0.07/repo
on Sonnet, ~$0.18/repo on Opus — measure real numbers in beta).

---

## 10. Quality bar
- TypeScript strict, ESLint + Prettier, no `any` in `packages/core`.
- Unit test coverage ≥ 80% for `packages/core`.
- E2E tests for: sign-up → onboarding → CV export; tailored CV from job ad; GitHub
  proposal → approve → dry run → apply (against a test account / mocked Octokit);
  LinkedIn photo export; website publish; full evaluation.
- Accessibility: keyboard navigation, labels, WCAG AA.
- Every AI feature has a **mock mode** (like gitms) so tests and local dev run without
  API calls.

---

## 11. Known constraints (do not try to work around them)
| Constraint | Consequence |
|---|---|
| LinkedIn Profile Edit API is restricted to approved developers; photo edits need a private permission | No direct LinkedIn editing; mockup + copy + downloadable images |
| No documented GitHub API for pinning repos or changing the avatar (re-check during build) | Guided manual steps |
| ATS systems differ per company | Score is an estimate; never claim a guaranteed pass |
| AI can hallucinate | Facts-only prompts, schemas, placeholders, mandatory student review |

---

## 12. Build phases and task checklist

### Phase 0 — Validate (weeks 1–3) — owner-led, minimal code
- [ ] Landing page with waitlist form (name, email, university, target role)
- [ ] Free ATS check page (prototype of checker in 6.2)
- [ ] Analytics on landing + waitlist
**Gate 1:** 30+ on the waitlist.

### Phase 1 — Foundation + MVP (weeks 4–12)
- [ ] Monorepo setup (structure in section 4), CI (lint, types, tests), preview deploys
- [ ] Supabase project (EU), Drizzle schema + migrations for section 5, RLS policies
- [ ] Auth (email, Google, GitHub) + onboarding flow
- [ ] Profile editor + import from CV PDF / LinkedIn PDF (AI extraction → review screen)
- [ ] AI layer: client, model config, zod schemas, retries, caching, `ai_usage`, mock mode
- [ ] CV builder: template, HTML preview, PDF + DOCX export
- [ ] ATS checker (6.2) + fix loop
- [ ] Cover letter (6.3)
- [ ] Job ads + generic/tailored versions (6.4)
- [ ] Port gitms `core/` into `packages/core/github` with its tests
- [ ] GitHub App: install flow, encrypted token storage, scan + audit into Postgres
- [ ] GitHub proposals → review → approve → dry run → apply → undo (repos)
- [ ] Profile README + profile fields (6.1 add-ons 1–3)
- [ ] Dashboard v1 with module cards
**Gate 2:** a new user can go from sign-up to an exported CV and applied GitHub changes,
end to end, with all E2E tests green.

### Phase 2 — Private beta (weeks 13–18), 50–100 students
- [ ] LinkedIn studio: import, mockup with copy buttons, banner generator, photo tool
- [ ] Documents pack (6.7)
- [ ] Personal website: 3 templates, subdomain publishing
- [ ] Consistency checker (6.8)
- [ ] Full evaluation + report + score history (6.9)
- [ ] Pins + clean-up guidance (6.1 add-ons 4–6)
- [ ] Feedback widget; measure AI cost per user
**Gate 3:** ≥ 60% of beta users finish a CV; AI cost per active user known.

### Phase 3 — Launch v1 (weeks 19–26)
- [ ] Stripe plans + feature gating (section 9)
- [ ] Website: custom domains, GitHub Pages deploy, 2 more templates
- [ ] University plan: admin dashboard (aggregate progress only, no private documents)
- [ ] Blog/guides, SEO, Open Graph images
- [ ] Privacy policy, terms, imprint, consent banner, data export/delete
- [ ] Load test AI + PDF workers; error monitoring (Sentry)

### Later (not v1)
Job application tracker · AI interview practice · salary ranges by city ·
German-language CVs (Lebenslauf, Anschreiben) · Chrome extension for job ads.

---

## 13. Success metrics (instrument from Phase 1)
| Metric | Target |
|---|---|
| Sign-up → finished CV within 7 days | 60% |
| Average evaluation score after 30 days | 70/100 |
| Free → Pro conversion | 3–5% |
| Students reporting an interview within 60 days | track from beta |
| University partners | 1 pilot at launch, 3 within a year |

---

## 14. Open questions (ask the owner; do not assume)
- [ ] Final product name and domain.
- [ ] Background removal: self-hosted model or paid API?
- [ ] Job queue: Supabase table + worker, Inngest, or Trigger.dev?
- [ ] First university pilot partner.
- [ ] Budget and fixed launch date.
- [ ] Should gitms stay a separate open-source tool, become a package, or be merged?

---

## 15. Decision log
| Date | Decision | Why |
|---|---|---|
| 2026-11-15 | Product plan first; all 8 modules in v1; AI-powered; English only | Owner's choice |
| 2026-11-15 | GitHub module built on gitms; switch from pasted PAT to GitHub App | Reuse working code; safer, one-click for students |
| 2026-11-15 | No direct LinkedIn editing; mockup + copy + image tools | LinkedIn edit API restricted |
| 2026-11-15 | Next.js + Supabase (EU) + Claude API + Vercel | Small team, managed services, GDPR |
| 2026-11-15 | Product name is Launchpad (was ReadyDev); kept in `APP_NAME` in `lib/site.ts` | Owner's choice |

---

## 16. References
- Product plan (living doc): https://claude.ai/artifact/6Pj9Puo2A1hGkAuXKvuzL9
- gitms: https://github.com/xkhaliil/github-ms
- Owner's GitHub profile (example data): https://github.com/xkhaliil
- LinkedIn Profile Edit API: https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-edit-api
- GitHub pinning docs: https://docs.github.com/en/enterprise-server@3.15/account-and-profile/how-tos/profile-customization/pinning-items-to-your-profile
- LinkedIn image sizes (banner 1584×396, photo 400×400): https://rightblogger.com/blog/linkedin-banner-size
