import { NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { farmers, voiceRecordings, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    await requireAdmin();

    const [{ count: totalFarmers }] = await db.select({ count: sql<number>`count(*)` }).from(farmers);
    const [{ count: activeFarmers }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(farmers)
      .where(eq(farmers.status, "active"));
    const [{ count: totalRecordings }] = await db.select({ count: sql<number>`count(*)` }).from(voiceRecordings);
    const [{ count: totalTransactions }] = await db.select({ count: sql<number>`count(*)` }).from(transactions);

    const statusRows = await db
      .select({ status: voiceRecordings.status, count: sql<number>`count(*)` })
      .from(voiceRecordings)
      .groupBy(voiceRecordings.status);

    return NextResponse.json({
      totalFarmers,
      activeFarmers,
      totalRecordings,
      totalTransactions,
      recordingStatusBreakdown: statusRows,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 403 });
    return NextResponse.json({ error: "Hitilafu." }, { status: 500 });
  }
}
