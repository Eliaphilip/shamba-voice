import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getFarmerByUserId } from "@/lib/farm";
import { db } from "@/db";
import { voiceRecordings, aiExtractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { voiceTranscriptSchema } from "@/lib/validators";
import { extractTransaction } from "@/lib/extraction";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Wasifu wa mkulima haujapatikana." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = voiceTranscriptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }
    const { transcript } = parsed.data;

    const [recording] = await db
      .insert(voiceRecordings)
      .values({ farmerId: farmer.id, transcript, status: "transcribed" })
      .returning();

    const extraction = await extractTransaction(transcript);

    await db.insert(aiExtractions).values({
      voiceRecordingId: recording.id,
      rawJson: JSON.stringify(extraction),
      missingFields: extraction.missingFields.join(",") || null,
      confidence: extraction.confidence,
    });

    const status = extraction.missingFields.length > 0 ? "needs_clarification" : "extracted";
    await db.update(voiceRecordings).set({ status }).where(eq(voiceRecordings.id, recording.id));

    return NextResponse.json({
      voiceRecordingId: recording.id,
      extraction,
      status,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Sauti haikuweza kuchakatwa. Tafadhali jaribu tena." }, { status: 500 });
  }
}
