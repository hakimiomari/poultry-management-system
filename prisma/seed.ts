// Demo data: 5 users, 3 sheds, 2 flocks (1 layer, 1 broiler), 30 days of logs & movements, breed standards, settings.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

const prisma = new PrismaClient();
const day = (offset: number) => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + offset); return d; };
// deterministic pseudo-random
let seed = 42; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
const ri = (min: number, max: number) => Math.floor(min + rnd() * (max - min + 1));

async function main() {
  await prisma.auditLog.deleteMany(); await prisma.eggStockMovement.deleteMany(); await prisma.contact.deleteMany(); await prisma.dailyLog.deleteMany(); await prisma.birdMovement.deleteMany();
  await prisma.healthLog.deleteMany(); await prisma.weightSample.deleteMany(); await prisma.transaction.deleteMany();
  await prisma.flock.deleteMany(); await prisma.shed.deleteMany(); await prisma.user.deleteMany();
  await prisma.breedStandard.deleteMany(); await prisma.setting.deleteMany();

  const pw = async (p: string) => bcrypt.hash(p, 10);
  const users = await Promise.all([
    prisma.user.create({ data: { fullName: "Ahmad Owner", phone: "0700000001", passwordHash: await pw("owner123"), role: "OWNER" } }),
    prisma.user.create({ data: { fullName: "Farid Manager", phone: "0700000002", passwordHash: await pw("manager123"), role: "FARM_MANAGER", language: "FA_DARI" } }),
    prisma.user.create({ data: { fullName: "Karim Worker", phone: "0700000003", passwordHash: await pw("worker123"), role: "WORKER", language: "PS_PASHTO" } }),
    prisma.user.create({ data: { fullName: "Dr. Nadia Vet", phone: "0700000004", passwordHash: await pw("vet123"), role: "VETERINARIAN" } }),
    prisma.user.create({ data: { fullName: "Zahra Accountant", phone: "0700000005", passwordHash: await pw("acct123"), role: "ACCOUNTANT" } }),
  ]);
  const worker = users[2];

  const shed1 = await prisma.shed.create({ data: { shedName: "Shed-1-North", capacity: 5000, shedType: "CLOSED_ENVIRONMENT", hasSensors: true, status: "OCCUPIED" } });
  const shed2 = await prisma.shed.create({ data: { shedName: "Shed-2-South", capacity: 3000, shedType: "OPEN_SIDED", status: "OCCUPIED" } });
  await prisma.shed.create({ data: { shedName: "Shed-3-Brooder", capacity: 2000, shedType: "SEMI_CLOSED", status: "CLEANING" } });

  for (const s of Object.entries(DEFAULT_SETTINGS)) await prisma.setting.create({ data: { key: s[0], value: s[1].value, description: s[1].description } });

  const cobb = [[1, 185, 167], [2, 465, 512], [3, 943, 1167], [4, 1524, 2125], [5, 2191, 3348], [6, 2857, 4789]];
  for (const [w, wt, feed] of cobb) await prisma.breedStandard.create({ data: { breed: "Cobb 500", flockType: "BROILER", week: w, targetWeightG: wt, cumulativeFeedG: feed } });
  const layerCurve = [[18, 5], [19, 20], [20, 45], [21, 65], [22, 78], [23, 85], [24, 89], [26, 92], [28, 94], [30, 94], [35, 92], [40, 90], [50, 85], [60, 80], [70, 75]];
  for (const [w, p] of layerCurve) await prisma.breedStandard.create({ data: { breed: "Hy-Line Brown", flockType: "LAYER", week: w, targetProduction: p } });

  // Broiler flock: 4,500 Cobb 500 chicks, intake 29 days ago
  const broiler = await prisma.flock.create({ data: { flockName: "Flock-A-Broiler", flockType: "BROILER", breed: "Cobb 500", shedId: shed1.id,
    intakeDate: day(-29), initialQuantity: 4500, initialAvgWeightG: 42, chickCostAfn: 4500 * 55 } });
  // Layer flock: 2,800 Hy-Line Brown, 30 weeks old (intake 210 days ago), in lay
  const layer = await prisma.flock.create({ data: { flockName: "Flock-B-Layer", flockType: "LAYER", breed: "Hy-Line Brown", shedId: shed2.id,
    intakeDate: day(-210), initialQuantity: 2800, initialAvgWeightG: 38, chickCostAfn: 2800 * 120 } });

  let broilerPop = 4500, layerPop = 2800 - 60; // layer lost 60 before the logged window
  await prisma.birdMovement.create({ data: { flockId: layer.id, date: day(-100), movementType: "MORTALITY", quantity: 45, cause: "UNKNOWN", notes: "Pre-window losses" } });
  await prisma.birdMovement.create({ data: { flockId: layer.id, date: day(-90), movementType: "CULL", quantity: 15, cause: "LOW_PRODUCTION" } });

  for (let i = 29; i >= 0; i--) {
    const d = day(-i); const age = 29 - i + 1;
    // Broiler: feed grows with age; mortality spike on day 12 (disease)
    const bDead = age === 12 ? 55 : ri(0, 6);
    broilerPop -= bDead;
    const bFeedPerBird = 15 + age * 5; // g/bird/day approx
    await prisma.dailyLog.create({ data: { flockId: broiler.id, date: d, feedConsumedKg: Math.round((bFeedPerBird * broilerPop) / 100) / 10,
      waterConsumedL: Math.round((bFeedPerBird * broilerPop * 1.9) / 1000), recordedById: worker.id, notes: age === 12 ? "Several weak birds, vet informed" : undefined } });
    if (bDead > 0) await prisma.birdMovement.create({ data: { flockId: broiler.id, date: d, movementType: "MORTALITY", quantity: bDead, cause: age === 12 ? "DISEASE" : "UNKNOWN" } });
    // Layer: ~92% hen-day, small daily losses
    const lDead = ri(0, 2); layerPop -= lDead;
    const eggs = Math.round(layerPop * (0.90 + rnd() * 0.04));
    await prisma.dailyLog.create({ data: { flockId: layer.id, date: d, feedConsumedKg: Math.round(layerPop * 0.115 * 10) / 10, waterConsumedL: Math.round(layerPop * 0.22),
      eggsCollected: eggs, eggsBroken: ri(3, 15), recordedById: worker.id } });
    if (lDead > 0) await prisma.birdMovement.create({ data: { flockId: layer.id, date: d, movementType: "MORTALITY", quantity: lDead, cause: "UNKNOWN" } });
  }
  // Weight samples for broiler each week
  for (const [w, wt] of [[1, 178], [2, 440], [3, 900], [4, 1470]]) await prisma.weightSample.create({ data: { flockId: broiler.id, sampleDate: day(-29 + w * 7), sampleSize: 50, averageWeightG: wt, uniformityPercent: 80 + ri(0, 8) } });
  // Health logs (Broiler standard program)
  for (const [d, name, method] of [[7, "ND (Lasota)", "WATER"], [14, "Gumboro (IBD)", "WATER"], [21, "ND booster", "WATER"], [28, "IBD booster", "WATER"]] as const) {
    const sched = day(-29 + d - 1); const done = sched < day(0);
    await prisma.healthLog.create({ data: { flockId: broiler.id, scheduledDate: sched, administeredDate: done ? sched : null, type: "VACCINE", productName: name, method, status: done ? "DONE" : "PENDING" } });
  }

  // ── Contacts, purchases, sales, vet visits (Phase 3) ──
  const mk = (data: Parameters<typeof prisma.contact.create>[0]["data"]) => prisma.contact.create({ data });
  const feedCo = await mk({ name: "Kabul Feed Mills", phone: "0700111222", contactType: "FEED_SUPPLIER", address: "Kabul" });
  const chickCo = await mk({ name: "Afghan Hatchery", phone: "0700333444", contactType: "CHICK_SUPPLIER" });
  const medCo = await mk({ name: "Pamir Vet Pharma", phone: "0700555666", contactType: "MEDICINE_SUPPLIER" });
  const equipCo = await mk({ name: "Farm Equipment Store", contactType: "EQUIPMENT_SUPPLIER" });
  const vet = await mk({ name: "Dr. Nadia (Vet)", phone: "0700000004", contactType: "VETERINARIAN" });
  const eggBuyer = await mk({ name: "Bazaar Egg Traders", phone: "0700777888", contactType: "EGG_BUYER" });
  const meatBuyer = await mk({ name: "City Poultry Market", contactType: "MEAT_BUYER" });
  const tx = (data: Parameters<typeof prisma.transaction.create>[0]["data"]) => prisma.transaction.create({ data });
  await tx({ type: "EXPENSE", category: "CHICKS", date: day(-29), quantity: 4500, unit: "PIECE", unitPriceAfn: 55, amountAfn: 4500 * 55, amountPaidAfn: 4500 * 55, paymentStatus: "PAID", flockId: broiler.id, contactId: chickCo.id, description: "Cobb 500 day-old chicks" });
  for (const w of [0, 1, 2, 3]) await tx({ type: "EXPENSE", category: "FEED", date: day(-28 + w * 7), quantity: 60, unit: "BAG", unitPriceAfn: 2400, amountAfn: 144000, amountPaidAfn: w === 3 ? 0 : 144000, paymentStatus: w === 3 ? "CREDIT" : "PAID", dueDate: w === 3 ? day(7) : null, contactId: feedCo.id, description: ["Starter", "Starter", "Grower", "Grower"][w] + " feed 50 kg bags" });
  await tx({ type: "EXPENSE", category: "VITAMINS", date: day(-20), quantity: 5, unit: "LITER", unitPriceAfn: 900, amountAfn: 4500, amountPaidAfn: 4500, paymentStatus: "PAID", contactId: medCo.id, description: "Vitamin C + electrolytes" });
  await tx({ type: "EXPENSE", category: "EQUIPMENT", date: day(-15), quantity: 20, unit: "PIECE", unitPriceAfn: 650, amountAfn: 13000, amountPaidAfn: 6000, paymentStatus: "PARTIAL", contactId: equipCo.id, description: "Bell drinkers" });
  await tx({ type: "EXPENSE", category: "UTILITIES", date: day(-3), amountAfn: 8200, amountPaidAfn: 8200, paymentStatus: "PAID", description: "Electricity — month" });
  await tx({ type: "EXPENSE", category: "LABOR", date: day(-1), amountAfn: 24000, amountPaidAfn: 24000, paymentStatus: "PAID", description: "Worker salaries" });
  for (let i = 27; i >= 1; i -= 3) { const trays = 200 + ri(0, 40); const credit = i % 9 === 0;
    const sale = await tx({ type: "INCOME", category: "EGG_SALE", date: day(-i), quantity: trays, unit: "TRAY", unitPriceAfn: 210, amountAfn: trays * 210, amountPaidAfn: credit ? Math.round(trays * 210 * 0.5) : trays * 210, paymentStatus: credit ? "PARTIAL" : "PAID", flockId: layer.id, contactId: eggBuyer.id, description: "Eggs (trays of 30)" });
    await prisma.eggStockMovement.create({ data: { date: day(-i), movementType: "SALE", quantityEggs: trays * 30, flockId: layer.id, linkedTransactionId: sale.id } }); }
  await tx({ type: "INCOME", category: "MANURE_SALE", date: day(-6), quantity: 2, unit: "OTHER", unitPriceAfn: 3500, amountAfn: 7000, amountPaidAfn: 7000, paymentStatus: "PAID", contactId: meatBuyer.id, description: "Litter / manure, 2 truckloads" });
  const visitTx = await tx({ type: "EXPENSE", category: "VET_VISIT", date: day(-17), quantity: 1, unit: "VISIT", unitPriceAfn: 2500, amountAfn: 2500, amountPaidAfn: 2500, paymentStatus: "PAID", flockId: broiler.id, contactId: vet.id, description: "Mortality spike investigation" });
  await prisma.healthLog.create({ data: { flockId: broiler.id, type: "VET_VISIT", productName: "Mortality spike investigation", scheduledDate: day(-17), administeredDate: day(-17), status: "DONE", contactId: vet.id, transactionId: visitTx.id, notes: "Suspected E. coli; antibiotic course 5 days, improve ventilation." } });
  await prisma.healthLog.create({ data: { flockId: layer.id, type: "CHECKUP", productName: "Monthly flock check-up", scheduledDate: day(5), status: "PENDING", contactId: vet.id } });
  await prisma.healthLog.create({ data: { flockId: broiler.id, type: "MEDICATION", productName: "Enrofloxacin 10% (5 days)", scheduledDate: day(-16), administeredDate: day(-16), method: "WATER", status: "DONE" } });
  console.log(`Seeded: ${users.length} users, 3 sheds, 2 flocks, 60 daily logs, 7 contacts, transactions & vet visits. Login 0700000001 / owner123`);
}
main().finally(() => prisma.$disconnect());
