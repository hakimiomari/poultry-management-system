import { prisma } from "@/lib/db";
import { PageHeader, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DailyLogDialog } from "@/components/forms/DailyLogForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteDailyLogAction } from "@/lib/actions";
import { fmtDate } from "@/lib/format";
import { ClipboardPlus, Pencil, Trash2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function DailyLogsPage() {
  const [logs, flocks] = await Promise.all([
    prisma.dailyLog.findMany({ include: { flock: true, recordedBy: true }, orderBy: { date: "desc" }, take: 100 }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } })]);
  return (
    <div>
      <PageHeader title="Daily logs" subtitle="Feed, water and egg records per flock"><DailyLogDialog flocks={flocks} trigger={<Button><ClipboardPlus />Record today</Button>} /></PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{["Date", "Flock", "Feed kg", "Water L", "Eggs", "Broken", "Recorded by", "Notes", ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {logs.map((l) => <TableRow key={l.id}><TableCell className="tabular">{fmtDate(l.date)}</TableCell><TableCell className="font-medium">{l.flock.flockName}</TableCell><TableCell className="tabular">{l.feedConsumedKg}</TableCell>
              <TableCell className="tabular">{l.waterConsumedL ?? "—"}</TableCell><TableCell className="tabular">{l.eggsCollected}</TableCell><TableCell className="tabular">{l.eggsBroken}</TableCell>
              <TableCell className="text-muted-foreground">{l.recordedBy?.fullName ?? "—"}</TableCell><TableCell className="max-w-48 truncate text-muted-foreground">{l.notes ?? ""}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{l.flock.status === "ACTIVE" && <><DailyLogDialog flocks={[{ id: l.flock.id, flockName: l.flock.flockName, flockType: l.flock.flockType }]} log={l} trigger={<Button variant="ghost" size="icon-xs" aria-label="Edit"><Pencil /></Button>} />
                <ConfirmButton title="Delete this daily log?" description={`Removes the ${fmtDate(l.date)} log for ${l.flock.flockName}.`} action={deleteDailyLogAction.bind(null, l.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label="Delete"><Trash2 /></Button>} /></>}</TableCell></TableRow>)}
            {logs.length === 0 && <TableRow><TableCell colSpan={9}><Empty>No logs yet.</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
