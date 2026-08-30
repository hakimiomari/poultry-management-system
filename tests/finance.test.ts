import { describe, it, expect } from "vitest";
import { lineAmount, normalisePayment, monthTotals, balances, contactBalance, byCategory } from "@/lib/domain/finance";

const txs = [
  { type: "INCOME", category: "EGG_SALE", amountAfn: 12000, amountPaidAfn: 12000, paymentStatus: "PAID", date: "2026-08-02", contactId: "buyer" },
  { type: "INCOME", category: "EGG_SALE", amountAfn: 9000, amountPaidAfn: 4000, paymentStatus: "PARTIAL", date: "2026-08-10", contactId: "buyer" },
  { type: "EXPENSE", category: "FEED", amountAfn: 50000, amountPaidAfn: 0, paymentStatus: "CREDIT", date: "2026-08-05", contactId: "feedco" },
  { type: "EXPENSE", category: "VET_VISIT", amountAfn: 1500, amountPaidAfn: 1500, paymentStatus: "PAID", date: "2026-07-28", contactId: "vet" },
];

describe("finance formulas", () => {
  it("line amount = qty × unit price unless explicit", () => {
    expect(lineAmount(40, 2500)).toBe(100000);
    expect(lineAmount(40, 2500, 99000)).toBe(99000);
    expect(lineAmount(undefined, undefined)).toBe(0);
  });
  it("normalises payment status and paid amount", () => {
    expect(normalisePayment(1000, "PAID")).toEqual({ status: "PAID", paid: 1000 });
    expect(normalisePayment(1000, "CREDIT", 500)).toEqual({ status: "CREDIT", paid: 0 });
    expect(normalisePayment(1000, "PARTIAL", 400)).toEqual({ status: "PARTIAL", paid: 400 });
    expect(normalisePayment(1000, "PARTIAL", 1000)).toEqual({ status: "PAID", paid: 1000 });
    expect(normalisePayment(1000, "PARTIAL", 0)).toEqual({ status: "CREDIT", paid: 0 });
  });
  it("month totals (hand-calculated: Aug income 21,000, expense 50,000)", () => {
    expect(monthTotals(txs, "2026-08")).toEqual({ income: 21000, expense: 50000, net: -29000, count: 3 });
  });
  it("receivables and payables from unpaid parts", () => {
    expect(balances(txs)).toEqual({ receivables: 5000, payables: 50000 });
  });
  it("contact balance sign: buyer owes us, we owe supplier", () => {
    expect(contactBalance(txs.filter((t) => t.contactId === "buyer"))).toBe(5000);
    expect(contactBalance(txs.filter((t) => t.contactId === "feedco"))).toBe(-50000);
  });
  it("groups by category, largest first", () => {
    expect(byCategory(txs, "EXPENSE")).toEqual([{ category: "FEED", total: 50000 }, { category: "VET_VISIT", total: 1500 }]);
  });
});
