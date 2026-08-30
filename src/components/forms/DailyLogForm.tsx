import { FormDialog } from "@/components/FormDialog";
import { BigNumber, Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveDailyLogAction } from "@/lib/actions";
import { getT } from "@/lib/locale";
import { fmtDate, fmtDateDisplay, todayStr } from "@/lib/format";
import type { ReactNode } from "react";

export type FlockOption = { id: string; flockName: string; flockType: string };
type Log = { flockId: string; date: Date; feedConsumedKg: number; waterConsumedL: number | null; eggsCollected: number; eggsBroken: number; notes: string | null };

export async function DailyLogDialog({ trigger, flocks, log, flockId }: { trigger: ReactNode; flocks: FlockOption[]; log?: Log; flockId?: string }) {
  const { t } = await getT();
  const selected = log?.flockId ?? flockId ?? flocks[0]?.id;
  const isLayer = flocks.some((f) => f.flockType === "LAYER");
  return (
    <FormDialog trigger={trigger} title={log ? t("logs.form.editTitle", { date: fmtDateDisplay(log.date) }) : t("logs.form.title")} description={t("logs.form.desc")} action={saveDailyLogAction}>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("common.flock")}><NativeSelect name="flockId" defaultValue={selected} disabled={!!log}>{flocks.map((f) => <NativeSelectOption key={f.id} value={f.id}>{f.flockName}</NativeSelectOption>)}</NativeSelect>{log && <input type="hidden" name="flockId" value={log.flockId} />}</Field>
        <Field label={t("common.date")}><Input name="date" type="date" required defaultValue={log ? fmtDate(log.date) : todayStr()} readOnly={!!log} dir="ltr" /></Field>
        <Field label={t("logs.form.deaths")}><BigNumber name="mortality" min={0} defaultValue={0} /></Field>
        <Field label={t("logs.form.feed")}><BigNumber name="feedConsumedKg" inputMode="decimal" step="0.1" min={0} defaultValue={log?.feedConsumedKg ?? 0} /></Field>
        <Field label={t("logs.form.water")}><BigNumber name="waterConsumedL" inputMode="decimal" min={0} defaultValue={log?.waterConsumedL ?? undefined} /></Field>
        {isLayer && <><Field label={t("logs.form.eggs")}><BigNumber name="eggsCollected" min={0} defaultValue={log?.eggsCollected ?? 0} /></Field>
        <Field label={t("logs.form.eggsBroken")}><BigNumber name="eggsBroken" min={0} defaultValue={log?.eggsBroken ?? 0} /></Field></>}
      </div>
      <Field label={t("common.notes")}><Textarea name="notes" rows={2} defaultValue={log?.notes ?? ""} /></Field>
    </FormDialog>
  );
}
