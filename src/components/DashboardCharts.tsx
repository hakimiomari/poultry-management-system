"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { axis, tip, fmtDay } from "@/components/FlockChart";

type Day = { date: string; deaths: number; eggs: number; feedKg: number };
type DayKey = "deaths" | "eggs" | "feedKg";

const full = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
/** One tick style per axis: compact (10K) once the axis reaches 10,000, in full below that. */
const tickFormat = (max: number) => (max >= 10_000 ? compact : full);
const value = (v: unknown) => (typeof v === "number" ? full(v) : String(v ?? ""));
const margin = { left: 0, right: 8, top: 8, bottom: 0 };

/** A sparse count per day (deaths): one column per day, single hue. */
export function DailyColumns({ data, dataKey, label, color, height = 190 }: { data: Day[]; dataKey: DayKey; label: string; color: string; height?: number }) {
  const max = Math.max(0, ...data.map((d) => d[dataKey]));
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={margin}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} width={44} allowDecimals={false} tickFormatter={tickFormat(max)} />
        <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} formatter={value} />
        <Bar dataKey={dataKey} name={label} fill={color} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer></div>
  );
}

/** A steady daily quantity (eggs, feed): 2px line over a light wash of the same hue. A column per day would read as a solid block. */
export function DailyArea({ data, dataKey, label, color, height = 190 }: { data: Day[]; dataKey: DayKey; label: string; color: string; height?: number }) {
  const max = Math.max(0, ...data.map((d) => d[dataKey]));
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={margin}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="date" {...axis} tickFormatter={fmtDay} minTickGap={24} />
        <YAxis {...axis} width={44} tickFormatter={tickFormat(max)} />
        <Tooltip {...tip} cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }} formatter={value} />
        <Area type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} dot={false} activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer></div>
  );
}

// The card legend uses the same two tokens (bg-chart-1 / bg-chart-2).
const INCOME_COLOR = "var(--chart-1)", EXPENSE_COLOR = "var(--chart-2)";

/** Income beside expenses for each month, on one shared axis. The legend is rendered by the card. */
export function CashflowChart({ data, incomeLabel, expenseLabel, height = 190 }: { data: { month: string; income: number; expense: number }[]; incomeLabel: string; expenseLabel: string; height?: number }) {
  const max = Math.max(0, ...data.flatMap((d) => [d.income, d.expense]));
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={margin} barGap={2}>
        <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="month" {...axis} />
        <YAxis {...axis} width={44} tickFormatter={tickFormat(max)} />
        <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} formatter={value} />
        <Bar dataKey="income" name={incomeLabel} fill={INCOME_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="expense" name={expenseLabel} fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer></div>
  );
}
