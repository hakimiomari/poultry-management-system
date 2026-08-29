import Link from "next/link";
import { prisma } from "@/lib/db";
import { shedOccupancy } from "@/lib/services/flocks";
import { currentQuantity, cumulativeMortalityPct, ageInDays } from "@/lib/domain/population";
import { PageHeader, ToneBadge, typeTone, statusTone, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlockDialog } from "@/components/forms/FlockForm";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { fmtDate, fmtNum } from "@/lib/format";
import { Plus, Pencil } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function FlocksPage() {
  const { t, lang } = await getT();
  const [flocks, sheds] = await Promise.all([
    prisma.flock.findMany({ include: { shed: true, birdMovements: true }, orderBy: [{ status: "asc" }, { intakeDate: "desc" }] }),
    prisma.shed.findMany({ orderBy: { shedName: "asc" } })]);
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  const shedOptions = sheds.map((s, i) => ({ id: s.id, shedName: s.shedName, capacity: s.capacity, free: s.capacity - occ[i] }));
  const head = [t("common.flock"), t("flocks.typeBreed"), t("flocks.shed"), t("flocks.intake"), t("flocks.age"), t("flocks.population"), t("flocks.mortality"), t("common.status"), ""];
  return (
    <div>
      <PageHeader title={t("flocks.title")} subtitle={t("flocks.nActive", { n: flocks.filter((f) => f.status === "ACTIVE").length })}>
        <FlockDialog sheds={shedOptions} trigger={<Button><Plus />{t("flocks.new")}</Button>} />
      </PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{head.map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {flocks.map((f) => { const m = cumulativeMortalityPct(f.initialQuantity, f.birdMovements); return (
              <TableRow key={f.id}>
                <TableCell><Link href={`/flocks/${f.id}`} className="font-semibold text-primary hover:underline">{f.flockName}</Link></TableCell>
                <TableCell><ToneBadge tone={typeTone(f.flockType)}>{enumLabel(f.flockType, lang)}</ToneBadge> <span className="text-muted-foreground">{f.breed}</span></TableCell>
                <TableCell>{f.shed.shedName}</TableCell><TableCell className="tabular" dir="ltr">{fmtDate(f.intakeDate)}</TableCell>
                <TableCell className="tabular">{ageInDays(f.intakeDate, f.closedAt ?? new Date())} {t("common.days")}</TableCell>
                <TableCell className="tabular">{fmtNum(currentQuantity(f.initialQuantity, f.birdMovements))} <span className="text-muted-foreground">/ {fmtNum(f.initialQuantity)}</span></TableCell>
                <TableCell className={`tabular ${m > 5 ? "font-semibold text-destructive" : ""}`}>{m.toFixed(2)}%</TableCell>
                <TableCell><ToneBadge tone={statusTone(f.status)}>{enumLabel(f.status, lang)}</ToneBadge></TableCell>
                <TableCell className="text-end">{f.status === "ACTIVE" && <FlockDialog sheds={shedOptions} flock={f} trigger={<Button variant="ghost" size="icon-sm" aria-label={t("common.edit")}><Pencil /></Button>} />}</TableCell>
              </TableRow>); })}
            {flocks.length === 0 && <TableRow><TableCell colSpan={9}><Empty>{t("flocks.none")}</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
