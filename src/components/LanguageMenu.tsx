"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/components/I18nProvider";
import { setLanguageAction } from "@/lib/actions";
import { LANGUAGES } from "@/lib/enums";
import { enumLabel, type Lang } from "@/lib/i18n";

/** Latin codes for the badges: a handle on each row for readers who do not know the other script. */
const CODE: Record<Lang, string> = { EN: "EN", FA_DARI: "FA", PS_PASHTO: "PS" };

/** Header language switcher. Each language is listed in its own script so it is readable whatever the current one is. */
export function LanguageMenu() {
  const { t, lang } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("auth.language")}
        disabled={pending}
        className="group flex h-10 items-center gap-2 rounded-full border border-transparent px-2.5 text-sm font-medium outline-none transition hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60 data-popup-open:border-border data-popup-open:bg-muted"
      >
        <Languages className="size-4.5 text-muted-foreground" />
        <span className="hidden sm:block">{enumLabel(lang, lang)}</span>
        <ChevronDown className="hidden size-4 text-muted-foreground transition-transform duration-200 group-data-popup-open:rotate-180 sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl p-1.5 shadow-lg"
      >
        <DropdownMenuRadioGroup
          className="space-y-0.5"
          value={lang}
          onValueChange={(v) => {
            startTransition(async () => {
              await setLanguageAction(String(v));
              router.refresh();
            });
          }}
        >
          {LANGUAGES.map((l) => (
            <DropdownMenuRadioItem
              key={l}
              value={l}
              closeOnClick
              className="group/item cursor-pointer gap-3 rounded-lg py-1.5 ps-1.5 text-sm font-medium focus:bg-muted focus:text-foreground focus:**:text-foreground data-checked:bg-primary/10 data-checked:[&_svg]:text-primary!"
            >
              <span
                dir="ltr"
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold tracking-wide text-muted-foreground group-focus/item:bg-background group-data-checked/item:bg-primary group-data-checked/item:text-primary-foreground!"
              >
                {CODE[l]}
              </span>
              {enumLabel(l, l)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
