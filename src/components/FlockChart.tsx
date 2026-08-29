"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

type Point = { date: string; population: number; deaths: number; feedKg: number; eggs: number; henDayPct: number | null };

export function PopulationChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke="#eee" /><XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} width={50} /><Tooltip />
        <Line type="monotone" dataKey="population" stroke="#15803d" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
export function MortalityChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke="#eee" /><XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} width={40} /><Tooltip />
        <Bar dataKey="deaths" fill="#dc2626" />
      </BarChart>
    </ResponsiveContainer>
  );
}
export function ProductionChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid stroke="#eee" /><XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} width={40} /><Tooltip />
        <Line type="monotone" dataKey="henDayPct" name="Hen-day %" stroke="#2563eb" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
