# PMS — Poultry Management System

Source-of-truth spec: `SPEC.md` (v2.0). Read it before changing data models, formulas, or alerts.

## Stack
- Next.js 15 (App Router, `src/app`), TypeScript, Tailwind v4, **shadcn/ui v4 (Base UI)** in `src/components/ui/` — add more with `npx shadcn add <name>`
- Create/edit/delete happen in dialogs: `src/components/FormDialog.tsx` (server-action form, keeps input on error) and `ConfirmButton.tsx`; entity forms in `src/components/forms/`. Actions return `{ ok }` / `{ error }` (no redirects except login).
- Palette lives as shadcn CSS variables in `src/app/globals.css` (light + dark). Use `Kpi`, `ToneBadge`, `PageHeader`, `AlertBanner` from `src/components/pms.tsx`.
- Prisma 6 + SQLite (`prisma/schema.prisma`, `DATABASE_URL` in `.env`). Switch to PostgreSQL by changing `provider` and the URL.
- Auth: cookie session (jose JWT) — `src/lib/auth.ts`. Roles: OWNER, FARM_MANAGER, WORKER, VETERINARIAN, ACCOUNTANT.
- Validation: zod schemas in `src/lib/validation.ts`. Enums live in `src/lib/enums.ts` (SQLite has no native enums).
- Live updates: `audit()` calls `notifyChange()` (`src/lib/live.ts`), `/api/live` streams that signal (SSE, signed-in only, no data), and `LiveRefresh` in the app layout calls `router.refresh()` on every open screen. A write that skips `audit()` will not reach other devices. In-process only: one Node server.
- PWA + offline field entry (production builds only; the service worker needs https:// or localhost):
  - `public/sw.js` serves pages network-first and falls back to copies saved on the device by `src/lib/offline/pages.ts` (every page in the user's menu plus active flocks, wiped on logout or when another user signs in). Bump a cache version in `sw.js` to discard what phones hold.
  - Daily logs and bird movements can be recorded with no connection: `FormDialog offline="dailyLog" | "movement"` puts the entry in an IndexedDB outbox (`src/lib/offline/outbox.ts`), `<OfflineSync>` posts it to `/api/sync` when `/api/ping` answers again, and refused entries stay listed in `<OutboxButton>`. The outbox works on plain http too, as long as the page is already open.
  - `src/lib/records.ts` holds the one implementation of those two writes, shared by the server actions and `/api/sync`. An offline entry's id becomes the created movement's id, which is what makes a re-send harmless: keep that if you change it.
  - Every other form and all deletes need a connection and say so (`offline.cannot`) instead of failing.
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
Phase 1 (done): users/auth, sheds, flocks, daily logs, bird movements, dashboard. Finance (done): transactions (`/finance`), contacts, vet visits/health logs (`/health`); egg/bird sales sync `egg_stock_movements`/`bird_movements` via `linkedTransactionId`, vet-visit cost syncs a `transactions` row via `health_logs.transactionId`.
Next phases per SPEC.md Part F.
