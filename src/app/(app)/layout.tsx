import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { t, enumLabel, isRtl, type Lang } from "@/lib/i18n";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const lang = user.language as Lang;
  const nav = [["/dashboard", t("nav.dashboard", lang)], ["/flocks", t("nav.flocks", lang)], ["/sheds", t("nav.sheds", lang)], ["/daily-logs", t("nav.dailyLogs", lang)], ["/movements", t("nav.movements", lang)]];
  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"} className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold">🐔 PMS</Link>
          <nav className="hidden gap-4 text-sm sm:flex">{nav.map(([h, l]) => <Link key={h} href={h} className="hover:text-green-700">{l}</Link>)}</nav>
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{user.fullName} · {enumLabel(user.role, lang)}</span>
            <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">{t("nav.logout", lang)}</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 pb-24 sm:pb-8">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex justify-around border-t border-gray-200 bg-white py-2 text-xs sm:hidden">
        {nav.map(([h, l]) => <Link key={h} href={h} className="px-2 py-1 text-center">{l}</Link>)}
      </nav>
    </div>
  );
}
