import Link from "next/link";
import { prisma } from "@/lib/db";
import { shedOccupancy } from "@/lib/services/flocks";
import { currentQuantity, cumulativeMortalityPct, ageInDays } from "@/lib/domain/population";
import { PageHeader, ToneBadge, typeTone, statusTone, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlockDialog } from "@/components/forms/FlockForm";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, fmtNum } from "@/lib/format";
import { Plus, Pencil } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function FlocksPage() {
  const [flocks, sheds] = await Promise.all([
    prisma.flock.findMany({ include: { shed: true, birdMovements: true }, orderBy: [{ status: "asc" }, { intakeDate: "desc" }] }),
    prisma.shed.findMany({ orderBy: { shedName: "asc" } })]);
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  const shedOptions = sheds.map((s, i) => ({ id: s.id, shedName: s.shedName, capacity: s.capacity, free: s.capacity - occ[i] }));
  return (
    <div>
      <PageHeader title="Flocks" subtitle={`${flocks.filter((f) => f.status === "ACTIVE").length} active`}>
        <FlockDialog sheds={shedOptions} trigger={<Button><Plus />New flock</Button>} />
      </PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{["Flock", "Type / breed", "Shed", "Intake", "Age", "Population", "Mortality", "Status", ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {flocks.map((f) => { const m = cumulativeMortalityPct(f.initialQuantity, f.birdMovements); return (
              <TableRow key={f.id}>
                <TableCell><Link href={`/flocks/${f.id}`} className="font-semibold text-primary hover:underline">{f.flockName}</Link></TableCell>
                <TableCell><ToneBadge tone={typeTone(f.flockType)}>{enumLabel(f.flockType)}</ToneBadge> <span className="text-muted-foreground">{f.breed}</span></TableCell>
                <TableCell>{f.shed.shedName}</TableCell><TableCell className="tabular">{fmtDate(f.intakeDate)}</TableCell>
                <TableCell className="tabular">{ageInDays(f.intakeDate, f.closedAt ?? new Date())} d</TableCell>
                <TableCell className="tabular">{fmtNum(currentQuantity(f.initialQuantity, f.birdMovements))} <span className="text-muted-foreground">/ {fmtNum(f.initialQuantity)}</span></TableCell>
                <TableCell className={`tabular ${m > 5 ? "font-semibold text-destructive" : ""}`}>{m.toFixed(2)}%</TableCell>
                <TableCell><ToneBadge tone={statusTone(f.status)}>{enumLabel(f.status)}</ToneBadge></TableCell>
                <TableCell className="text-right">{f.status === "ACTIVE" && <FlockDialog sheds={shedOptions} flock={f} trigger={<Button variant="ghost" size="icon-sm" aria-label="Edit"><Pencil /></Button>} />}</TableCell>
              </TableRow>); })}
            {flocks.length === 0 && <TableRow><TableCell colSpan={9}><Empty>No flocks yet.</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
