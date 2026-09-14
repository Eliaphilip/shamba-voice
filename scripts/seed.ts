import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import bcrypt from "bcryptjs";
import * as schema from "../src/db/schema";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "shamba-voice.db");
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

async function main() {
  console.log("Seeding Shamba Voice demo data...");

  // ---- Admin account ----
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const [admin] = await db
    .insert(schema.users)
    .values({ phone: "0700000000", passwordHash: adminPasswordHash, role: "admin" })
    .returning();
  console.log("Admin created:", admin.phone);

  // ---- Demo farmer: Eliya ----
  const farmerPasswordHash = await bcrypt.hash("eliya123", 10);
  const [user] = await db
    .insert(schema.users)
    .values({ phone: "0712345678", passwordHash: farmerPasswordHash, role: "farmer" })
    .returning();

  const [farmer] = await db
    .insert(schema.farmers)
    .values({
      userId: user.id,
      farmerCode: "SV-1001",
      name: "Eliya Mushi",
      preferredLanguage: "sw",
      locationApprox: "Kilosa, Morogoro",
    })
    .returning();

  const [farm] = await db
    .insert(schema.farms)
    .values({ farmerId: farmer.id, name: "Shamba la Mahindi", primaryCrop: "Mahindi", sizeAcres: 3.5 })
    .returning();

  const [season] = await db
    .insert(schema.seasons)
    .values({
      farmId: farm.id,
      label: `Msimu ${new Date().getFullYear()}`,
      crop: "Mahindi",
      plantingDate: new Date(Date.now() - 60 * 86400000).toISOString(),
      isActive: true,
    })
    .returning();

  await db.insert(schema.consents).values([
    { farmerId: farmer.id, type: "data_processing", granted: true },
    { farmerId: farmer.id, type: "voice_recording", granted: true },
  ]);

  const now = Date.now();
  const day = 86400000;

  await db.insert(schema.transactions).values([
    { seasonId: season.id, type: "expense", category: "Mbegu", amount: 60000, crop: "Mahindi", occurredAt: new Date(now - 55 * day).toISOString(), source: "manual" },
    { seasonId: season.id, type: "expense", category: "Vibarua", activity: "Kulima", amount: 70000, crop: "Mahindi", occurredAt: new Date(now - 50 * day).toISOString(), source: "voice" },
    { seasonId: season.id, type: "expense", category: "Mbolea", amount: 150000, crop: "Mahindi", quantityLabel: "Mifuko 2", occurredAt: new Date(now - 30 * day).toISOString(), source: "voice" },
    { seasonId: season.id, type: "expense", category: "Vibarua", activity: "Kupalilia", amount: 20000, crop: "Mahindi", occurredAt: new Date(now - 2 * day).toISOString(), source: "voice" },
    { seasonId: season.id, type: "expense", category: "Mbolea", amount: 80000, crop: "Mahindi", quantityLabel: "Mifuko 2", occurredAt: new Date(now).toISOString(), source: "voice" },
    { seasonId: season.id, type: "sale", category: "Mauzo", amount: 250000, crop: "Mahindi", occurredAt: new Date(now - 9 * day).toISOString(), source: "voice" },
    { seasonId: season.id, type: "sale", category: "Mauzo", amount: 600000, crop: "Mahindi", occurredAt: new Date(now - 1 * day).toISOString(), source: "voice" },
  ]);

  await db.insert(schema.productions).values([
    { seasonId: season.id, quantity: 15, unit: "Mifuko", recordedAt: new Date(now - 5 * day).toISOString() },
  ]);

  console.log("Demo farmer created:");
  console.log("  Phone: 0712345678");
  console.log("  Password: eliya123");
  console.log("Admin login:");
  console.log("  Phone: 0700000000");
  console.log("  Password: admin123");
  console.log("Done.");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
