# PMS — Poultry Management System

Source-of-truth spec: `SPEC.md` (v2.0). Read it before changing data models, formulas, or alerts.

## Stack
- Next.js 15 (App Router, `src/app`), TypeScript, Tailwind v4, **shadcn/ui v4 (Base UI)** in `src/components/ui/` — add more with `npx shadcn add <name>`
- Create/edit/delete happen in dialogs: `src/components/FormDialog.tsx` (server-action form, keeps input on error) and `ConfirmButton.tsx`; entity forms in `src/components/forms/`. Actions return `{ ok }` / `{ error }` (no redirects except login).
- Palette lives as shadcn CSS variables in `src/app/globals.css` (light + dark). Use `Kpi`, `ToneBadge`, `PageHeader`, `AlertBanner` from `src/components/pms.tsx`.
- Prisma 6 + SQLite (`prisma/schema.prisma`, `DATABASE_URL` in `.env`). Switch to PostgreSQL by changing `provider` and the URL.
- Auth: cookie session (jose JWT) — `src/lib/auth.ts`. Roles: OWNER, FARM_MANAGER, WORKER, VETERINARIAN, ACCOUNTANT.
- Validation: zod schemas in `src/lib/validation.ts`. Enums live in `src/lib/enums.ts` (SQLite has no native enums).
- Pure business formulas: `src/lib/domain/*` — **no DB access, unit-tested with vitest** (`tests/`).

## Rules
- **No hardcoded business numbers.** Thresholds go in the `settings` table; breed curves in `breed_standards`.
- Current population = initial_quantity − Σ bird_movements.quantity (never track a "current count" column).
- Every write goes through a validated server action / API route, and is recorded in `audit_logs`.
- **Localization is complete (EN / Dari / Pashto).** Dictionaries in `src/lib/i18n/{en,fa,ps}.ts` are typed against `en.ts` — adding a key to EN without FA/PS fails `tsc`, and `tests/i18n.test.ts` checks placeholders match. Never hardcode UI text: server components use `const { t, lang } = await getT()` (`src/lib/locale.ts`), client components use `useT()` (`src/components/I18nProvider.tsx`). Action errors and alert/rule messages are keys (`err.*`, `alert.*`) translated at render. Enum labels via `enumLabel(v, lang)`. Language = session user's language, else the `pms_lang` cookie set by the login-page switcher. RTL is set on `<html dir>` by the root layout; use logical classes (`ms-`, `text-end`) and `dir="ltr"` on dates/phones.

## Commands
- `npm run dev` — start; `npm run db:reset` — migrate + seed; `npm test` — vitest
- Demo login: phone `0700000001` / password `owner123` (see `prisma/seed.ts`)

## Roadmap
Phase 1 (done): users/auth, sheds, flocks, daily logs, bird movements, dashboard.
Next phases per SPEC.md Part F.
