import { prisma } from "./db";

export async function audit(userId: string | null, tableName: string, recordId: string, action: "CREATE" | "UPDATE" | "DELETE", oldValue?: unknown, newValue?: unknown) {
  await prisma.auditLog.create({ data: { userId, tableName, recordId, action,
    oldValue: oldValue ? JSON.stringify(oldValue) : null, newValue: newValue ? JSON.stringify(newValue) : null } });
}
