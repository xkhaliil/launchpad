# Launchpad

Job-ready platform for CS graduates. See [plan.md](plan.md) for the product plan.

## Getting started

Requires Node.js 24 (see `.nvmrc`).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                 | What it does                                  |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Start the dev server                          |
| `npm run build`        | Production build                              |
| `npm run lint`         | Run ESLint                                    |
| `npm run typecheck`    | Generate route types and run `tsc --noEmit`   |
| `npm test`             | Run unit tests with Vitest                    |
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing (used by CI) |

## The app (demo mode)

Every app screen is built and runs on example data, with no backend:
dashboard, profile, evaluation and consistency, CV builder with ATS check,
cover letters, job ads, LinkedIn studio, GitHub, personal website, documents,
settings, and onboarding. Sign up or log in opens the demo.

- **Data:** `lib/demo/data.ts` (example data) and `lib/demo/store.ts` (kept in
  the browser's localStorage). Settings can export it as JSON or reset it.
- **Logic:** `lib/core/` holds the real, tested rules: ATS checks, keyword
  matching, cover-letter checks, consistency checks and scoring.
- **AI:** `lib/ai/provider.ts` is the interface any model provider plugs into;
  `lib/ai/mock.ts` is the mock used today. It only rearranges profile facts
  and leaves `[ADD: …]` placeholders for anything missing.
- **Works for real today:** CV PDF export (browser print), LinkedIn banner and
  photo PNG export, data export, copy buttons. Simulated: GitHub writes,
  website publishing, merged PDF, DOCX export.

## Sign-in (not built yet)

The navbar shows **Log in** and **Sign up**, or an avatar with the person's
initials when someone is signed in. Sign-in itself is not built yet (plan.md,
Phase 1), so:

- `lib/auth/session.ts` is the single place that answers "who is signed in?".
  It returns nobody for now; real sign-in only has to change that file.
- `/signup` and `/login` show the planned sign-in options (GitHub, Google,
  email). They are not connected: trying one shows a notice that accounts are
  not open yet, and nothing is sent or saved.
- To preview the avatar in development, set `MOCK_USER_NAME` in `.env.local`
  (see `.env.example`).

## Git hooks

Husky runs `lint-staged` on every commit: staged files are fixed with ESLint and
formatted with Prettier. Hooks are installed automatically by `npm install`.

## CI

`.github/workflows/ci.yml` runs on every push: format check, lint, typecheck, tests
and build.
