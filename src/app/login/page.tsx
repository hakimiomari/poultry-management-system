import { ActionForm } from "@/components/Form";
import { loginAction } from "@/lib/actions";
import { Field, inputCls } from "@/components/ui";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center p-6">
      <div className="mb-6 text-center"><div className="text-4xl">🐔</div><h1 className="mt-2 text-xl font-semibold">{t("app.title")}</h1></div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ActionForm action={loginAction} submitLabel={t("auth.login")}>
          <Field label={t("auth.phone")}><input name="phone" inputMode="tel" required className={inputCls} defaultValue="0700000001" /></Field>
          <Field label={t("auth.password")}><input name="password" type="password" required className={inputCls} /></Field>
        </ActionForm>
        <p className="mt-4 text-xs text-gray-500">Demo: 0700000001 / owner123 · 0700000003 / worker123</p>
      </div>
    </main>
  );
}
