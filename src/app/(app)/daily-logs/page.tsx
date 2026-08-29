import { prisma } from "@/lib/db";
import { PageHeader, Table } from "@/components/ui";
import { fmtDate } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function DailyLogsPage() {
  const logs = await prisma.dailyLog.findMany({ include: { flock: true, recordedBy: true }, orderBy: { date: "desc" }, take: 100 });
  return (
    <div>
      <PageHeader title="Daily logs" subtitle="Feed, water and egg records per flock" action={{ href: "/daily-logs/new", label: "+ Record today" }} />
      <Table head={["Date", "Flock", "Feed kg", "Water L", "Eggs", "Broken", "Recorded by", "Notes"]}>
        {logs.map((l) => <tr key={l.id}><td className="tabular">{fmtDate(l.date)}</td><td className="font-medium">{l.flock.flockName}</td><td className="tabular">{l.feedConsumedKg}</td>
          <td className="tabular">{l.waterConsumedL ?? "—"}</td><td className="tabular">{l.eggsCollected}</td><td className="tabular">{l.eggsBroken}</td>
          <td className="text-muted">{l.recordedBy?.fullName ?? "—"}</td><td className="text-muted">{l.notes ?? ""}</td></tr>)}
      </Table>
    </div>
  );
}
