import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/Form";
import { createDailyLogAction } from "@/lib/actions";
import { Field, inputCls, bigNumCls, PageHeader } from "@/components/ui";
import { todayStr } from "@/lib/format";

export default async function NewDailyLog({ searchParams }: { searchParams: Promise<{ flockId?: string }> }) {
  const { flockId } = await searchParams;
  const flocks = await prisma.flock.findMany({ where: { status: "ACTIVE" }, orderBy: { flockName: "asc" } });
  const num = bigNumCls;
  return (
    <div className="max-w-lg">
      <PageHeader title="Daily log" />
      <ActionForm action={createDailyLogAction}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Flock"><select name="flockId" defaultValue={flockId} className={inputCls}>{flocks.map((f) => <option key={f.id} value={f.id}>{f.flockName}</option>)}</select></Field>
          <Field label="Date"><input name="date" type="date" defaultValue={todayStr()} required className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="💀 Deaths today"><input name="mortality" type="number" inputMode="numeric" min={0} defaultValue={0} className={num} /></Field>
          <Field label="🌾 Feed (kg)"><input name="feedConsumedKg" type="number" inputMode="decimal" step="0.1" min={0} defaultValue={0} className={num} /></Field>
          <Field label="💧 Water (L)"><input name="waterConsumedL" type="number" inputMode="decimal" min={0} className={num} /></Field>
          <Field label="🥚 Eggs collected"><input name="eggsCollected" type="number" inputMode="numeric" min={0} defaultValue={0} className={num} /></Field>
          <Field label="🥚 Eggs broken"><input name="eggsBroken" type="number" inputMode="numeric" min={0} defaultValue={0} className={num} /></Field>
        </div>
        <Field label="Notes"><textarea name="notes" rows={2} className={inputCls} /></Field>
        <p className="text-xs text-muted">Saving for an existing date updates that day&apos;s log. Deaths create a MORTALITY bird movement.</p>
      </ActionForm>
    </div>
  );
}
