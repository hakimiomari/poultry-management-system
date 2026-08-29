import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getFlockKpis } from "@/lib/services/flocks";
import { closeFlockAction, deleteMovementAction } from "@/lib/actions";
import { Badge, Card, Kpi, PageHeader, Table } from "@/components/ui";
import { MortalityChart, PopulationChart, ProductionChart } from "@/components/FlockChart";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, fmtNum } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/enums";
export const dynamic = "force-dynamic";

export default async function FlockDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exists = await prisma.flock.findUnique({ where: { id } }); if (!exists) notFound();
  const k = await getFlockKpis(id); const f = k.flock; const user = await getSession();
  const canWrite = user && can(user.role, "records") && f.status === "ACTIVE";
  const movements = [...f.birdMovements].reverse().slice(0, 30);
  const logs = [...f.dailyLogs].reverse().slice(0, 14);
  return (
    <div className="space-y-5">
      <PageHeader title={`${f.flockName}`} />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge tone={f.flockType === "BROILER" ? "amber" : "blue"}>{enumLabel(f.flockType)}</Badge><span>{f.breed}</span><span>·</span><span>{f.shed.shedName}</span><span>·</span>
        <span>Intake {fmtDate(f.intakeDate)}</span><Badge tone={f.status === "ACTIVE" ? "green" : "gray"}>{enumLabel(f.status)}</Badge>
        {canWrite && <span className="ml-auto flex gap-2">
          <Link href={`/daily-logs/new?flockId=${f.id}`} className="rounded-lg bg-green-700 px-3 py-1.5 text-white">+ Daily log</Link>
          <Link href={`/movements/new?flockId=${f.id}`} className="rounded-lg border px-3 py-1.5">+ Movement</Link>
          <form action={closeFlockAction.bind(null, f.id)}><button className="rounded-lg border border-red-300 px-3 py-1.5 text-red-700">Close flock</button></form>
        </span>}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Kpi label="Population" value={fmtNum(k.current)} sub={`of ${fmtNum(f.initialQuantity)}`} />
        <Kpi label="Age" value={`${k.ageDays} d`} sub={`week ${Math.ceil(k.ageDays / 7)}`} />
        <Kpi label="Cum. mortality" value={`${k.mortalityPct.toFixed(2)}%`} sub={`${k.totalDeaths} birds`} tone={k.mortalityPct > 5 ? "danger" : "default"} />
        <Kpi label="Deaths today" value={k.todayDeaths} sub={`${k.todayMortalityPct.toFixed(2)}%`} tone={k.todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi label="Total feed" value={`${fmtNum(k.totalFeedKg)} kg`} sub={k.current ? `${fmtNum((k.totalFeedKg * 1000) / f.initialQuantity)} g/bird` : ""} />
        {f.flockType === "LAYER" ? <Kpi label="Hen-day today" value={k.todayHenDayPct != null ? `${k.todayHenDayPct.toFixed(1)}%` : "—"} /> : <Kpi label="Sold" value={fmtNum(k.totalSold)} />}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><div className="mb-2 text-sm font-medium">Population</div><PopulationChart data={k.series} /></Card>
        <Card><div className="mb-2 text-sm font-medium">Daily mortality</div><MortalityChart data={k.series} /></Card>
        {f.flockType === "LAYER" && <Card className="lg:col-span-2"><div className="mb-2 text-sm font-medium">Hen-day production %</div><ProductionChart data={k.series} /></Card>}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div><h2 className="mb-2 font-medium">Recent daily logs</h2>
          <Table head={["Date", "Feed kg", "Water L", f.flockType === "LAYER" ? "Eggs" : "Notes", ...(f.flockType === "LAYER" ? ["Broken"] : [])]}>
            {logs.map((l) => <tr key={l.id}><td className="px-3 py-2">{fmtDate(l.date)}</td><td className="px-3 py-2">{l.feedConsumedKg}</td><td className="px-3 py-2">{l.waterConsumedL ?? "—"}</td>
              {f.flockType === "LAYER" ? <><td className="px-3 py-2">{l.eggsCollected}</td><td className="px-3 py-2">{l.eggsBroken}</td></> : <td className="px-3 py-2 text-gray-500">{l.notes ?? ""}</td>}</tr>)}
          </Table></div>
        <div><h2 className="mb-2 font-medium">Bird movements</h2>
          <Table head={["Date", "Type", "Qty", "Cause", ""]}>
            {movements.map((m) => <tr key={m.id}><td className="px-3 py-2">{fmtDate(m.date)}</td><td className="px-3 py-2"><Badge tone={m.movementType === "MORTALITY" ? "red" : m.movementType === "SALE" ? "green" : "gray"}>{enumLabel(m.movementType)}</Badge></td>
              <td className="px-3 py-2">{m.quantity}</td><td className="px-3 py-2">{m.cause ? enumLabel(m.cause) : "—"}</td>
              <td className="px-3 py-2">{canWrite && <form action={deleteMovementAction.bind(null, m.id)}><button className="text-xs text-red-600 hover:underline">delete</button></form>}</td></tr>)}
          </Table></div>
      </div>
    </div>
  );
}
