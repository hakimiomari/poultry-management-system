"use server";
// All writes: validate (zod) → business rules (domain) → persist → audit → revalidate.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { audit } from "./audit";
import { login as doLogin, logout as doLogout, requireUser } from "./auth";
import { birdMovementSchema, dailyLogSchema, flockSchema, formToObject, loginSchema, shedSchema } from "./validation";
import { validateMovement, validateShedCapacity, currentQuantity } from "./domain/population";
import { shedOccupancy } from "./services/flocks";
import { toDate } from "./format";

export type ActionState = { error?: string } | undefined;

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const p = loginSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: "Enter phone and password" };
  const u = await doLogin(p.data.phone, p.data.password);
  if (!u) return { error: "Invalid phone or password" };
  redirect("/dashboard");
}
export async function logoutAction() { await doLogout(); redirect("/login"); }

export async function createShedAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records");
  const p = shedSchema.safeParse({ ...formToObject(fd), hasSensors: fd.get("hasSensors") === "on" });
  if (!p.success) return { error: p.error.issues.map((i) => i.message).join(", ") };
  if (await prisma.shed.findUnique({ where: { shedName: p.data.shedName } })) return { error: "Shed name already exists" };
  const shed = await prisma.shed.create({ data: p.data });
  await audit(user.id, "sheds", shed.id, "CREATE", null, shed);
  revalidatePath("/sheds"); redirect("/sheds");
}

export async function createFlockAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records");
  const p = flockSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: p.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") };
  const shed = await prisma.shed.findUnique({ where: { id: p.data.shedId } });
  if (!shed) return { error: "Shed not found" };
  const cap = validateShedCapacity(shed.capacity, await shedOccupancy(shed.id), p.data.initialQuantity);
  if (!cap.ok) return { error: cap.error };
  if (await prisma.flock.findUnique({ where: { flockName: p.data.flockName } })) return { error: "Flock name already exists" };
  const flock = await prisma.flock.create({ data: { ...p.data, intakeDate: toDate(p.data.intakeDate) } });
  await prisma.shed.update({ where: { id: shed.id }, data: { status: "OCCUPIED" } });
  await audit(user.id, "flocks", flock.id, "CREATE", null, flock);
  revalidatePath("/flocks"); revalidatePath("/dashboard"); redirect(`/flocks/${flock.id}`);
}

export async function closeFlockAction(flockId: string) {
  const user = await requireUser("records");
  const old = await prisma.flock.findUniqueOrThrow({ where: { id: flockId } });
  const flock = await prisma.flock.update({ where: { id: flockId }, data: { status: "COMPLETED", closedAt: new Date() } });
  if ((await shedOccupancy(flock.shedId)) === 0) await prisma.shed.update({ where: { id: flock.shedId }, data: { status: "CLEANING" } });
  await audit(user.id, "flocks", flockId, "UPDATE", old, flock);
  revalidatePath("/flocks"); revalidatePath("/dashboard"); revalidatePath(`/flocks/${flockId}`);
}

export async function createDailyLogAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records");
  const p = dailyLogSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: p.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") };
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
  revalidatePath("/daily-logs"); revalidatePath("/dashboard"); revalidatePath(`/flocks/${data.flockId}`);
  redirect(`/flocks/${data.flockId}`);
}

export async function createMovementAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireUser("records");
  const p = birdMovementSchema.safeParse(formToObject(fd));
  if (!p.success) return { error: p.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ") };
  const d = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: d.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: "Flock not found or not active" };
  if (toDate(d.date) < flock.intakeDate) return { error: "Date is before flock intake date" };
  const v = validateMovement(flock.initialQuantity, flock.birdMovements, d.quantity);
  if (!v.ok) return { error: v.error };
  if (d.movementType === "SALE" && flock.flockType === "BROILER" && !d.averageWeightG) return { error: "Average weight is required for broiler sales" };
  const mv = await prisma.birdMovement.create({ data: { ...d, date: toDate(d.date) } });
  await audit(user.id, "bird_movements", mv.id, "CREATE", null, mv);
  if (currentQuantity(flock.initialQuantity, [...flock.birdMovements, mv]) === 0) await closeFlockAction(flock.id);
  revalidatePath("/movements"); revalidatePath("/dashboard"); revalidatePath(`/flocks/${d.flockId}`);
  redirect(`/flocks/${d.flockId}`);
}

export async function deleteMovementAction(id: string) {
  const user = await requireUser("records");
  const old = await prisma.birdMovement.findUniqueOrThrow({ where: { id } });
  await prisma.birdMovement.delete({ where: { id } });
  await audit(user.id, "bird_movements", id, "DELETE", old, null);
  revalidatePath("/movements"); revalidatePath("/dashboard"); revalidatePath(`/flocks/${old.flockId}`);
}
