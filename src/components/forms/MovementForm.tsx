import { FormDialog } from "@/components/FormDialog";
import { BigNumber, Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveMovementAction } from "@/lib/actions";
import { MOVEMENT_CAUSES, MOVEMENT_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";
import type { FlockOption } from "./DailyLogForm";

type Movement = { id: string; flockId: string; date: Date; movementType: string; quantity: number; cause: string | null; averageWeightG: number | null; notes: string | null };

export function MovementDialog({ trigger, flocks, movement, flockId }: { trigger: ReactNode; flocks: FlockOption[]; movement?: Movement; flockId?: string }) {
  return (
    <FormDialog trigger={trigger} title={movement ? "Edit movement" : "Bird movement"} description="Mortality, cull, sale or transfer out of the flock." action={saveMovementAction}>
      {movement && <input type="hidden" name="id" value={movement.id} />}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Flock"><NativeSelect name="flockId" defaultValue={movement?.flockId ?? flockId}>{flocks.map((f) => <NativeSelectOption key={f.id} value={f.id}>{f.flockName}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label="Date"><Input name="date" type="date" required defaultValue={movement ? fmtDate(movement.date) : todayStr()} /></Field>
        <Field label="Type"><NativeSelect name="movementType" defaultValue={movement?.movementType}>{MOVEMENT_TYPES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label="Quantity"><BigNumber name="quantity" min={1} required defaultValue={movement?.quantity} /></Field>
        <Field label="Cause"><NativeSelect name="cause" defaultValue={movement?.cause ?? ""}><NativeSelectOption value="">—</NativeSelectOption>{MOVEMENT_CAUSES.map((v) => <NativeSelectOption key={v} value={v}>{enumLabel(v)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label="Avg weight (g)" hint="Required for broiler sales"><Input name="averageWeightG" type="number" inputMode="decimal" min={1} defaultValue={movement?.averageWeightG ?? undefined} /></Field>
      </div>
      <Field label="Notes"><Textarea name="notes" rows={2} defaultValue={movement?.notes ?? ""} /></Field>
    </FormDialog>
  );
}
