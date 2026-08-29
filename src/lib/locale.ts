// Server-side locale resolution: session language → `pms_lang` cookie (pre-login choice) → EN.
import { cookies } from "next/headers";
import { getSession } from "./auth";
import { isLang, makeT, type Lang } from "./i18n";

export const LANG_COOKIE = "pms_lang";

export async function getLang(): Promise<Lang> {
  const s = await getSession();
  if (s && isLang(s.language)) return s.language;
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(c) ? c : "EN";
}
export async function getT() { const lang = await getLang(); return { lang, t: makeT(lang) }; }
