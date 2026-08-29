import { FormDialog } from "@/components/FormDialog";
import { BigNumber, Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveDailyLogAction } from "@/lib/actions";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";

export type FlockOption = { id: string; flockName: string; flockType: string };
type Log = { flockId: string; date: Date; feedConsumedKg: number; waterConsumedL: number | null; eggsCollected: number; eggsBroken: number; notes: string | null };

export function DailyLogDialog({ trigger, flocks, log, flockId }: { trigger: ReactNode; flocks: FlockOption[]; log?: Log; flockId?: string }) {
  const selected = log?.flockId ?? flockId ?? flocks[0]?.id;
  const isLayer = flocks.some((f) => f.flockType === "LAYER");
  return (
    <FormDialog trigger={trigger} title={log ? `Edit log · ${fmtDate(log.date)}` : "Daily log"} description="Deaths entered here create a MORTALITY movement. Saving an existing date updates it." action={saveDailyLogAction}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Flock"><NativeSelect name="flockId" defaultValue={selected} disabled={!!log}>{flocks.map((f) => <NativeSelectOption key={f.id} value={f.id}>{f.flockName}</NativeSelectOption>)}</NativeSelect>{log && <input type="hidden" name="flockId" value={log.flockId} />}</Field>
        <Field label="Date"><Input name="date" type="date" required defaultValue={log ? fmtDate(log.date) : todayStr()} readOnly={!!log} /></Field>
        <Field label="💀 Deaths today"><BigNumber name="mortality" min={0} defaultValue={0} /></Field>
        <Field label="🌾 Feed (kg)"><BigNumber name="feedConsumedKg" inputMode="decimal" step="0.1" min={0} defaultValue={log?.feedConsumedKg ?? 0} /></Field>
        <Field label="💧 Water (L)"><BigNumber name="waterConsumedL" inputMode="decimal" min={0} defaultValue={log?.waterConsumedL ?? undefined} /></Field>
        {isLayer && <><Field label="🥚 Eggs collected"><BigNumber name="eggsCollected" min={0} defaultValue={log?.eggsCollected ?? 0} /></Field>
        <Field label="🥚 Eggs broken"><BigNumber name="eggsBroken" min={0} defaultValue={log?.eggsBroken ?? 0} /></Field></>}
      </div>
      <Field label="Notes"><Textarea name="notes" rows={2} defaultValue={log?.notes ?? ""} /></Field>
    </FormDialog>
  );
}
