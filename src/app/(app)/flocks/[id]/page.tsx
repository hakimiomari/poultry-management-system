import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getFlockKpis } from "@/lib/services/flocks";
import { closeFlockAction, deleteMovementAction } from "@/lib/actions";
import { Badge, Card, Kpi, PageHeader, Table, Button } from "@/components/ui";
import { MortalityChart, PopulationChart, ProductionChart } from "@/components/FlockChart";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, fmtNum } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/enums";
export const dynamic = "force-dynamic";

export default async function FlockDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await prisma.flock.findUnique({ where: { id } }))) notFound();
  const k = await getFlockKpis(id); const f = k.flock; const user = await getSession();
  const canWrite = user && can(user.role, "records") && f.status === "ACTIVE";
  const movements = [...f.birdMovements].reverse().slice(0, 30);
  const logs = [...f.dailyLogs].reverse().slice(0, 14);
  const isLayer = f.flockType === "LAYER";
  return (
    <div className="space-y-6">
      <PageHeader title={f.flockName} subtitle={`${enumLabel(f.flockType)} · ${f.breed} · ${f.shed.shedName} · intake ${fmtDate(f.intakeDate)}`}>
        <Badge tone={f.status === "ACTIVE" ? "green" : "gray"}>{enumLabel(f.status)}</Badge>
        {canWrite && <>
          <Button href={`/daily-logs/new?flockId=${f.id}`}>📝 Daily log</Button>
          <Button href={`/movements/new?flockId=${f.id}`} variant="secondary">↔️ Movement</Button>
          <form action={closeFlockAction.bind(null, f.id)}><Button variant="danger">Close flock</Button></form>
        </>}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon="🔢" label="Population" value={fmtNum(k.current)} sub={`of ${fmtNum(f.initialQuantity)}`} />
        <Kpi icon="📅" label="Age" value={`${k.ageDays} d`} sub={`week ${Math.ceil(k.ageDays / 7)}`} />
        <Kpi icon="📉" label="Cum. mortality" value={`${k.mortalityPct.toFixed(2)}%`} sub={`${k.totalDeaths} birds`} tone={k.mortalityPct > 5 ? "danger" : "default"} />
        <Kpi icon="💀" label="Deaths today" value={k.todayDeaths} sub={`${k.todayMortalityPct.toFixed(2)}%`} tone={k.todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi icon="🌾" label="Total feed" value={`${fmtNum(k.totalFeedKg)} kg`} sub={`${fmtNum((k.totalFeedKg * 1000) / f.initialQuantity)} g/bird`} />
        {isLayer ? <Kpi icon="🥚" label="Hen-day today" value={k.todayHenDayPct != null ? `${k.todayHenDayPct.toFixed(1)}%` : "—"} tone="info" /> : <Kpi icon="🛒" label="Sold" value={fmtNum(k.totalSold)} tone="info" />}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Population"><PopulationChart data={k.series} /></Card>
        <Card title="Daily mortality"><MortalityChart data={k.series} /></Card>
        {isLayer && <Card title="Hen-day production %" className="xl:col-span-2"><ProductionChart data={k.series} /></Card>}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div><h2 className="mb-3 font-semibold">Recent daily logs</h2>
          <Table head={["Date", "Feed kg", "Water L", ...(isLayer ? ["Eggs", "Broken"] : ["Notes"])]}>
            {logs.map((l) => <tr key={l.id}><td className="tabular">{fmtDate(l.date)}</td><td className="tabular">{l.feedConsumedKg}</td><td className="tabular">{l.waterConsumedL ?? "—"}</td>
              {isLayer ? <><td className="tabular">{l.eggsCollected}</td><td className="tabular">{l.eggsBroken}</td></> : <td className="text-muted">{l.notes ?? ""}</td>}</tr>)}
          </Table></div>
        <div><h2 className="mb-3 font-semibold">Bird movements</h2>
          <Table head={["Date", "Type", "Qty", "Cause", ""]}>
            {movements.map((m) => <tr key={m.id}><td className="tabular">{fmtDate(m.date)}</td><td><Badge tone={m.movementType === "MORTALITY" ? "red" : m.movementType === "SALE" ? "green" : "gray"}>{enumLabel(m.movementType)}</Badge></td>
              <td className="tabular">{m.quantity}</td><td>{m.cause ? enumLabel(m.cause) : "—"}</td>
              <td>{canWrite && <form action={deleteMovementAction.bind(null, m.id)}><button className="text-xs text-danger hover:underline">delete</button></form>}</td></tr>)}
          </Table></div>
      </div>
    </div>
  );
}
