import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`);

// ---------- Auth / Identity ----------

export const users = sqliteTable("users", {
  id: id(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("farmer"), // "farmer" | "admin"
  createdAt: createdAt(),
});

export const sessions = sqliteTable("sessions", {
  id: id(),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: createdAt(),
});

// ---------- Farmer / Farm ----------

export const farmers = sqliteTable("farmers", {
  id: id(),
  userId: text("user_id").notNull().unique(),
  farmerCode: text("farmer_code").notNull().unique(),
  name: text("name").notNull(),
  preferredLanguage: text("preferred_language").notNull().default("sw"),
  locationApprox: text("location_approx"),
  status: text("status").notNull().default("active"), // active | suspended | deleted
  createdAt: createdAt(),
});

export const farms = sqliteTable("farms", {
  id: id(),
  farmerId: text("farmer_id").notNull(),
  name: text("name").notNull(),
  sizeAcres: real("size_acres"),
  primaryCrop: text("primary_crop").notNull(),
  createdAt: createdAt(),
});

export const seasons = sqliteTable("seasons", {
  id: id(),
  farmId: text("farm_id").notNull(),
  label: text("label").notNull(), // e.g. "Msimu 2026"
  crop: text("crop").notNull(),
  plantingDate: text("planting_date"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

// ---------- Transactions ----------

export const transactions = sqliteTable("transactions", {
  id: id(),
  seasonId: text("season_id").notNull(),
  type: text("type").notNull(), // "expense" | "sale"
  category: text("category").notNull(), // Mbolea, Vibarua, Usafiri, Pembejeo, Mauzo, Nyingine...
  activity: text("activity"),
  amount: real("amount").notNull(),
  crop: text("crop"),
  quantityLabel: text("quantity_label"),
  occurredAt: text("occurred_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  source: text("source").notNull().default("voice"), // voice | manual | clarified
  voiceRecordingId: text("voice_recording_id"),
  createdAt: createdAt(),
});

export const productions = sqliteTable("productions", {
  id: id(),
  seasonId: text("season_id").notNull(),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull().default("Mifuko"),
  lossQuantity: real("loss_quantity"),
  recordedAt: text("recorded_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

// ---------- Voice / AI pipeline ----------

export const voiceRecordings = sqliteTable("voice_recordings", {
  id: id(),
  farmerId: text("farmer_id").notNull(),
  transcript: text("transcript").notNull(),
  status: text("status").notNull().default("pending"),
  // pending | transcribed | extracted | needs_clarification | confirmed | failed
  createdAt: createdAt(),
});

export const aiExtractions = sqliteTable("ai_extractions", {
  id: id(),
  voiceRecordingId: text("voice_recording_id").notNull().unique(),
  rawJson: text("raw_json").notNull(),
  missingFields: text("missing_fields"),
  confidence: real("confidence").notNull().default(0),
  createdAt: createdAt(),
});

export const aiConversations = sqliteTable("ai_conversations", {
  id: id(),
  farmerId: text("farmer_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: createdAt(),
});

// ---------- Trust / Governance ----------

export const consents = sqliteTable("consents", {
  id: id(),
  farmerId: text("farmer_id").notNull(),
  type: text("type").notNull(), // data_processing | voice_recording
  granted: integer("granted", { mode: "boolean" }).notNull().default(true),
  createdAt: createdAt(),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: id(),
  userId: text("user_id"),
  action: text("action").notNull(),
  detail: text("detail"),
  createdAt: createdAt(),
});
