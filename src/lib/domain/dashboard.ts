// Pure farm-wide aggregations for the dashboard. No DB access.
import { currentQuantity, type MovementLike } from "./population";
import { henDayPct, type DailyLogLike } from "./production";
import { monthTotals, type TxLike } from "./finance";

const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

export interface CauseMovement extends MovementLike { cause?: string | null }
export interface FarmFlock { flockType: string; initialQuantity: number; intakeDate: Date | string; movements: CauseMovement[]; logs: DailyLogLike[] }
export interface FarmDay { date: string; population: number; deaths: number; eggs: number; feedKg: number; henDayPct: number | null }

/** `days` consecutive calendar days ending on `end` (inclusive), oldest first, as YYYY-MM-DD. */
export function dateRange(end: Date | string, days: number): string[] {
  const last = new Date(`${dayKey(end)}T00:00:00.000Z`).getTime();
  return Array.from({ length: Math.max(0, days) }, (_, i) => new Date(last - (days - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}

/** `count` consecutive months ending on `endMonth` (inclusive), oldest first, as YYYY-MM. */
export function monthRange(endMonth: string, count: number): string[] {
  const [y, m] = endMonth.split("-").map(Number);
  return Array.from({ length: Math.max(0, count) }, (_, i) => new Date(Date.UTC(y, m - 1 - (count - 1 - i), 1)).toISOString().slice(0, 7));
}

/** Most recent day with a log or a movement, never later than `today`; `today` when nothing is recorded. */
export function latestRecordDay(flocks: FarmFlock[], today: string): string {
  let latest = "";
  for (const f of flocks) for (const r of [...f.logs, ...f.movements]) { const k = dayKey(r.date); if (k <= today && k > latest) latest = k; }
  return latest || today;
}

/**
 * One row per day, summed over every flock already placed on that day.
 * Population is end-of-day (movements up to and including the day applied), as on the flock charts.
 * Hen-day % = layer eggs ÷ layer hens present, only over layer flocks that logged that day; null when none did.
 */
export function farmDailySeries(flocks: FarmFlock[], dates: string[]): FarmDay[] {
  return dates.map((date) => {
    let population = 0, deaths = 0, eggs = 0, feedKg = 0, layerEggs = 0, layerHens = 0;
    for (const f of flocks) {
      if (dayKey(f.intakeDate) > date) continue;
      const pop = currentQuantity(f.initialQuantity, f.movements.filter((m) => dayKey(m.date) <= date));
      population += pop;
      deaths += f.movements.filter((m) => m.movementType === "MORTALITY" && dayKey(m.date) === date).reduce((s, m) => s + m.quantity, 0);
      const logs = f.logs.filter((l) => dayKey(l.date) === date);
      for (const l of logs) { eggs += l.eggsCollected || 0; feedKg += l.feedConsumedKg || 0; }
      if (f.flockType === "LAYER" && logs.length > 0) { layerEggs += logs.reduce((s, l) => s + (l.eggsCollected || 0), 0); layerHens += pop; }
    }
    return { date, population, deaths, eggs, feedKg, henDayPct: layerHens > 0 ? henDayPct(layerEggs, layerHens) : null };
  });
}

/** Deaths between `from` and `to` (inclusive), grouped by cause, largest first. A missing cause counts as UNKNOWN. */
export function deathsByCause(movements: CauseMovement[], from: string, to: string): { cause: string; total: number }[] {
  const m = new Map<string, number>();
  for (const mv of movements) {
    const k = dayKey(mv.date);
    if (mv.movementType !== "MORTALITY" || k < from || k > to) continue;
    const cause = mv.cause || "UNKNOWN";
    m.set(cause, (m.get(cause) ?? 0) + mv.quantity);
  }
  return [...m.entries()].map(([cause, total]) => ({ cause, total })).sort((a, b) => b.total - a.total);
}

/** Income, expense and net for each month, in the order given. */
export function monthlyCashflow(txs: TxLike[], months: string[]): { month: string; income: number; expense: number; net: number }[] {
  return months.map((month) => { const { income, expense, net } = monthTotals(txs, month); return { month, income, expense, net }; });
}

/** Sum of one measure over the days from `from` to `to` (inclusive). */
export function sumBetween(series: FarmDay[], key: "deaths" | "eggs" | "feedKg", from: string, to: string): number {
  return series.reduce((s, d) => (d.date >= from && d.date <= to ? s + d[key] : s), 0);
}

/** Mean hen-day % over the days that have one; null when no day does. */
export function averageHenDay(series: FarmDay[]): number | null {
  const vals = series.map((d) => d.henDayPct).filter((v): v is number => v != null);
  return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
}
