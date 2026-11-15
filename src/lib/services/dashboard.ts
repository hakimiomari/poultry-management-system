// Read-side service for the dashboard: loads rows, hands them to the pure aggregations in domain/dashboard.
import { prisma } from "@/lib/db";
import { getActiveFlockSummaries } from "./flocks";
import { getSettingNumber } from "@/lib/settings";
import { fmtDate, todayStr } from "@/lib/format";
import { totalByType } from "@/lib/domain/population";
import { monthTotals, balances } from "@/lib/domain/finance";
import { dateRange, monthRange, latestRecordDay, farmDailySeries, deathsByCause, monthlyCashflow, sumBetween, averageHenDay, type FarmFlock } from "@/lib/domain/dashboard";

const positiveInt = (v: number, fallback: number) => (Number.isFinite(v) && v >= 1 ? Math.round(v) : fallback);

/** Finance and health blocks are only loaded for roles allowed to see them. */
export async function getDashboard(show: { finance: boolean; health: boolean }) {
  const today = todayStr();
  const [flocks, sheds, trendDaysRaw, monthsRaw, trayRaw] = await Promise.all([
    getActiveFlockSummaries(), prisma.shed.findMany({ orderBy: { shedName: "asc" } }),
    getSettingNumber("dashboard.trendDays"), getSettingNumber("dashboard.cashflowMonths"), getSettingNumber("eggs.trayCount"),
  ]);
  const farm: FarmFlock[] = flocks.map((f) => ({ flockType: f.flock.flockType, initialQuantity: f.flock.initialQuantity, intakeDate: f.flock.intakeDate, movements: f.flock.birdMovements, logs: f.flock.dailyLogs }));
  const movements = farm.flatMap((f) => f.movements);

  // Trend charts end on the latest recorded day, so a farm that has not logged today still sees its recent history.
  const dates = dateRange(latestRecordDay(farm, today), positiveInt(trendDaysRaw, 30));
  const from = dates[0], to = dates[dates.length - 1];
  const series = farmDailySeries(farm, dates);
  const week = dateRange(today, 7), weekSeries = farmDailySeries(farm, week);
  const todayRow = weekSeries[weekSeries.length - 1];
  const initialBirds = flocks.reduce((s, f) => s + f.flock.initialQuantity, 0), totalDeaths = totalByType(movements, "MORTALITY");

  const [finance, health] = await Promise.all([show.finance ? loadFinance(today.slice(0, 7), positiveInt(monthsRaw, 6)) : null, show.health ? loadHealth(today) : null]);

  return {
    flocks, trayCount: positiveInt(trayRaw, 30),
    totals: {
      birds: flocks.reduce((s, f) => s + f.current, 0), initialBirds, totalDeaths,
      cumMortalityPct: initialBirds > 0 ? (totalDeaths / initialBirds) * 100 : 0,
      todayDeaths: todayRow.deaths, todayEggs: todayRow.eggs, todayFeedKg: todayRow.feedKg,
      weekDeaths: sumBetween(weekSeries, "deaths", week[0], today), weekFeedKg: sumBetween(weekSeries, "feedKg", week[0], today),
    },
    trend: { from, to, series, deaths: sumBetween(series, "deaths", from, to), eggs: sumBetween(series, "eggs", from, to), feedKg: sumBetween(series, "feedKg", from, to), avgHenDay: averageHenDay(series) },
    causes: deathsByCause(movements, from, to),
    sheds: sheds.map((s) => { const occupied = flocks.filter((f) => f.flock.shedId === s.id).reduce((n, f) => n + f.current, 0); return { id: s.id, shedName: s.shedName, capacity: s.capacity, status: s.status, occupied, pct: s.capacity > 0 ? Math.round((occupied / s.capacity) * 100) : 0 }; }),
    finance, health,
  };
}

async function loadFinance(month: string, months: number) {
  const txs = await prisma.transaction.findMany({ select: { type: true, category: true, amountAfn: true, amountPaidAfn: true, paymentStatus: true, date: true } });
  return { ...monthTotals(txs, month), ...balances(txs), months, cashflow: monthlyCashflow(txs, monthRange(month, months)) };
}

async function loadHealth(today: string) {
  const where = { status: "PENDING", flock: { status: "ACTIVE" } };
  const [upcoming, pending, overdue] = await Promise.all([
    prisma.healthLog.findMany({ where, include: { flock: { select: { id: true, flockName: true } } }, orderBy: { scheduledDate: "asc" }, take: 5 }),
    prisma.healthLog.count({ where }),
    prisma.healthLog.count({ where: { ...where, scheduledDate: { lt: new Date(`${today}T00:00:00.000Z`) } } }),
  ]);
  return { pending, overdue, upcoming: upcoming.map((l) => ({ id: l.id, date: fmtDate(l.scheduledDate), type: l.type, productName: l.productName, flock: l.flock, overdue: fmtDate(l.scheduledDate) < today })) };
}
