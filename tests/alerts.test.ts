import { describe, it, expect } from "vitest";
import { abnormalMortalityAlert, missingDailyLogAlert } from "@/lib/domain/alerts";

describe("alerts #3 and #13", () => {
  it("fires abnormal mortality only above the configured threshold", () => {
    expect(abnormalMortalityAlert("f", "A", 0.9, 1)).toBeNull();
    expect(abnormalMortalityAlert("f", "A", 1.0, 1)).toBeNull();
    expect(abnormalMortalityAlert("f", "A", 1.2, 1)?.severity).toBe("CRITICAL");
  });
  it("missing daily log only after cutoff", () => {
    const before = new Date("2026-08-29T10:00:00"); const after = new Date("2026-08-29T19:00:00");
    expect(missingDailyLogAlert("f", "A", false, before, "18:00")).toBeNull();
    expect(missingDailyLogAlert("f", "A", false, after, "18:00")?.code).toBe("MISSING_DAILY_LOG");
    expect(missingDailyLogAlert("f", "A", true, after, "18:00")).toBeNull();
  });
});
