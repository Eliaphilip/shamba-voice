import { db } from "@/db";
import { farmers, farms, seasons, transactions, productions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { TxLike } from "./calc";

export async function getFarmerByUserId(userId: string) {
  const rows = await db.select().from(farmers).where(eq(farmers.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function getActiveSeason(farmerId: string) {
  const farmRows = await db.select().from(farms).where(eq(farms.farmerId, farmerId)).limit(1);
  const farm = farmRows[0];
  if (!farm) return null;

  const seasonRows = await db
    .select()
    .from(seasons)
    .where(and(eq(seasons.farmId, farm.id), eq(seasons.isActive, true)))
    .limit(1);

  return { farm, season: seasonRows[0] ?? null };
}

export async function getSeasonTransactions(seasonId: string): Promise<TxLike[]> {
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.seasonId, seasonId))
    .orderBy(desc(transactions.occurredAt));
  return rows.map((r) => ({
    type: r.type as TxLike["type"],
    category: r.category,
    amount: r.amount,
    crop: r.crop,
    occurredAt: r.occurredAt,
  }));
}

export async function getSeasonHarvestTotal(seasonId: string) {
  const rows = await db.select().from(productions).where(eq(productions.seasonId, seasonId));
  const total = rows.reduce((sum, r) => sum + r.quantity, 0);
  const unit = rows[0]?.unit || "Mifuko";
  return { total, unit };
}
