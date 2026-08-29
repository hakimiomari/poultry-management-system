import { LoginForm } from "./LoginForm";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="font-heading text-2xl font-bold">🐔 PMS</div>
        <div><h2 className="font-heading text-4xl font-bold leading-tight">Every bird counted.<br />Every day recorded.</h2>
          <p className="mt-4 max-w-md opacity-80">Flocks, sheds, daily logs and alerts for broiler and layer farms — built to work on a phone, in the shed, in your language.</p></div>
        <div className="text-sm opacity-60">English · دری · پښتو</div>
      </section>
      <section className="flex flex-col justify-center p-6 sm:p-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 lg:hidden"><span className="text-4xl">🐔</span></div>
          <h1 className="font-heading text-2xl font-bold">{t("auth.login")}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{t("app.title")}</p>
          <LoginForm />
          <p className="mt-4 text-xs text-muted-foreground">Demo: 0700000001 / owner123 · 0700000003 / worker123</p>
        </div>
      </section>
    </main>
  );
}
