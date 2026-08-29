# Poultry Management System (PMS) — Feature Specification v2.0

Source-of-truth spec for the project. Section numbering follows the original document; Part 0 reconstructs the v1 core entities that v2 references.

---

## PART 0 — CORE ENTITIES (from v1, as extended by v2)

### Entity 1: Flocks (`flocks`)
* `flock_id` (PK, UUID), `flock_name`, `flock_type` (BROILER | LAYER), `breed` (e.g. Cobb 500, Ross 308, Hy-Line Brown)
* `shed_id` (FK sheds), `intake_date`, `initial_quantity`, `initial_avg_weight_g` (day-old chick ≈ 40 g)
* `chick_cost_afn` (total purchase cost), `status` (ACTIVE | COMPLETED)
* Validation: `initial_quantity` ≤ shed `capacity` (minus birds already housed in that shed).

### Entity 2: Daily Logs (`daily_logs`)
* `log_id`, `flock_id`, `date` (unique per flock/day)
* `feed_consumed_kg`, `water_consumed_l`, `eggs_collected` (layers), `eggs_broken`, `notes`, `recorded_by` (FK users)
* Mortality is NOT stored here — it is a `bird_movements` row (MORTALITY).

### Entity 3: Health Logs (`health_logs`)
* `health_log_id`, `flock_id`, `scheduled_date`, `administered_date` (nullable), `type` (VACCINE | MEDICATION | TREATMENT)
* `product_name`, `method` (WATER | SPRAY | INJECTION | EYE_DROP | FEED), `status` (PENDING | DONE | MISSED), `notes`

### Entity 4: Transactions (`transactions`)
* `transaction_id`, `date`, `type` (INCOME | EXPENSE), `category` (FEED, CHICKS, MEDICINE, LABOR, UTILITIES, EGG_SALE, BIRD_SALE, OTHER)
* `amount_afn`, `flock_id` (nullable), `contact_id` (nullable), `payment_status` (PAID | CREDIT | PARTIAL), `amount_paid_afn`, `description`

---

## PART A — CORRECTED & NEW DATA ENTITIES

### Entity 5: Sheds / Houses (`sheds`)
* `shed_id`, `shed_name`, `capacity`, `shed_type` (OPEN_SIDED | CLOSED_ENVIRONMENT | SEMI_CLOSED), `has_sensors`, `status` (OCCUPIED | EMPTY | CLEANING | MAINTENANCE)

### Entity 6: Bird Movements (`bird_movements`)
* `movement_id`, `flock_id`, `date`, `movement_type` (MORTALITY | CULL | SALE | TRANSFER | THEFT_LOSS), `quantity`
* `cause` (nullable: DISEASE | HEAT | INJURY | PREDATOR | LOW_PRODUCTION | MARKET_READY | UNKNOWN)
* `average_weight_g` (nullable — required for SALE of broilers), `linked_transaction_id` (nullable), `notes`

**Formula:** `Current Quantity = Initial Quantity − Σ(bird_movements.quantity)`

### Entity 7: Environment Logs (`environment_logs`)
* `env_log_id`, `shed_id`, `timestamp`, `temperature_c`, `humidity_percent`, `ammonia_ppm`, `source` (MANUAL | SENSOR)

### Entity 8: Feed Inventory (`feed_stock`, `feed_stock_movements`)
* feed_stock: `feed_id`, `feed_name`, `feed_stage` (STARTER | GROWER | FINISHER | LAYER | PRE_LAYER), `current_stock_kg`, `reorder_level_kg`, `unit_cost_afn`
* feed_stock_movements: `movement_id`, `feed_id`, `date`, `movement_type` (PURCHASE | CONSUMPTION | ADJUSTMENT | WASTE), `quantity_kg`, `flock_id` (nullable)
* Daily log `feed_consumed_kg` auto-creates a CONSUMPTION movement.

### Entity 9: Egg Inventory (`egg_stock_movements`)
* `movement_id`, `date`, `movement_type` (COLLECTION | SALE | DAMAGE | HOME_USE | ADJUSTMENT), `quantity_eggs` (store eggs, display trays of 30), `grade` (LARGE | MEDIUM | SMALL | DAMAGED), `flock_id`, `linked_transaction_id`
* `Eggs In Stock = Σ(COLLECTION) − Σ(SALE + DAMAGE + HOME_USE ± ADJUSTMENT)`

### Entity 10: Weight Sampling (`weight_samples`)
* `sample_id`, `flock_id`, `sample_date`, `sample_size`, `average_weight_g`, `uniformity_percent`
* `FCR = Total Feed Consumed ÷ [(Current Avg Weight × Current Qty) − (Initial Weight × Initial Qty)]`

### Entity 11: Users & Roles (`users`)
* `user_id`, `full_name`, `phone`, `password_hash`, `role` (OWNER | FARM_MANAGER | WORKER | VETERINARIAN | ACCOUNTANT), `language` (EN | FA_DARI | PS_PASHTO), `is_active`
* Permissions: WORKER = data entry only; MANAGER = data + reports + alerts; OWNER = everything incl. finances; VET = health module; ACCOUNTANT = financial module.

### Entity 12: Suppliers & Customers (`contacts`)
* `contact_id`, `name`, `phone`, `address`, `contact_type` (FEED_SUPPLIER | CHICK_SUPPLIER | MEDICINE_SUPPLIER | EGG_BUYER | MEAT_BUYER | OTHER), `outstanding_balance_afn`

### Entity 13: Audit Trail (`audit_logs`)
* `audit_id`, `user_id`, `table_name`, `record_id`, `action` (CREATE | UPDATE | DELETE), `old_value` (JSON), `new_value` (JSON), `timestamp`

---

## PART B — NEW FUNCTIONAL MODULES

### B1. Batch Performance Benchmarking
* `breed_standards` table (editable, not hardcoded): weekly target weight & cumulative feed per breed. Cobb 500 ≈ wk1 185 g, wk2 465 g, wk3 943 g, wk4 1,524 g, wk5 2,191 g, wk6 2,857 g.
* Layers: onset ~18–20 wks, peak 90–95% at ~26–30 wks, decline ~0.5%/wk after peak.
* Actual vs standard chart; deviation > 10% below standard → advisory alert.

### B2. Vaccination Program Templates
* `vaccine_programs` per breed/type; on flock intake, auto-generate `health_logs` with dates computed from `intake_date`.

### B3. Cost-Per-Unit Analytics
* Broiler: cost per kg live weight = total flock expenses ÷ total kg sold; break-even price.
* Layer: cost per egg / per tray; daily feed cost per egg.
* General expenses apportioned across active flocks by bird-days.

### B4. Flock Closure & Batch Report
On status → COMPLETED: final mortality %, FCR, total feed, avg sale weight / production %, income, expense, net profit, profit per bird, comparison with previous batches.

### B5. Water Quality & Consumption Analytics
* Water:feed ratio (normal ≈ 1.8–2:1). Alert on water drop > 20% day-over-day.

### B6. Labor & Task Management
* `tasks` table: recurring daily checklists assigned to workers; manager sees completion.

### B7. Reports & Export
* Daily summary, weekly performance, monthly P&L, vaccination compliance. PDF/Excel export; WhatsApp share.

---

## PART C — SMART / AI FEATURES (Claude API)
All optional and degradeable; core must work offline.
1. Natural-language farm assistant (Dari/Pashto/English).
2. Anomaly narratives on alerts (last 14 days → probable cause + checklist; always append "consult your veterinarian").
3. Weekly advisory report (scheduled, localized).
4. Photo-assisted triage (advisory only, "not a diagnosis").
5. Voice/chat data entry → structured JSON → user confirms → save.
6. Feed least-cost suggestion (advisory).

**Integration pattern:** model never writes to DB. Model output → validation layer → user confirmation → save. Single `askClaude(context, question)` service module.

---

## PART D — PLATFORM & UX
1. Offline-first (local store + sync; server wins on reference data, latest-timestamp wins on logs, conflicts flagged).
2. Multi-language UI: English, Dari, Pashto, full RTL. Enums via translation keys.
3. SMS fallback for critical alerts.
4. Low-literacy friendly entry: large numeric keypads, icons, minimal typing.
5. Dual calendar: Gregorian + Solar Hijri (Jalali).
6. Automatic daily backup + one-tap export.

---

## PART E — ALERTS ENGINE

| # | Trigger | Condition | Severity | Action |
|---|---------|-----------|----------|--------|
| 1 | Heat stress | Shed temp > 30 °C (configurable) | High | Foggers/fans, Vitamin C in water |
| 2 | Cold stress (brooding) | Temp < stage minimum (wk1 32 °C, −2.5 °C/wk) | High | Check brooders/heaters |
| 3 | Abnormal mortality | Daily mortality > 1% of current qty | Critical | Isolate, call veterinarian |
| 4 | Vaccination due | health_log PENDING & date = today | Medium | Prepare vaccine |
| 5 | Missed vaccination | PENDING & date < today | High | Reschedule immediately |
| 6 | Production drop | Hen-day % falls > 5 pts vs 7-day avg | High | Check feed, water, light, disease |
| 7 | Feed stock low | current_stock_kg < reorder_level | Medium | Order feed (days remaining) |
| 8 | Feed runout forecast | stock ÷ avg daily consumption < 5 days | High | Urgent reorder |
| 9 | Water drop | Consumption ↓ > 20% vs previous day | High | Inspect flock |
| 10 | FCR drift (broiler) | Cumulative FCR > standard + 0.2 | Medium | Review feed quality/wastage |
| 11 | Weight below standard | Sample avg > 10% under breed curve | Medium | Review nutrition & health |
| 12 | Overdue receivables | Credit sale unpaid > N days | Low | Follow up with buyer |
| 13 | Missing daily log | No log by cutoff time | Low | Remind assigned worker |

All thresholds stored in a `settings` table — configurable, never hardcoded.

---

## PART F — BUILD PLAN

**Stack (chosen):** Next.js + Prisma (SQLite dev / PostgreSQL prod), mobile-responsive, PWA-ready.

**Phases**
1. Core records: users/auth, sheds, flocks, daily logs, bird movements, dashboard (population & mortality).
2. Health & alerts: vaccine templates, health logs, alerts #3, #4, #5, #13.
3. Finance & inventory: transactions, contacts/credit, feed stock, egg stock, alerts #7, #8, #12.
4. Analytics: breed standards, FCR & production curves, cost-per-unit, batch closure report, alerts #6, #10, #11.
5. Environment & polish: environment logs, heat/cold alerts, PDF/Excel export, localization, offline sync.
6. AI features: chat assistant, anomaly narratives, voice data entry, weekly reports.

**Definition of done (per phase):** formulas verified against hand-calculated examples (unit tests); works on mobile widths; Dari/Pashto strings externalized; backup/restore tested; demo data walkthrough.
