import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveHealthLogAction } from "@/lib/actions";
import { HEALTH_METHODS, HEALTH_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";
import type { FlockOpt, Opt } from "./TransactionForm";

type Log = { id: string; flockId: string; type: string; productName: string; scheduledDate: Date; administeredDate: Date | null; method: string | null; contactId: string | null; notes: string | null; transaction?: { amountAfn: number } | null };

export async function HealthDialog({ trigger, kind, log, flocks, vets, flockId }: { trigger: ReactNode; kind?: "VET_VISIT" | "CHECKUP"; log?: Log; flocks: FlockOpt[]; vets: Opt[]; flockId?: string }) {
  const { t, lang } = await getT();
  const type = log?.type ?? kind ?? "VET_VISIT";
  return (
    <FormDialog trigger={trigger} title={log ? t("health.form.editTitle") : kind === "CHECKUP" ? t("health.form.checkupTitle") : t("health.form.visitTitle")} description={t("health.form.desc")} action={saveHealthLogAction} wide>
      {log && <input type="hidden" name="id" value={log.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("common.flock")}><NativeSelect name="flockId" defaultValue={log?.flockId ?? flockId ?? flocks[0]?.id}>{flocks.map((f) => <NativeSelectOption key={f.id} value={f.id}>{f.flockName}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("health.form.type")}><NativeSelect name="type" defaultValue={type}>{HEALTH_TYPES.map((h) => <NativeSelectOption key={h} value={h}>{enumLabel(h, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("health.form.purpose")} className="sm:col-span-2"><Input name="productName" required defaultValue={log?.productName} /></Field>
        <Field label={t("health.form.date")}><Input name="scheduledDate" type="date" required defaultValue={log ? fmtDate(log.scheduledDate) : todayStr()} dir="ltr" /></Field>
        <Field label={t("health.form.doneDate")} hint={t("health.form.doneHint")}><Input name="administeredDate" type="date" defaultValue={log ? (log.administeredDate ? fmtDate(log.administeredDate) : undefined) : todayStr()} dir="ltr" /></Field>
        <Field label={t("health.form.vet")}><NativeSelect name="contactId" defaultValue={log?.contactId ?? ""}><NativeSelectOption value="">{t("health.form.noVet")}</NativeSelectOption>{vets.map((v) => <NativeSelectOption key={v.id} value={v.id}>{v.name}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("health.form.cost")}><Input name="costAfn" type="number" inputMode="decimal" min={0} step="0.01" defaultValue={log?.transaction?.amountAfn ?? undefined} dir="ltr" /></Field>
        <Field label={t("health.form.method")}><NativeSelect name="method" defaultValue={log?.method ?? ""}><NativeSelectOption value="">{t("common.dash")}</NativeSelectOption>{HEALTH_METHODS.map((m) => <NativeSelectOption key={m} value={m}>{enumLabel(m, lang)}</NativeSelectOption>)}</NativeSelect></Field>
      </div>
      <Field label={t("health.form.notes")}><Textarea name="notes" rows={3} defaultValue={log?.notes ?? ""} /></Field>
    </FormDialog>
  );
}
