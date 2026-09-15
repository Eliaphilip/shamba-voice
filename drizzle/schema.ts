import { pgTable, text, unique, real, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const aiConversations = pgTable("ai_conversations", {
	id: text().primaryKey().notNull(),
	farmerId: text("farmer_id").notNull(),
	question: text().notNull(),
	answer: text().notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const aiExtractions = pgTable("ai_extractions", {
	id: text().primaryKey().notNull(),
	voiceRecordingId: text("voice_recording_id").notNull(),
	rawJson: text("raw_json").notNull(),
	missingFields: text("missing_fields"),
	confidence: real().default(0).notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("ai_extractions_voice_recording_id_unique").on(table.voiceRecordingId),
]);

export const auditLogs = pgTable("audit_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	action: text().notNull(),
	detail: text(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const consents = pgTable("consents", {
	id: text().primaryKey().notNull(),
	farmerId: text("farmer_id").notNull(),
	type: text().notNull(),
	granted: boolean().default(true).notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const farmers = pgTable("farmers", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	farmerCode: text("farmer_code").notNull(),
	name: text().notNull(),
	preferredLanguage: text("preferred_language").default('sw').notNull(),
	locationApprox: text("location_approx"),
	status: text().default('active').notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("farmers_user_id_unique").on(table.userId),
	unique("farmers_farmer_code_unique").on(table.farmerCode),
]);

export const farms = pgTable("farms", {
	id: text().primaryKey().notNull(),
	farmerId: text("farmer_id").notNull(),
	name: text().notNull(),
	sizeAcres: real("size_acres"),
	primaryCrop: text("primary_crop").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const productions = pgTable("productions", {
	id: text().primaryKey().notNull(),
	seasonId: text("season_id").notNull(),
	quantity: real().notNull(),
	unit: text().default('Mifuko').notNull(),
	lossQuantity: real("loss_quantity"),
	recordedAt: text("recorded_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const seasons = pgTable("seasons", {
	id: text().primaryKey().notNull(),
	farmId: text("farm_id").notNull(),
	label: text().notNull(),
	crop: text().notNull(),
	plantingDate: text("planting_date"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	token: text().notNull(),
	expiresAt: text("expires_at").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("sessions_token_unique").on(table.token),
]);

export const transactions = pgTable("transactions", {
	id: text().primaryKey().notNull(),
	seasonId: text("season_id").notNull(),
	type: text().notNull(),
	category: text().notNull(),
	activity: text(),
	amount: real().notNull(),
	crop: text(),
	quantityLabel: text("quantity_label"),
	occurredAt: text("occurred_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	source: text().default('voice').notNull(),
	voiceRecordingId: text("voice_recording_id"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	phone: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().default('farmer').notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	unique("users_phone_unique").on(table.phone),
]);

export const voiceRecordings = pgTable("voice_recordings", {
	id: text().primaryKey().notNull(),
	farmerId: text("farmer_id").notNull(),
	transcript: text().notNull(),
	status: text().default('pending').notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
