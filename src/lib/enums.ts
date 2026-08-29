// All enums (SQLite has no native enum type). Display via i18n keys, never raw.
export const ROLES = ["OWNER", "FARM_MANAGER", "WORKER", "VETERINARIAN", "ACCOUNTANT"] as const;
export const LANGUAGES = ["EN", "FA_DARI", "PS_PASHTO"] as const;
export const SHED_TYPES = ["OPEN_SIDED", "CLOSED_ENVIRONMENT", "SEMI_CLOSED"] as const;
export const SHED_STATUSES = ["OCCUPIED", "EMPTY", "CLEANING", "MAINTENANCE"] as const;
export const FLOCK_TYPES = ["BROILER", "LAYER"] as const;
export const FLOCK_STATUSES = ["ACTIVE", "COMPLETED"] as const;
export const MOVEMENT_TYPES = ["MORTALITY", "CULL", "SALE", "TRANSFER", "THEFT_LOSS"] as const;
export const MOVEMENT_CAUSES = ["DISEASE", "HEAT", "INJURY", "PREDATOR", "LOW_PRODUCTION", "MARKET_READY", "UNKNOWN"] as const;
export const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE"] as const;

export type Role = (typeof ROLES)[number];
export type FlockType = (typeof FLOCK_TYPES)[number];
export type MovementType = (typeof MOVEMENT_TYPES)[number];

/** Role permission matrix (SPEC Entity 11). */
export const PERMISSIONS: Record<Role, readonly string[]> = {
  OWNER: ["records", "reports", "alerts", "finance", "health", "admin"],
  FARM_MANAGER: ["records", "reports", "alerts", "health"],
  WORKER: ["records"],
  VETERINARIAN: ["health", "records:read"],
  ACCOUNTANT: ["finance", "records:read"],
};

export function can(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role] ?? [];
  if (perms.includes(permission)) return true;
  if (permission.endsWith(":read")) return perms.includes(permission.replace(":read", ""));
  return false;
}
