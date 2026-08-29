import { prisma } from "@/lib/db";
import { shedOccupancy } from "@/lib/services/flocks";
import { Badge, PageHeader } from "@/components/ui";
import { enumLabel } from "@/lib/i18n";
import { fmtNum } from "@/lib/format";
export const dynamic = "force-dynamic";

export default async function ShedsPage() {
  const sheds = await prisma.shed.findMany({ orderBy: { shedName: "asc" } });
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  return (
    <div>
      <PageHeader title="Sheds" subtitle={`${sheds.length} houses · ${fmtNum(occ.reduce((a, b) => a + b, 0))} birds housed`} action={{ href: "/sheds/new", label: "+ Add shed" }} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sheds.map((s, i) => { const pct = Math.round((occ[i] / s.capacity) * 100); return (
          <div key={s.id} className="card p-5">
            <div className="mb-3 flex items-start justify-between"><div><div className="text-lg font-semibold">🏠 {s.shedName}</div><div className="text-sm text-muted">{enumLabel(s.shedType)}{s.hasSensors && " · sensors"}</div></div>
              <Badge tone={s.status === "OCCUPIED" ? "green" : s.status === "EMPTY" ? "gray" : "amber"}>{enumLabel(s.status)}</Badge></div>
            <div className="mb-1 flex justify-between text-sm"><span className="tabular font-medium">{fmtNum(occ[i])} birds</span><span className="tabular text-muted">{pct}% of {fmtNum(s.capacity)}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2"><div className={`h-full rounded-full ${pct > 95 ? "bg-danger" : "bg-primary"}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
          </div>); })}
      </div>
    </div>
  );
}
