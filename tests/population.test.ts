import { describe, it, expect } from "vitest";
import { currentQuantity, cumulativeMortalityPct, dailyMortalityPct, populationAtStartOfDay, ageInDays, validateMovement, validateShedCapacity } from "@/lib/domain/population";

// Hand-calculated example: 1,000 birds; day1 5 dead; day2 3 dead + 2 culled; day5 sold 300.
const moves = [
  { movementType: "MORTALITY", quantity: 5, date: "2026-08-01" },
  { movementType: "MORTALITY", quantity: 3, date: "2026-08-02" },
  { movementType: "CULL", quantity: 2, date: "2026-08-02" },
  { movementType: "SALE", quantity: 300, date: "2026-08-05" },
];

describe("population formulas", () => {
  it("current quantity = initial − Σ all movements (not just deaths)", () => {
    expect(currentQuantity(1000, moves)).toBe(1000 - 5 - 3 - 2 - 300); // 690
  });
  it("cumulative mortality % counts MORTALITY only", () => {
    expect(cumulativeMortalityPct(1000, moves)).toBeCloseTo(0.8); // 8/1000
  });
  it("population at start of day excludes that day's movements", () => {
    expect(populationAtStartOfDay(1000, moves, "2026-08-02")).toBe(995);
    expect(populationAtStartOfDay(1000, moves, "2026-08-05")).toBe(990);
  });
  it("daily mortality % uses population at start of day", () => {
    expect(dailyMortalityPct(1000, moves, "2026-08-02")).toBeCloseTo((3 / 995) * 100);
    expect(dailyMortalityPct(1000, moves, "2026-08-03")).toBe(0);
  });
  it("age in days", () => { expect(ageInDays("2026-08-01", "2026-08-29")).toBe(28); });
  it("cannot remove more birds than present", () => {
    expect(validateMovement(1000, moves, 690).ok).toBe(true);
    const r = validateMovement(1000, moves, 691); expect(r.ok).toBe(false); if (!r.ok) expect(r).toMatchObject({ key: "err.notEnoughBirds", params: { n: 690, q: 691 } });
    expect(validateMovement(1000, moves, 0).ok).toBe(false);
  });
  it("shed capacity rule", () => {
    expect(validateShedCapacity(5000, 3000, 2000).ok).toBe(true);
    expect(validateShedCapacity(5000, 3000, 2001).ok).toBe(false);
  });
});
