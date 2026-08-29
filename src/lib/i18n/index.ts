// Localization core. Dictionaries are typed against en.ts so a missing key fails `tsc`.
import en from "./en"; import fa from "./fa"; import ps from "./ps";
import { LANGUAGES } from "../enums";

export type Lang = (typeof LANGUAGES)[number];
export type TKey = keyof typeof en;
export type Vars = Record<string, string | number>;
export type TFn = (key: TKey, vars?: Vars) => string;

const dict: Record<Lang, Record<TKey, string>> = { EN: en, FA_DARI: fa, PS_PASHTO: ps };

export function t(key: TKey, lang: Lang = "EN", vars?: Vars): string {
  let s: string = dict[lang]?.[key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
export const makeT = (lang: Lang): TFn => (key, vars) => t(key, lang, vars);
/** Enum values display through translation keys (SPEC Part D.2). Falls back to the raw value. */
export const enumLabel = (v: string, lang: Lang = "EN") => t(`enum.${v}` as TKey, lang);
export const isRtl = (lang: Lang) => lang !== "EN";
export const htmlLang = (lang: Lang) => ({ EN: "en", FA_DARI: "fa-AF", PS_PASHTO: "ps-AF" })[lang];
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGUAGES as readonly string[]).includes(v);
