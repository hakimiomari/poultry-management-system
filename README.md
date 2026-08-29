# PMS — Poultry Management System

Farm records for broiler and layer flocks: sheds, flocks, daily logs, bird movements, dashboard KPIs and alerts.
Spec: [SPEC.md](SPEC.md). Agent guidance: [CLAUDE.md](CLAUDE.md).

## Quick start
```bash
npm install          # also runs `prisma generate`
npm run db:reset     # migrate + seed demo data (2 flocks, 30 days of logs)
npm run dev          # http://localhost:3000
```
Demo logins (phone / password): `0700000001 / owner123` (Owner), `0700000002 / manager123`, `0700000003 / worker123`, `0700000004 / vet123`, `0700000005 / acct123`.

## Scripts
| Command | Purpose |
|---|---|
| `npm test` | Unit tests for business formulas (population, mortality, FCR, hen-day, alerts) |
| `npm run db:migrate` | Create a new migration after editing `prisma/schema.prisma` |
| `npm run db:seed` | Re-seed demo data |
| `npm run build && npm start` | Production build |

## Structure
- `prisma/schema.prisma` — all 13 entities from the spec + `settings`, `breed_standards`, `tasks`
- `src/lib/domain/` — pure formulas, no DB (tested in `tests/`)
- `src/lib/services/` — DB reads that assemble KPIs and evaluate alerts
- `src/lib/actions.ts` — server actions: zod validation → business rules → persist → audit log
- `src/lib/settings.ts` — configurable thresholds (read from the `settings` table)
- `src/lib/i18n.ts` — externalized strings (EN complete; Dari/Pashto keys stubbed, RTL layout switches by user language)
- `src/app/(app)/` — authenticated pages; `src/app/login`

## Switching to PostgreSQL
Change `provider = "postgresql"` in `prisma/schema.prisma`, set `DATABASE_URL`, delete `prisma/migrations`, run `npm run db:migrate`.

## Roadmap
Phase 1 (this release) is complete. Phases 2–6 (health & vaccine templates, finance & inventory, analytics, environment/export/offline, AI features) are described in SPEC.md Part F.
