"use client";
import { createContext, useContext, type ReactNode } from "react";
import { makeT, type Lang, type TFn } from "@/lib/i18n";

const Ctx = createContext<{ lang: Lang; t: TFn }>({ lang: "EN", t: makeT("EN") });
export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <Ctx.Provider value={{ lang, t: makeT(lang) }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
