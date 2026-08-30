// Server-side locale resolution: session language → `pms_lang` cookie (pre-login choice) → EN.
import { cookies } from "next/headers";
import { getSession } from "./auth";
import { isLang, makeT, type Lang } from "./i18n";
import { THEMES, type Theme } from "./enums";

export const LANG_COOKIE = "pms_lang";

export async function getLang(): Promise<Lang> {
  const s = await getSession();
  if (s && isLang(s.language)) return s.language;
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(c) ? c : "EN";
}
export async function getT() { const lang = await getLang(); return { lang, t: makeT(lang) }; }

export const THEME_COOKIE = "pms_theme";
export const isTheme = (v: unknown): v is Theme => typeof v === "string" && (THEMES as readonly string[]).includes(v);
/** Theme is cookie-driven for instant, flash-free rendering; the user's saved preference is copied into the cookie at login. */
export async function getTheme(): Promise<Theme> {
  const c = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(c) ? c : "SYSTEM";
}
export const themeClass = (t: Theme) => (t === "DARK" ? "dark" : t === "LIGHT" ? "light" : "");
