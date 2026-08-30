import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, ToneBadge } from "@/components/pms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditProfileDialog, ChangePasswordDialog } from "@/components/forms/ProfileForms";
import { enumLabel, type TKey } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { PERMISSIONS, type Role } from "@/lib/enums";
import { fmtDateDisplay } from "@/lib/format";
import { Pencil, KeyRound } from "lucide-react";
export const dynamic = "force-dynamic";

const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default async function ProfilePage() {
  const session = await requireUser(); const { t, lang } = await getT();
  const [user, activity] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.id } }),
    prisma.auditLog.findMany({ where: { userId: session.id }, orderBy: { timestamp: "desc" }, take: 15 })]);
  return (
    <div className="space-y-6">
      <PageHeader title={t("profile.title")} subtitle={t("profile.subtitle")}>
        <EditProfileDialog user={user} trigger={<Button><Pencil />{t("profile.edit")}</Button>} />
        <ChangePasswordDialog trigger={<Button variant="outline"><KeyRound />{t("profile.changePw")}</Button>} />
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">{initials(user.fullName)}</div>
            <div><div className="text-lg font-semibold">{user.fullName}</div><div className="text-sm text-muted-foreground" dir="ltr">{user.phone}</div></div>
            <div className="flex gap-2"><ToneBadge tone="green">{enumLabel(user.role, lang)}</ToneBadge><ToneBadge>{enumLabel(user.language, lang)}</ToneBadge></div>
            <div className="text-xs text-muted-foreground">{t("profile.memberSince", { date: fmtDateDisplay(user.createdAt) })}</div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t("profile.permissions")}</CardTitle><CardDescription>{t("profile.permissionsDesc", { role: enumLabel(user.role, lang) })}</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">{PERMISSIONS[user.role as Role].map((p) => <ToneBadge key={p} tone="blue">{t(`perm.${p}` as TKey)}</ToneBadge>)}</CardContent>
        </Card>
      </div>
      <Card className="gap-0 py-0"><CardHeader className="py-4"><CardTitle>{t("profile.activity")}</CardTitle></CardHeader>
        <Table><TableHeader><TableRow><TableHead>{t("profile.when")}</TableHead><TableHead>{t("profile.action")}</TableHead><TableHead>{t("profile.record")}</TableHead></TableRow></TableHeader>
          <TableBody>{activity.map((a) => <TableRow key={a.id}><TableCell className="tabular whitespace-nowrap" dir="ltr">{a.timestamp.toISOString().slice(0, 16).replace("T", " ")}</TableCell><TableCell><ToneBadge tone={a.action === "DELETE" ? "red" : a.action === "CREATE" ? "green" : "gray"}>{enumLabel(a.action, lang)}</ToneBadge></TableCell><TableCell className="text-muted-foreground">{a.tableName}</TableCell></TableRow>)}
            {activity.length === 0 && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">{t("profile.noActivity")}</TableCell></TableRow>}</TableBody></Table></Card>
    </div>
  );
}
