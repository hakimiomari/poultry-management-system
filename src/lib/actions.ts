"use server";
// All writes: validate (zod) → business rules (domain) → persist → audit → revalidate.
// Actions return { ok } / { error } so dialogs can close in place; only login redirects.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { audit } from "./audit";
import { login as doLogin, logout as doLogout, requireUser } from "./auth";
import { birdMovementSchema, dailyLogSchema, flockSchema, formToObject, loginSchema, shedSchema } from "./validation";
import { validateMovement, validateShedCapacity, currentQuantity } from "./domain/population";
import { shedOccupancy } from "./services/flocks";
import { toDate } from "./format";

export type ActionState = { ok?: boolean; error?: string } | undefined;
const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) => e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
const refreshAll = (flockId?: string) => { for (const p of ["/dashboard", "/flocks", "/sheds", "/daily-logs", "/movements"]) revalidatePath(p); if (flockId) revalidatePath(`/flocks/${flockId}`); };

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = loginSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: "Enter phone and password" };
  const u = await doLogin(p.data.phone, p.data.password);
  if (!u) return { error: "Invalid phone or password" };
  redirect("/dashboard");
}
export async function logoutAction() { await doLogout(); redirect("/login"); }

/* ── Sheds ─────────────────────────────────────────────────────── */
export async function saveShedAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records");
  const id = (fd.get("id") as string) || null;
  const p = shedSchema.safeParse({ ...formToObject(fd), hasSensors: fd.get("hasSensors") === "on" });
  if (!p.success) return { error: issues(p.error) };
  const dup = await prisma.shed.findUnique({ where: { shedName: p.data.shedName } });
  if (dup && dup.id !== id) return { error: "Shed name already exists" };
  if (id) {
    const old = await prisma.shed.findUniqueOrThrow({ where: { id } });
    const housed = await shedOccupancy(id);
    if (p.data.capacity < housed) return { error: `Capacity cannot be below the ${housed} birds currently housed` };
    const shed = await prisma.shed.update({ where: { id }, data: p.data });
    await audit(user.id, "sheds", id, "UPDATE", old, shed);
  } else {
    const shed = await prisma.shed.create({ data: p.data });
    await audit(user.id, "sheds", shed.id, "CREATE", null, shed);
  }
  refreshAll(); return { ok: true };
}
export async function deleteShedAction(id: string): Promise<ActionState> {
  const user = await requireUser("records");
  if (await prisma.flock.count({ where: { shedId: id } })) return { error: "Shed has flocks assigned; cannot delete" };
  const old = await prisma.shed.delete({ where: { id } });
  await audit(user.id, "sheds", id, "DELETE", old, null);
  refreshAll(); return { ok: true };
}

/* ── Flocks ────────────────────────────────────────────────────── */
export async function saveFlockAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records");
  const id = (fd.get("id") as string) || null;
  const p = flockSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(p.error) };
  const shed = await prisma.shed.findUnique({ where: { id: p.data.shedId } });
  if (!shed) return { error: "Shed not found" };
  const dup = await prisma.flock.findUnique({ where: { flockName: p.data.flockName } });
  if (dup && dup.id !== id) return { error: "Flock name already exists" };
  const existing = id ? await prisma.flock.findUniqueOrThrow({ where: { id }, include: { birdMovements: true } }) : null;
  const ownBirds = existing && existing.shedId === shed.id ? currentQuantity(existing.initialQuantity, existing.birdMovements) : 0;
  const cap = validateShedCapacity(shed.capacity, (await shedOccupancy(shed.id)) - ownBirds, existing ? p.data.initialQuantity - (existing.initialQuantity - ownBirds) : p.data.initialQuantity);
  if (!cap.ok) return { error: cap.error };
  if (existing && p.data.initialQuantity - (existing.initialQuantity - ownBirds) < 0) return { error: "Initial quantity is below birds already removed" };
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
  const user = await requireUser("records");
  const p = dailyLogSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(p.error) };
  const { mortality, date, ...data } = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: data.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: "Flock not found or not active" };
  if (toDate(date) < flock.intakeDate) return { error: "Date is before flock intake date" };
  if (data.eggsBroken > data.eggsCollected) return { error: "Broken eggs cannot exceed collected eggs" };
  if (mortality > 0) { const v = validateMovement(flock.initialQuantity, flock.birdMovements, mortality); if (!v.ok) return { error: v.error }; }
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
  const user = await requireUser("records");
  const id = (fd.get("id") as string) || null;
  const p = birdMovementSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: issues(p.error) };
  const d = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: d.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: "Flock not found or not active" };
  if (toDate(d.date) < flock.intakeDate) return { error: "Date is before flock intake date" };
  const others = flock.birdMovements.filter((m) => m.id !== id);
  const v = validateMovement(flock.initialQuantity, others, d.quantity);
  if (!v.ok) return { error: v.error };
  if (d.movementType === "SALE" && flock.flockType === "BROILER" && !d.averageWeightG) return { error: "Average weight is required for broiler sales" };
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
