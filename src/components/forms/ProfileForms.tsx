import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { changePasswordAction, updateProfileAction } from "@/lib/actions";
import { getT } from "@/lib/locale";
import type { ReactNode } from "react";

export async function EditProfileDialog({ trigger, user }: { trigger: ReactNode; user: { fullName: string; phone: string } }) {
  const { t } = await getT();
  return (
    <FormDialog trigger={trigger} title={t("profile.form.title")} description={t("profile.form.desc")} action={updateProfileAction}>
      <Field label={t("profile.form.fullName")}><Input name="fullName" required defaultValue={user.fullName} /></Field>
      <Field label={t("profile.form.phone")}><Input name="phone" inputMode="tel" required defaultValue={user.phone} dir="ltr" /></Field>
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
