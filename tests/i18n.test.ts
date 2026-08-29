import { describe, it, expect } from "vitest";
import en from "@/lib/i18n/en"; import fa from "@/lib/i18n/fa"; import ps from "@/lib/i18n/ps";
import { t, enumLabel } from "@/lib/i18n";

describe("i18n dictionaries", () => {
  it("fa and ps cover every English key with non-empty strings", () => {
    for (const k of Object.keys(en) as (keyof typeof en)[]) { expect(fa[k], `fa:${k}`).toBeTruthy(); expect(ps[k], `ps:${k}`).toBeTruthy(); }
  });
  it("placeholders match across languages", () => {
    const ph = (s: string) => (s.match(/\{[a-z]+\}/g) ?? []).sort().join(",");
    for (const k of Object.keys(en) as (keyof typeof en)[]) { expect(ph(fa[k]), `fa:${k}`).toBe(ph(en[k])); expect(ph(ps[k]), `ps:${k}`).toBe(ph(en[k])); }
  });
  it("interpolates and falls back", () => {
    expect(t("dash.alertsNeed", "EN", { n: 3 })).toBe("3 alert(s) need attention");
    expect(t("err.notEnoughBirds", "FA_DARI", { n: 5, q: 9 })).toContain("5");
    expect(enumLabel("BROILER", "PS_PASHTO")).toBe("غوښې");
  });
});
