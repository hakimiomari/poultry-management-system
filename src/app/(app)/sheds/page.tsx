import { prisma } from "@/lib/db";
import { shedOccupancy } from "@/lib/services/flocks";
import { PageHeader, ToneBadge, statusTone } from "@/components/pms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShedDialog } from "@/components/forms/ShedForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteShedAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { fmtNum } from "@/lib/format";
import { Plus, Pencil, Trash2, Warehouse } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ShedsPage() {
  const sheds = await prisma.shed.findMany({ orderBy: { shedName: "asc" } });
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  return (
    <div>
      <PageHeader title="Sheds" subtitle={`${sheds.length} houses · ${fmtNum(occ.reduce((a, b) => a + b, 0))} birds housed`}>
        <ShedDialog trigger={<Button><Plus />Add shed</Button>} />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sheds.map((s, i) => { const pct = Math.round((occ[i] / s.capacity) * 100); return (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Warehouse className="size-4 text-muted-foreground" />{s.shedName}</CardTitle>
              <CardDescription>{enumLabel(s.shedType)}{s.hasSensors && " · sensors"}</CardDescription>
              <CardAction><ToneBadge tone={statusTone(s.status)}>{enumLabel(s.status)}</ToneBadge></CardAction>
            </CardHeader>
            <CardContent>
              <div className="mb-1.5 flex justify-between text-sm"><span className="tabular font-medium">{fmtNum(occ[i])} birds</span><span className="tabular text-muted-foreground">{pct}% of {fmtNum(s.capacity)}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${pct > 95 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
              <div className="mt-4 flex justify-end gap-1">
                <ShedDialog shed={s} trigger={<Button variant="ghost" size="sm"><Pencil />Edit</Button>} />
                <ConfirmButton title={`Delete ${s.shedName}?`} description="Only sheds with no flocks can be deleted. This cannot be undone." action={deleteShedAction.bind(null, s.id)} trigger={<Button variant="ghost" size="sm" className="text-destructive"><Trash2 />Delete</Button>} />
              </div>
            </CardContent>
          </Card>); })}
      </div>
    </div>
  );
}
