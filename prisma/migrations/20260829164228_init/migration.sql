-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'EN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sheds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shedName" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "shedType" TEXT NOT NULL,
    "hasSensors" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'EMPTY',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "flocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockName" TEXT NOT NULL,
    "flockType" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "shedId" TEXT NOT NULL,
    "intakeDate" DATETIME NOT NULL,
    "initialQuantity" INTEGER NOT NULL,
    "initialAvgWeightG" REAL NOT NULL DEFAULT 40,
    "chickCostAfn" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "flocks_shedId_fkey" FOREIGN KEY ("shedId") REFERENCES "sheds" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "feedConsumedKg" REAL NOT NULL DEFAULT 0,
    "waterConsumedL" REAL,
    "eggsCollected" INTEGER NOT NULL DEFAULT 0,
    "eggsBroken" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "recordedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_logs_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_logs_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bird_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cause" TEXT,
    "averageWeightG" REAL,
    "linkedTransactionId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bird_movements_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bird_movements_linkedTransactionId_fkey" FOREIGN KEY ("linkedTransactionId") REFERENCES "transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "health_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "scheduledDate" DATETIME NOT NULL,
    "administeredDate" DATETIME,
    "type" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    CONSTRAINT "health_logs_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "contactType" TEXT NOT NULL,
    "outstandingBalanceAfn" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountAfn" REAL NOT NULL,
    "flockId" TEXT,
    "contactId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
    "amountPaidAfn" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "environment_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shedId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "temperatureC" REAL NOT NULL,
    "humidityPercent" REAL,
    "ammoniaPpm" REAL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    CONSTRAINT "environment_logs_shedId_fkey" FOREIGN KEY ("shedId") REFERENCES "sheds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feed_stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedName" TEXT NOT NULL,
    "feedStage" TEXT NOT NULL,
    "currentStockKg" REAL NOT NULL DEFAULT 0,
    "reorderLevelKg" REAL NOT NULL DEFAULT 0,
    "unitCostAfn" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "feed_stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "feedId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantityKg" REAL NOT NULL,
    "flockId" TEXT,
    CONSTRAINT "feed_stock_movements_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "feed_stock" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feed_stock_movements_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "egg_stock_movements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantityEggs" INTEGER NOT NULL,
    "grade" TEXT,
    "flockId" TEXT,
    "linkedTransactionId" TEXT,
    CONSTRAINT "egg_stock_movements_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "egg_stock_movements_linkedTransactionId_fkey" FOREIGN KEY ("linkedTransactionId") REFERENCES "transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "weight_samples" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flockId" TEXT NOT NULL,
    "sampleDate" DATETIME NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "averageWeightG" REAL NOT NULL,
    "uniformityPercent" REAL,
    CONSTRAINT "weight_samples_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "flocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "breed_standards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "breed" TEXT NOT NULL,
    "flockType" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "targetWeightG" REAL,
    "cumulativeFeedG" REAL,
    "targetProduction" REAL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assignedToId" TEXT,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" DATETIME,
    CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "sheds_shedName_key" ON "sheds"("shedName");

-- CreateIndex
CREATE UNIQUE INDEX "flocks_flockName_key" ON "flocks"("flockName");

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_flockId_date_key" ON "daily_logs"("flockId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bird_movements_linkedTransactionId_key" ON "bird_movements"("linkedTransactionId");

-- CreateIndex
CREATE INDEX "bird_movements_flockId_date_idx" ON "bird_movements"("flockId", "date");

-- CreateIndex
CREATE INDEX "health_logs_flockId_scheduledDate_idx" ON "health_logs"("flockId", "scheduledDate");

-- CreateIndex
CREATE INDEX "environment_logs_shedId_timestamp_idx" ON "environment_logs"("shedId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "feed_stock_feedName_key" ON "feed_stock"("feedName");

-- CreateIndex
CREATE UNIQUE INDEX "egg_stock_movements_linkedTransactionId_key" ON "egg_stock_movements"("linkedTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "breed_standards_breed_week_key" ON "breed_standards"("breed", "week");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_recordId_idx" ON "audit_logs"("tableName", "recordId");
