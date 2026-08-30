"use client";
import { useState, startTransition } from "react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { setThemeAction } from "@/lib/actions";
import { FormDialog } from "@/components/FormDialog";
import { Field } from "@/components/forms/fields";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/lib/actions";
import { useT } from "@/components/I18nProvider";
import { ChevronDown, KeyRound, LogOut, UserCircle, Sun, Moon, Monitor } from "lucide-react";

type Props = { user: { fullName: string }; theme: string; logout: () => Promise<void> };

const Avatar = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 font-bold text-primary-foreground shadow-sm ring-2 ring-background ${className}`}>
    {name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
  </span>
);

const itemCls = "group gap-3 rounded-lg px-2.5 py-2 text-sm focus:bg-primary/10 focus:text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground focus:[&_svg]:text-primary!";

export function UserMenu({ user, theme, logout }: Props) {
  const { t } = useT(); const router = useRouter();
  const [pwOpen, setPwOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full border border-transparent py-1 pe-2.5 ps-1 text-sm outline-none transition hover:border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 data-open:border-border data-open:bg-muted">
          <Avatar name={user.fullName} className="size-8 text-xs" />
          <span className="hidden max-w-40 truncate font-medium sm:block">{user.fullName}</span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200 group-data-open:rotate-180" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64 rounded-xl p-1.5 shadow-lg">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="mb-1 flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-3">
              <Avatar name={user.fullName} className="size-11 text-sm" />
              <span className="min-w-0 truncate text-base font-semibold text-foreground">{user.fullName}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem nativeButton={false} render={<Link href="/profile" />} className={itemCls}><UserCircle />{t("nav.profile")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPwOpen(true)} className={itemCls}><KeyRound />{t("profile.changePw")}</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2.5 pb-1 text-xs font-medium text-muted-foreground">{t("theme.label")}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme} onValueChange={(v) => { startTransition(async () => { await setThemeAction(String(v)); router.refresh(); }); }}>
              {([["LIGHT", Sun, t("theme.LIGHT")], ["DARK", Moon, t("theme.DARK")], ["SYSTEM", Monitor, t("theme.SYSTEM")]] as const).map(([v, Icon, label]) => (
                <DropdownMenuRadioItem key={v} value={v} className="gap-3 rounded-lg py-2 text-sm [&_svg]:size-4 [&_svg]:text-muted-foreground"><Icon />{label}</DropdownMenuRadioItem>))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="my-1.5" />
          <DropdownMenuItem variant="destructive" onClick={() => logout()} className={`${itemCls} [&_svg]:text-destructive`}><LogOut />{t("nav.logout")}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <FormDialog open={pwOpen} onOpenChange={setPwOpen} title={t("pw.title")} action={changePasswordAction} submitLabel={t("pw.update")}>
        <Field label={t("pw.current")}><Input name="currentPassword" type="password" required autoComplete="current-password" dir="ltr" /></Field>
        <Field label={t("pw.new")} hint={t("pw.hint")}><Input name="newPassword" type="password" required minLength={6} autoComplete="new-password" dir="ltr" /></Field>
        <Field label={t("pw.confirm")}><Input name="confirmPassword" type="password" required autoComplete="new-password" dir="ltr" /></Field>
      </FormDialog>
    </>
  );
}
