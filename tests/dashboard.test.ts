import { describe, it, expect } from "vitest";
import { dateRange, monthRange, latestRecordDay, farmDailySeries, deathsByCause, monthlyCashflow, sumBetween, averageHenDay, type FarmFlock } from "@/lib/domain/dashboard";

const log = (date: string, feedConsumedKg: number, eggsCollected = 0) => ({ date, feedConsumedKg, eggsCollected, eggsBroken: 0 });
const broiler: FarmFlock = {
  flockType: "BROILER", initialQuantity: 1000, intakeDate: "2026-08-01",
  movements: [
    { date: "2026-08-02", movementType: "MORTALITY", quantity: 10, cause: "DISEASE" },
    { date: "2026-08-03", movementType: "MORTALITY", quantity: 5, cause: null },
    { date: "2026-08-03", movementType: "SALE", quantity: 100 },
  ],
  logs: [log("2026-08-01", 20), log("2026-08-02", 22), log("2026-08-03", 24)],
};
const layer: FarmFlock = {
  flockType: "LAYER", initialQuantity: 500, intakeDate: "2026-08-02",
  movements: [{ date: "2026-08-03", movementType: "MORTALITY", quantity: 20, cause: "HEAT" }],
  logs: [log("2026-08-02", 50, 400), log("2026-08-03", 55, 432)],
};

describe("dashboard aggregations", () => {
  it("builds inclusive day and month ranges, oldest first, across boundaries", () => {
    expect(dateRange("2026-03-02", 4)).toEqual(["2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02"]);
    expect(dateRange("2026-08-03", 0)).toEqual([]);
    expect(monthRange("2026-02", 4)).toEqual(["2025-11", "2025-12", "2026-01", "2026-02"]);
  });
  it("finds the latest recorded day, capped at today", () => {
    expect(latestRecordDay([broiler, layer], "2026-11-14")).toBe("2026-08-03");
    expect(latestRecordDay([broiler, layer], "2026-08-02")).toBe("2026-08-02");
    expect(latestRecordDay([], "2026-11-14")).toBe("2026-11-14");
  });
  it("sums the farm per day (hand-calculated)", () => {
    const s = farmDailySeries([broiler, layer], dateRange("2026-08-04", 4));
    // Aug 1: only the broiler is placed. No layer log, so no hen-day %.
    expect(s[0]).toEqual({ date: "2026-08-01", population: 1000, deaths: 0, eggs: 0, feedKg: 20, henDayPct: null });
    // Aug 2: 990 broilers + 500 layers; 400 eggs ÷ 500 hens = 80%.
    expect(s[1]).toEqual({ date: "2026-08-02", population: 1490, deaths: 10, eggs: 400, feedKg: 72, henDayPct: 80 });
    // Aug 3: broiler 1000 − 10 − 5 − 100 = 885; layer 500 − 20 = 480; 432 ÷ 480 = 90%.
    expect(s[2]).toEqual({ date: "2026-08-03", population: 1365, deaths: 25, eggs: 432, feedKg: 79, henDayPct: 90 });
    // Aug 4: nothing logged; population carries forward.
    expect(s[3]).toEqual({ date: "2026-08-04", population: 1365, deaths: 0, eggs: 0, feedKg: 0, henDayPct: null });
  });
  it("totals a measure over a date span and averages hen-day over logged days only", () => {
    const s = farmDailySeries([broiler, layer], dateRange("2026-08-04", 4));
    expect(sumBetween(s, "deaths", "2026-08-01", "2026-08-04")).toBe(35);
    expect(sumBetween(s, "feedKg", "2026-08-02", "2026-08-03")).toBe(151);
    expect(averageHenDay(s)).toBe(85);
    expect(averageHenDay(farmDailySeries([broiler], dateRange("2026-08-03", 3)))).toBeNull();
  });
  it("groups deaths by cause within the span, largest first, ignoring sales", () => {
    const all = [...broiler.movements, ...layer.movements];
    expect(deathsByCause(all, "2026-08-01", "2026-08-31")).toEqual([{ cause: "HEAT", total: 20 }, { cause: "DISEASE", total: 10 }, { cause: "UNKNOWN", total: 5 }]);
    expect(deathsByCause(all, "2026-08-01", "2026-08-02")).toEqual([{ cause: "DISEASE", total: 10 }]);
  });
  it("totals income and expense per month, including empty months", () => {
    const txs = [
      { type: "INCOME", amountAfn: 12000, amountPaidAfn: 12000, paymentStatus: "PAID", date: "2026-08-02" },
      { type: "EXPENSE", amountAfn: 50000, amountPaidAfn: 0, paymentStatus: "CREDIT", date: "2026-08-05" },
      { type: "EXPENSE", amountAfn: 1500, amountPaidAfn: 1500, paymentStatus: "PAID", date: "2026-07-28" },
    ];
    expect(monthlyCashflow(txs, monthRange("2026-09", 3))).toEqual([
      { month: "2026-07", income: 0, expense: 1500, net: -1500 },
      { month: "2026-08", income: 12000, expense: 50000, net: -38000 },
      { month: "2026-09", income: 0, expense: 0, net: 0 },
    ]);
  });
});
