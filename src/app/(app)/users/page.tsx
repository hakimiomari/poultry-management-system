import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, ToneBadge } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserDialog } from "@/components/forms/UserForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { toggleUserActiveAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireUser("admin"); const { t, lang } = await getT();
  const users = await prisma.user.findMany({ orderBy: [{ isActive: "desc" }, { role: "asc" }, { fullName: "asc" }] });
  const head = [t("common.name"), t("users.phone"), t("users.role"), t("users.language"), t("common.status"), ""];
  return (
    <div>
      <PageHeader title={t("users.title")} subtitle={t("users.nActive", { n: users.filter((u) => u.isActive).length })}><UserDialog trigger={<Button><Plus />{t("users.new")}</Button>} /></PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{head.map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {users.map((u) => { const self = u.id === me.id; return (
              <TableRow key={u.id} className={u.isActive ? "" : "opacity-60"}>
                <TableCell className="font-medium">{u.fullName}{self && <span className="ms-2 text-xs text-muted-foreground">({t("common.you")})</span>}</TableCell>
                <TableCell className="tabular" dir="ltr">{u.phone}</TableCell><TableCell><ToneBadge tone={u.role === "OWNER" ? "green" : "blue"}>{enumLabel(u.role, lang)}</ToneBadge></TableCell>
                <TableCell>{enumLabel(u.language, lang)}</TableCell><TableCell><ToneBadge tone={u.isActive ? "green" : "gray"}>{u.isActive ? t("common.active") : t("common.inactive")}</ToneBadge></TableCell>
                <TableCell className="text-end whitespace-nowrap">
                  <UserDialog user={u} isSelf={self} trigger={<Button variant="ghost" size="icon-xs" aria-label={t("common.edit")}><Pencil /></Button>} />
                  {!self && <ConfirmButton title={u.isActive ? t("users.deactivateTitle", { name: u.fullName }) : t("users.reactivateTitle", { name: u.fullName })} description={u.isActive ? t("users.deactivateDesc") : t("users.reactivateDesc")} confirmLabel={u.isActive ? t("users.deactivate") : t("users.reactivate")} action={toggleUserActiveAction.bind(null, u.id)}
                    trigger={<Button variant="ghost" size="icon-xs" className={u.isActive ? "text-destructive" : "text-success"} aria-label="toggle">{u.isActive ? <UserX /> : <UserCheck />}</Button>} />}
                </TableCell>
              </TableRow>); })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
