import type { ReactNode } from "react";
import Link from "next/link";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>
);
export const Kpi = ({ label, value, sub, tone = "default" }: { label: string; value: string | number; sub?: string; tone?: "default" | "danger" | "ok" }) => (
  <Card>
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className={`mt-1 text-2xl font-semibold ${tone === "danger" ? "text-red-600" : tone === "ok" ? "text-green-700" : "text-gray-900"}`}>{value}</div>
    {sub && <div className="text-xs text-gray-500">{sub}</div>}
  </Card>
);
export const Badge = ({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "red" | "amber" | "blue" }) => {
  const c = { gray: "bg-gray-100 text-gray-700", green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800", amber: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-800" }[tone];
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{children}</span>;
};
export const PageHeader = ({ title, action }: { title: string; action?: { href: string; label: string } }) => (
  <div className="mb-4 flex items-center justify-between">
    <h1 className="text-xl font-semibold">{title}</h1>
    {action && <Link href={action.href} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">{action.label}</Link>}
  </div>
);
export const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600";
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>{children}</label>
);
export const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr>{head.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
);
