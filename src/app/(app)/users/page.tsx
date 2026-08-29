import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, ToneBadge } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserDialog } from "@/components/forms/UserForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { LANGUAGE_LABELS } from "@/components/forms/ProfileForms";
import { toggleUserActiveAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { Plus, Pencil, UserX, UserCheck } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireUser("admin");
  const users = await prisma.user.findMany({ orderBy: [{ isActive: "desc" }, { role: "asc" }, { fullName: "asc" }] });
  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.filter((u) => u.isActive).length} active accounts`}><UserDialog trigger={<Button><Plus />New user</Button>} /></PageHeader>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{["Name", "Phone", "Role", "Language", "Status", ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {users.map((u) => { const self = u.id === me.id; return (
              <TableRow key={u.id} className={u.isActive ? "" : "opacity-60"}>
                <TableCell className="font-medium">{u.fullName}{self && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</TableCell>
                <TableCell className="tabular">{u.phone}</TableCell><TableCell><ToneBadge tone={u.role === "OWNER" ? "green" : "blue"}>{enumLabel(u.role)}</ToneBadge></TableCell>
                <TableCell>{LANGUAGE_LABELS[u.language]}</TableCell><TableCell><ToneBadge tone={u.isActive ? "green" : "gray"}>{u.isActive ? "Active" : "Inactive"}</ToneBadge></TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <UserDialog user={u} isSelf={self} trigger={<Button variant="ghost" size="icon-xs" aria-label="Edit"><Pencil /></Button>} />
                  {!self && <ConfirmButton title={u.isActive ? `Deactivate ${u.fullName}?` : `Reactivate ${u.fullName}?`} description={u.isActive ? "They will no longer be able to log in. Their records are kept." : "They will be able to log in again."} confirmLabel={u.isActive ? "Deactivate" : "Reactivate"} action={toggleUserActiveAction.bind(null, u.id)}
                    trigger={<Button variant="ghost" size="icon-xs" className={u.isActive ? "text-destructive" : "text-success"} aria-label="Toggle active">{u.isActive ? <UserX /> : <UserCheck />}</Button>} />}
                </TableCell>
              </TableRow>); })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
