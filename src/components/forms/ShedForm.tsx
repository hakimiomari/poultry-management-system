import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveShedAction } from "@/lib/actions";
import { SHED_STATUSES, SHED_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import type { ReactNode } from "react";

type Shed = { id: string; shedName: string; capacity: number; shedType: string; hasSensors: boolean; status: string };

export function ShedDialog({ trigger, shed }: { trigger: ReactNode; shed?: Shed }) {
  return (
    <FormDialog trigger={trigger} title={shed ? `Edit ${shed.shedName}` : "New shed"} description="A physical house where a flock lives." action={saveShedAction}>
      {shed && <input type="hidden" name="id" value={shed.id} />}
      <Field label="Shed name"><Input name="shedName" required defaultValue={shed?.shedName} placeholder="Shed-4-East" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Capacity (birds)"><Input name="capacity" type="number" inputMode="numeric" min={1} required defaultValue={shed?.capacity} /></Field>
        <Field label="Type"><NativeSelect name="shedType" defaultValue={shed?.shedType}>{SHED_TYPES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label="Status"><NativeSelect name="status" defaultValue={shed?.status ?? "EMPTY"}>{SHED_STATUSES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v)}</NativeSelectOption>)}</NativeSelect></Field>
        <div className="flex items-end gap-2 pb-2"><Checkbox id="hasSensors" name="hasSensors" defaultChecked={shed?.hasSensors} /><Label htmlFor="hasSensors">Has environment sensors</Label></div>
      </div>
    </FormDialog>
  );
}
