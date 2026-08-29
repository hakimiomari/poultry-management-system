import { FormDialog } from "@/components/FormDialog";
import { BigNumber, Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveMovementAction } from "@/lib/actions";
import { MOVEMENT_CAUSES, MOVEMENT_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";
import type { FlockOption } from "./DailyLogForm";

type Movement = { id: string; flockId: string; date: Date; movementType: string; quantity: number; cause: string | null; averageWeightG: number | null; notes: string | null };

export async function MovementDialog({ trigger, flocks, movement, flockId }: { trigger: ReactNode; flocks: FlockOption[]; movement?: Movement; flockId?: string }) {
  const { t, lang } = await getT();
  return (
    <FormDialog trigger={trigger} title={movement ? t("mov.form.editTitle") : t("mov.form.title")} description={t("mov.form.desc")} action={saveMovementAction}>
      {movement && <input type="hidden" name="id" value={movement.id} />}
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("common.flock")}><NativeSelect name="flockId" defaultValue={movement?.flockId ?? flockId}>{flocks.map((f) => <NativeSelectOption key={f.id} value={f.id}>{f.flockName}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("common.date")}><Input name="date" type="date" required defaultValue={movement ? fmtDate(movement.date) : todayStr()} dir="ltr" /></Field>
        <Field label={t("common.type")}><NativeSelect name="movementType" defaultValue={movement?.movementType}>{MOVEMENT_TYPES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("common.quantity")}><BigNumber name="quantity" min={1} required defaultValue={movement?.quantity} /></Field>
        <Field label={t("common.cause")}><NativeSelect name="cause" defaultValue={movement?.cause ?? ""}><NativeSelectOption value="">{t("common.dash")}</NativeSelectOption>{MOVEMENT_CAUSES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("mov.form.avgWeight")} hint={t("mov.form.avgWeightHint")}><Input name="averageWeightG" type="number" inputMode="decimal" min={1} defaultValue={movement?.averageWeightG ?? undefined} /></Field>
      </div>
      <Field label={t("common.notes")}><Textarea name="notes" rows={2} defaultValue={movement?.notes ?? ""} /></Field>
    </FormDialog>
  );
}
