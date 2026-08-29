"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Bird, Warehouse, ClipboardList, ArrowLeftRight, Users, UserCircle } from "lucide-react";

const ICONS = { dashboard: LayoutDashboard, flocks: Bird, sheds: Warehouse, logs: ClipboardList, movements: ArrowLeftRight, users: Users, profile: UserCircle } as const;
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function SideNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="hidden w-60 shrink-0 flex-col gap-1 border-e bg-sidebar p-3 lg:flex">
      {items.map((i) => { const Icon = ICONS[i.icon]; const active = path.startsWith(i.href); return (
        <Link key={i.href} href={i.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground", active && "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent")}>
          <Icon className="size-4.5" />{i.label}</Link>); })}
    </nav>
  );
}
export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t bg-sidebar pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.slice(0, 5).map((i) => { const Icon = ICONS[i.icon]; const active = path.startsWith(i.href); return (
        <Link key={i.href} href={i.href} className={cn("flex flex-col items-center gap-0.5 px-2 py-2 text-[11px] text-muted-foreground", active && "text-primary")}><Icon className="size-5" />{i.label}</Link>); })}
    </nav>
  );
}
