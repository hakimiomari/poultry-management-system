"use client";
import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Moon, Sun } from "lucide-react";
import { useT } from "@/components/I18nProvider";
import { setThemeAction } from "@/lib/actions";
import type { Theme } from "@/lib/enums";
import { cn } from "@/lib/utils";

const OPTIONS = [
  ["LIGHT", Sun],
  ["DARK", Moon],
  ["SYSTEM", Monitor],
] as const;

/** Profile theme selector: three boxes, the active one highlighted. Applies immediately, like the account-menu switcher. */
export function ThemePicker({ theme }: { theme: Theme }) {
  const { t } = useT();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic(theme);
  const choose = (v: Theme) => {
    if (v === current) return;
    startTransition(async () => {
      setCurrent(v);
      await setThemeAction(v);
      router.refresh();
    });
  };
  return (
    <div
      role="radiogroup"
      aria-label={t("theme.label")}
      className="grid max-w-sm grid-cols-3 gap-2"
    >
      {OPTIONS.map(([v, Icon]) => {
        const active = v === current;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(v)}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border bg-background px-2 py-2.5 text-xs font-medium text-muted-foreground outline-none transition hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
              active &&
                "border-primary bg-primary/10 text-foreground ring-1 ring-primary",
            )}
          >
            <Icon className={cn("size-4.5", active && "text-primary")} />
            {t(`theme.${v}`)}
          </button>
        );
      })}
    </div>
  );
}
