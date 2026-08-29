import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveUserAction } from "@/lib/actions";
import { LANGUAGES, ROLES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import type { ReactNode } from "react";

type User = { id: string; fullName: string; phone: string; role: string; language: string; isActive: boolean };

export async function UserDialog({ trigger, user, isSelf }: { trigger: ReactNode; user?: User; isSelf?: boolean }) {
  const { t, lang } = await getT();
  return (
    <FormDialog trigger={trigger} title={user ? t("users.form.editTitle", { name: user.fullName }) : t("users.form.title")} description={user ? t("users.form.descEdit") : t("users.form.descNew")} action={saveUserAction}>
      {user && <input type="hidden" name="id" value={user.id} />}
      <Field label={t("profile.form.fullName")}><Input name="fullName" required defaultValue={user?.fullName} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("profile.form.phone")}><Input name="phone" inputMode="tel" required defaultValue={user?.phone} dir="ltr" /></Field>
        <Field label={t("users.role")}><NativeSelect name="role" defaultValue={user?.role ?? "WORKER"} disabled={isSelf}>{ROLES.map((r) => <NativeSelectOption key={r} value={r}>{enumLabel(r, lang)}</NativeSelectOption>)}</NativeSelect>{isSelf && <input type="hidden" name="role" value={user?.role} />}</Field>
        <Field label={t("users.language")}><NativeSelect name="language" defaultValue={user?.language ?? "EN"}>{LANGUAGES.map((l) => <NativeSelectOption key={l} value={l}>{enumLabel(l, l)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={user ? t("users.form.resetPassword") : t("users.form.password")} hint={t("pw.hint")}><Input name="password" type="password" minLength={6} required={!user} autoComplete="new-password" dir="ltr" /></Field>
      </div>
      {!isSelf && <div className="flex items-center gap-2"><Checkbox id="isActive" name="isActive" defaultChecked={user?.isActive ?? true} /><Label htmlFor="isActive">{t("users.form.active")}</Label></div>}
      {isSelf && <input type="hidden" name="isActive" value="on" />}
    </FormDialog>
  );
}
