import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getFarmerByUserId, getActiveSeason } from "@/lib/farm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { manualTransactionSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ transactions: [] });

    const ctx = await getActiveSeason(farmer.id);
    if (!ctx?.season) return NextResponse.json({ transactions: [] });

    const filter = req.nextUrl.searchParams.get("filter"); // Zote | Matumizi | Mauzo | Wafanyakazi | Mavuno...
    let rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.seasonId, ctx.season.id))
      .orderBy(desc(transactions.occurredAt));

    if (filter && filter !== "Zote") {
      if (filter === "Matumizi") rows = rows.filter((r) => r.type === "expense");
      else if (filter === "Mauzo") rows = rows.filter((r) => r.type === "sale");
      else rows = rows.filter((r) => r.category === filter);
    }

    return NextResponse.json({ transactions: rows });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: "Hitilafu imetokea." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Wasifu wa mkulima haujapatikana." }, { status: 404 });

    const ctx = await getActiveSeason(farmer.id);
    if (!ctx?.season) return NextResponse.json({ error: "Msimu haujapatikana." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = manualTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Taarifa si sahihi." }, { status: 400 });
    }

    const [row] = await db
      .insert(transactions)
      .values({ ...parsed.data, seasonId: ctx.season.id, source: "manual" })
      .returning();

    return NextResponse.json({ transaction: row });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: "Hitilafu imetokea." }, { status: 500 });
  }
}
