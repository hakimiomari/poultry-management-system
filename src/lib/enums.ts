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
// Finance (SPEC Entity 4 + 12)
export const TX_TYPES = ["INCOME", "EXPENSE"] as const;
export const EXPENSE_CATEGORIES = ["FEED", "CHICKS", "MEDICINE", "VITAMINS", "EQUIPMENT", "VET_VISIT", "LABOR", "UTILITIES", "TRANSPORT", "OTHER"] as const;
export const INCOME_CATEGORIES = ["EGG_SALE", "BIRD_SALE", "MANURE_SALE", "EQUIPMENT_SALE", "OTHER_SALE"] as const;
export const TX_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;
export const PAYMENT_STATUSES = ["PAID", "CREDIT", "PARTIAL"] as const;
export const UNITS = ["KG", "BAG", "PIECE", "TRAY", "DOZEN", "LITER", "BOX", "VISIT", "OTHER"] as const;
export const CONTACT_TYPES = ["FEED_SUPPLIER", "CHICK_SUPPLIER", "MEDICINE_SUPPLIER", "EQUIPMENT_SUPPLIER", "VETERINARIAN", "EGG_BUYER", "MEAT_BUYER", "OTHER"] as const;
// Health (SPEC Entity 3)
export const HEALTH_TYPES = ["VACCINE", "MEDICATION", "TREATMENT", "VET_VISIT", "CHECKUP"] as const;
export const HEALTH_METHODS = ["WATER", "SPRAY", "INJECTION", "EYE_DROP", "FEED"] as const;
export const HEALTH_STATUSES = ["PENDING", "DONE", "MISSED"] as const;

export type Role = (typeof ROLES)[number];
export type FlockType = (typeof FLOCK_TYPES)[number];
export type MovementType = (typeof MOVEMENT_TYPES)[number];

/** Role permission matrix (SPEC Entity 11). */
export const PERMISSIONS: Record<Role, readonly string[]> = {
  OWNER: ["records", "reports", "alerts", "finance", "health", "admin"],
  FARM_MANAGER: ["records", "reports", "alerts", "health", "finance:read"],
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
