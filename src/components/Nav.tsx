"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

export function SideNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="hidden w-60 shrink-0 flex-col gap-1 border-e border-border bg-surface p-4 lg:flex">
      {items.map((i) => <Link key={i.href} href={i.href} data-active={path.startsWith(i.href)} className="nav-link"><span className="text-lg">{i.icon}</span>{i.label}</Link>)}
    </nav>
  );
}
export function BottomNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map((i) => <Link key={i.href} href={i.href} data-active={path.startsWith(i.href)} className="nav-link flex-col gap-0.5 px-2 py-2 text-[11px]"><span className="text-xl">{i.icon}</span>{i.label}</Link>)}
    </nav>
  );
}
