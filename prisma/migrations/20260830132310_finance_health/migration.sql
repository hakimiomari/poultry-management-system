-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "dueDate" DATETIME;
ALTER TABLE "transactions" ADD COLUMN "quantity" REAL;
ALTER TABLE "transactions" ADD COLUMN "unit" TEXT;
ALTER TABLE "transactions" ADD COLUMN "unitPriceAfn" REAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "contactType" TEXT NOT NULL,
    "outstandingBalanceAfn" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_contacts" ("address", "contactType", "id", "name", "outstandingBalanceAfn", "phone") SELECT "address", "contactType", "id", "name", "outstandingBalanceAfn", "phone" FROM "contacts";
DROP TABLE "contacts";
ALTER TABLE "new_contacts" RENAME TO "contacts";
CREATE TABLE "new_health_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "administeredDate" DATETIME,
    "type" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "contactId" TEXT,
    "transactionId" TEXT,
    CONSTRAINT "health_logs_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "health_logs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "health_logs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_health_logs" ("administeredDate", "flockId", "id", "method", "notes", "productName", "scheduledDate", "status", "type") SELECT "administeredDate", "flockId", "id", "method", "notes", "productName", "scheduledDate", "status", "type" FROM "health_logs";
DROP TABLE "health_logs";
ALTER TABLE "new_health_logs" RENAME TO "health_logs";
CREATE UNIQUE INDEX "health_logs_transactionId_key" ON "health_logs"("transactionId");
CREATE INDEX "health_logs_flockId_scheduledDate_idx" ON "health_logs"("flockId", "scheduledDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "transactions_date_idx" ON "transactions"("date");
