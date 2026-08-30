// Read-side finance & health services.
import { prisma } from "@/lib/db";
import { monthTotals, balances, byCategory, contactBalance } from "@/lib/domain/finance";
import { todayStr } from "@/lib/format";

export async function getFinanceOverview() {
  const [txs, flocks, contacts] = await Promise.all([
    prisma.transaction.findMany({ include: { flock: { select: { id: true, flockName: true } }, contact: { select: { id: true, name: true } } }, orderBy: [{ date: "desc" }, { createdAt: "desc" }], take: 300 }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } }),
    prisma.contact.findMany({ select: { id: true, name: true, contactType: true }, orderBy: { name: "asc" } }),
  ]);
  const all = await prisma.transaction.findMany({ select: { type: true, category: true, amountAfn: true, amountPaidAfn: true, paymentStatus: true, date: true } });
  const month = todayStr().slice(0, 7);
  return { txs, flocks, contacts, month, totals: monthTotals(all, month), ...balances(all),
    expenseByCat: byCategory(all.filter((t) => t.date.toISOString().startsWith(month)), "EXPENSE"),
    incomeByCat: byCategory(all.filter((t) => t.date.toISOString().startsWith(month)), "INCOME") };
}

export async function getContactsWithBalances() {
  const contacts = await prisma.contact.findMany({ include: { transactions: { select: { type: true, amountAfn: true, amountPaidAfn: true, paymentStatus: true, date: true } } }, orderBy: { name: "asc" } });
  return contacts.map((c) => ({ ...c, balance: contactBalance(c.transactions), txCount: c.transactions.length }));
}

export async function getHealthOverview() {
  const [logs, flocks, vets] = await Promise.all([
    prisma.healthLog.findMany({ include: { flock: { select: { id: true, flockName: true, status: true } }, contact: { select: { id: true, name: true } }, transaction: { select: { amountAfn: true } } }, orderBy: [{ scheduledDate: "desc" }], take: 200 }),
    prisma.flock.findMany({ where: { status: "ACTIVE" }, select: { id: true, flockName: true, flockType: true }, orderBy: { flockName: "asc" } }),
    prisma.contact.findMany({ where: { contactType: "VETERINARIAN" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const today = todayStr();
  return { logs: logs.map((l) => ({ ...l, overdue: l.status === "PENDING" && l.scheduledDate.toISOString().slice(0, 10) < today })), flocks, vets, pending: logs.filter((l) => l.status === "PENDING").length };
}
