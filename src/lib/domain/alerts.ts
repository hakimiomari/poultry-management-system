// Phase-1 alert rules (SPEC Part E #3 & #13). Thresholds are injected from `settings` — never hardcoded here.
// Alerts carry a code + params; the UI renders them via i18n keys `alert.<code>.msg` / `.action`.
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertCode = "ABNORMAL_MORTALITY" | "MISSING_DAILY_LOG";
export interface Alert { code: AlertCode; severity: Severity; flockId?: string; params: Record<string, string | number> }

/** #3 Abnormal mortality: daily mortality % > threshold */
export function abnormalMortalityAlert(flockId: string, flockName: string, dailyMortalityPct: number, thresholdPct: number): Alert | null {
  if (dailyMortalityPct <= thresholdPct) return null;
  return { code: "ABNORMAL_MORTALITY", severity: "CRITICAL", flockId, params: { flock: flockName, pct: dailyMortalityPct.toFixed(2), threshold: thresholdPct } };
}

/** #13 Missing daily log: no log for today and current time past cutoff (HH:mm). */
export function missingDailyLogAlert(flockId: string, flockName: string, hasLogToday: boolean, now: Date, cutoffHHmm: string): Alert | null {
  if (hasLogToday) return null;
  const [h, m] = cutoffHHmm.split(":").map(Number);
  const cutoff = new Date(now); cutoff.setHours(h, m, 0, 0);
  if (now < cutoff) return null;
  return { code: "MISSING_DAILY_LOG", severity: "LOW", flockId, params: { flock: flockName } };
}
