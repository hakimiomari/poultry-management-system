"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLangAction } from "@/lib/actions";
import { LANGUAGES } from "@/lib/enums";
import { enumLabel, type Lang } from "@/lib/i18n";
import { useT } from "@/components/I18nProvider";
import { cn } from "@/lib/utils";

/** Pre-login language picker; stores a cookie and re-renders the page. */
export function LangSwitcher({ className }: { className?: string }) {
  const { lang } = useT(); const router = useRouter(); const [pending, start] = useTransition();
  return (
    <div className={cn("inline-flex rounded-lg border bg-card p-0.5", className)} role="group">
      {LANGUAGES.map((l: Lang) => (
        <button key={l} type="button" disabled={pending} onClick={() => start(async () => { await setLangAction(l); router.refresh(); })}
          className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition", l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{enumLabel(l, l)}</button>
      ))}
    </div>
  );
}
