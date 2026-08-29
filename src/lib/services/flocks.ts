// Read-side services: assemble flock KPIs from DB using pure domain formulas.
import { prisma } from "@/lib/db";
import { currentQuantity, cumulativeMortalityPct, dailyMortalityPct, ageInDays, totalByType } from "@/lib/domain/population";
import { henDayPct, totalFeedKg } from "@/lib/domain/production";
import { abnormalMortalityAlert, missingDailyLogAlert, type Alert } from "@/lib/domain/alerts";
import { getSetting, getSettingNumber } from "@/lib/settings";
import { fmtDate, todayStr } from "@/lib/format";

export async function getFlockKpis(flockId: string) {
  const flock = await prisma.flock.findUniqueOrThrow({ where: { id: flockId }, include: { shed: true, birdMovements: { orderBy: { date: "asc" } }, dailyLogs: { orderBy: { date: "asc" } } } });
  const current = currentQuantity(flock.initialQuantity, flock.birdMovements);
  const today = todayStr();
  const todayLog = flock.dailyLogs.find((l) => fmtDate(l.date) === today);
  const series = flock.dailyLogs.map((l) => {
    const d = fmtDate(l.date);
    const deaths = flock.birdMovements.filter((m) => m.movementType === "MORTALITY" && fmtDate(m.date) === d).reduce((s, m) => s + m.quantity, 0);
    const pop = currentQuantity(flock.initialQuantity, flock.birdMovements.filter((m) => fmtDate(m.date) <= d));
    return { date: d, population: pop, deaths, feedKg: l.feedConsumedKg, eggs: l.eggsCollected, henDayPct: flock.flockType === "LAYER" ? henDayPct(l.eggsCollected, pop) : null };
  });
  return {
    flock, current, ageDays: ageInDays(flock.intakeDate),
    mortalityPct: cumulativeMortalityPct(flock.initialQuantity, flock.birdMovements),
    totalDeaths: totalByType(flock.birdMovements, "MORTALITY"), totalSold: totalByType(flock.birdMovements, "SALE"),
    todayDeaths: flock.birdMovements.filter((m) => m.movementType === "MORTALITY" && fmtDate(m.date) === today).reduce((s, m) => s + m.quantity, 0),
    todayMortalityPct: dailyMortalityPct(flock.initialQuantity, flock.birdMovements, today),
    totalFeedKg: totalFeedKg(flock.dailyLogs), hasLogToday: !!todayLog,
    todayHenDayPct: todayLog && flock.flockType === "LAYER" ? henDayPct(todayLog.eggsCollected, current) : null,
    series,
  };
}

export async function getActiveFlockSummaries() {
  const flocks = await prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { intakeDate: "desc" } });
  return Promise.all(flocks.map((f) => getFlockKpis(f.id)));
}

/** Evaluate Phase-1 alerts (#3, #13) against DB-stored thresholds. */
export async function evaluateAlerts(): Promise<Alert[]> {
  const [threshold, cutoff, summaries] = await Promise.all([getSettingNumber("alert.mortality.dailyPct"), getSetting("alert.dailyLog.cutoffTime"), getActiveFlockSummaries()]);
  const alerts: Alert[] = [];
  for (const s of summaries) {
    const a = abnormalMortalityAlert(s.flock.id, s.flock.flockName, s.todayMortalityPct, threshold); if (a) alerts.push(a);
    const b = missingDailyLogAlert(s.flock.id, s.flock.flockName, s.hasLogToday, new Date(), cutoff); if (b) alerts.push(b);
  }
  return alerts;
}

export async function shedOccupancy(shedId: string): Promise<number> {
  const flocks = await prisma.flock.findMany({ where: { shedId, status: "ACTIVE" }, include: { birdMovements: true } });
  return flocks.reduce((s, f) => s + currentQuantity(f.initialQuantity, f.birdMovements), 0);
}
