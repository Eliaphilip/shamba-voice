CREATE TABLE "ai_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"farmer_id" text NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_extractions" (
	"id" text PRIMARY KEY NOT NULL,
	"voice_recording_id" text NOT NULL,
	"raw_json" text NOT NULL,
	"missing_fields" text,
	"confidence" real DEFAULT 0 NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "ai_extractions_voice_recording_id_unique" UNIQUE("voice_recording_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"detail" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consents" (
	"id" text PRIMARY KEY NOT NULL,
	"farmer_id" text NOT NULL,
	"type" text NOT NULL,
	"granted" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "farmers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"farmer_code" text NOT NULL,
	"name" text NOT NULL,
	"preferred_language" text DEFAULT 'sw' NOT NULL,
	"location_approx" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "farmers_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "farmers_farmer_code_unique" UNIQUE("farmer_code")
);
--> statement-breakpoint
CREATE TABLE "farms" (
	"id" text PRIMARY KEY NOT NULL,
	"farmer_id" text NOT NULL,
	"name" text NOT NULL,
	"size_acres" real,
	"primary_crop" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productions" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"quantity" real NOT NULL,
	"unit" text DEFAULT 'Mifuko' NOT NULL,
	"loss_quantity" real,
	"recorded_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"farm_id" text NOT NULL,
	"label" text NOT NULL,
	"crop" text NOT NULL,
	"planting_date" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"activity" text,
	"amount" real NOT NULL,
	"crop" text,
	"quantity_label" text,
	"occurred_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"source" text DEFAULT 'voice' NOT NULL,
	"voice_recording_id" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'farmer' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "voice_recordings" (
	"id" text PRIMARY KEY NOT NULL,
	"farmer_id" text NOT NULL,
	"transcript" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
