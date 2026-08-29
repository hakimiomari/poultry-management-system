// Externalized UI strings. EN complete; FA/PS keys present (fill in translations later).
import { LANGUAGES } from "./enums";
export type Lang = (typeof LANGUAGES)[number];

const en = {
  "app.title": "Poultry Management System",
  "nav.dashboard": "Dashboard", "nav.flocks": "Flocks", "nav.sheds": "Sheds",
  "nav.dailyLogs": "Daily Logs", "nav.movements": "Bird Movements", "nav.logout": "Logout",
  "field.date": "Date", "field.quantity": "Quantity", "field.notes": "Notes",
  "field.feedKg": "Feed consumed (kg)", "field.waterL": "Water consumed (L)",
  "field.eggs": "Eggs collected", "field.eggsBroken": "Eggs broken",
  "kpi.population": "Current population", "kpi.mortality": "Cumulative mortality",
  "kpi.age": "Age (days)", "kpi.activeFlocks": "Active flocks", "kpi.todayMortality": "Deaths today",
  "action.save": "Save", "action.cancel": "Cancel", "action.add": "Add",
  "auth.login": "Login", "auth.phone": "Phone", "auth.password": "Password", "auth.invalid": "Invalid phone or password",
  // enums
  "enum.OWNER": "Owner", "enum.FARM_MANAGER": "Farm manager", "enum.WORKER": "Worker",
  "enum.VETERINARIAN": "Veterinarian", "enum.ACCOUNTANT": "Accountant",
  "enum.OPEN_SIDED": "Open-sided", "enum.CLOSED_ENVIRONMENT": "Closed environment", "enum.SEMI_CLOSED": "Semi-closed",
  "enum.OCCUPIED": "Occupied", "enum.EMPTY": "Empty", "enum.CLEANING": "Cleaning", "enum.MAINTENANCE": "Maintenance",
  "enum.BROILER": "Broiler", "enum.LAYER": "Layer", "enum.ACTIVE": "Active", "enum.COMPLETED": "Completed",
  "enum.MORTALITY": "Mortality", "enum.CULL": "Cull", "enum.SALE": "Sale", "enum.TRANSFER": "Transfer", "enum.THEFT_LOSS": "Theft / loss",
  "enum.DISEASE": "Disease", "enum.HEAT": "Heat", "enum.INJURY": "Injury", "enum.PREDATOR": "Predator",
  "enum.LOW_PRODUCTION": "Low production", "enum.MARKET_READY": "Market ready", "enum.UNKNOWN": "Unknown",
} as const;

export type TKey = keyof typeof en;
const fa: Partial<Record<TKey, string>> = { "app.title": "سیستم مدیریت مرغداری", "nav.dashboard": "داشبورد", "nav.flocks": "گله‌ها", "nav.sheds": "سالن‌ها" };
const ps: Partial<Record<TKey, string>> = { "app.title": "د چرګانو د مدیریت سیستم", "nav.dashboard": "ډاشبورډ", "nav.flocks": "رمې", "nav.sheds": "شیډونه" };

const dict: Record<Lang, Partial<Record<TKey, string>>> = { EN: en, FA_DARI: fa, PS_PASHTO: ps };

export function t(key: TKey | string, lang: Lang = "EN"): string {
  return (dict[lang] as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
}
export const enumLabel = (v: string, lang: Lang = "EN") => t(`enum.${v}`, lang);
export const isRtl = (lang: Lang) => lang !== "EN";
