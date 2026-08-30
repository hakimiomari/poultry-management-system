"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Area, AreaChart } from "recharts";

type Point = { date: string; population: number; deaths: number; feedKg: number; eggs: number; henDayPct: number | null };
const axis = { tick: { fontSize: 11, fill: "var(--muted-foreground)" }, axisLine: false, tickLine: false } as const;
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground)", fontSize: 12 } };
const fmtDay = (d: string) => d.slice(5);

export function PopulationChart({ data, height = 200, label = "population" }: { data: Point[]; height?: number; label?: string }) {
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs><linearGradient id="pop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} domain={["auto", "auto"]} width={48} /><Tooltip {...tip} />
        <Area type="monotone" dataKey="population" name={label} stroke="var(--chart-1)" fill="url(#pop)" strokeWidth={2.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer></div>
  );
}
export function MortalityChart({ data, label = "deaths" }: { data: Point[]; label?: string }) {
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} width={36} /><Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="deaths" name={label} fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer></div>
  );
}
export function ProductionChart({ data, label = "Hen-day %" }: { data: Point[]; label?: string }) {
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} domain={[0, 100]} width={36} /><Tooltip {...tip} />
        <Line type="monotone" dataKey="henDayPct" name={label} stroke="var(--chart-3)" dot={false} strokeWidth={2.5} />
      </LineChart>
    </ResponsiveContainer></div>
  );
}
