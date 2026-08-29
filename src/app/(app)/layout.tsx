import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { t, enumLabel, isRtl, type Lang } from "@/lib/i18n";
import { SideNav, BottomNav, type NavItem } from "@/components/Nav";
import { fmtJalali, todayStr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { can } from "@/lib/enums";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const lang = user.language as Lang;
  const items: NavItem[] = [
    { href: "/dashboard", label: t("nav.dashboard", lang), icon: "dashboard" }, { href: "/flocks", label: t("nav.flocks", lang), icon: "flocks" },
    { href: "/sheds", label: t("nav.sheds", lang), icon: "sheds" }, { href: "/daily-logs", label: t("nav.dailyLogs", lang), icon: "logs" },
    { href: "/movements", label: t("nav.movements", lang), icon: "movements" },
    ...(can(user.role, "admin") ? [{ href: "/users", label: t("nav.users", lang), icon: "users" as const }] : []),
    { href: "/profile", label: t("nav.profile", lang), icon: "profile" },
  ];
  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"} className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5 lg:px-6">
          <div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground">🐔</span>
            <div><div className="font-heading font-bold leading-tight">PMS</div><div className="hidden text-xs text-muted-foreground sm:block">{todayStr()} · {fmtJalali(new Date())}</div></div></div>
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <Link href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted"><span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</span><span className="hidden text-start sm:block"><span className="block font-medium leading-tight">{user.fullName}</span><span className="block text-xs text-muted-foreground">{enumLabel(user.role, lang)}</span></span></Link>
            <Button variant="outline" size="sm"><LogOut />{t("nav.logout", lang)}</Button>
          </form>
        </div>
      </header>
      <div className="flex min-w-0 flex-1"><SideNav items={items} /><main className="w-full min-w-0 flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</main></div>
      <BottomNav items={items} />
    </div>
  );
}
