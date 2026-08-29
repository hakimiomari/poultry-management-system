import { describe, it, expect } from "vitest";
import { fcr, henDayPct, waterFeedRatio } from "@/lib/domain/production";

describe("production formulas", () => {
  it("FCR = feed ÷ weight gain (hand example: 3,400 kg feed, 980 birds × 2,000 g, 1,000 × 40 g)", () => {
    // gain = (2000*980 − 40*1000)/1000 = 1,920 kg → FCR = 3400/1920 = 1.7708
    expect(fcr(3400, 2000, 980, 40, 1000)).toBeCloseTo(1.7708, 3);
  });
  it("FCR is null when there is no gain or no feed", () => {
    expect(fcr(0, 2000, 980, 40, 1000)).toBeNull();
    expect(fcr(100, 40, 1000, 40, 1000)).toBeNull();
  });
  it("hen-day % = eggs ÷ hens × 100", () => {
    expect(henDayPct(870, 1000)).toBe(87);
    expect(henDayPct(10, 0)).toBe(0);
  });
  it("water:feed ratio", () => {
    expect(waterFeedRatio(200, 100)).toBe(2);
    expect(waterFeedRatio(null, 100)).toBeNull();
  });
});
