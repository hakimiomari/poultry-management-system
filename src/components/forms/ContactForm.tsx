import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { saveContactAction } from "@/lib/actions";
import { CONTACT_TYPES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import type { ReactNode } from "react";

type Contact = { id: string; name: string; phone: string | null; address: string | null; contactType: string; notes: string | null };

export async function ContactDialog({ trigger, contact }: { trigger: ReactNode; contact?: Contact }) {
  const { t, lang } = await getT();
  return (
    <FormDialog trigger={trigger} title={contact ? t("contacts.form.editTitle", { name: contact.name }) : t("contacts.form.title")} action={saveContactAction}>
      {contact && <input type="hidden" name="id" value={contact.id} />}
      <Field label={t("contacts.form.name")}><Input name="name" required defaultValue={contact?.name} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("contacts.form.type")}><NativeSelect name="contactType" defaultValue={contact?.contactType ?? "FEED_SUPPLIER"}>{CONTACT_TYPES.map((c) => <NativeSelectOption key={c} value={c}>{enumLabel(c, lang)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("contacts.form.phone")}><Input name="phone" inputMode="tel" defaultValue={contact?.phone ?? ""} dir="ltr" /></Field>
      </div>
      <Field label={t("contacts.form.address")}><Input name="address" defaultValue={contact?.address ?? ""} /></Field>
      <Field label={t("contacts.form.notes")}><Textarea name="notes" rows={2} defaultValue={contact?.notes ?? ""} /></Field>
    </FormDialog>
  );
}
