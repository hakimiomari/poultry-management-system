"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Area, AreaChart } from "recharts";

type Point = { date: string; population: number; deaths: number; feedKg: number; eggs: number; henDayPct: number | null };
const axis = { tick: { fontSize: 11, fill: "var(--muted)" }, axisLine: false, tickLine: false } as const;
const tip = { contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 12 } };
const fmtDay = (d: string) => d.slice(5);

export function PopulationChart({ data, height = 200 }: { data: Point[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <defs><linearGradient id="pop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} domain={["auto", "auto"]} width={48} /><Tooltip {...tip} />
        <Area type="monotone" dataKey="population" stroke="var(--primary)" fill="url(#pop)" strokeWidth={2.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
export function MortalityChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} width={36} /><Tooltip {...tip} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey="deaths" fill="var(--danger)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function ProductionChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} domain={[0, 100]} width={36} /><Tooltip {...tip} />
        <Line type="monotone" dataKey="henDayPct" name="Hen-day %" stroke="var(--info)" dot={false} strokeWidth={2.5} />
      </LineChart>
    </ResponsiveContainer>
  );
}
