import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/locale";
import { getContactsWithBalances } from "@/lib/services/finance";
import { PageHeader, ToneBadge, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { ContactDialog } from "@/components/forms/ContactForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteContactAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { can } from "@/lib/enums";
import { fmtNum } from "@/lib/format";
import { Plus, Pencil, Trash2, Phone, MapPin } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const user = await requireUser("finance:read"); const { t, lang } = await getT();
  const contacts = await getContactsWithBalances(); const canWrite = can(user.role, "finance");
  return (
    <div>
      <PageHeader title={t("contacts.title")} subtitle={t("contacts.subtitle")}>{canWrite && <ContactDialog trigger={<Button><Plus />{t("contacts.add")}</Button>} />}</PageHeader>
      {contacts.length === 0 && <Empty>{t("contacts.none")}</Empty>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contacts.map((c) => (
          <Card key={c.id}>
            <CardHeader><CardTitle>{c.name}</CardTitle><CardDescription>{enumLabel(c.contactType, lang)} · {t("contacts.nTx", { n: c.txCount })}</CardDescription>
              <CardAction><ToneBadge tone={c.balance > 0 ? "blue" : c.balance < 0 ? "red" : "gray"}>{c.balance > 0 ? t("contacts.owesUs") : c.balance < 0 ? t("contacts.weOwe") : t("contacts.settled")}</ToneBadge></CardAction></CardHeader>
            <CardContent>
              <div className="tabular text-2xl font-semibold">{fmtNum(Math.abs(c.balance))} <span className="text-sm font-normal text-muted-foreground">AFN</span></div>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {c.phone && <div className="flex items-center gap-2"><Phone className="size-3.5" /><span dir="ltr">{c.phone}</span></div>}
                {c.address && <div className="flex items-center gap-2"><MapPin className="size-3.5" />{c.address}</div>}
              </div>
              {canWrite && <div className="mt-3 flex justify-end gap-1">
                <ContactDialog contact={c} trigger={<Button variant="ghost" size="sm"><Pencil />{t("common.edit")}</Button>} />
                <ConfirmButton title={t("contacts.deleteTitle", { name: c.name })} description={t("contacts.deleteDesc")} action={deleteContactAction.bind(null, c.id)} trigger={<Button variant="ghost" size="sm" className="text-destructive"><Trash2 />{t("common.delete")}</Button>} />
              </div>}
            </CardContent>
          </Card>))}
      </div>
    </div>
  );
}
