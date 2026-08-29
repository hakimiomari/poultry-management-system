"use client";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/fields";
import { t } from "@/lib/i18n";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <Card><CardContent>
      <form action={action} className="space-y-4">
        {state?.error && <div className="rounded-lg border border-destructive/30 bg-danger-soft px-3 py-2 text-sm text-destructive">{state.error}</div>}
        <Field label={t("auth.phone")}><Input name="phone" inputMode="tel" required defaultValue="0700000001" className="h-11" /></Field>
        <Field label={t("auth.password")}><Input name="password" type="password" required className="h-11" /></Field>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Signing in…" : t("auth.login")}</Button>
      </form>
    </CardContent></Card>
  );
}
