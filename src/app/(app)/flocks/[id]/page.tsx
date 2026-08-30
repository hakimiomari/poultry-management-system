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
import { getT } from "@/lib/locale";
import { fmtDateDisplay, fmtNum } from "@/lib/format";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/enums";
import { Hash, CalendarDays, TrendingDown, Skull, Wheat, Egg, ShoppingCart, ClipboardPlus, ArrowLeftRight, Pencil, Trash2, Lock } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function FlockDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { t, lang } = await getT();
  if (!(await prisma.flock.findUnique({ where: { id } }))) notFound();
  const [k, user, sheds] = await Promise.all([getFlockKpis(id), getSession(), prisma.shed.findMany({ orderBy: { shedName: "asc" } })]);
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  const shedOptions = sheds.map((s, i) => ({ id: s.id, shedName: s.shedName, capacity: s.capacity, free: s.capacity - occ[i] }));
  const f = k.flock; const isLayer = f.flockType === "LAYER";
  const canWrite = !!user && can(user.role, "records") && f.status === "ACTIVE";
  const opt = [{ id: f.id, flockName: f.flockName, flockType: f.flockType }];
  const movements = [...f.birdMovements].reverse().slice(0, 30), logs = [...f.dailyLogs].reverse().slice(0, 14);
  const editBtn = <Button variant="ghost" size="icon-xs" aria-label={t("common.edit")}><Pencil /></Button>;
  const delBtn = <Button variant="ghost" size="icon-xs" className="text-destructive" aria-label={t("common.delete")}><Trash2 /></Button>;
  return (
    <div className="space-y-6">
      <PageHeader title={f.flockName} subtitle={`${enumLabel(f.flockType, lang)} · ${f.breed} · ${f.shed.shedName} · ${t("flocks.intakeOn", { date: fmtDateDisplay(f.intakeDate) })}`}>
        <ToneBadge tone={statusTone(f.status)}>{enumLabel(f.status, lang)}</ToneBadge>
        {canWrite && <>
          <DailyLogDialog flocks={opt} flockId={f.id} trigger={<Button><ClipboardPlus />{t("logs.form.title")}</Button>} />
          <MovementDialog flocks={opt} flockId={f.id} trigger={<Button variant="outline"><ArrowLeftRight />{t("mov.movement")}</Button>} />
          <FlockDialog sheds={shedOptions} flock={f} trigger={<Button variant="outline"><Pencil />{t("common.edit")}</Button>} />
          <ConfirmButton title={t("flocks.closeTitle", { name: f.flockName })} description={t("flocks.closeDesc")} confirmLabel={t("flocks.closeFlock")} action={closeFlockAction.bind(null, f.id)} trigger={<Button variant="destructive"><Lock />{t("flocks.close")}</Button>} />
        </>}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={<Hash />} label={t("flocks.kpi.population")} value={fmtNum(k.current)} sub={`${t("common.of")} ${fmtNum(f.initialQuantity)}`} />
        <Kpi icon={<CalendarDays />} label={t("flocks.kpi.age")} value={`${k.ageDays} ${t("common.days")}`} sub={`${t("common.week")} ${Math.ceil(k.ageDays / 7)}`} />
        <Kpi icon={<TrendingDown />} label={t("flocks.kpi.cumMortality")} value={`${k.mortalityPct.toFixed(2)}%`} sub={t("flocks.kpi.nBirds", { n: k.totalDeaths })} tone={k.mortalityPct > 5 ? "danger" : "default"} />
        <Kpi icon={<Skull />} label={t("flocks.kpi.deathsToday")} value={k.todayDeaths} sub={`${k.todayMortalityPct.toFixed(2)}%`} tone={k.todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi icon={<Wheat />} label={t("flocks.kpi.totalFeed")} value={`${fmtNum(k.totalFeedKg)} ${t("common.kg")}`} sub={t("flocks.kpi.perBird", { n: fmtNum((k.totalFeedKg * 1000) / f.initialQuantity) })} />
        {isLayer ? <Kpi icon={<Egg />} label={t("flocks.kpi.henDay")} value={k.todayHenDayPct != null ? `${k.todayHenDayPct.toFixed(1)}%` : t("common.dash")} tone="info" /> : <Kpi icon={<ShoppingCart />} label={t("flocks.kpi.sold")} value={fmtNum(k.totalSold)} tone="info" />}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardHeader><CardTitle>{t("flocks.chart.population")}</CardTitle></CardHeader><CardContent><PopulationChart data={k.series} label={t("flocks.chart.population")} /></CardContent></Card>
        <Card><CardHeader><CardTitle>{t("flocks.chart.mortality")}</CardTitle></CardHeader><CardContent><MortalityChart data={k.series} label={t("dash.mortality")} /></CardContent></Card>
        {isLayer && <Card className="xl:col-span-2"><CardHeader><CardTitle>{t("flocks.chart.henDay")}</CardTitle></CardHeader><CardContent><ProductionChart data={k.series} label={t("flocks.chart.henDay")} /></CardContent></Card>}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="py-0 gap-0"><CardHeader className="py-4"><CardTitle>{t("flocks.recentLogs")}</CardTitle></CardHeader>
          <Table><TableHeader><TableRow><TableHead>{t("common.date")}</TableHead><TableHead>{t("logs.feedKg")}</TableHead><TableHead>{t("logs.waterL")}</TableHead>{isLayer ? <><TableHead>{t("logs.eggs")}</TableHead><TableHead>{t("logs.broken")}</TableHead></> : <TableHead>{t("common.notes")}</TableHead>}<TableHead /></TableRow></TableHeader>
            <TableBody>{logs.map((l) => <TableRow key={l.id}><TableCell className="tabular" dir="ltr">{fmtDateDisplay(l.date)}</TableCell><TableCell className="tabular">{l.feedConsumedKg}</TableCell><TableCell className="tabular">{l.waterConsumedL ?? t("common.dash")}</TableCell>
              {isLayer ? <><TableCell className="tabular">{l.eggsCollected}</TableCell><TableCell className="tabular">{l.eggsBroken}</TableCell></> : <TableCell className="max-w-40 truncate text-muted-foreground">{l.notes ?? ""}</TableCell>}
              <TableCell className="text-end whitespace-nowrap">{canWrite && <><DailyLogDialog flocks={opt} log={l} trigger={editBtn} />
                <ConfirmButton title={t("logs.deleteTitle")} description={t("logs.deleteDesc", { date: fmtDateDisplay(l.date), flock: f.flockName })} action={deleteDailyLogAction.bind(null, l.id)} trigger={delBtn} /></>}</TableCell></TableRow>)}
              {logs.length === 0 && <TableRow><TableCell colSpan={7}><Empty>{t("flocks.noLogs")}</Empty></TableCell></TableRow>}</TableBody></Table></Card>
        <Card className="py-0 gap-0"><CardHeader className="py-4"><CardTitle>{t("flocks.movements")}</CardTitle></CardHeader>
          <Table><TableHeader><TableRow><TableHead>{t("common.date")}</TableHead><TableHead>{t("common.type")}</TableHead><TableHead>{t("mov.qty")}</TableHead><TableHead>{t("common.cause")}</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{movements.map((m) => <TableRow key={m.id}><TableCell className="tabular" dir="ltr">{fmtDateDisplay(m.date)}</TableCell><TableCell><ToneBadge tone={movementTone(m.movementType)}>{enumLabel(m.movementType, lang)}</ToneBadge></TableCell>
              <TableCell className="tabular">{m.quantity}</TableCell><TableCell>{m.cause ? enumLabel(m.cause, lang) : t("common.dash")}</TableCell>
              <TableCell className="text-end whitespace-nowrap">{canWrite && <><MovementDialog flocks={opt} movement={m} trigger={editBtn} />
                <ConfirmButton title={t("mov.deleteTitle")} description={t("mov.deleteDesc", { n: m.quantity, flock: f.flockName })} action={deleteMovementAction.bind(null, m.id)} trigger={delBtn} /></>}</TableCell></TableRow>)}
              {movements.length === 0 && <TableRow><TableCell colSpan={5}><Empty>{t("flocks.noMovements")}</Empty></TableCell></TableRow>}</TableBody></Table></Card>
      </div>
    </div>
  );
}
