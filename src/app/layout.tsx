import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/locale";
import { htmlLang, isRtl, t } from "@/lib/i18n";
import { I18nProvider } from "@/components/I18nProvider";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazir", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: `${t("app.short", lang)} — ${t("app.title", lang)}`, description: t("auth.blurb", lang) };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={htmlLang(lang)} dir={isRtl(lang) ? "rtl" : "ltr"} className={vazir.variable}>
      <body className="min-h-screen antialiased"><I18nProvider lang={lang}>{children}</I18nProvider></body>
    </html>
  );
}
