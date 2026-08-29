import Link from "next/link";
import { evaluateAlerts, getActiveFlockSummaries } from "@/lib/services/flocks";
import { Card, Kpi, Badge, PageHeader, AlertBanner, Button } from "@/components/ui";
import { PopulationChart } from "@/components/FlockChart";
import { fmtNum, todayStr } from "@/lib/format";
import { enumLabel } from "@/lib/i18n";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [flocks, alerts] = await Promise.all([getActiveFlockSummaries(), evaluateAlerts()]);
  const totalBirds = flocks.reduce((s, f) => s + f.current, 0);
  const todayDeaths = flocks.reduce((s, f) => s + f.todayDeaths, 0);
  const eggsToday = flocks.reduce((s, f) => s + (f.series.find((p) => p.date === todayStr())?.eggs ?? 0), 0);
  const feedToday = flocks.reduce((s, f) => s + (f.series.find((p) => p.date === todayStr())?.feedKg ?? 0), 0);
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={alerts.length ? `${alerts.length} alert${alerts.length > 1 ? "s" : ""} need attention` : "All flocks normal"}>
        <Button href="/daily-logs/new">📝 Record today</Button>
      </PageHeader>
      {alerts.length > 0 && <div className="space-y-2">{alerts.map((a) => <AlertBanner key={a.code + a.flockId} {...a} />)}</div>}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi icon="🐔" label="Active flocks" value={flocks.length} />
        <Kpi icon="🔢" label="Total birds" value={fmtNum(totalBirds)} />
        <Kpi icon="💀" label="Deaths today" value={todayDeaths} tone={todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi icon="🥚" label="Eggs today" value={fmtNum(eggsToday)} sub={`${fmtNum(eggsToday / 30, 1)} trays`} tone="info" />
        <Kpi icon="🌾" label="Feed today" value={`${fmtNum(feedToday)} kg`} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {flocks.map((f) => (
          <Card key={f.flock.id} title={f.flock.flockName} action={<div className="flex items-center gap-2"><Badge tone={f.flock.flockType === "BROILER" ? "amber" : "blue"}>{enumLabel(f.flock.flockType)}</Badge><Link href={`/flocks/${f.flock.id}`} className="text-sm font-medium text-primary hover:underline">Open →</Link></div>}>
            <div className="mb-3 grid grid-cols-3 gap-3">
              <Stat label="Population" value={`${fmtNum(f.current)}`} sub={`of ${fmtNum(f.flock.initialQuantity)}`} />
              <Stat label="Mortality" value={`${f.mortalityPct.toFixed(2)}%`} danger={f.mortalityPct > 5} />
              <Stat label="Age" value={`${f.ageDays} d`} sub={`week ${Math.ceil(f.ageDays / 7)}`} />
            </div>
            <PopulationChart data={f.series} height={170} />
          </Card>
        ))}
        {flocks.length === 0 && <Card>No active flocks. <Link href="/flocks/new" className="text-primary underline">Add one</Link>.</Card>}
      </div>
    </div>
  );
}
const Stat = ({ label, value, sub, danger }: { label: string; value: string; sub?: string; danger?: boolean }) => (
  <div><div className="text-xs text-muted">{label}</div><div className={`tabular text-lg font-semibold ${danger ? "text-danger" : ""}`}>{value}</div>{sub && <div className="text-xs text-muted">{sub}</div>}</div>
);
