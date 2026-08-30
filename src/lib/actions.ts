"use server";
// All writes: validate (zod) → business rules (domain) → persist → audit → revalidate.
// Actions return { ok } / { error } so dialogs can close in place; only login redirects.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { audit } from "./audit";
import { login as doLogin, logout as doLogout, requireUser, getSession } from "./auth";
import { birdMovementSchema, dailyLogSchema, flockSchema, formToObject, loginSchema, shedSchema } from "./validation";
import { validateMovement, validateShedCapacity, currentQuantity } from "./domain/population";
import { shedOccupancy } from "./services/flocks";
import { toDate, todayStr } from "./format";
import { getT, THEME_COOKIE, isTheme } from "./locale";
import { cookies } from "next/headers";
import type { TKey, TFn } from "./i18n";
import type { RuleError } from "./domain/population";

export type ActionState = { ok?: boolean; error?: string } | undefined;
const issues = (t: TFn, e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  t("err.invalid", { fields: [...new Set(e.issues.map((i) => t(`field.${String(i.path[0])}` as TKey)))].join(", ") });
const rule = (t: TFn, r: RuleError) => ({ error: t(r.key, r.params) });
const refreshAll = (flockId?: string) => { for (const p of ["/dashboard", "/flocks", "/sheds", "/daily-logs", "/movements"]) revalidatePath(p); if (flockId) revalidatePath(`/flocks/${flockId}`); };

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const { t } = await getT();
  const p = loginSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: t("auth.enterBoth") };
  const u = await doLogin(p.data.phone, p.data.password);
  if (!u) return { error: t("auth.invalid") };
  redirect("/dashboard");
}
export async function logoutAction() { await doLogout(); redirect("/login"); }

/* ── Sheds ─────────────────────────────────────────────────────── */
export async function saveShedAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = shedSchema.safeParse({ ...formToObject(fd), hasSensors: fd.get("hasSensors") === "on" });
  if (!p.success) return { error: issues(t, p.error) };
  const dup = await prisma.shed.findUnique({ where: { shedName: p.data.shedName } });
  if (dup && dup.id !== id) return { error: t("err.shedExists") };
  if (id) {
    const old = await prisma.shed.findUniqueOrThrow({ where: { id } });
    const housed = await shedOccupancy(id);
    if (p.data.capacity < housed) return { error: t("err.capacityBelowHoused", { n: housed }) };
    const shed = await prisma.shed.update({ where: { id }, data: p.data });
    await audit(user.id, "sheds", id, "UPDATE", old, shed);
  } else {
    const shed = await prisma.shed.create({ data: p.data });
    await audit(user.id, "sheds", shed.id, "CREATE", null, shed);
  }
  refreshAll(); return { ok: true };
}
export async function deleteShedAction(id: string): Promise<ActionState> {
  const user = await requireUser("records"); const { t } = await getT();
  if (await prisma.flock.count({ where: { shedId: id } })) return { error: t("err.shedHasFlocks") };
  const old = await prisma.shed.delete({ where: { id } });
  await audit(user.id, "sheds", id, "DELETE", old, null);
  refreshAll(); return { ok: true };
}

/* ── Flocks ────────────────────────────────────────────────────── */
export async function saveFlockAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = flockSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const shed = await prisma.shed.findUnique({ where: { id: p.data.shedId } });
  if (!shed) return { error: t("err.shedNotFound") };
  const dup = await prisma.flock.findUnique({ where: { flockName: p.data.flockName } });
  if (dup && dup.id !== id) return { error: t("err.flockExists") };
  const existing = id ? await prisma.flock.findUniqueOrThrow({ where: { id }, include: { birdMovements: true } }) : null;
  const ownBirds = existing && existing.shedId === shed.id ? currentQuantity(existing.initialQuantity, existing.birdMovements) : 0;
  const cap = validateShedCapacity(shed.capacity, (await shedOccupancy(shed.id)) - ownBirds, existing ? p.data.initialQuantity - (existing.initialQuantity - ownBirds) : p.data.initialQuantity);
  if (!cap.ok) return rule(t, cap);
  if (existing && p.data.initialQuantity - (existing.initialQuantity - ownBirds) < 0) return { error: t("err.qtyBelowRemoved") };
  const data = { ...p.data, intakeDate: toDate(p.data.intakeDate) };
  const flock = existing ? await prisma.flock.update({ where: { id: id! }, data }) : await prisma.flock.create({ data });
  await prisma.shed.update({ where: { id: shed.id }, data: { status: "OCCUPIED" } });
  if (existing && existing.shedId !== shed.id && (await shedOccupancy(existing.shedId)) === 0) await prisma.shed.update({ where: { id: existing.shedId }, data: { status: "EMPTY" } });
  await audit(user.id, "flocks", flock.id, existing ? "UPDATE" : "CREATE", existing, flock);
  refreshAll(flock.id); return { ok: true };
}
export async function closeFlockAction(flockId: string) {
  const user = await requireUser("records");
  const old = await prisma.flock.findUniqueOrThrow({ where: { id: flockId } });
  const flock = await prisma.flock.update({ where: { id: flockId }, data: { status: "COMPLETED", closedAt: new Date() } });
  if ((await shedOccupancy(flock.shedId)) === 0) await prisma.shed.update({ where: { id: flock.shedId }, data: { status: "CLEANING" } });
  await audit(user.id, "flocks", flockId, "UPDATE", old, flock);
  refreshAll(flockId);
}

/* ── Daily logs ────────────────────────────────────────────────── */
export async function saveDailyLogAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records"); const { t } = await getT();
  const p = dailyLogSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const { mortality, date, ...data } = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: data.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: t("err.flockInactive") };
  if (toDate(date) < flock.intakeDate) return { error: t("err.dateBeforeIntake") };
  if (data.eggsBroken > data.eggsCollected) return { error: t("err.brokenExceeds") };
  if (mortality > 0) { const v = validateMovement(flock.initialQuantity, flock.birdMovements, mortality); if (!v.ok) return rule(t, v); }
  const existing = await prisma.dailyLog.findUnique({ where: { flockId_date: { flockId: data.flockId, date: toDate(date) } } });
  const log = existing
    ? await prisma.dailyLog.update({ where: { id: existing.id }, data: { ...data, recordedById: user.id } })
    : await prisma.dailyLog.create({ data: { ...data, date: toDate(date), recordedById: user.id } });
  await audit(user.id, "daily_logs", log.id, existing ? "UPDATE" : "CREATE", existing, log);
  if (mortality > 0) {
    const mv = await prisma.birdMovement.create({ data: { flockId: data.flockId, date: toDate(date), movementType: "MORTALITY", quantity: mortality, cause: "UNKNOWN", notes: "From daily log" } });
    await audit(user.id, "bird_movements", mv.id, "CREATE", null, mv);
  }
  refreshAll(data.flockId); return { ok: true };
}
export async function deleteDailyLogAction(id: string): Promise<ActionState> {
  const user = await requireUser("records");
  const old = await prisma.dailyLog.delete({ where: { id } });
  await audit(user.id, "daily_logs", id, "DELETE", old, null);
  refreshAll(old.flockId); return { ok: true };
}

/* ── Bird movements ────────────────────────────────────────────── */
export async function saveMovementAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = birdMovementSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const d = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: d.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: t("err.flockInactive") };
  if (toDate(d.date) < flock.intakeDate) return { error: t("err.dateBeforeIntake") };
  const others = flock.birdMovements.filter((m) => m.id !== id);
  const v = validateMovement(flock.initialQuantity, others, d.quantity);
  if (!v.ok) return rule(t, v);
  if (d.movementType === "SALE" && flock.flockType === "BROILER" && !d.averageWeightG) return { error: t("err.weightRequired") };
  const data = { ...d, date: toDate(d.date), cause: d.cause ?? null, averageWeightG: d.averageWeightG ?? null, notes: d.notes ?? null };
  const old = id ? await prisma.birdMovement.findUniqueOrThrow({ where: { id } }) : null;
  const mv = old ? await prisma.birdMovement.update({ where: { id: id! }, data }) : await prisma.birdMovement.create({ data });
  await audit(user.id, "bird_movements", mv.id, old ? "UPDATE" : "CREATE", old, mv);
  if (currentQuantity(flock.initialQuantity, [...others, mv]) === 0) await closeFlockAction(flock.id);
  refreshAll(d.flockId); return { ok: true };
}
export async function deleteMovementAction(id: string): Promise<ActionState> {
  const user = await requireUser("records");
  const old = await prisma.birdMovement.delete({ where: { id } });
  await audit(user.id, "bird_movements", id, "DELETE", old, null);
  refreshAll(old.flockId); return { ok: true };
}

/* ── Profile & users ───────────────────────────────────────────── */
import bcrypt from "bcryptjs";
import { passwordSchema, profileSchema, userAdminSchema } from "./validation";
import { refreshSession } from "./auth";

export async function updateProfileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser(); const { t } = await getT();
  const p = profileSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const dup = await prisma.user.findUnique({ where: { phone: p.data.phone } });
  if (dup && dup.id !== user.id) return { error: t("err.phoneInUse") };
  const old = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const updated = await prisma.user.update({ where: { id: user.id }, data: p.data });
  await audit(user.id, "users", user.id, "UPDATE", { fullName: old.fullName, phone: old.phone, language: old.language, theme: old.theme }, p.data);
  await refreshSession(updated.id);
  (await cookies()).set(THEME_COOKIE, p.data.theme, { sameSite: "lax", path: "/", maxAge: 365 * 86400 });
  revalidatePath("/", "layout"); return { ok: true };
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser(); const { t } = await getT();
  const p = passwordSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await bcrypt.compare(p.data.currentPassword, row.passwordHash))) return { error: t("err.wrongPassword") };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(p.data.newPassword, 10) } });
  await audit(user.id, "users", user.id, "UPDATE", null, { passwordChanged: true });
  return { ok: true };
}

export async function saveUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireUser("admin"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = userAdminSchema.safeParse({ ...formToObject(fd), isActive: fd.get("isActive") === "on" });
  if (!p.success) return { error: issues(t, p.error) };
  const { password, ...data } = p.data;
  const dup = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (dup && dup.id !== id) return { error: t("err.phoneInUse") };
  if (id === admin.id && (data.role !== "OWNER" || !data.isActive)) return { error: t("err.selfDemote") };
  if (id) {
    const old = await prisma.user.findUniqueOrThrow({ where: { id } });
    await prisma.user.update({ where: { id }, data: { ...data, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) } });
    await audit(admin.id, "users", id, "UPDATE", { ...old, passwordHash: undefined }, { ...data, passwordReset: !!password });
    if (id === admin.id) await refreshSession(id);
  } else {
    if (!password) return { error: t("err.pwRequired") };
    const user = await prisma.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 10) } });
    await audit(admin.id, "users", user.id, "CREATE", null, data);
  }
  revalidatePath("/users"); return { ok: true };
}

export async function toggleUserActiveAction(id: string): Promise<ActionState> {
  const admin = await requireUser("admin"); const { t } = await getT();
  if (id === admin.id) return { error: t("err.selfDeactivate") };
  const old = await prisma.user.findUniqueOrThrow({ where: { id } });
  const user = await prisma.user.update({ where: { id }, data: { isActive: !old.isActive } });
  await audit(admin.id, "users", id, "UPDATE", { isActive: old.isActive }, { isActive: user.isActive });
  revalidatePath("/users"); return { ok: true };
}

/* ── Finance: sales & purchases ────────────────────────────────── */
import { contactSchema, healthLogSchema, transactionSchema } from "./validation";
import { lineAmount, normalisePayment } from "./domain/finance";
import { getSettingNumber } from "./settings";

const refreshFinance = (flockId?: string | null) => { for (const p of ["/finance", "/contacts", "/health", "/dashboard", "/movements"]) revalidatePath(p); if (flockId) revalidatePath(`/flocks/${flockId}`); };
const eggsFromUnit = async (qty: number, unit?: string | null) => unit === "TRAY" ? Math.round(qty * (await getSettingNumber("eggs.trayCount"))) : unit === "DOZEN" ? Math.round(qty * 12) : Math.round(qty);

/** Keep egg/bird stock movements in sync with an INCOME transaction. */
async function syncSaleMovements(txId: string, d: { type: string; category: string; date: Date; quantity?: number | null; unit?: string | null; flockId?: string | null; unitPriceAfn?: number | null }, t: TFn): Promise<string | null> {
  const wantBird = d.type === "INCOME" && d.category === "BIRD_SALE" && !!d.quantity && !!d.flockId;
  const wantEgg = d.type === "INCOME" && d.category === "EGG_SALE" && !!d.quantity;
  const existingBird = await prisma.birdMovement.findUnique({ where: { linkedTransactionId: txId } });
  const existingEgg = await prisma.eggStockMovement.findUnique({ where: { linkedTransactionId: txId } });
  if (wantBird) {
    const qty = d.quantity!; if (!Number.isInteger(qty)) return t("err.birdSaleQty");
    const flock = await prisma.flock.findUnique({ where: { id: d.flockId! }, include: { birdMovements: true } });
    if (!flock) return t("err.flockInactive");
    const v = validateMovement(flock.initialQuantity, flock.birdMovements.filter((m) => m.id !== existingBird?.id), qty);
    if (!v.ok) return t(v.key, v.params);
    const data = { flockId: d.flockId!, date: d.date, movementType: "SALE", quantity: qty, cause: "MARKET_READY", linkedTransactionId: txId, notes: "From sale" };
    if (existingBird) await prisma.birdMovement.update({ where: { id: existingBird.id }, data }); else await prisma.birdMovement.create({ data });
  } else if (existingBird) await prisma.birdMovement.delete({ where: { id: existingBird.id } });
  if (wantEgg) {
    const data = { date: d.date, movementType: "SALE", quantityEggs: await eggsFromUnit(d.quantity!, d.unit), flockId: d.flockId ?? null, linkedTransactionId: txId };
    if (existingEgg) await prisma.eggStockMovement.update({ where: { id: existingEgg.id }, data }); else await prisma.eggStockMovement.create({ data });
  } else if (existingEgg) await prisma.eggStockMovement.delete({ where: { id: existingEgg.id } });
  return null;
}

export async function saveTransactionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("finance"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = transactionSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const d = p.data;
  const amount = lineAmount(d.quantity, d.unitPriceAfn, d.amountAfn);
  if (amount <= 0) return { error: t("err.amountRequired") };
  if (d.type === "INCOME" && d.category === "BIRD_SALE" && d.quantity && !d.flockId) return { error: t("err.saleNeedsFlock") };
  const pay = normalisePayment(amount, d.paymentStatus, d.amountPaidAfn);
  const data = { type: d.type, category: d.category, date: toDate(d.date), quantity: d.quantity ?? null, unit: d.unit ?? null, unitPriceAfn: d.unitPriceAfn ?? null, amountAfn: amount,
    flockId: d.flockId ?? null, contactId: d.contactId ?? null, paymentStatus: pay.status, amountPaidAfn: pay.paid, dueDate: d.dueDate ? toDate(d.dueDate) : null, description: d.description ?? null };
  const old = id ? await prisma.transaction.findUnique({ where: { id } }) : null;
  if (id && !old) return { error: t("err.notFound") };
  const tx = old ? await prisma.transaction.update({ where: { id: id! }, data }) : await prisma.transaction.create({ data });
  const err = await syncSaleMovements(tx.id, data, t);
  if (err) { if (!old) await prisma.transaction.delete({ where: { id: tx.id } }); else await prisma.transaction.update({ where: { id: tx.id }, data: old }); return { error: err }; }
  await audit(user.id, "transactions", tx.id, old ? "UPDATE" : "CREATE", old, tx);
  refreshFinance(data.flockId); return { ok: true };
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  const user = await requireUser("finance"); const { t } = await getT();
  const old = await prisma.transaction.findUnique({ where: { id } });
  if (!old) return { error: t("err.notFound") };
  await prisma.birdMovement.deleteMany({ where: { linkedTransactionId: id } });
  await prisma.eggStockMovement.deleteMany({ where: { linkedTransactionId: id } });
  await prisma.healthLog.updateMany({ where: { transactionId: id }, data: { transactionId: null } });
  await prisma.transaction.delete({ where: { id } });
  await audit(user.id, "transactions", id, "DELETE", old, null);
  refreshFinance(old.flockId); return { ok: true };
}

/* ── Contacts ──────────────────────────────────────────────────── */
export async function saveContactAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("finance"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = contactSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const data = { ...p.data, phone: p.data.phone ?? null, address: p.data.address ?? null, notes: p.data.notes ?? null };
  const old = id ? await prisma.contact.findUnique({ where: { id } }) : null;
  const c = old ? await prisma.contact.update({ where: { id: id! }, data }) : await prisma.contact.create({ data });
  await audit(user.id, "contacts", c.id, old ? "UPDATE" : "CREATE", old, c);
  refreshFinance(); return { ok: true };
}
export async function deleteContactAction(id: string): Promise<ActionState> {
  const user = await requireUser("finance"); const { t } = await getT();
  if (await prisma.transaction.count({ where: { contactId: id } })) return { error: t("err.contactHasTx") };
  await prisma.healthLog.updateMany({ where: { contactId: id }, data: { contactId: null } });
  const old = await prisma.contact.delete({ where: { id } });
  await audit(user.id, "contacts", id, "DELETE", old, null);
  refreshFinance(); return { ok: true };
}

/* ── Health: vet visits, check-ups, vaccines ───────────────────── */
export async function saveHealthLogAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("health"); const { t } = await getT();
  const id = (fd.get("id") as string) || null;
  const p = healthLogSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(t, p.error) };
  const d = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: d.flockId } });
  if (!flock) return { error: t("err.flockInactive") };
  const old = id ? await prisma.healthLog.findUnique({ where: { id } }) : null;
  if (id && !old) return { error: t("err.notFound") };
  const done = !!d.administeredDate;
  const data = { flockId: d.flockId, type: d.type, productName: d.productName, scheduledDate: toDate(d.scheduledDate), administeredDate: done ? toDate(d.administeredDate!) : null,
    method: d.method ?? null, contactId: d.contactId ?? null, notes: d.notes ?? null, status: done ? "DONE" : "PENDING" };
  const log = old ? await prisma.healthLog.update({ where: { id: id! }, data }) : await prisma.healthLog.create({ data });
  // cost → expense transaction (VET_VISIT for visits/check-ups, MEDICINE otherwise), kept in sync
  const cost = d.costAfn ?? 0;
  if (cost > 0) {
    const txData = { type: "EXPENSE", category: d.type === "VET_VISIT" || d.type === "CHECKUP" ? "VET_VISIT" : "MEDICINE", date: toDate(d.administeredDate ?? d.scheduledDate), amountAfn: cost, amountPaidAfn: cost, paymentStatus: "PAID",
      flockId: d.flockId, contactId: d.contactId ?? null, unit: "VISIT", quantity: 1, unitPriceAfn: cost, description: d.productName };
    if (log.transactionId) await prisma.transaction.update({ where: { id: log.transactionId }, data: txData });
    else { const tx = await prisma.transaction.create({ data: txData }); await prisma.healthLog.update({ where: { id: log.id }, data: { transactionId: tx.id } }); }
  } else if (log.transactionId) { await prisma.healthLog.update({ where: { id: log.id }, data: { transactionId: null } }); await prisma.transaction.delete({ where: { id: log.transactionId } }); }
  await audit(user.id, "health_logs", log.id, old ? "UPDATE" : "CREATE", old, log);
  refreshFinance(d.flockId); return { ok: true };
}
export async function markHealthDoneAction(id: string): Promise<ActionState> {
  const user = await requireUser("health"); const { t } = await getT();
  const old = await prisma.healthLog.findUnique({ where: { id } });
  if (!old) return { error: t("err.notFound") };
  const log = await prisma.healthLog.update({ where: { id }, data: { status: "DONE", administeredDate: toDate(todayStr()) } });
  await audit(user.id, "health_logs", id, "UPDATE", old, log);
  refreshFinance(old.flockId); return { ok: true };
}
export async function deleteHealthLogAction(id: string): Promise<ActionState> {
  const user = await requireUser("health"); const { t } = await getT();
  const old = await prisma.healthLog.findUnique({ where: { id } });
  if (!old) return { error: t("err.notFound") };
  await prisma.healthLog.delete({ where: { id } });
  if (old.transactionId) await prisma.transaction.delete({ where: { id: old.transactionId } });
  await audit(user.id, "health_logs", id, "DELETE", old, null);
  refreshFinance(old.flockId); return { ok: true };
}

/* ── Theme ─────────────────────────────────────────────────────── */
export async function setThemeAction(theme: string) {
  if (!isTheme(theme)) return;
  (await cookies()).set(THEME_COOKIE, theme, { sameSite: "lax", path: "/", maxAge: 365 * 86400 });
  const u = await getSession();
  if (u) await prisma.user.update({ where: { id: u.id }, data: { theme } });
  revalidatePath("/", "layout");
}
