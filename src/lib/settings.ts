import { prisma } from "./db";

/** Default settings, seeded into the `settings` table. Values are read from DB at runtime (SPEC Part E). */
export const DEFAULT_SETTINGS: Record<string, { value: string; description: string }> = {
  "alert.mortality.dailyPct": { value: "1", description: "Abnormal mortality: daily mortality % threshold (#3)" },
  "alert.dailyLog.cutoffTime": { value: "18:00", description: "Missing daily log cutoff time HH:mm (#13)" },
  "alert.heat.maxTempC": { value: "30", description: "Heat stress temperature °C (#1)" },
  "alert.production.dropPts": { value: "5", description: "Production drop vs 7-day avg (#6)" },
  "alert.feed.runoutDays": { value: "5", description: "Feed runout forecast days (#8)" },
  "alert.water.dropPct": { value: "20", description: "Water consumption drop % (#9)" },
  "eggs.trayCount": { value: "30", description: "Eggs per tray for display" },
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key]?.value ?? "";
}
export const getSettingNumber = async (key: string) => Number(await getSetting(key));
