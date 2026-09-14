import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getFarmerByUserId, getActiveSeason } from "@/lib/farm";
import { db } from "@/db";
import { transactions, voiceRecordings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { confirmTransactionSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Wasifu wa mkulima haujapatikana." }, { status: 404 });

    const ctx = await getActiveSeason(farmer.id);
    if (!ctx?.season) return NextResponse.json({ error: "Msimu haujapatikana." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = confirmTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Taarifa si sahihi." }, { status: 400 });
    }
    const { voiceRecordingId, ...fields } = parsed.data;

    const [row] = await db
      .insert(transactions)
      .values({
        ...fields,
        seasonId: ctx.season.id,
        voiceRecordingId: voiceRecordingId ?? null,
        source: voiceRecordingId ? "voice" : "manual",
      })
      .returning();

    if (voiceRecordingId) {
      await db.update(voiceRecordings).set({ status: "confirmed" }).where(eq(voiceRecordings.id, voiceRecordingId));
    }

    return NextResponse.json({ transaction: row });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Imeshindikana kuhifadhi rekodi." }, { status: 500 });
  }
}
