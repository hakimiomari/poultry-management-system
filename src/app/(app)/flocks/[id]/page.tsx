import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getFlockKpis, shedOccupancy } from "@/lib/services/flocks";
import { closeFlockAction, deleteDailyLogAction, deleteMovementAction } from "@/lib/actions";
import { Kpi, PageHeader, ToneBadge, statusTone, movementTone, Empty } from "@/components/pms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MortalityChart, PopulationChart, ProductionChart } from "@/components/FlockChart";
import { DailyLogDialog } from "@/components/forms/DailyLogForm";
import { MovementDialog } from "@/components/forms/MovementForm";
import { FlockDialog } from "@/components/forms/FlockForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, fmtNum } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/enums";
import { Hash, CalendarDays, TrendingDown, Skull, Wheat, Egg, ShoppingCart, ClipboardPlus, ArrowLeftRight, Pencil, Trash2, Lock } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function FlockDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await prisma.flock.findUnique({ where: { id } }))) notFound();
  const [k, user, sheds] = await Promise.all([getFlockKpis(id), getSession(), prisma.shed.findMany({ orderBy: { shedName: "asc" } })]);
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  const shedOptions = sheds.map((s, i) => ({ id: s.id, shedName: s.shedName, capacity: s.capacity, free: s.capacity - occ[i] }));
  const f = k.flock; const isLayer = f.flockType === "LAYER";
  const canWrite = !!user && can(user.role, "records") && f.status === "ACTIVE";
  const opt = [{ id: f.id, flockName: f.flockName, flockType: f.flockType }];
  const movements = [...f.birdMovements].reverse().slice(0, 30), logs = [...f.dailyLogs].reverse().slice(0, 14);
  return (
    <div className="space-y-6">
      <PageHeader title={f.flockName} subtitle={`${enumLabel(f.flockType)} · ${f.breed} · ${f.shed.shedName} · intake ${fmtDate(f.intakeDate)}`}>
        <ToneBadge tone={statusTone(f.status)}>{enumLabel(f.status)}</ToneBadge>
        {canWrite && <>
          <DailyLogDialog flocks={opt} flockId={f.id} trigger={<Button><ClipboardPlus />Daily log</Button>} />
          <MovementDialog flocks={opt} flockId={f.id} trigger={<Button variant="outline"><ArrowLeftRight />Movement</Button>} />
          <FlockDialog sheds={shedOptions} flock={f} trigger={<Button variant="outline"><Pencil />Edit</Button>} />
          <ConfirmButton title={`Close ${f.flockName}?`} description="Marks the flock COMPLETED. No further logs or movements can be recorded." confirmLabel="Close flock" action={closeFlockAction.bind(null, f.id)} trigger={<Button variant="destructive"><Lock />Close</Button>} />
        </>}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={<Hash />} label="Population" value={fmtNum(k.current)} sub={`of ${fmtNum(f.initialQuantity)}`} />
        <Kpi icon={<CalendarDays />} label="Age" value={`${k.ageDays} d`} sub={`week ${Math.ceil(k.ageDays / 7)}`} />
        <Kpi icon={<TrendingDown />} label="Cum. mortality" value={`${k.mortalityPct.toFixed(2)}%`} sub={`${k.totalDeaths} birds`} tone={k.mortalityPct > 5 ? "danger" : "default"} />
        <Kpi icon={<Skull />} label="Deaths today" value={k.todayDeaths} sub={`${k.todayMortalityPct.toFixed(2)}%`} tone={k.todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi icon={<Wheat />} label="Total feed" value={`${fmtNum(k.totalFeedKg)} kg`} sub={`${fmtNum((k.totalFeedKg * 1000) / f.initialQuantity)} g/bird`} />
        {isLayer ? <Kpi icon={<Egg />} label="Hen-day today" value={k.todayHenDayPct != null ? `${k.todayHenDayPct.toFixed(1)}%` : "—"} tone="info" /> : <Kpi icon={<ShoppingCart />} label="Sold" value={fmtNum(k.totalSold)} tone="info" />}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>Population</CardTitle></CardHeader><CardContent><PopulationChart data={k.series} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Daily mortality</CardTitle></CardHeader><CardContent><MortalityChart data={k.series} /></CardContent></Card>
        {isLayer && <Card className="xl:col-span-2"><CardHeader><CardTitle>Hen-day production %</CardTitle></CardHeader><CardContent><ProductionChart data={k.series} /></CardContent></Card>}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="py-0 gap-0"><CardHeader className="py-4"><CardTitle>Recent daily logs</CardTitle></CardHeader>
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Feed kg</TableHead><TableHead>Water L</TableHead>{isLayer ? <><TableHead>Eggs</TableHead><TableHead>Broken</TableHead></> : <TableHead>Notes</TableHead>}<TableHead /></TableRow></TableHeader>
            <TableBody>{logs.map((l) => <TableRow key={l.id}><TableCell className="tabular">{fmtDate(l.date)}</TableCell><TableCell className="tabular">{l.feedConsumedKg}</TableCell><TableCell className="tabular">{l.waterConsumedL ?? "—"}</TableCell>
              {isLayer ? <><TableCell className="tabular">{l.eggsCollected}</TableCell><TableCell className="tabular">{l.eggsBroken}</TableCell></> : <TableCell className="max-w-40 truncate text-muted-foreground">{l.notes ?? ""}</TableCell>}
              <TableCell className="text-right whitespace-nowrap">{canWrite && <><DailyLogDialog flocks={opt} log={l} trigger={<Button variant="ghost" size="icon-xs" aria-label="Edit"><Pencil /></Button>} />
                <ConfirmButton title="Delete this daily log?" description={`Removes the ${fmtDate(l.date)} log. Mortality movements are kept.`} action={deleteDailyLogAction.bind(null, l.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label="Delete"><Trash2 /></Button>} /></>}</TableCell></TableRow>)}
              {logs.length === 0 && <TableRow><TableCell colSpan={7}><Empty>No logs yet.</Empty></TableCell></TableRow>}</TableBody></Table></Card>
        <Card className="py-0 gap-0"><CardHeader className="py-4"><CardTitle>Bird movements</CardTitle></CardHeader>
          <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Qty</TableHead><TableHead>Cause</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{movements.map((m) => <TableRow key={m.id}><TableCell className="tabular">{fmtDate(m.date)}</TableCell><TableCell><ToneBadge tone={movementTone(m.movementType)}>{enumLabel(m.movementType)}</ToneBadge></TableCell>
              <TableCell className="tabular">{m.quantity}</TableCell><TableCell>{m.cause ? enumLabel(m.cause) : "—"}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{canWrite && <><MovementDialog flocks={opt} movement={m} trigger={<Button variant="ghost" size="icon-xs" aria-label="Edit"><Pencil /></Button>} />
                <ConfirmButton title="Delete this movement?" description={`Removes ${m.quantity} ${enumLabel(m.movementType).toLowerCase()} on ${fmtDate(m.date)} and restores the birds to the population.`} action={deleteMovementAction.bind(null, m.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label="Delete"><Trash2 /></Button>} /></>}</TableCell></TableRow>)}
              {movements.length === 0 && <TableRow><TableCell colSpan={5}><Empty>No movements yet.</Empty></TableCell></TableRow>}</TableBody></Table></Card>
      </div>
    </div>
  );
}
