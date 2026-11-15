import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { getLang, getTheme, themeClass } from "@/lib/locale";
import { htmlLang, isRtl, t } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";
import { PwaRegister } from "@/components/pwa";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazir", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: `${t("app.short", lang)} — ${t("app.title", lang)}`, description: t("auth.blurb", lang), appleWebApp: { capable: true, title: t("app.short", lang), statusBarStyle: "default" } };
}

// Browser/status-bar colour follows the app header (the card colour in globals.css) for the user's chosen theme.
const BAR = { light: "#ffffff", dark: "#161b23" };
export async function generateViewport(): Promise<Viewport> {
  const theme = await getTheme();
  return {
    viewportFit: "cover", // lets env(safe-area-inset-*) work in the installed app
    themeColor: theme === "LIGHT" ? BAR.light : theme === "DARK" ? BAR.dark
      : [{ media: "(prefers-color-scheme: light)", color: BAR.light }, { media: "(prefers-color-scheme: dark)", color: BAR.dark }],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [lang, theme] = await Promise.all([getLang(), getTheme()]);
  return (
    <html lang={htmlLang(lang)} dir={isRtl(lang) ? "rtl" : "ltr"} className={`${vazir.variable} ${themeClass(theme)}`.trim()} style={theme === "SYSTEM" ? undefined : { colorScheme: theme.toLowerCase() }}>
      <body className="min-h-screen antialiased"><I18nProvider lang={lang}>{children}</I18nProvider><PwaRegister /></body>
    </html>
  );
}
