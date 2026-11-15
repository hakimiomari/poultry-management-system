import Link from "next/link";
import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/enums";
import { evaluateAlerts } from "@/lib/services/flocks";
import { getDashboard } from "@/lib/services/dashboard";
import { Kpi, PageHeader, AlertBanner, ToneBadge, typeTone, Empty } from "@/components/pms";
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PopulationChart } from "@/components/FlockChart";
import { DailyColumns, DailyArea, CashflowChart } from "@/components/DashboardCharts";
import { DailyLogDialog } from "@/components/forms/DailyLogForm";
import { fmtNum, fmtDateDisplay } from "@/lib/format";
import { enumLabel, type TKey } from "@/lib/i18n";
import { getT } from "@/lib/locale";
import { Bird, Hash, Skull, Egg, Wheat, ClipboardPlus, ArrowRight, Percent, Scale, Stethoscope } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await requireUser(); const { t, lang } = await getT();
  const [d, alerts] = await Promise.all([getDashboard({ finance: can(user.role, "finance:read"), health: can(user.role, "health") }), evaluateAlerts()]);
  const { flocks, totals, trend, finance, health } = d;
  const options = flocks.map((f) => ({ id: f.flock.id, flockName: f.flock.flockName, flockType: f.flock.flockType })).sort((a, b) => a.flockName.localeCompare(b.flockName));
  const shedsInUse = d.sheds.filter((s) => s.occupied > 0).length;
  const maxCause = Math.max(1, ...d.causes.map((c) => c.total));
  const open = (href: string) => <CardAction><Button variant="ghost" size="sm" nativeButton={false} render={<Link href={href} />}>{t("common.open")}<ArrowRight className="rtl:rotate-180" /></Button></CardAction>;
  return (
    <div className="space-y-6">
      <PageHeader title={t("dash.title")} subtitle={alerts.length ? t("dash.alertsNeed", { n: alerts.length }) : t("dash.allNormal")}>
        <DailyLogDialog flocks={options} trigger={<Button><ClipboardPlus />{t("dash.recordToday")}</Button>} />
      </PageHeader>
      {alerts.length > 0 && <div className="space-y-2">{alerts.map((a) => <AlertBanner key={a.code + a.flockId} severity={a.severity} severityLabel={t(`severity.${a.severity}` as TKey)} message={t(`alert.${a.code}.msg` as TKey, a.params)} action={t(`alert.${a.code}.action` as TKey, a.params)} />)}</div>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={<Bird />} label={t("dash.activeFlocks")} value={flocks.length} sub={t("dash.shedsInUse", { n: shedsInUse, total: d.sheds.length })} />
        <Kpi icon={<Hash />} label={t("dash.totalBirds")} value={fmtNum(totals.birds)} sub={`${t("common.of")} ${fmtNum(totals.initialBirds)}`} />
        <Kpi icon={<Skull />} label={t("dash.deathsToday")} value={fmtNum(totals.todayDeaths)} sub={t("dash.last7", { n: fmtNum(totals.weekDeaths) })} tone={totals.todayDeaths > 0 ? "danger" : "ok"} />
        <Kpi icon={<Percent />} label={t("flocks.kpi.cumMortality")} value={`${totals.cumMortalityPct.toFixed(2)}%`} sub={t("flocks.kpi.nBirds", { n: fmtNum(totals.totalDeaths) })} />
        <Kpi icon={<Egg />} label={t("dash.eggsToday")} value={fmtNum(totals.todayEggs)} sub={`${fmtNum(totals.todayEggs / d.trayCount, 1)} ${t("common.trays")}`} tone="info" />
        <Kpi icon={<Wheat />} label={t("dash.feedToday")} value={<>{fmtNum(totals.todayFeedKg)} <span className="text-sm font-medium">{t("common.kg")}</span></>} sub={t("dash.last7", { n: `${fmtNum(totals.weekFeedKg)} ${t("common.kg")}` })} />
        {finance && <Kpi icon={<Scale />} label={t("fin.kpi.net")} value={`⁦${fmtNum(finance.net)}⁩`} sub={`${t("fin.kpi.receivables")} ${fmtNum(finance.receivables)} · ${t("fin.kpi.payables")} ${fmtNum(finance.payables)}`} tone={finance.net >= 0 ? "ok" : "danger"} />}
        {health && <Kpi icon={<Stethoscope />} label={t("dash.healthPending")} value={health.pending} sub={health.overdue > 0 ? t("dash.nOverdue", { n: health.overdue }) : undefined} tone={health.overdue > 0 ? "danger" : "default"} />}
      </div>

      {flocks.length > 0 && <>
        <Section title={t("dash.trends")} sub={t("dash.trendsSub", { from: fmtDateDisplay(trend.from), to: fmtDateDisplay(trend.to) })}>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title={t("flocks.chart.mortality")} sub={t("dash.chart.deathsSub", { n: fmtNum(trend.deaths) })} empty={trend.deaths === 0 && t("dash.noDeaths")}>
              <DailyColumns data={trend.series} dataKey="deaths" label={t("enum.MORTALITY")} color="var(--chart-2)" />
            </ChartCard>
            <ChartCard title={t("dash.chart.eggs")} sub={[t("dash.chart.eggsSub", { n: fmtNum(trend.eggs) }), trend.avgHenDay != null && t("dash.chart.henDayAvg", { pct: trend.avgHenDay.toFixed(1) })].filter(Boolean).join(" · ")} empty={trend.eggs === 0 && t("dash.noData")}>
              <DailyArea data={trend.series} dataKey="eggs" label={t("logs.eggs")} color="var(--chart-3)" />
            </ChartCard>
            <ChartCard className={finance ? undefined : "xl:col-span-2"} title={t("dash.chart.feed")} sub={t("dash.chart.feedSub", { n: fmtNum(trend.feedKg) })} empty={trend.feedKg === 0 && t("dash.noData")}>
              <DailyArea data={trend.series} dataKey="feedKg" label={t("logs.feedKg")} color="var(--chart-1)" />
            </ChartCard>
            {finance && (
              <ChartCard title={t("dash.chart.cashflow")} sub={t("dash.chart.cashflowSub", { n: finance.months })} action={open("/finance")} empty={finance.cashflow.every((m) => m.income === 0 && m.expense === 0) && t("fin.none")}>
                <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-xs bg-chart-1" />{enumLabel("INCOME", lang)}</span>
                  <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-xs bg-chart-2" />{enumLabel("EXPENSE", lang)}</span>
                </div>
                <CashflowChart data={finance.cashflow} incomeLabel={enumLabel("INCOME", lang)} expenseLabel={enumLabel("EXPENSE", lang)} height={166} />
              </ChartCard>
            )}
          </div>
          {/* The same numbers as tables, for screen readers. The wrapper is what hides them: a table ignores sr-only's 1px width. */}
          <div className="sr-only">
          <table>
            <caption>{t("dash.trends")}</caption>
            <thead><tr><th>{t("common.date")}</th><th>{t("dash.population")}</th><th>{t("enum.MORTALITY")}</th><th>{t("logs.eggs")}</th><th>{t("logs.feedKg")}</th></tr></thead>
            <tbody>{trend.series.map((p) => <tr key={p.date}><td>{p.date}</td><td>{p.population}</td><td>{p.deaths}</td><td>{p.eggs}</td><td>{fmtNum(p.feedKg, 1)}</td></tr>)}</tbody>
          </table>
          {finance && <table>
            <caption>{t("dash.chart.cashflow")}</caption>
            <thead><tr><th>{t("common.date")}</th><th>{enumLabel("INCOME", lang)}</th><th>{enumLabel("EXPENSE", lang)}</th></tr></thead>
            <tbody>{finance.cashflow.map((m) => <tr key={m.month}><td>{m.month}</td><td>{m.income}</td><td>{m.expense}</td></tr>)}</tbody>
          </table>}
          </div>
        </Section>

        <div className={`grid gap-4 ${health ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
          <Card>
            <CardHeader><CardTitle>{t("dash.sheds")}</CardTitle><CardDescription>{t("dash.shedsInUse", { n: shedsInUse, total: d.sheds.length })}</CardDescription>{open("/sheds")}</CardHeader>
            <CardContent className="space-y-4">
              {d.sheds.map((s) => (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2"><span className="truncate font-medium">{s.shedName}</span>{s.occupied === 0 && <ToneBadge>{enumLabel(s.status, lang)}</ToneBadge>}</span>
                    <span className="tabular shrink-0 text-muted-foreground">{fmtNum(s.occupied)} · {t("sheds.pctOf", { pct: s.pct, cap: fmtNum(s.capacity) })}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-primary/15" role="meter" aria-label={s.shedName} aria-valuemin={0} aria-valuemax={s.capacity} aria-valuenow={s.occupied}><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(s.pct, 100)}%` }} /></div>
                </div>
              ))}
              {d.sheds.length === 0 && <Empty>{t("common.noRecords")}</Empty>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t("dash.causes")}</CardTitle><CardDescription>{t("dash.chart.deathsSub", { n: fmtNum(trend.deaths) })}</CardDescription>{open("/movements")}</CardHeader>
            <CardContent className="space-y-2.5">
              {d.causes.map((c) => (
                <div key={c.cause} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 truncate">{enumLabel(c.cause, lang)}</span>
                  <div className="h-2 flex-1"><div className="h-full rounded-e-sm bg-chart-2" style={{ width: `${(c.total / maxCause) * 100}%` }} /></div>
                  <span className="tabular w-12 shrink-0 text-end font-medium">{fmtNum(c.total)}</span>
                </div>
              ))}
              {d.causes.length === 0 && <Empty>{t("dash.noDeaths")}</Empty>}
            </CardContent>
          </Card>
          {health && (
            <Card>
              <CardHeader><CardTitle>{t("dash.health")}</CardTitle><CardDescription>{t("health.pending", { n: health.pending })}{health.overdue > 0 && ` · ${t("dash.nOverdue", { n: health.overdue })}`}</CardDescription>{open("/health")}</CardHeader>
              <CardContent className="divide-y">
                {health.upcoming.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{h.productName}</div>
                      <div className="truncate text-xs text-muted-foreground">{enumLabel(h.type, lang)} · <Link href={`/flocks/${h.flock.id}`} className="text-primary hover:underline">{h.flock.flockName}</Link></div>
                    </div>
                    <div className="shrink-0 text-end"><div className="tabular text-xs text-muted-foreground">{fmtDateDisplay(h.date)}</div>{h.overdue && <ToneBadge tone="red">{t("health.overdue")}</ToneBadge>}</div>
                  </div>
                ))}
                {health.upcoming.length === 0 && <Empty>{t("dash.noHealth")}</Empty>}
              </CardContent>
            </Card>
          )}
        </div>
      </>}

      <Section title={t("dash.activeFlocks")}>
        <div className="grid gap-4 xl:grid-cols-2">
          {flocks.map((f) => (
            <Card key={f.flock.id}>
              <CardHeader><CardTitle className="flex items-center gap-2">{f.flock.flockName}<ToneBadge tone={typeTone(f.flock.flockType)}>{enumLabel(f.flock.flockType, lang)}</ToneBadge></CardTitle>{open(`/flocks/${f.flock.id}`)}</CardHeader>
              <CardContent>
                <div className="mb-3 grid grid-cols-3 gap-3">
                  <Stat label={t("dash.population")} value={fmtNum(f.current)} sub={`${t("common.of")} ${fmtNum(f.flock.initialQuantity)}`} />
                  <Stat label={t("dash.mortality")} value={`${f.mortalityPct.toFixed(2)}%`} danger={f.mortalityPct > 5} />
                  <Stat label={t("dash.age")} value={`${f.ageDays} ${t("common.days")}`} sub={`${t("common.week")} ${Math.ceil(f.ageDays / 7)}`} />
                </div>
                <PopulationChart data={f.series} height={170} label={t("dash.population")} />
              </CardContent>
            </Card>
          ))}
          {flocks.length === 0 && <Card><CardContent>{t("dash.noFlocks")} <Link href="/flocks" className="text-primary underline">{t("dash.createOne")}</Link></CardContent></Card>}
        </div>
      </Section>
    </div>
  );
}

const Section = ({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) => (
  <section className="space-y-3">
    <div><h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>{sub && <p className="text-sm text-muted-foreground">{sub}</p>}</div>
    {children}
  </section>
);
/** A titled chart card; `empty` replaces the plot with a message when there is nothing to draw. */
const ChartCard = ({ title, sub, action, empty, className, children }: { title: string; sub: string; action?: ReactNode; empty: string | false; className?: string; children: ReactNode }) => (
  <Card className={className}>
    <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{sub}</CardDescription>{action}</CardHeader>
    <CardContent>{empty ? <Empty>{empty}</Empty> : children}</CardContent>
  </Card>
);
const Stat = ({ label, value, sub, danger }: { label: string; value: string; sub?: string; danger?: boolean }) => (
  <div><div className="text-xs text-muted-foreground">{label}</div><div className={`tabular text-lg font-semibold ${danger ? "text-destructive" : ""}`}>{value}</div>{sub && <div className="text-xs text-muted-foreground">{sub}</div>}</div>
);
