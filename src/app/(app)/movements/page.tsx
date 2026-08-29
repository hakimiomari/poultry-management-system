import { prisma } from "@/lib/db";
import { Badge, PageHeader, Table } from "@/components/ui";
import { enumLabel } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const rows = await prisma.birdMovement.findMany({ include: { flock: true }, orderBy: { date: "desc" }, take: 150 });
  return (
    <div>
      <PageHeader title="Bird movements" action={{ href: "/movements/new", label: "+ Record movement" }} />
      <Table head={["Date", "Flock", "Type", "Qty", "Cause", "Avg wt (g)", "Notes"]}>
        {rows.map((m) => <tr key={m.id}><td className="px-3 py-2">{fmtDate(m.date)}</td><td className="px-3 py-2 font-medium">{m.flock.flockName}</td>
          <td className="px-3 py-2"><Badge tone={m.movementType === "MORTALITY" ? "red" : m.movementType === "SALE" ? "green" : "gray"}>{enumLabel(m.movementType)}</Badge></td>
          <td className="px-3 py-2">{m.quantity}</td><td className="px-3 py-2">{m.cause ? enumLabel(m.cause) : "—"}</td><td className="px-3 py-2">{m.averageWeightG ?? "—"}</td><td className="px-3 py-2 text-gray-500">{m.notes ?? ""}</td></tr>)}
      </Table>
    </div>
  );
}
