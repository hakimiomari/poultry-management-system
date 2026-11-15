"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/components/I18nProvider";
import {
  LayoutDashboard,
  Bird,
  Warehouse,
  ClipboardList,
  ArrowLeftRight,
  Users,
  UserCircle,
  Wallet,
  Handshake,
  Stethoscope,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICONS = {
  dashboard: LayoutDashboard,
  flocks: Bird,
  sheds: Warehouse,
  logs: ClipboardList,
  movements: ArrowLeftRight,
  users: Users,
  profile: UserCircle,
  finance: Wallet,
  contacts: Handshake,
  health: Stethoscope,
} as const;
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function SideNav({
  items,
  logout,
}: {
  items: NavItem[];
  logout: () => Promise<void>;
}) {
  const path = usePathname();
  const { t } = useT();
  return (
    <nav className="hidden w-60 shrink-0 border-e bg-sidebar lg:block">
      {/* Pinned under the 3.5rem header so the links and the logout button stay in view on long pages. */}
      <div className="sticky top-14 flex h-[calc(100dvh-3.5rem)] flex-col p-3">
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((i) => {
            const Icon = ICONS[i.icon];
            const active = path.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="size-4.5" />
                {i.label}
              </Link>
            );
          })}
        </div>
        <form action={logout} className="mt-3 shrink-0 border-t pt-3">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4.5 rtl:-scale-x-100" />
            {t("nav.logout")}
          </button>
        </form>
      </div>
    </nav>
  );
}
export function BottomNav({
  items,
  moreLabel,
}: {
  items: NavItem[];
  moreLabel: string;
}) {
  const path = usePathname();
  const primary = items.slice(0, 4),
    rest = items.slice(4);
  console.log("primary => ", primary);
  const moreActive = rest.some((i) => path.startsWith(i.href));
  const cls = (active: boolean) =>
    cn(
      "flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] text-muted-foreground",
      active && "text-primary",
    );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden">
      {primary.map((i) => {
        const Icon = ICONS[i.icon];
        return (
          <Link
            key={i.href}
            href={i.href}
            className={cls(path.startsWith(i.href))}
          >
            <Icon className="size-5" />
            {i.label}
          </Link>
        );
      })}
      {rest.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(cls(moreActive), "outline-none")}>
            <MoreHorizontal className="size-5" />
            {moreLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="end"
            sideOffset={10}
            className="w-56 p-1.5"
          >
            {rest.map((i) => {
              const Icon = ICONS[i.icon];
              const active = path.startsWith(i.href);
              return (
                <DropdownMenuItem
                  key={i.href}
                  nativeButton={false}
                  render={<Link href={i.href} />}
                  className={cn(
                    "gap-3 rounded-lg px-2.5 py-2.5 text-sm [&_svg]:size-4 [&_svg]:text-muted-foreground",
                    active &&
                      "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-primary",
                  )}
                >
                  <Icon />
                  {i.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
