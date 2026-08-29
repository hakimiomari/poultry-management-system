import { prisma } from "@/lib/db";
import { shedOccupancy } from "@/lib/services/flocks";
import { ActionForm } from "@/components/Form";
import { createFlockAction } from "@/lib/actions";
import { Field, inputCls, PageHeader } from "@/components/ui";
import { FLOCK_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { todayStr } from "@/lib/format";

export default async function NewFlock() {
  const sheds = await prisma.shed.findMany({ orderBy: { shedName: "asc" } });
  const occ = await Promise.all(sheds.map((s) => shedOccupancy(s.id)));
  return (
    <div className="max-w-lg">
      <PageHeader title="New flock" />
      <ActionForm action={createFlockAction}>
        <Field label="Flock name"><input name="flockName" required className={inputCls} placeholder="Flock-C-Broiler" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type"><select name="flockType" className={inputCls}>{FLOCK_TYPES.map((v) => <option key={v} value={v}>{enumLabel(v)}</option>)}</select></Field>
          <Field label="Breed"><input name="breed" required className={inputCls} placeholder="Cobb 500" list="breeds" /><datalist id="breeds"><option>Cobb 500</option><option>Ross 308</option><option>Hy-Line Brown</option><option>Lohmann Brown</option></datalist></Field>
        </div>
        <Field label="Shed (free capacity)"><select name="shedId" className={inputCls}>{sheds.map((s, i) => <option key={s.id} value={s.id}>{s.shedName} — {s.capacity - occ[i]} free of {s.capacity}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Intake date"><input name="intakeDate" type="date" defaultValue={todayStr()} required className={inputCls} /></Field>
          <Field label="Initial quantity"><input name="initialQuantity" type="number" inputMode="numeric" min={1} required className={inputCls} /></Field>
          <Field label="Initial avg weight (g)"><input name="initialAvgWeightG" type="number" inputMode="decimal" step="0.1" defaultValue={40} className={inputCls} /></Field>
          <Field label="Chick cost total (AFN)"><input name="chickCostAfn" type="number" inputMode="decimal" min={0} defaultValue={0} className={inputCls} /></Field>
        </div>
      </ActionForm>
    </div>
  );
}
