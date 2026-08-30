import { prisma } from "@/lib/db";
import { PageHeader, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DailyLogDialog } from "@/components/forms/DailyLogForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteDailyLogAction } from "@/lib/actions";
import { getT } from "@/lib/locale";
import { fmtDateDisplay } from "@/lib/format";
import { ClipboardPlus, Pencil, Trash2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function DailyLogsPage() {
  const { t } = await getT();
  const [logs, flocks] = await Promise.all([
    prisma.dailyLog.findMany({ include: { flock: true, recordedBy: true }, orderBy: { date: "desc" }, take: 100 }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } })]);
  const head = [t("common.date"), t("common.flock"), t("logs.feedKg"), t("logs.waterL"), t("logs.eggs"), t("logs.broken"), t("logs.recordedBy"), t("common.notes"), ""];
  return (
    <div>
      <PageHeader title={t("logs.title")} subtitle={t("logs.subtitle")}><DailyLogDialog flocks={flocks} trigger={<Button><ClipboardPlus />{t("logs.record")}</Button>} /></PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{head.map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {logs.map((l) => <TableRow key={l.id}><TableCell className="tabular" dir="ltr">{fmtDateDisplay(l.date)}</TableCell><TableCell className="font-medium">{l.flock.flockName}</TableCell><TableCell className="tabular">{l.feedConsumedKg}</TableCell>
              <TableCell className="tabular">{l.waterConsumedL ?? t("common.dash")}</TableCell><TableCell className="tabular">{l.eggsCollected}</TableCell><TableCell className="tabular">{l.eggsBroken}</TableCell>
              <TableCell className="text-muted-foreground">{l.recordedBy?.fullName ?? t("common.dash")}</TableCell><TableCell className="max-w-48 truncate text-muted-foreground">{l.notes ?? ""}</TableCell>
              <TableCell className="text-end whitespace-nowrap">{l.flock.status === "ACTIVE" && <><DailyLogDialog flocks={[{ id: l.flock.id, flockName: l.flock.flockName, flockType: l.flock.flockType }]} log={l} trigger={<Button variant="ghost" size="icon-xs" aria-label={t("common.edit")}><Pencil /></Button>} />
                <ConfirmButton title={t("logs.deleteTitle")} description={t("logs.deleteDesc", { date: fmtDateDisplay(l.date), flock: l.flock.flockName })} action={deleteDailyLogAction.bind(null, l.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label={t("common.delete")}><Trash2 /></Button>} /></>}</TableCell></TableRow>)}
            {logs.length === 0 && <TableRow><TableCell colSpan={9}><Empty>{t("common.noRecords")}</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
