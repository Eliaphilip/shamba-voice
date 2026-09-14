import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

// Single shared SQLite connection (file-based, persists between requests in dev/prod on one instance).
// For production at scale, swap this file for a Postgres connection (see README "Going to production").
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "shamba-voice.db");

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export { sqlite };
