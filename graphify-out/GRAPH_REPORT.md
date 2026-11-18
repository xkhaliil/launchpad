# Graph Report - launchpad  (2026-11-18)

## Corpus Check
- 102 files · ~55,099 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .ttf 2, .example 1)

## Summary
- 719 nodes · 1917 edges · 24 communities (20 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `69c34453`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- github.ts
- react
- jobs.tsx
- profile.tsx
- plan.md — Launchpad: Job-Ready Platform for CS Graduates
- app-shell.tsx
- store.ts
- package.json
- dashboard.tsx
- ci.yml
- compilerOptions
- modules.tsx
- react
- review.tsx
- suggestions.ts
- manifests.ts
- mock.ts
- .prettierrc.json
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- mock.ts
- selectors.ts
- core.test.ts

## God Nodes (most connected - your core abstractions)
1. `useDemo()` - 38 edges
2. `react` - 38 edges
3. `updateDemo()` - 32 edges
4. `next` - 32 edges
5. `lucide-react` - 26 edges
6. `Repositories()` - 24 edges
7. `ScreenMotion()` - 21 edges
8. `PageHeader()` - 19 edges
9. `ProfileScreen()` - 19 edges
10. `plan.md — Launchpad: Job-Ready Platform for CS Graduates` - 18 edges

## Surprising Connections (you probably didn't know these)
- `6.2 CV builder (PDF) + ATS checker` --references--> `Education`  [INFERRED]
  plan.md → lib/core/types.ts
- `6.2 CV builder (PDF) + ATS checker` --references--> `Experience`  [INFERRED]
  plan.md → lib/core/types.ts
- `Page()` --calls--> `CvScreen()`  [EXTRACTED]
  app/(app)/cv/page.tsx → components/app/screens/cv.tsx
- `Page()` --calls--> `WebsiteScreen()`  [EXTRACTED]
  app/(app)/website/page.tsx → components/app/screens/website.tsx
- `Page()` --calls--> `GithubScreen()`  [EXTRACTED]
  app/(app)/github/page.tsx → components/app/screens/github.tsx

## Import Cycles
- None detected.

## Communities (24 total, 4 thin omitted)

### Community 0 - "github.ts"
Cohesion: 0.05
Nodes (97): metadata, Page(), ScreenMotion(), useReview(), CvScreen(), ApplySection(), Filter, FILTERS (+89 more)

### Community 1 - "react"
Cohesion: 0.06
Nodes (62): geistMono, metadata, nohemi, LogInPage(), metadata, Home(), metadata, SignUpPage() (+54 more)

### Community 2 - "jobs.tsx"
Cohesion: 0.10
Nodes (35): metadata, Page(), metadata, Page(), CopyButton(), AddJobAd(), GenericDetail(), Highlighted() (+27 more)

### Community 3 - "profile.tsx"
Cohesion: 0.06
Nodes (52): metadata, Page(), metadata, Page(), metadata, Page(), CvDocument(), CvOptions (+44 more)

### Community 4 - "plan.md — Launchpad: Job-Ready Platform for CS Graduates"
Cohesion: 0.04
Nodes (45): 0. How to work on this project (agent rules), 10. Quality bar, 11. Known constraints (do not try to work around them), 12. Build phases and task checklist, 13. Success metrics (instrument from Phase 1), 14. Open questions (ask the owner; do not assume), 15. Decision log, 16. References (+37 more)

### Community 5 - "app-shell.tsx"
Cohesion: 0.11
Nodes (31): AppLayout(), AppShell(), Avatar(), BottomBar(), isActive(), MoreSheet(), Readiness(), ReviewButton() (+23 more)

### Community 6 - "store.ts"
Cohesion: 0.06
Nodes (55): metadata, Page(), metadata, Page(), metadata, Page(), ReviewProvider(), ACCEPT (+47 more)

### Community 7 - "package.json"
Cohesion: 0.06
Nodes (45): eslintConfig, react-dom@19.3.0, devDependencies, eslint@^9, eslint-config-next@16.4.6, eslint-config-prettier@^10.1.8, husky@^9.1.7, lint-staged@^17.6.0 (+37 more)

### Community 8 - "dashboard.tsx"
Cohesion: 0.14
Nodes (17): metadata, Page(), AreaBar(), DashboardScreen(), SHORT, StartStep(), listClass, AREA_WEIGHTS (+9 more)

### Community 9 - "ci.yml"
Cohesion: 0.10
Nodes (20): env, name, runs-on, steps, concurrency, cancel-in-progress, group, NEXT_TELEMETRY_DISABLED (+12 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "modules.tsx"
Cohesion: 0.25
Nodes (16): Bar(), Chip(), ConsistencyMock(), CoverLetterMock(), CvMock(), DocumentsMock(), GithubMock(), Keyword() (+8 more)

### Community 12 - "react"
Cohesion: 0.13
Nodes (19): played, Doc, docs, PROFILE, centre(), HeroMotion(), attachMagnetic(), attachTilt() (+11 more)

### Community 13 - "review.tsx"
Cohesion: 0.19
Nodes (14): inline(), Markdown(), CountUp(), acceptLabel(), CONFIDENCE_TONE, Finished(), OpenOptions, ProposalDetails() (+6 more)

### Community 14 - "suggestions.ts"
Cohesion: 0.20
Nodes (12): LinkedinSuggestions, findPlaceholders(), Confidence, currentBio(), suggestedBio(), LINKEDIN_TEXT, pendingSuggestions(), readyToAccept() (+4 more)

### Community 15 - "manifests.ts"
Cohesion: 0.36
Nodes (15): MANIFEST_FILES, parseCargoToml(), parseComposerJson(), parseGemfile(), parseGoMod(), parseManifest(), parsePackageJson(), parsePom() (+7 more)

### Community 16 - "mock.ts"
Cohesion: 0.18
Nodes (10): ai, DEP_TOPICS, draftRepoFromEvidence(), lowerFirst(), sentence(), strongestBullets(), title(), AiProvider (+2 more)

### Community 21 - "mock.ts"
Cohesion: 0.22
Nodes (14): ACTION_VERBS, allBullets(), checkCv(), CvCheck, CvReport, datesValid(), hasResult(), startsWithActionVerb() (+6 more)

### Community 22 - "selectors.ts"
Cohesion: 0.28
Nodes (13): Cliche, CLICHES, findCliches(), paragraphCount(), WORD_LIMIT, wordCount(), appMetrics(), consistencyIssues() (+5 more)

### Community 23 - "core.test.ts"
Cohesion: 0.23
Nodes (10): ConsistencyField, ConsistencyIssue, EXACT, FIELD_LABELS, findIssues(), normalise(), same(), Source (+2 more)

## Knowledge Gaps
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `github.ts`, `react`, `jobs.tsx`, `profile.tsx`, `app-shell.tsx`, `store.ts`, `package.json`, `dashboard.tsx`, `modules.tsx`, `review.tsx`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useDemo()` (e.g. with `current()` and `subscribe()`) actually correct?**
  _`useDemo()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `github.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05357142857142857 - nodes in this community are weakly interconnected._
- **Why does `6.2 CV builder (PDF) + ATS checker` connect `profile.tsx` to `plan.md — Launchpad: Job-Ready Platform for CS Graduates`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06073871409028728 - nodes in this community are weakly interconnected._
- **Why does `6. Module specifications` connect `plan.md — Launchpad: Job-Ready Platform for CS Graduates` to `profile.tsx`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Should `jobs.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10365853658536585 - nodes in this community are weakly interconnected._