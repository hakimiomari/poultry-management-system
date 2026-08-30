import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { changePasswordAction, updateProfileAction } from "@/lib/actions";
import { LANGUAGES, THEMES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import type { ReactNode } from "react";

export async function EditProfileDialog({ trigger, user }: { trigger: ReactNode; user: { fullName: string; phone: string; language: string; theme: string } }) {
  const { t } = await getT();
  return (
    <FormDialog trigger={trigger} title={t("profile.form.title")} description={t("profile.form.desc")} action={updateProfileAction}>
      <Field label={t("profile.form.fullName")}><Input name="fullName" required defaultValue={user.fullName} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t("profile.form.phone")}><Input name="phone" inputMode="tel" required defaultValue={user.phone} dir="ltr" /></Field>
        <Field label={t("profile.form.language")}><NativeSelect name="language" defaultValue={user.language}>{LANGUAGES.map((l) => <NativeSelectOption key={l} value={l}>{enumLabel(l, l)}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={t("theme.label")} className="col-span-2"><NativeSelect name="theme" defaultValue={user.theme}>{THEMES.map((th) => <NativeSelectOption key={th} value={th}>{t(`theme.${th}` as "theme.SYSTEM")}</NativeSelectOption>)}</NativeSelect></Field>
      </div>
    </FormDialog>
  );
}

export async function ChangePasswordDialog({ trigger }: { trigger: ReactNode }) {
  const { t } = await getT();
  return (
    <FormDialog trigger={trigger} title={t("pw.title")} action={changePasswordAction} submitLabel={t("pw.update")}>
      <Field label={t("pw.current")}><Input name="currentPassword" type="password" required autoComplete="current-password" dir="ltr" /></Field>
      <Field label={t("pw.new")} hint={t("pw.hint")}><Input name="newPassword" type="password" required minLength={6} autoComplete="new-password" dir="ltr" /></Field>
      <Field label={t("pw.confirm")}><Input name="confirmPassword" type="password" required autoComplete="new-password" dir="ltr" /></Field>
    </FormDialog>
  );
}
