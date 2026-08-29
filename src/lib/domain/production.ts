// FCR, hen-day %, daily series — pure functions (SPEC Entity 10, B1).
export interface DailyLogLike { date: Date | string; feedConsumedKg: number; eggsCollected: number; eggsBroken: number; waterConsumedL?: number | null }

/** FCR = Total Feed ÷ [(Current Avg Wt × Current Qty) − (Initial Wt × Initial Qty)] (all weights kg) */
export function fcr(totalFeedKg: number, currentAvgWeightG: number, currentQty: number, initialAvgWeightG: number, initialQty: number): number | null {
  const gainKg = (currentAvgWeightG * currentQty - initialAvgWeightG * initialQty) / 1000;
  if (gainKg <= 0 || totalFeedKg <= 0) return null;
  return totalFeedKg / gainKg;
}

/** Hen-day production % = eggs ÷ hens present × 100 */
export function henDayPct(eggs: number, hensPresent: number): number {
  return hensPresent > 0 ? (eggs / hensPresent) * 100 : 0;
}

export function totalFeedKg(logs: DailyLogLike[]): number {
  return logs.reduce((s, l) => s + (l.feedConsumedKg || 0), 0);
}

/** Water:feed ratio by weight (1 L ≈ 1 kg). Normal ≈ 1.8–2.0. */
export function waterFeedRatio(waterL: number | null | undefined, feedKg: number): number | null {
  if (!waterL || feedKg <= 0) return null;
  return waterL / feedKg;
}
