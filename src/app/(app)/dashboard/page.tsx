import Link from "next/link";
import { prisma } from "@/lib/db";
import { evaluateAlerts, getActiveFlockSummaries } from "@/lib/services/flocks";
import { Kpi, PageHeader, AlertBanner, ToneBadge, typeTone } from "@/components/pms";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PopulationChart } from "@/components/FlockChart";
import { DailyLogDialog } from "@/components/forms/DailyLogForm";
import { fmtNum, todayStr } from "@/lib/format";
import { enumLabel } from "@/lib/i18n";
import { Bird, Hash, Skull, Egg, Wheat, ClipboardPlus, ArrowRight } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [flocks, alerts, options] = await Promise.all([getActiveFlockSummaries(), evaluateAlerts(), prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } })]);
  const today = (k: "eggs" | "feedKg") => flocks.reduce((s, f) => s + (f.series.find((p) => p.date === todayStr())?.[k] ?? 0), 0);
  const totalBirds = flocks.reduce((s, f) => s + f.current, 0), todayDeaths = flocks.reduce((s, f) => s + f.todayDeaths, 0);
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={alerts.length ? `${alerts.length} alert${alerts.length > 1 ? "s" : ""} need attention` : "All flocks normal"}>
        <DailyLogDialog flocks={options} trigger={<Button><ClipboardPlus />Record today</Button>} />
      </PageHeader>
      {alerts.length > 0 && <div className="space-y-2">{alerts.map((a) => <AlertBanner key={a.code + a.flockId} {...a} />)}</div>}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi icon={<Bird />} label="Active flocks" value={flocks.length} />
        <Kpi icon={<Hash />} label="Total birds" value={fmtNum(totalBirds)} />
        <Kpi icon={<Skull />} label="Deaths today" value={todayDeaths} tone={todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi icon={<Egg />} label="Eggs today" value={fmtNum(today("eggs"))} sub={`${fmtNum(today("eggs") / 30, 1)} trays`} tone="info" />
        <Kpi icon={<Wheat />} label="Feed today" value={`${fmtNum(today("feedKg"))} kg`} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {flocks.map((f) => (
          <Card key={f.flock.id}>
            <CardHeader><CardTitle className="flex items-center gap-2">{f.flock.flockName}<ToneBadge tone={typeTone(f.flock.flockType)}>{enumLabel(f.flock.flockType)}</ToneBadge></CardTitle>
              <CardAction><Button variant="ghost" size="sm" render={<Link href={`/flocks/${f.flock.id}`} />}>Open<ArrowRight /></Button></CardAction></CardHeader>
            <CardContent>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat label="Population" value={fmtNum(f.current)} sub={`of ${fmtNum(f.flock.initialQuantity)}`} />
                <Stat label="Mortality" value={`${f.mortalityPct.toFixed(2)}%`} danger={f.mortalityPct > 5} />
                <Stat label="Age" value={`${f.ageDays} d`} sub={`week ${Math.ceil(f.ageDays / 7)}`} />
              </div>
              <PopulationChart data={f.series} height={170} />
            </CardContent>
          </Card>
        ))}
        {flocks.length === 0 && <Card><CardContent>No active flocks yet. <Link href="/flocks" className="text-primary underline">Create one</Link>.</CardContent></Card>}
      </div>
    </div>
  );
}
const Stat = ({ label, value, sub, danger }: { label: string; value: string; sub?: string; danger?: boolean }) => (
  <div><div className="text-xs text-muted-foreground">{label}</div><div className={`tabular text-lg font-semibold ${danger ? "text-destructive" : ""}`}>{value}</div>{sub && <div className="text-xs text-muted-foreground">{sub}</div>}</div>
);
