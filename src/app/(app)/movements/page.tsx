import { prisma } from "@/lib/db";
import { Badge, PageHeader, Table } from "@/components/ui";
import { enumLabel } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const rows = await prisma.birdMovement.findMany({ include: { flock: true }, orderBy: { date: "desc" }, take: 150 });
  return (
    <div>
      <PageHeader title="Bird movements" subtitle="Mortality, culls, sales and transfers" action={{ href: "/movements/new", label: "+ Record movement" }} />
      <Table head={["Date", "Flock", "Type", "Qty", "Cause", "Avg wt (g)", "Notes"]}>
        {rows.map((m) => <tr key={m.id}><td className="tabular">{fmtDate(m.date)}</td><td className="font-medium">{m.flock.flockName}</td>
          <td><Badge tone={m.movementType === "MORTALITY" ? "red" : m.movementType === "SALE" ? "green" : "gray"}>{enumLabel(m.movementType)}</Badge></td>
          <td className="tabular">{m.quantity}</td><td>{m.cause ? enumLabel(m.cause) : "—"}</td><td className="tabular">{m.averageWeightG ?? "—"}</td><td className="text-muted">{m.notes ?? ""}</td></tr>)}
      </Table>
    </div>
  );
}
