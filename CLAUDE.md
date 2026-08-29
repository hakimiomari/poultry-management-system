# PMS — Poultry Management System

Source-of-truth spec: `SPEC.md` (v2.0). Read it before changing data models, formulas, or alerts.

## Stack
- Next.js 15 (App Router, `src/app`), TypeScript, Tailwind v4
- Prisma 6 + SQLite (`prisma/schema.prisma`, `DATABASE_URL` in `.env`). Switch to PostgreSQL by changing `provider` and the URL.
- Auth: cookie session (jose JWT) — `src/lib/auth.ts`. Roles: OWNER, FARM_MANAGER, WORKER, VETERINARIAN, ACCOUNTANT.
- Validation: zod schemas in `src/lib/validation.ts`. Enums live in `src/lib/enums.ts` (SQLite has no native enums).
- Pure business formulas: `src/lib/domain/*` — **no DB access, unit-tested with vitest** (`tests/`).

## Rules
- **No hardcoded business numbers.** Thresholds go in the `settings` table; breed curves in `breed_standards`.
- Current population = initial_quantity − Σ bird_movements.quantity (never track a "current count" column).
- Every write goes through a validated server action / API route, and is recorded in `audit_logs`.
- Enum labels are displayed via translation keys (`src/lib/i18n.ts`) — never raw enum strings in UI.

## Commands
- `npm run dev` — start; `npm run db:reset` — migrate + seed; `npm test` — vitest
- Demo login: phone `0700000001` / password `owner123` (see `prisma/seed.ts`)

## Roadmap
Phase 1 (done): users/auth, sheds, flocks, daily logs, bird movements, dashboard.
Next phases per SPEC.md Part F.
