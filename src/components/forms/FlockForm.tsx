import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveFlockAction } from "@/lib/actions";
import { FLOCK_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";

export type ShedOption = { id: string; shedName: string; capacity: number; free: number };
type Flock = { id: string; flockName: string; flockType: string; breed: string; shedId: string; intakeDate: Date; initialQuantity: number; initialAvgWeightG: number; chickCostAfn: number };

export function FlockDialog({ trigger, sheds, flock }: { trigger: ReactNode; sheds: ShedOption[]; flock?: Flock }) {
  return (
    <FormDialog trigger={trigger} title={flock ? `Edit ${flock.flockName}` : "New flock"} description="Initial quantity must fit the shed's free capacity." action={saveFlockAction} wide>
      {flock && <input type="hidden" name="id" value={flock.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Flock name"><Input name="flockName" required defaultValue={flock?.flockName} placeholder="Flock-C-Broiler" /></Field>
        <Field label="Type"><NativeSelect name="flockType" defaultValue={flock?.flockType}>{FLOCK_TYPES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label="Breed"><Input name="breed" required defaultValue={flock?.breed} list="breeds" placeholder="Cobb 500" /><datalist id="breeds"><option>Cobb 500</option><option>Ross 308</option><option>Hy-Line Brown</option><option>Lohmann Brown</option></datalist></Field>
        <Field label="Shed (free capacity)"><NativeSelect name="shedId" defaultValue={flock?.shedId}>{sheds.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.shedName} — {s.free} free of {s.capacity}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label="Intake date"><Input name="intakeDate" type="date" required defaultValue={flock ? fmtDate(flock.intakeDate) : todayStr()} /></Field>
        <Field label="Initial quantity"><Input name="initialQuantity" type="number" inputMode="numeric" min={1} required defaultValue={flock?.initialQuantity} /></Field>
        <Field label="Initial avg weight (g)"><Input name="initialAvgWeightG" type="number" inputMode="decimal" step="0.1" defaultValue={flock?.initialAvgWeightG ?? 40} /></Field>
        <Field label="Chick cost total (AFN)"><Input name="chickCostAfn" type="number" inputMode="decimal" min={0} defaultValue={flock?.chickCostAfn ?? 0} /></Field>
      </div>
    </FormDialog>
  );
}
