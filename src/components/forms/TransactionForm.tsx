import { FormDialog } from "@/components/FormDialog";
import { BigNumber, Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveTransactionAction } from "@/lib/actions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_STATUSES, UNITS } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { fmtDate, todayStr } from "@/lib/format";
import type { ReactNode } from "react";

export type Opt = { id: string; name: string };
export type FlockOpt = { id: string; flockName: string };
type Tx = { id: string; type: string; category: string; date: Date; quantity: number | null; unit: string | null; unitPriceAfn: number | null; amountAfn: number; flockId: string | null; contactId: string | null; paymentStatus: string; amountPaidAfn: number; dueDate: Date | null; description: string | null };

export async function TransactionDialog({ trigger, kind, tx, flocks, contacts }: { trigger: ReactNode; kind: "INCOME" | "EXPENSE"; tx?: Tx; flocks: FlockOpt[]; contacts: Opt[] }) {
  const { t, lang } = await getT();
  const type = tx?.type ?? kind; const sale = type === "INCOME";
  const cats = sale ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (
    <FormDialog trigger={trigger} title={tx ? t("fin.form.editTitle") : sale ? t("fin.form.saleTitle") : t("fin.form.purchaseTitle")} description={sale ? t("fin.form.saleDesc") : t("fin.form.purchaseDesc")} action={saveTransactionAction} wide>
      {tx && <input type="hidden" name="id" value={tx.id} />}
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("fin.form.category")}><NativeSelect name="category" defaultValue={tx?.category ?? cats[0]}>{cats.map((c) => <NativeSelectOption key={c} value={c}>{enumLabel(c, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("common.date")}><Input name="date" type="date" required defaultValue={tx ? fmtDate(tx.date) : todayStr()} dir="ltr" /></Field>
        <Field label={t("fin.form.quantity")}><BigNumber name="quantity" inputMode="decimal" step="0.01" min={0} defaultValue={tx?.quantity ?? undefined} /></Field>
        <Field label={t("fin.form.unit")}><NativeSelect name="unit" defaultValue={tx?.unit ?? (sale ? (type === "INCOME" && (tx?.category ?? cats[0]) === "EGG_SALE" ? "TRAY" : "KG") : "BAG")}>{UNITS.map((u) => <NativeSelectOption key={u} value={u}>{enumLabel(u, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("fin.form.unitPrice")}><Input name="unitPriceAfn" type="number" inputMode="decimal" step="0.01" min={0} defaultValue={tx?.unitPriceAfn ?? undefined} dir="ltr" /></Field>
        <Field label={t("fin.form.amount")} hint={t("fin.form.amountHint")}><Input name="amountAfn" type="number" inputMode="decimal" step="0.01" min={0} defaultValue={tx && !(tx.quantity && tx.unitPriceAfn) ? tx.amountAfn : undefined} dir="ltr" /></Field>
        <Field label={t("fin.form.contact")}><NativeSelect name="contactId" defaultValue={tx?.contactId ?? ""}><NativeSelectOption value="">{t("fin.form.noContact")}</NativeSelectOption>{contacts.map((c) => <NativeSelectOption key={c.id} value={c.id}>{c.name}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("fin.form.flock")}><NativeSelect name="flockId" defaultValue={tx?.flockId ?? ""}><NativeSelectOption value="">{t("fin.form.noFlock")}</NativeSelectOption>{flocks.map((f) => <NativeSelectOption key={f.id} value={f.id}>{f.flockName}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("fin.form.payment")}><NativeSelect name="paymentStatus" defaultValue={tx?.paymentStatus ?? "PAID"}>{PAYMENT_STATUSES.map((s) => <NativeSelectOption key={s} value={s}>{enumLabel(s, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("fin.form.amountPaid")}><Input name="amountPaidAfn" type="number" inputMode="decimal" step="0.01" min={0} defaultValue={tx?.paymentStatus === "PARTIAL" ? tx.amountPaidAfn : undefined} dir="ltr" /></Field>
        <Field label={t("fin.form.dueDate")}><Input name="dueDate" type="date" defaultValue={tx?.dueDate ? fmtDate(tx.dueDate) : undefined} dir="ltr" /></Field>
      </div>
      <Field label={t("fin.form.description")}><Textarea name="description" rows={2} defaultValue={tx?.description ?? ""} /></Field>
    </FormDialog>
  );
}
