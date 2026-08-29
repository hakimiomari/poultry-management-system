// Pure population & mortality formulas (SPEC Entity 6). No DB access.
export interface MovementLike { movementType: string; quantity: number; date: Date | string }

/** Current Quantity = Initial − Σ(all bird_movements.quantity) */
export function currentQuantity(initialQuantity: number, movements: MovementLike[]): number {
  return initialQuantity - movements.reduce((s, m) => s + m.quantity, 0);
}

export function totalByType(movements: MovementLike[], type: string): number {
  return movements.filter((m) => m.movementType === type).reduce((s, m) => s + m.quantity, 0);
}

/** Cumulative mortality % = deaths ÷ initial × 100 */
export function cumulativeMortalityPct(initialQuantity: number, movements: MovementLike[]): number {
  if (initialQuantity <= 0) return 0;
  return (totalByType(movements, "MORTALITY") / initialQuantity) * 100;
}

const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

/** Population at the START of `day` (movements before that day already applied). */
export function populationAtStartOfDay(initialQuantity: number, movements: MovementLike[], day: Date | string): number {
  const k = dayKey(day);
  return currentQuantity(initialQuantity, movements.filter((m) => dayKey(m.date) < k));
}

/** Daily mortality % = deaths on day ÷ population at start of day × 100 */
export function dailyMortalityPct(initialQuantity: number, movements: MovementLike[], day: Date | string): number {
  const k = dayKey(day);
  const pop = populationAtStartOfDay(initialQuantity, movements, day);
  if (pop <= 0) return 0;
  const deaths = movements.filter((m) => m.movementType === "MORTALITY" && dayKey(m.date) === k).reduce((s, m) => s + m.quantity, 0);
  return (deaths / pop) * 100;
}

export function ageInDays(intakeDate: Date | string, on: Date | string = new Date()): number {
  const a = new Date(dayKey(intakeDate)).getTime();
  const b = new Date(dayKey(on)).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Movement quantity validation: cannot remove more birds than currently present. */
export function validateMovement(initialQuantity: number, movements: MovementLike[], quantity: number) {
  const current = currentQuantity(initialQuantity, movements);
  if (quantity <= 0) return { ok: false as const, error: "Quantity must be positive" };
  if (quantity > current) return { ok: false as const, error: `Only ${current} birds present; cannot remove ${quantity}` };
  return { ok: true as const, remaining: current - quantity };
}

/** Shed capacity rule (SPEC Entity 5): new flock + birds already housed ≤ capacity. */
export function validateShedCapacity(capacity: number, alreadyHoused: number, newQuantity: number) {
  const total = alreadyHoused + newQuantity;
  if (total > capacity) return { ok: false as const, error: `Shed capacity ${capacity} exceeded (${alreadyHoused} housed + ${newQuantity} new = ${total})` };
  return { ok: true as const };
}
