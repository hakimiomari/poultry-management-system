"use client";
import { useState } from "react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/FormDialog";
import { Field } from "@/components/forms/fields";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/lib/actions";
import { useT } from "@/components/I18nProvider";
import { ChevronDown, KeyRound, LogOut, UserCircle } from "lucide-react";

type Props = { user: { fullName: string }; logout: () => Promise<void> };

export function UserMenu({ user, logout }: Props) {
  const { t } = useT();
  const [pwOpen, setPwOpen] = useState(false);
  const initials = user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 data-open:bg-muted">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{initials}</span>
          <span className="hidden font-medium sm:block">{user.fullName}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuGroup><DropdownMenuLabel className="flex items-center gap-3 py-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{initials}</span>
            <span className="min-w-0 truncate font-semibold">{user.fullName}</span>
          </DropdownMenuLabel></DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem nativeButton={false} render={<Link href="/profile" />}><UserCircle />{t("nav.profile")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPwOpen(true)}><KeyRound />{t("profile.changePw")}</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => logout()}><LogOut />{t("nav.logout")}</DropdownMenuItem>
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
