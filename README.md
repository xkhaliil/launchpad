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
| `npm run format`       | Format all files with Prettier                |
| `npm run format:check` | Check formatting without writing (used by CI) |

## Git hooks

Husky runs `lint-staged` on every commit: staged files are fixed with ESLint and
formatted with Prettier. Hooks are installed automatically by `npm install`.

## CI

`.github/workflows/ci.yml` runs on every push: format check, lint, typecheck and build.
