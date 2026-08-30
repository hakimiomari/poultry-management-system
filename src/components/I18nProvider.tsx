"use client";
import { createContext, useContext, type ReactNode } from "react";
import { makeT, isRtl, type Lang, type TFn } from "@/lib/i18n";
import { DirectionProvider } from "@base-ui/react/direction-provider";

const Ctx = createContext<{ lang: Lang; t: TFn }>({ lang: "EN", t: makeT("EN") });
export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  // DirectionProvider lets Base UI popups (menus, dialogs, selects) align and animate correctly in RTL.
  return <DirectionProvider direction={isRtl(lang) ? "rtl" : "ltr"}><Ctx.Provider value={{ lang, t: makeT(lang) }}>{children}</Ctx.Provider></DirectionProvider>;
}
export const useT = () => useContext(Ctx);
