import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveFlockAction } from "@/lib/actions";
import { FLOCK_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";

export type ShedOption = { id: string; shedName: string; capacity: number; free: number };
type Flock = { id: string; flockName: string; flockType: string; breed: string; shedId: string; intakeDate: Date; initialQuantity: number; initialAvgWeightG: number; chickCostAfn: number };

export async function FlockDialog({ trigger, sheds, flock }: { trigger: ReactNode; sheds: ShedOption[]; flock?: Flock }) {
  const { t, lang } = await getT();
  return (
    <FormDialog trigger={trigger} title={flock ? t("flocks.form.editTitle", { name: flock.flockName }) : t("flocks.form.title")} description={t("flocks.form.desc")} action={saveFlockAction} wide>
      {flock && <input type="hidden" name="id" value={flock.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("flocks.form.name")}><Input name="flockName" required defaultValue={flock?.flockName} placeholder="Flock-C" /></Field>
        <Field label={t("common.type")}><NativeSelect name="flockType" defaultValue={flock?.flockType}>{FLOCK_TYPES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("flocks.form.breed")}><Input name="breed" required defaultValue={flock?.breed} list="breeds" placeholder="Cobb 500" /><datalist id="breeds"><option>Cobb 500</option><option>Ross 308</option><option>Hy-Line Brown</option><option>Lohmann Brown</option></datalist></Field>
        <Field label={t("flocks.form.shed")}><NativeSelect name="shedId" defaultValue={flock?.shedId}>{sheds.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.shedName} — {t("flocks.form.freeOf", { free: s.free, cap: s.capacity })}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("flocks.form.intakeDate")}><Input name="intakeDate" type="date" required defaultValue={flock ? fmtDate(flock.intakeDate) : todayStr()} dir="ltr" /></Field>
        <Field label={t("flocks.form.initialQty")}><Input name="initialQuantity" type="number" inputMode="numeric" min={1} required defaultValue={flock?.initialQuantity} /></Field>
        <Field label={t("flocks.form.initialWeight")}><Input name="initialAvgWeightG" type="number" inputMode="decimal" step="0.1" defaultValue={flock?.initialAvgWeightG ?? 40} /></Field>
        <Field label={t("flocks.form.chickCost")}><Input name="chickCostAfn" type="number" inputMode="decimal" min={0} defaultValue={flock?.chickCostAfn ?? 0} /></Field>
      </div>
    </FormDialog>
  );
}
