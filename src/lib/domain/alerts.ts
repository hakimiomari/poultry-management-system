// Phase-1 alert rules (SPEC Part E #3 & #13). Thresholds are injected from `settings` — never hardcoded here.
export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export interface Alert { code: string; severity: Severity; flockId?: string; message: string; action: string }

/** #3 Abnormal mortality: daily mortality % > threshold */
export function abnormalMortalityAlert(flockId: string, flockName: string, dailyMortalityPct: number, thresholdPct: number): Alert | null {
  if (dailyMortalityPct <= thresholdPct) return null;
  return { code: "ABNORMAL_MORTALITY", severity: "CRITICAL", flockId,
    message: `${flockName}: daily mortality ${dailyMortalityPct.toFixed(2)}% exceeds ${thresholdPct}%`,
    action: "Isolate sick birds, call veterinarian" };
}

/** #13 Missing daily log: no log for today and current time past cutoff (HH:mm). */
export function missingDailyLogAlert(flockId: string, flockName: string, hasLogToday: boolean, now: Date, cutoffHHmm: string): Alert | null {
  if (hasLogToday) return null;
  const [h, m] = cutoffHHmm.split(":").map(Number);
  const cutoff = new Date(now); cutoff.setHours(h, m, 0, 0);
  if (now < cutoff) return null;
  return { code: "MISSING_DAILY_LOG", severity: "LOW", flockId, message: `${flockName}: no daily log recorded today`, action: "Remind assigned worker" };
}
