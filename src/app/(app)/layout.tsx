import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { t, enumLabel, isRtl, type Lang } from "@/lib/i18n";
import { SideNav, BottomNav, type NavItem } from "@/components/Nav";
import { fmtJalali, todayStr } from "@/lib/format";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const lang = user.language as Lang;
  const items: NavItem[] = [
    { href: "/dashboard", label: t("nav.dashboard", lang), icon: "📊" }, { href: "/flocks", label: t("nav.flocks", lang), icon: "🐔" },
    { href: "/sheds", label: t("nav.sheds", lang), icon: "🏠" }, { href: "/daily-logs", label: t("nav.dailyLogs", lang), icon: "📝" },
    { href: "/movements", label: t("nav.movements", lang), icon: "↔️" },
  ];
  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"} className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg text-white">🐔</span>
            <div><div className="font-bold leading-tight">PMS</div><div className="hidden text-xs text-muted sm:block">{todayStr()} · {fmtJalali(new Date())}</div></div></div>
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <div className="hidden text-end sm:block"><div className="font-medium">{user.fullName}</div><div className="text-xs text-muted">{enumLabel(user.role, lang)}</div></div>
            <button className="rounded-xl border border-border px-3 py-1.5 text-sm hover:bg-surface-2">{t("nav.logout", lang)}</button>
          </form>
        </div>
      </header>
      <div className="flex min-w-0 flex-1">
        <SideNav items={items} />
        <main className="w-full min-w-0 flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</main>
      </div>
      <BottomNav items={items} />
    </div>
  );
}
