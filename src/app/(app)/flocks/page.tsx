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
      <PageHeader title="Flocks" action={{ href: "/flocks/new", label: "+ New flock" }} />
      <Table head={["Flock", "Type / breed", "Shed", "Intake", "Age", "Population", "Mortality", "Status"]}>
        {flocks.map((f) => (
          <tr key={f.id}>
            <td className="px-3 py-2"><Link href={`/flocks/${f.id}`} className="font-medium text-green-700 hover:underline">{f.flockName}</Link></td>
            <td className="px-3 py-2">{enumLabel(f.flockType)} · {f.breed}</td><td className="px-3 py-2">{f.shed.shedName}</td>
            <td className="px-3 py-2">{fmtDate(f.intakeDate)}</td><td className="px-3 py-2">{ageInDays(f.intakeDate, f.closedAt ?? new Date())} d</td>
            <td className="px-3 py-2">{fmtNum(currentQuantity(f.initialQuantity, f.birdMovements))} / {fmtNum(f.initialQuantity)}</td>
            <td className="px-3 py-2">{cumulativeMortalityPct(f.initialQuantity, f.birdMovements).toFixed(2)}%</td>
            <td className="px-3 py-2"><Badge tone={f.status === "ACTIVE" ? "green" : "gray"}>{enumLabel(f.status)}</Badge></td>
          </tr>))}
      </Table>
    </div>
  );
}
