import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { getT } from "@/lib/locale";
import { SideNav, BottomNav, type NavItem } from "@/components/Nav";
import { fmtJalali, todayStr } from "@/lib/format";
import { UserMenu } from "@/components/UserMenu";
import { can } from "@/lib/enums";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(); const { t } = await getT();
  const items: NavItem[] = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: "dashboard" }, { href: "/flocks", label: t("nav.flocks"), icon: "flocks" },
    { href: "/sheds", label: t("nav.sheds"), icon: "sheds" }, { href: "/daily-logs", label: t("nav.dailyLogs"), icon: "logs" },
    { href: "/movements", label: t("nav.movements"), icon: "movements" },
    ...(can(user.role, "admin") ? [{ href: "/users", label: t("nav.users"), icon: "users" as const }] : []),
    { href: "/profile", label: t("nav.profile"), icon: "profile" },
  ];
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5 lg:px-6">
          <div className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground">🐔</span>
            <div><div className="font-heading font-bold leading-tight">{t("app.short")}</div><div className="hidden text-xs text-muted-foreground sm:block" dir="ltr">{todayStr()} · {fmtJalali(new Date())}</div></div></div>
          <UserMenu user={{ fullName: user.fullName }} logout={logoutAction} />
        </div>
      </header>
      <div className="flex min-w-0 flex-1"><SideNav items={items} /><main className="w-full min-w-0 flex-1 px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</main></div>
      <BottomNav items={items} />
    </div>
  );
}
