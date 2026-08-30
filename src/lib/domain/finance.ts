// Pure finance formulas (SPEC Entity 4/12, B3). No DB access.
export interface TxLike { type: string; category?: string; amountAfn: number; amountPaidAfn: number; paymentStatus: string; date: Date | string; contactId?: string | null }

/** Line amount = quantity × unit price, unless an explicit amount is given. */
export function lineAmount(quantity?: number | null, unitPrice?: number | null, explicit?: number | null): number {
  if (explicit != null && explicit > 0) return explicit;
  if (quantity != null && unitPrice != null) return Math.round(quantity * unitPrice * 100) / 100;
  return 0;
}

/** Normalise payment: PAID → fully paid; CREDIT → nothing paid; PARTIAL → clamp. Returns {status, paid}. */
export function normalisePayment(amount: number, status: string, paid?: number | null) {
  if (status === "PAID") return { status: "PAID", paid: amount };
  if (status === "CREDIT") return { status: "CREDIT", paid: 0 };
  const p = Math.min(Math.max(paid ?? 0, 0), amount);
  if (p >= amount) return { status: "PAID", paid: amount };
  if (p <= 0) return { status: "CREDIT", paid: 0 };
  return { status: "PARTIAL", paid: p };
}

export const outstanding = (t: TxLike) => Math.max(0, t.amountAfn - t.amountPaidAfn);

const monthKey = (d: Date | string) => new Date(d).toISOString().slice(0, 7);

export function monthTotals(txs: TxLike[], month: string) {
  const inMonth = txs.filter((t) => monthKey(t.date) === month);
  const income = inMonth.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amountAfn, 0);
  const expense = inMonth.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amountAfn, 0);
  return { income, expense, net: income - expense, count: inMonth.length };
}

/** Receivables = unpaid part of sales; payables = unpaid part of purchases. */
export function balances(txs: TxLike[]) {
  const receivables = txs.filter((t) => t.type === "INCOME").reduce((s, t) => s + outstanding(t), 0);
  const payables = txs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + outstanding(t), 0);
  return { receivables, payables };
}

/** Per-contact balance: positive = they owe us (unpaid sales), negative = we owe them (unpaid purchases). */
export function contactBalance(txs: TxLike[]): number {
  return txs.reduce((s, t) => s + (t.type === "INCOME" ? outstanding(t) : -outstanding(t)), 0);
}

export function byCategory(txs: TxLike[], type: string): { category: string; total: number }[] {
  const m = new Map<string, number>();
  for (const t of txs) if (t.type === type) m.set(t.category ?? "OTHER", (m.get(t.category ?? "OTHER") ?? 0) + t.amountAfn);
  return [...m.entries()].map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total);
}
