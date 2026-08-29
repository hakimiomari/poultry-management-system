import type { ReactNode } from "react";
import Link from "next/link";

export const Card = ({ children, className = "", title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) => (
  <section className={`card p-5 ${className}`}>
    {(title || action) && <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-muted uppercase tracking-wider">{title}</h3>{action}</div>}
    {children}
  </section>
);

export const Kpi = ({ label, value, sub, icon, tone = "default" }: { label: string; value: string | number; sub?: string; icon?: string; tone?: "default" | "danger" | "ok" | "info" }) => {
  const color = { default: "text-text", danger: "text-danger", ok: "text-primary", info: "text-info" }[tone];
  const bg = { default: "bg-surface-2", danger: "bg-danger-soft", ok: "bg-primary-soft", info: "bg-info-soft" }[tone];
  return (
    <div className="card flex items-start gap-3 p-4">
      {icon && <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${bg}`}>{icon}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-muted">{label}</div>
        <div className={`tabular mt-0.5 whitespace-nowrap text-xl font-semibold leading-tight md:text-2xl ${color}`}>{value}</div>
        {sub && <div className="text-xs text-muted">{sub}</div>}
      </div>
    </div>
  );
};

export const Badge = ({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "red" | "amber" | "blue" }) => {
  const c = { gray: "bg-surface-2 text-muted border-border", green: "bg-primary-soft text-primary border-transparent", red: "bg-danger-soft text-danger border-transparent",
    amber: "bg-accent-soft text-accent border-transparent", blue: "bg-info-soft text-info border-transparent" }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c}`}>{children}</span>;
};

export const Button = ({ href, children, variant = "primary", className = "" }: { href?: string; children: ReactNode; variant?: "primary" | "secondary" | "danger"; className?: string }) => {
  const v = { primary: "bg-primary text-white hover:bg-primary-hover", secondary: "border border-border bg-surface hover:bg-surface-2", danger: "border border-danger/40 text-danger hover:bg-danger-soft" }[variant];
  const cls = `inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${v} ${className}`;
  return href ? <Link href={href} className={cls}>{children}</Link> : <button className={cls}>{children}</button>;
};

export const PageHeader = ({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: { href: string; label: string }; children?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div>
    <div className="flex gap-2">{children}{action && <Button href={action.href}>{action.label}</Button>}</div>
  </div>
);

export const inputCls = "w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-base transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";
export const bigNumCls = inputCls + " tabular text-center text-3xl font-semibold";
export const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="block"><span className="mb-1.5 block text-sm font-medium">{label}</span>{children}{hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}</label>
);

export const Table = ({ head, children, empty = "No records yet." }: { head: string[]; children: ReactNode; empty?: string }) => {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <div className="card overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead><tr className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">{head.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border [&_td]:px-4 [&_td]:py-3 [&_tr:hover]:bg-surface-2">{rows.length ? rows : <tr><td colSpan={head.length} className="py-10 text-center text-muted">{empty}</td></tr>}</tbody>
      </table>
    </div>
  );
};

export const AlertBanner = ({ severity, message, action }: { severity: string; message: string; action: string }) => {
  const hot = severity === "CRITICAL" || severity === "HIGH";
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${hot ? "border-danger/30 bg-danger-soft" : "border-accent/40 bg-accent-soft"}`}>
      <span className="text-lg">{hot ? "🚨" : "⚠️"}</span>
      <div><span className="font-semibold">{message}</span><span className="text-muted"> — {action}</span></div>
      <Badge tone={hot ? "red" : "amber"}>{severity}</Badge>
    </div>
  );
};
