import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { changePasswordAction, updateProfileAction } from "@/lib/actions";
import { LANGUAGES } from "@/lib/enums";
import type { ReactNode } from "react";

export const LANGUAGE_LABELS: Record<string, string> = { EN: "English", FA_DARI: "دری (Dari)", PS_PASHTO: "پښتو (Pashto)" };

export function EditProfileDialog({ trigger, user }: { trigger: ReactNode; user: { fullName: string; phone: string; language: string } }) {
  return (
    <FormDialog trigger={trigger} title="Edit profile" description="Your name, login phone and interface language." action={updateProfileAction}>
      <Field label="Full name"><Input name="fullName" required defaultValue={user.fullName} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone (login)"><Input name="phone" inputMode="tel" required defaultValue={user.phone} /></Field>
        <Field label="Language"><NativeSelect name="language" defaultValue={user.language}>{LANGUAGES.map((l) => <NativeSelectOption key={l} value={l}>{LANGUAGE_LABELS[l]}</NativeSelectOption>)}</NativeSelect></Field>
      </div>
    </FormDialog>
  );
}

export function ChangePasswordDialog({ trigger }: { trigger: ReactNode }) {
  return (
    <FormDialog trigger={trigger} title="Change password" action={changePasswordAction} submitLabel="Update password">
      <Field label="Current password"><Input name="currentPassword" type="password" required autoComplete="current-password" /></Field>
      <Field label="New password" hint="At least 6 characters"><Input name="newPassword" type="password" required minLength={6} autoComplete="new-password" /></Field>
      <Field label="Confirm new password"><Input name="confirmPassword" type="password" required autoComplete="new-password" /></Field>
    </FormDialog>
  );
}
