import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/locale";
import { getHealthOverview } from "@/lib/services/finance";
import { PageHeader, ToneBadge, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HealthDialog } from "@/components/forms/HealthForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteHealthLogAction, markHealthDoneAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { can } from "@/lib/enums";
import { fmtDateDisplay, fmtNum } from "@/lib/format";
import { Stethoscope, ClipboardCheck, Pencil, Trash2, Check } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const user = await requireUser("health"); const { t, lang } = await getT();
  const o = await getHealthOverview(); const canWrite = can(user.role, "health");
  return (
    <div>
      <PageHeader title={t("health.title")} subtitle={`${t("health.subtitle")} · ${t("health.pending", { n: o.pending })}`}>
        {canWrite && <><HealthDialog kind="VET_VISIT" flocks={o.flocks} vets={o.vets} trigger={<Button><Stethoscope />{t("health.addVisit")}</Button>} />
          <HealthDialog kind="CHECKUP" flocks={o.flocks} vets={o.vets} trigger={<Button variant="outline"><ClipboardCheck />{t("health.addCheckup")}</Button>} /></>}
      </PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{[t("health.col.date"), t("common.flock"), t("health.col.type"), t("health.col.what"), t("health.col.vet"), t("health.col.cost"), t("common.status"), ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {o.logs.map((l) => (
              <TableRow key={l.id} className={l.overdue ? "bg-danger-soft/40" : ""}>
                <TableCell className="tabular whitespace-nowrap">{fmtDateDisplay(l.administeredDate ?? l.scheduledDate)}</TableCell>
                <TableCell><Link href={`/flocks/${l.flock.id}`} className="font-medium text-primary hover:underline">{l.flock.flockName}</Link></TableCell>
                <TableCell><ToneBadge tone={l.type === "VET_VISIT" || l.type === "CHECKUP" ? "blue" : "amber"}>{enumLabel(l.type, lang)}</ToneBadge></TableCell>
                <TableCell><div className="font-medium">{l.productName}</div>{l.notes && <div className="max-w-64 truncate text-xs text-muted-foreground">{l.notes}</div>}</TableCell>
                <TableCell>{l.contact?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="tabular">{l.transaction ? fmtNum(l.transaction.amountAfn) : "—"}</TableCell>
                <TableCell><ToneBadge tone={l.status === "DONE" ? "green" : l.overdue ? "red" : "amber"}>{l.overdue ? t("health.overdue") : enumLabel(l.status, lang)}</ToneBadge></TableCell>
                <TableCell className="text-end whitespace-nowrap">{canWrite && <>
                  {l.status === "PENDING" && <ConfirmButton title={t("health.markDoneTitle")} description={t("health.markDoneDesc", { name: l.productName })} confirmLabel={t("health.markDone")} action={markHealthDoneAction.bind(null, l.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-success" aria-label={t("health.markDone")}><Check /></Button>} />}
                  <HealthDialog log={l} flocks={o.flocks} vets={o.vets} trigger={<Button variant="ghost" size="icon-xs" aria-label={t("common.edit")}><Pencil /></Button>} />
                  <ConfirmButton title={t("health.deleteTitle")} description={t("health.deleteDesc", { name: l.productName })} action={deleteHealthLogAction.bind(null, l.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label={t("common.delete")}><Trash2 /></Button>} /></>}</TableCell>
              </TableRow>))}
            {o.logs.length === 0 && <TableRow><TableCell colSpan={8}><Empty>{t("health.none")}</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
