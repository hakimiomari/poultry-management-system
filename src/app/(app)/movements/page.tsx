import { prisma } from "@/lib/db";
import { PageHeader, ToneBadge, movementTone, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MovementDialog } from "@/components/forms/MovementForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteMovementAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { fmtDate } from "@/lib/format";
import { ArrowLeftRight, Pencil, Trash2 } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const [rows, flocks] = await Promise.all([
    prisma.birdMovement.findMany({ include: { flock: true }, orderBy: { date: "desc" }, take: 150 }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } })]);
  return (
    <div>
      <PageHeader title="Bird movements" subtitle="Mortality, culls, sales and transfers"><MovementDialog flocks={flocks} trigger={<Button><ArrowLeftRight />Record movement</Button>} /></PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{["Date", "Flock", "Type", "Qty", "Cause", "Avg wt (g)", "Notes", ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {rows.map((m) => <TableRow key={m.id}><TableCell className="tabular">{fmtDate(m.date)}</TableCell><TableCell className="font-medium">{m.flock.flockName}</TableCell>
              <TableCell><ToneBadge tone={movementTone(m.movementType)}>{enumLabel(m.movementType)}</ToneBadge></TableCell>
              <TableCell className="tabular">{m.quantity}</TableCell><TableCell>{m.cause ? enumLabel(m.cause) : "—"}</TableCell><TableCell className="tabular">{m.averageWeightG ?? "—"}</TableCell><TableCell className="max-w-48 truncate text-muted-foreground">{m.notes ?? ""}</TableCell>
              <TableCell className="text-right whitespace-nowrap">{m.flock.status === "ACTIVE" && <><MovementDialog flocks={flocks} movement={m} trigger={<Button variant="ghost" size="icon-xs" aria-label="Edit"><Pencil /></Button>} />
                <ConfirmButton title="Delete this movement?" description={`Restores ${m.quantity} birds to ${m.flock.flockName}.`} action={deleteMovementAction.bind(null, m.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label="Delete"><Trash2 /></Button>} /></>}</TableCell></TableRow>)}
            {rows.length === 0 && <TableRow><TableCell colSpan={8}><Empty>No movements yet.</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
