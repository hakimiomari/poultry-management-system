import { FormDialog } from "@/components/FormDialog";
import { Field } from "./fields";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveUserAction } from "@/lib/actions";
import { LANGUAGES, ROLES } from "@/lib/enums";
import { enumLabel } from "@/lib/i18n";
import { LANGUAGE_LABELS } from "./ProfileForms";
import type { ReactNode } from "react";

type User = { id: string; fullName: string; phone: string; role: string; language: string; isActive: boolean };

export function UserDialog({ trigger, user, isSelf }: { trigger: ReactNode; user?: User; isSelf?: boolean }) {
  return (
    <FormDialog trigger={trigger} title={user ? `Edit ${user.fullName}` : "New user"} description={user ? "Leave password blank to keep the current one." : "The user logs in with their phone number."} action={saveUserAction}>
      {user && <input type="hidden" name="id" value={user.id} />}
      <Field label="Full name"><Input name="fullName" required defaultValue={user?.fullName} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone (login)"><Input name="phone" inputMode="tel" required defaultValue={user?.phone} /></Field>
        <Field label="Role"><NativeSelect name="role" defaultValue={user?.role ?? "WORKER"} disabled={isSelf}>{ROLES.map((r) => <NativeSelectOption key={r} value={r}>{enumLabel(r)}</NativeSelectOption>)}</NativeSelect>{isSelf && <input type="hidden" name="role" value={user?.role} />}</Field>
        <Field label="Language"><NativeSelect name="language" defaultValue={user?.language ?? "EN"}>{LANGUAGES.map((l) => <NativeSelectOption key={l} value={l}>{LANGUAGE_LABELS[l]}</NativeSelectOption>)}</NativeSelect></Field>
        <Field label={user ? "Reset password" : "Password"} hint="At least 6 characters"><Input name="password" type="password" minLength={6} required={!user} autoComplete="new-password" /></Field>
      </div>
      {!isSelf && <div className="flex items-center gap-2"><Checkbox id="isActive" name="isActive" defaultChecked={user?.isActive ?? true} /><Label htmlFor="isActive">Active (can log in)</Label></div>}
      {isSelf && <input type="hidden" name="isActive" value="on" />}
    </FormDialog>
  );
}
