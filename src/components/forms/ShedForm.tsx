import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveShedAction } from "@/lib/actions";
import { SHED_STATUSES, SHED_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import type { ReactNode } from "react";

type Shed = { id: string; shedName: string; capacity: number; shedType: string; hasSensors: boolean; status: string };

export async function ShedDialog({ trigger, shed }: { trigger: ReactNode; shed?: Shed }) {
  const { t, lang } = await getT();
  return (
    <FormDialog trigger={trigger} title={shed ? t("sheds.form.editTitle", { name: shed.shedName }) : t("sheds.form.title")} description={t("sheds.form.desc")} action={saveShedAction}>
      {shed && <input type="hidden" name="id" value={shed.id} />}
      <Field label={t("sheds.form.name")}><Input name="shedName" required defaultValue={shed?.shedName} placeholder="Shed-4-East" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("sheds.form.capacity")}><Input name="capacity" type="number" inputMode="numeric" min={1} required defaultValue={shed?.capacity} /></Field>
        <Field label={t("sheds.form.type")}><NativeSelect name="shedType" defaultValue={shed?.shedType}>{SHED_TYPES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("sheds.form.status")}><NativeSelect name="status" defaultValue={shed?.status ?? "EMPTY"}>{SHED_STATUSES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <div className="flex items-end gap-2 pb-2"><Checkbox id="hasSensors" name="hasSensors" defaultChecked={shed?.hasSensors} /><Label htmlFor="hasSensors">{t("sheds.form.hasSensors")}</Label></div>
      </div>
    </FormDialog>
  );
}
