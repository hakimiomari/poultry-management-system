// Core of the field-entry writes (daily logs, bird movements). One implementation, two callers:
// the server actions (online forms) and /api/sync (entries recorded on a phone with no connection).
// Not a "use server" file on purpose: these take the user as an argument and must never be callable from the browser.
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { audit } from "./audit";
import type { SessionUser } from "./auth";
import { birdMovementSchema, dailyLogSchema } from "./validation";
import { validateMovement, currentQuantity, type RuleError } from "./domain/population";
import { shedOccupancy } from "./services/flocks";
import { toDate } from "./format";
import type { TFn, TKey } from "./i18n";

type Result = { ok?: boolean; error?: string } | undefined; // same shape as ActionState in actions.ts

export const issues = (t: TFn, e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  t("err.invalid", { fields: [...new Set(e.issues.map((i) => t(`field.${String(i.path[0])}` as TKey)))].join(", ") });
export const rule = (t: TFn, r: RuleError) => ({ error: t(r.key, r.params) });
export const refreshAll = (flockId?: string) => { for (const p of ["/dashboard", "/flocks", "/sheds", "/daily-logs", "/movements"]) revalidatePath(p); if (flockId) revalidatePath(`/flocks/${flockId}`); };

export async function closeFlock(user: SessionUser, flockId: string) {
  const old = await prisma.flock.findUniqueOrThrow({ where: { id: flockId } });
  const flock = await prisma.flock.update({ where: { id: flockId }, data: { status: "COMPLETED", closedAt: new Date() } });
  if ((await shedOccupancy(flock.shedId)) === 0) await prisma.shed.update({ where: { id: flock.shedId }, data: { status: "CLEANING" } });
  await audit(user.id, "flocks", flockId, "UPDATE", old, flock);
  refreshAll(flockId);
}

/**
 * Save a daily log (one per flock per day; an existing day is updated). Deaths become a MORTALITY movement.
 * `clientId` is the id an offline entry was given on the phone. It becomes the id of the deaths movement,
 * so an entry that is sent twice (the reply was lost) does not count its deaths twice.
 */
export async function applyDailyLog(user: SessionUser, t: TFn, input: Record<string, unknown>, clientId?: string): Promise<Result> {
  const p = dailyLogSchema.safeParse(input);
  if (!p.success) return { error: issues(t, p.error) };
  const { mortality, date, ...data } = p.data;
  const flock = await prisma.flock.findUnique({ where: { id: data.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: t("err.flockInactive") };
  if (toDate(date) < flock.intakeDate) return { error: t("err.dateBeforeIntake") };
  if (data.eggsBroken > data.eggsCollected) return { error: t("err.brokenExceeds") };
  const deathsAlreadySaved = !!clientId && flock.birdMovements.some((m) => m.id === clientId);
  const deaths = deathsAlreadySaved ? 0 : mortality;
  if (deaths > 0) { const v = validateMovement(flock.initialQuantity, flock.birdMovements, deaths); if (!v.ok) return rule(t, v); }
  const existing = await prisma.dailyLog.findUnique({ where: { flockId_date: { flockId: data.flockId, date: toDate(date) } } });
  const log = existing
    ? await prisma.dailyLog.update({ where: { id: existing.id }, data: { ...data, recordedById: user.id } })
    : await prisma.dailyLog.create({ data: { ...data, date: toDate(date), recordedById: user.id } });
  await audit(user.id, "daily_logs", log.id, existing ? "UPDATE" : "CREATE", existing, log);
  if (deaths > 0) {
    const mv = await prisma.birdMovement.create({ data: { ...(clientId ? { id: clientId } : {}), flockId: data.flockId, date: toDate(date), movementType: "MORTALITY", quantity: deaths, cause: "UNKNOWN", notes: "From daily log" } });
    await audit(user.id, "bird_movements", mv.id, "CREATE", null, mv);
  }
  refreshAll(data.flockId); return { ok: true };
}

/**
 * Create a bird movement, or update one when `input.id` is set.
 * `clientId` (offline entries) becomes the new movement's id, so sending the same entry twice creates it once.
 */
export async function applyMovement(user: SessionUser, t: TFn, input: Record<string, unknown>, clientId?: string): Promise<Result> {
  const id = typeof input.id === "string" && input.id ? input.id : null;
  const p = birdMovementSchema.safeParse(input);
  if (!p.success) return { error: issues(t, p.error) };
  const d = p.data;
  if (!id && clientId && (await prisma.birdMovement.findUnique({ where: { id: clientId }, select: { id: true } }))) return { ok: true }; // already received
  const flock = await prisma.flock.findUnique({ where: { id: d.flockId }, include: { birdMovements: true } });
  if (!flock || flock.status !== "ACTIVE") return { error: t("err.flockInactive") };
  if (toDate(d.date) < flock.intakeDate) return { error: t("err.dateBeforeIntake") };
  const others = flock.birdMovements.filter((m) => m.id !== id);
  const v = validateMovement(flock.initialQuantity, others, d.quantity);
  if (!v.ok) return rule(t, v);
  if (d.movementType === "SALE" && flock.flockType === "BROILER" && !d.averageWeightG) return { error: t("err.weightRequired") };
  const data = { ...d, date: toDate(d.date), cause: d.cause ?? null, averageWeightG: d.averageWeightG ?? null, notes: d.notes ?? null };
  const old = id ? await prisma.birdMovement.findUnique({ where: { id } }) : null;
  if (id && !old) return { error: t("err.notFound") }; // edited offline, deleted by someone else meanwhile
  const mv = old ? await prisma.birdMovement.update({ where: { id: id! }, data }) : await prisma.birdMovement.create({ data: { ...(clientId ? { id: clientId } : {}), ...data } });
  await audit(user.id, "bird_movements", mv.id, old ? "UPDATE" : "CREATE", old, mv);
  if (currentQuantity(flock.initialQuantity, [...others, mv]) === 0) await closeFlock(user, flock.id);
  refreshAll(d.flockId); return { ok: true };
}
