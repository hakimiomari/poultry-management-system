import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentQuantity, cumulativeMortalityPct, ageInDays } from "@/lib/domain/population";
import { Badge, PageHeader, Table } from "@/components/ui";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, fmtNum } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function FlocksPage() {
  const flocks = await prisma.flock.findMany({ include: { shed: true, birdMovements: true }, orderBy: [{ status: "asc" }, { intakeDate: "desc" }] });
  return (
    <div>
      <PageHeader title="Flocks" subtitle={`${flocks.filter((f) => f.status === "ACTIVE").length} active`} action={{ href: "/flocks/new", label: "+ New flock" }} />
      <Table head={["Flock", "Type / breed", "Shed", "Intake", "Age", "Population", "Mortality", "Status"]}>
        {flocks.map((f) => { const m = cumulativeMortalityPct(f.initialQuantity, f.birdMovements); return (
          <tr key={f.id}>
            <td><Link href={`/flocks/${f.id}`} className="font-semibold text-primary hover:underline">{f.flockName}</Link></td>
            <td><Badge tone={f.flockType === "BROILER" ? "amber" : "blue"}>{enumLabel(f.flockType)}</Badge> <span className="text-muted">{f.breed}</span></td><td>{f.shed.shedName}</td>
            <td className="tabular">{fmtDate(f.intakeDate)}</td><td className="tabular">{ageInDays(f.intakeDate, f.closedAt ?? new Date())} d</td>
            <td className="tabular">{fmtNum(currentQuantity(f.initialQuantity, f.birdMovements))} <span className="text-muted">/ {fmtNum(f.initialQuantity)}</span></td>
            <td className={`tabular ${m > 5 ? "font-semibold text-danger" : ""}`}>{m.toFixed(2)}%</td>
            <td><Badge tone={f.status === "ACTIVE" ? "green" : "gray"}>{enumLabel(f.status)}</Badge></td>
          </tr>); })}
      </Table>
    </div>
  );
}
