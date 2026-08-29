import { LoginForm } from "./LoginForm";
import { LangSwitcher } from "@/components/LangSwitcher";
import { getT } from "@/lib/locale";

export default async function LoginPage() {
  const { t } = await getT();
  const [line1, line2] = t("auth.tagline").split("\n");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="font-heading text-2xl font-bold">🐔 {t("app.short")}</div>
        <div><h2 className="font-heading text-4xl font-bold leading-tight">{line1}<br />{line2}</h2><p className="mt-4 max-w-md opacity-80">{t("auth.blurb")}</p></div>
        <div className="text-sm opacity-60">English · دری · پښتو</div>
      </section>
      <section className="flex flex-col justify-center p-6 sm:p-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 flex items-center justify-between"><span className="text-4xl lg:hidden">🐔</span><LangSwitcher className="ms-auto" /></div>
          <h1 className="font-heading text-2xl font-bold">{t("auth.login")}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{t("app.title")}</p>
          <LoginForm />
          <p className="mt-4 text-xs text-muted-foreground">{t("auth.demo")}</p>
        </div>
      </section>
    </main>
  );
}
