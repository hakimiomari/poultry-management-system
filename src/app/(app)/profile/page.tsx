import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader, ToneBadge } from "@/components/pms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditProfileDialog, ChangePasswordDialog, LANGUAGE_LABELS } from "@/components/forms/ProfileForms";
import { enumLabel } from "@/lib/i18n";
import { PERMISSIONS, type Role } from "@/lib/enums";
import { fmtDate } from "@/lib/format";
import { Pencil, KeyRound } from "lucide-react";
export const dynamic = "force-dynamic";

const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default async function ProfilePage() {
  const session = await requireUser();
  const [user, activity] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.id } }),
    prisma.auditLog.findMany({ where: { userId: session.id }, orderBy: { timestamp: "desc" }, take: 15 })]);
  return (
    <div className="space-y-6">
      <PageHeader title="My profile" subtitle="Account details, language and password">
        <EditProfileDialog user={user} trigger={<Button><Pencil />Edit profile</Button>} />
        <ChangePasswordDialog trigger={<Button variant="outline"><KeyRound />Change password</Button>} />
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">{initials(user.fullName)}</div>
            <div><div className="text-lg font-semibold">{user.fullName}</div><div className="text-sm text-muted-foreground">{user.phone}</div></div>
            <div className="flex gap-2"><ToneBadge tone="green">{enumLabel(user.role)}</ToneBadge><ToneBadge>{LANGUAGE_LABELS[user.language]}</ToneBadge></div>
            <div className="text-xs text-muted-foreground">Member since {fmtDate(user.createdAt)}</div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Permissions</CardTitle><CardDescription>What the {enumLabel(user.role)} role can access</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {PERMISSIONS[user.role as Role].map((p) => <ToneBadge key={p} tone="blue">{p}</ToneBadge>)}
          </CardContent>
        </Card>
      </div>
      <Card className="gap-0 py-0"><CardHeader className="py-4"><CardTitle>My recent activity</CardTitle></CardHeader>
        <Table><TableHeader><TableRow><TableHead>When</TableHead><TableHead>Action</TableHead><TableHead>Record</TableHead></TableRow></TableHeader>
          <TableBody>{activity.map((a) => <TableRow key={a.id}><TableCell className="tabular whitespace-nowrap">{a.timestamp.toISOString().slice(0, 16).replace("T", " ")}</TableCell><TableCell><ToneBadge tone={a.action === "DELETE" ? "red" : a.action === "CREATE" ? "green" : "gray"}>{a.action}</ToneBadge></TableCell><TableCell className="text-muted-foreground">{a.tableName}</TableCell></TableRow>)}
            {activity.length === 0 && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No activity yet.</TableCell></TableRow>}</TableBody></Table></Card>
    </div>
  );
}
