import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/Form";
import { createMovementAction } from "@/lib/actions";
import { Field, inputCls, PageHeader } from "@/components/ui";
import { MOVEMENT_CAUSES, MOVEMENT_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { todayStr } from "@/lib/format";

export default async function NewMovement({ searchParams }: { searchParams: Promise<{ flockId?: string }> }) {
  const { flockId } = await searchParams;
  const flocks = await prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { flockName: "asc" } });
  return (
    <div className="max-w-lg">
      <PageHeader title="Bird movement" />
      <ActionForm action={createMovementAction}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Flock"><select name="flockId" defaultValue={flockId} className={inputCls}>{flocks.map((f) => <option key={f.id} value={f.id}>{f.flockName}</option>)}</select></Field>
          <Field label="Date"><input name="date" type="date" defaultValue={todayStr()} required className={inputCls} /></Field>
          <Field label="Type"><select name="movementType" className={inputCls}>{MOVEMENT_TYPES.map((v) => <option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field>
          <Field label="Quantity"><input name="quantity" type="number" inputMode="numeric" min={1} required className={"text-2xl font-semibold text-center " + inputCls} /></Field>
          <Field label="Cause"><select name="cause" className={inputCls}><option value="">—</option>{MOVEMENT_CAUSES.map((v) => <option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field>
          <Field label="Avg weight (g) — required for broiler sales"><input name="averageWeightG" type="number" inputMode="decimal" min={1} className={inputCls} /></Field>
        </div>
        <Field label="Notes"><textarea name="notes" rows={2} className={inputCls} /></Field>
      </ActionForm>
    </div>
  );
}
