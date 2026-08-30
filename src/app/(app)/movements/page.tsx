import { prisma } from "@/lib/db";
import { PageHeader, ToneBadge, movementTone, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MovementDialog } from "@/components/forms/MovementForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteMovementAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { fmtDateDisplay } from "@/lib/format";
import { ArrowLeftRight, Pencil, Trash2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const { t, lang } = await getT();
  const [rows, flocks] = await Promise.all([
    prisma.birdMovement.findMany({ include: { flock: true }, orderBy: { date: "desc" }, take: 150 }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } })]);
  const head = [t("common.date"), t("common.flock"), t("common.type"), t("mov.qty"), t("common.cause"), t("mov.avgWt"), t("common.notes"), ""];
  return (
    <div>
      <PageHeader title={t("mov.title")} subtitle={t("mov.subtitle")}><MovementDialog flocks={flocks} trigger={<Button><ArrowLeftRight />{t("mov.record")}</Button>} /></PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{head.map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {rows.map((m) => <TableRow key={m.id}><TableCell className="tabular" dir="ltr">{fmtDateDisplay(m.date)}</TableCell><TableCell className="font-medium">{m.flock.flockName}</TableCell>
              <TableCell><ToneBadge tone={movementTone(m.movementType)}>{enumLabel(m.movementType, lang)}</ToneBadge></TableCell>
              <TableCell className="tabular">{m.quantity}</TableCell><TableCell>{m.cause ? enumLabel(m.cause, lang) : t("common.dash")}</TableCell><TableCell className="tabular">{m.averageWeightG ?? t("common.dash")}</TableCell><TableCell className="max-w-48 truncate text-muted-foreground">{m.notes ?? ""}</TableCell>
              <TableCell className="text-end whitespace-nowrap">{m.flock.status === "ACTIVE" && <><MovementDialog flocks={flocks} movement={m} trigger={<Button variant="ghost" size="icon-xs" aria-label={t("common.edit")}><Pencil /></Button>} />
                <ConfirmButton title={t("mov.deleteTitle")} description={t("mov.deleteDesc", { n: m.quantity, flock: m.flock.flockName })} action={deleteMovementAction.bind(null, m.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label={t("common.delete")}><Trash2 /></Button>} /></>}</TableCell></TableRow>)}
            {rows.length === 0 && <TableRow><TableCell colSpan={8}><Empty>{t("common.noRecords")}</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
