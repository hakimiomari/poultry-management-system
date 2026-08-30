import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getT } from "@/lib/locale";
import { getFinanceOverview } from "@/lib/services/finance";
import { Kpi, PageHeader, ToneBadge, Empty } from "@/components/pms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionDialog } from "@/components/forms/TransactionForm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { deleteTransactionAction } from "@/lib/actions";
import { enumLabel } from "@/lib/i18n";
import { can } from "@/lib/enums";
import { fmtDateDisplay, fmtNum } from "@/lib/format";
import { TrendingUp, TrendingDown, Scale, HandCoins, Receipt, Plus, ShoppingCart, Pencil, Trash2 } from "lucide-react";
export const dynamic = "force-dynamic";

const payTone = (s: string): "green" | "red" | "amber" => (s === "PAID" ? "green" : s === "CREDIT" ? "red" : "amber");

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("finance:read"); const { t, lang } = await getT();
  const { tab = "all" } = await searchParams;
  const o = await getFinanceOverview();
  const canWrite = can(user.role, "finance");
  const rows = o.txs.filter((x) => tab === "sales" ? x.type === "INCOME" : tab === "purchases" ? x.type === "EXPENSE" : true);
  const tabs: [string, string][] = [["all", t("fin.tab.all")], ["sales", t("fin.tab.sales")], ["purchases", t("fin.tab.purchases")]];
  return (
    <div className="space-y-6">
      <PageHeader title={t("fin.title")} subtitle={t("fin.subtitle")}>
        {canWrite && <><TransactionDialog kind="INCOME" flocks={o.flocks} contacts={o.contacts} trigger={<Button><Plus />{t("fin.addSale")}</Button>} />
          <TransactionDialog kind="EXPENSE" flocks={o.flocks} contacts={o.contacts} trigger={<Button variant="outline"><ShoppingCart />{t("fin.addPurchase")}</Button>} /></>}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi icon={<TrendingUp />} label={t("fin.kpi.income")} value={fmtNum(o.totals.income)} tone="ok" />
        <Kpi icon={<TrendingDown />} label={t("fin.kpi.expense")} value={fmtNum(o.totals.expense)} tone="danger" />
        <Kpi icon={<Scale />} label={t("fin.kpi.net")} value={`\u2066${fmtNum(o.totals.net)}\u2069`} tone={o.totals.net >= 0 ? "ok" : "danger"} />
        <Kpi icon={<HandCoins />} label={t("fin.kpi.receivables")} value={fmtNum(o.receivables)} sub={t("fin.kpi.receivablesSub")} tone="info" />
        <Kpi icon={<Receipt />} label={t("fin.kpi.payables")} value={fmtNum(o.payables)} sub={t("fin.kpi.payablesSub")} />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {[["fin.expenseByCategory", o.expenseByCat], ["fin.incomeByCategory", o.incomeByCat]].map(([k, cats]) => { const list = cats as { category: string; total: number }[]; const max = Math.max(1, ...list.map((c) => c.total)); return (
          <Card key={k as string}><CardHeader><CardTitle>{t(k as "fin.expenseByCategory")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">{list.length === 0 && <Empty>{t("fin.none")}</Empty>}{list.map((c) => (
              <div key={c.category} className="flex items-center gap-3 text-sm"><span className="w-36 truncate">{enumLabel(c.category, lang)}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${k === "fin.expenseByCategory" ? "bg-destructive/70" : "bg-primary"}`} style={{ width: `${(c.total / max) * 100}%` }} /></div>
                <span className="tabular w-24 text-end font-medium">{fmtNum(c.total)}</span></div>))}</CardContent></Card>); })}
      </div>
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">{tabs.map(([k, l]) => <Link key={k} href={`/finance?tab=${k}`} className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${tab === k ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{l}</Link>)}</div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow>{[t("common.date"), t("common.type"), t("fin.col.category"), t("fin.col.description"), t("fin.col.contact"), t("common.flock"), t("fin.col.qty"), t("fin.col.amount"), t("fin.col.payment"), ""].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            {rows.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="tabular whitespace-nowrap">{fmtDateDisplay(x.date)}</TableCell>
                <TableCell><ToneBadge tone={x.type === "INCOME" ? "green" : "gray"}>{enumLabel(x.type, lang)}</ToneBadge></TableCell>
                <TableCell className="font-medium">{enumLabel(x.category, lang)}</TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">{x.description ?? ""}</TableCell>
                <TableCell>{x.contact?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>{x.flock ? <Link href={`/flocks/${x.flock.id}`} className="text-primary hover:underline">{x.flock.flockName}</Link> : <span className="text-muted-foreground">{t("fin.general")}</span>}</TableCell>
                <TableCell className="tabular whitespace-nowrap">{x.quantity ? `${fmtNum(x.quantity, 2).replace(/\.00$/, "")} ${x.unit ? enumLabel(x.unit, lang) : ""}` : "—"}</TableCell>
                <TableCell className={`tabular whitespace-nowrap font-semibold ${x.type === "INCOME" ? "text-success" : ""}`}><span dir="ltr">{x.type === "INCOME" ? "+" : "−"}{fmtNum(x.amountAfn)}</span></TableCell>
                <TableCell><ToneBadge tone={payTone(x.paymentStatus)}>{enumLabel(x.paymentStatus, lang)}</ToneBadge>{x.paymentStatus !== "PAID" && <div className="tabular text-xs text-muted-foreground">{fmtNum(x.amountPaidAfn)} / {fmtNum(x.amountAfn)}{x.dueDate && ` · ${t("fin.due", { date: fmtDateDisplay(x.dueDate) })}`}</div>}</TableCell>
                <TableCell className="text-end whitespace-nowrap">{canWrite && <><TransactionDialog kind={x.type as "INCOME" | "EXPENSE"} tx={x} flocks={o.flocks} contacts={o.contacts} trigger={<Button variant="ghost" size="icon-xs" aria-label={t("common.edit")}><Pencil /></Button>} />
                  <ConfirmButton title={t("fin.deleteTitle")} description={t("fin.deleteDesc", { amount: fmtNum(x.amountAfn), category: enumLabel(x.category, lang) })} action={deleteTransactionAction.bind(null, x.id)} trigger={<Button variant="ghost" size="icon-xs" className="text-destructive" aria-label={t("common.delete")}><Trash2 /></Button>} /></>}</TableCell>
              </TableRow>))}
            {rows.length === 0 && <TableRow><TableCell colSpan={10}><Empty>{t("fin.none")}</Empty></TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
