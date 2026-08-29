import { prisma } from "@/lib/db";
import { shedOccupancy } from "@/lib/services/flocks";
import { Badge, PageHeader, Table } from "@/components/ui";
import { enumLabel } from "@/lib/i18n";
import { fmtNum } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function ShedsPage() {
  const sheds = await prisma.shed.findMany({ orderBy: { shedName: "asc" } });
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  return (
    <div>
      <PageHeader title="Sheds" action={{ href: "/sheds/new", label: "+ Add shed" }} />
      <Table head={["Shed", "Type", "Capacity", "Birds housed", "Sensors", "Status"]}>
        {sheds.map((s, i) => (
          <tr key={s.id}>
            <td className="px-3 py-2 font-medium">{s.shedName}</td><td className="px-3 py-2">{enumLabel(s.shedType)}</td>
            <td className="px-3 py-2">{fmtNum(s.capacity)}</td><td className="px-3 py-2">{fmtNum(occ[i])} ({Math.round((occ[i] / s.capacity) * 100)}%)</td>
            <td className="px-3 py-2">{s.hasSensors ? "Yes" : "No"}</td>
            <td className="px-3 py-2"><Badge tone={s.status === "OCCUPIED" ? "green" : s.status === "EMPTY" ? "gray" : "amber"}>{enumLabel(s.status)}</Badge></td>
          </tr>))}
      </Table>
    </div>
  );
}
