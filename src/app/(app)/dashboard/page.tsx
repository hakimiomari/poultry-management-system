import Link from "next/link";
import { evaluateAlerts, getActiveFlockSummaries } from "@/lib/services/flocks";
import { Card, Kpi, Badge, PageHeader } from "@/components/ui";
import { PopulationChart } from "@/components/FlockChart";
import { fmtNum, fmtJalali, todayStr } from "@/lib/format";
import { enumLabel } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [flocks, alerts] = await Promise.all([getActiveFlockSummaries(), evaluateAlerts()]);
  const totalBirds = flocks.reduce((s, f) => s + f.current, 0);
  const todayDeaths = flocks.reduce((s, f) => s + f.todayDeaths, 0);
  const eggsToday = flocks.reduce((s, f) => s + (f.series.find((p) => p.date === todayStr())?.eggs ?? 0), 0);
  return (
    <div className="space-y-5">
      <PageHeader title={`Dashboard · ${todayStr()} · ${fmtJalali(new Date())}`} />
      {alerts.length > 0 && (
        <div className="space-y-2">{alerts.map((a) => (
          <div key={a.code + a.flockId} className={`rounded-lg border p-3 text-sm ${a.severity === "CRITICAL" || a.severity === "HIGH" ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
            <Badge tone={a.severity === "CRITICAL" ? "red" : "amber"}>{a.severity}</Badge> <span className="font-medium">{a.message}</span> — {a.action}
          </div>))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Active flocks" value={flocks.length} />
        <Kpi label="Total birds" value={fmtNum(totalBirds)} />
        <Kpi label="Deaths today" value={todayDeaths} tone={todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi label="Eggs today" value={fmtNum(eggsToday)} sub={`${fmtNum(eggsToday / 30, 1)} trays`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {flocks.map((f) => (
          <Card key={f.flock.id}>
            <div className="mb-2 flex items-center justify-between">
              <Link href={`/flocks/${f.flock.id}`} className="font-semibold hover:text-green-700">{f.flock.flockName}</Link>
              <Badge tone={f.flock.flockType === "BROILER" ? "amber" : "blue"}>{enumLabel(f.flock.flockType)}</Badge>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
              <div><div className="text-xs text-gray-500">Population</div><div className="font-medium">{fmtNum(f.current)} / {fmtNum(f.flock.initialQuantity)}</div></div>
              <div><div className="text-xs text-gray-500">Mortality</div><div className={`font-medium ${f.mortalityPct > 5 ? "text-red-600" : ""}`}>{f.mortalityPct.toFixed(2)}%</div></div>
              <div><div className="text-xs text-gray-500">Age</div><div className="font-medium">{f.ageDays} d (wk {Math.ceil(f.ageDays / 7)})</div></div>
            </div>
            <PopulationChart data={f.series} />
          </Card>
        ))}
        {flocks.length === 0 && <Card>No active flocks. <Link href="/flocks/new" className="text-green-700 underline">Add one</Link>.</Card>}
      </div>
    </div>
  );
}
