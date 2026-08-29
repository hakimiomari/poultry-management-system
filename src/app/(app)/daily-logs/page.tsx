import { prisma } from "@/lib/db";
import { PageHeader, Table } from "@/components/ui";
import { fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function DailyLogsPage() {
  const logs = await prisma.dailyLog.findMany({ include: { flock: true, recordedBy: true }, orderBy: { date: "desc" }, take: 100 });
  return (
    <div>
      <PageHeader title="Daily logs" action={{ href: "/daily-logs/new", label: "+ Record today" }} />
      <Table head={["Date", "Flock", "Feed kg", "Water L", "Eggs", "Broken", "Recorded by", "Notes"]}>
        {logs.map((l) => <tr key={l.id}><td className="px-3 py-2">{fmtDate(l.date)}</td><td className="px-3 py-2 font-medium">{l.flock.flockName}</td><td className="px-3 py-2">{l.feedConsumedKg}</td>
          <td className="px-3 py-2">{l.waterConsumedL ?? "—"}</td><td className="px-3 py-2">{l.eggsCollected}</td><td className="px-3 py-2">{l.eggsBroken}</td>
          <td className="px-3 py-2">{l.recordedBy?.fullName ?? "—"}</td><td className="px-3 py-2 text-gray-500">{l.notes ?? ""}</td></tr>)}
      </Table>
    </div>
  );
}
