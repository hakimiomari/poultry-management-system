import { z } from "zod";
import { FLOCK_TYPES, MOVEMENT_CAUSES, MOVEMENT_TYPES, SHED_STATUSES, SHED_TYPES } from "./enums";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const shedSchema = z.object({
  shedName: z.string().min(1).max(60),
  capacity: z.coerce.number().int().positive(),
  shedType: z.enum(SHED_TYPES),
  hasSensors: z.coerce.boolean().default(false),
  status: z.enum(SHED_STATUSES).default("EMPTY"),
});

export const flockSchema = z.object({
  flockName: z.string().min(1).max(60),
  flockType: z.enum(FLOCK_TYPES),
  breed: z.string().min(1).max(60),
  shedId: z.string().uuid(),
  intakeDate: dateStr,
  initialQuantity: z.coerce.number().int().positive(),
  initialAvgWeightG: z.coerce.number().positive().default(40),
  chickCostAfn: z.coerce.number().min(0).default(0),
});

export const dailyLogSchema = z.object({
  flockId: z.string().uuid(),
  date: dateStr,
  feedConsumedKg: z.coerce.number().min(0).default(0),
  waterConsumedL: z.coerce.number().min(0).optional(),
  eggsCollected: z.coerce.number().int().min(0).default(0),
  eggsBroken: z.coerce.number().int().min(0).default(0),
  mortality: z.coerce.number().int().min(0).default(0), // convenience: creates a MORTALITY movement
  notes: z.string().max(500).optional(),
});

export const birdMovementSchema = z.object({
  flockId: z.string().uuid(),
  date: dateStr,
  movementType: z.enum(MOVEMENT_TYPES),
  quantity: z.coerce.number().int().positive(),
  cause: z.enum(MOVEMENT_CAUSES).optional(),
  averageWeightG: z.coerce.number().positive().optional(),
  notes: z.string().max(500).optional(),
});

export const loginSchema = z.object({ phone: z.string().min(5), password: z.string().min(1) });

/** Coerce FormData into a plain object (empty strings → undefined). */
export function formToObject(fd: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  fd.forEach((v, k) => { o[k] = v === "" ? undefined : v; });
  return o;
}
