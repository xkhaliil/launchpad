# Graph Report - launchpad  (2026-11-18)

## Corpus Check
- 89 files · ~42,427 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 4, .ttf 2, .example 1)

## Summary
- 590 nodes · 1470 edges · 22 communities (17 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c34e0d0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/ui.tsx
- react
- jobs.tsx
- profile.tsx
- plan.md — Launchpad: Job-Ready Platform for CS Graduates
- app-shell.tsx
- store.ts
- package.json
- review.tsx
- ci.yml
- compilerOptions
- modules.tsx
- scroll-motion.tsx
- scripts
- eslint.config.mjs
- dependencies
- vitest
- .prettierrc.json
- AGENTS.md
- CLAUDE.md
- .claude/CLAUDE.md
- mock.ts

## God Nodes (most connected - your core abstractions)
1. `useDemo()` - 34 edges
2. `react` - 33 edges
3. `next` - 30 edges
4. `lucide-react` - 24 edges
5. `updateDemo()` - 23 edges
6. `ProfileScreen()` - 19 edges
7. `ScreenMotion()` - 19 edges
8. `plan.md — Launchpad: Job-Ready Platform for CS Graduates` - 18 edges
9. `PageHeader()` - 17 edges
10. `evaluation()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `6.2 CV builder (PDF) + ATS checker` --references--> `Education`  [INFERRED]
  plan.md → lib/core/types.ts
- `6.2 CV builder (PDF) + ATS checker` --references--> `Experience`  [INFERRED]
  plan.md → lib/core/types.ts
- `Page()` --calls--> `CvScreen()`  [EXTRACTED]
  app/(app)/cv/page.tsx → components/app/screens/cv.tsx
- `Page()` --calls--> `DashboardScreen()`  [EXTRACTED]
  app/(app)/dashboard/page.tsx → components/app/screens/dashboard.tsx
- `Page()` --calls--> `JobsScreen()`  [EXTRACTED]
  app/(app)/jobs/page.tsx → components/app/screens/jobs.tsx

## Import Cycles
- None detected.

## Communities (22 total, 5 thin omitted)

### Community 0 - "app/ui.tsx"
Cohesion: 0.08
Nodes (35): metadata, Page(), metadata, Page(), metadata, Page(), CvDocument(), CvOptions (+27 more)

### Community 1 - "react"
Cohesion: 0.05
Nodes (66): geistMono, metadata, nohemi, LogInPage(), metadata, Home(), metadata, SignUpPage() (+58 more)

### Community 2 - "jobs.tsx"
Cohesion: 0.14
Nodes (28): metadata, Page(), AddJobAd(), GenericDetail(), Highlighted(), JobDetail(), JobsScreen(), LetterEditor() (+20 more)

### Community 3 - "profile.tsx"
Cohesion: 0.09
Nodes (38): metadata, Page(), metadata, Page(), OnboardingScreen(), roles, steps, AddButton() (+30 more)

### Community 4 - "plan.md — Launchpad: Job-Ready Platform for CS Graduates"
Cohesion: 0.04
Nodes (45): 0. How to work on this project (agent rules), 10. Quality bar, 11. Known constraints (do not try to work around them), 12. Build phases and task checklist, 13. Success metrics (instrument from Phase 1), 14. Open questions (ask the owner; do not assume), 15. Decision log, 16. References (+37 more)

### Community 5 - "app-shell.tsx"
Cohesion: 0.11
Nodes (32): AppLayout(), AppShell(), Avatar(), BottomBar(), isActive(), MoreSheet(), Readiness(), ReviewButton() (+24 more)

### Community 6 - "store.ts"
Cohesion: 0.07
Nodes (44): metadata, Page(), ACCEPT, DocumentsScreen(), listClass, mockProvider, ConsistencyField, ConsistencyIssue (+36 more)

### Community 7 - "package.json"
Cohesion: 0.11
Nodes (24): devDependencies, husky@^9.1.7, lint-staged@^17.6.0, prettier@^3.10.1, prettier-plugin-tailwindcss@^0.8.1, tailwindcss@4.3.3, @tailwindcss/turbopack@4.3.3, @types/node@^24.19.2 (+16 more)

### Community 8 - "review.tsx"
Cohesion: 0.06
Nodes (67): metadata, Page(), metadata, Page(), metadata, Page(), CopyButton(), CountUp() (+59 more)

### Community 9 - "ci.yml"
Cohesion: 0.10
Nodes (20): env, name, runs-on, steps, concurrency, cancel-in-progress, group, NEXT_TELEMETRY_DISABLED (+12 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "modules.tsx"
Cohesion: 0.24
Nodes (17): Bar(), Chip(), ConsistencyMock(), CoverLetterMock(), CvMock(), DocumentsMock(), GithubMock(), Keyword() (+9 more)

### Community 12 - "scroll-motion.tsx"
Cohesion: 0.42
Nodes (7): attachMagnetic(), attachTilt(), belowFold(), ScrollMotion(), @gsap/react@^2.1.2, gsap, @gsap/react

### Community 13 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, format, format:check, lint, prepare, start (+2 more)

### Community 14 - "eslint.config.mjs"
Cohesion: 0.25
Nodes (7): eslintConfig, eslint@^9, eslint-config-next@16.4.6, eslint-config-prettier@^10.1.8, eslint, eslint-config-next, eslint-config-prettier

### Community 15 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, gsap@^3.15.1, lucide-react@^1.73.0, next@16.4.6, react@19.3.0, react-dom@19.3.0, react-dom

### Community 21 - "mock.ts"
Cohesion: 0.12
Nodes (21): ai, lowerFirst(), strongestBullets(), AiProvider, JobAdDetails, ACTION_VERBS, allBullets(), checkCv() (+13 more)

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `app/ui.tsx`, `jobs.tsx`, `profile.tsx`, `app-shell.tsx`, `store.ts`, `package.json`, `review.tsx`, `modules.tsx`, `scroll-motion.tsx`, `dependencies`?**
  _High betweenness centrality (0.204) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useDemo()` (e.g. with `current()` and `subscribe()`) actually correct?**
  _`useDemo()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `app/ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.080338266384778 - nodes in this community are weakly interconnected._
- **Why does `6.2 CV builder (PDF) + ATS checker` connect `profile.tsx` to `plan.md — Launchpad: Job-Ready Platform for CS Graduates`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05423094904160823 - nodes in this community are weakly interconnected._
- **Why does `6. Module specifications` connect `plan.md — Launchpad: Job-Ready Platform for CS Graduates` to `profile.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Should `jobs.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14015151515151514 - nodes in this community are weakly interconnected._