import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getFarmerByUserId, getActiveSeason, getSeasonTransactions } from "@/lib/farm";
import { summarizeSeason } from "@/lib/calc";
import { answerQuestion } from "@/lib/assistant";
import { askSchema } from "@/lib/validators";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Wasifu wa mkulima haujapatikana." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Andika swali kwanza." }, { status: 400 });

    const ctx = await getActiveSeason(farmer.id);
    const txs = ctx?.season ? await getSeasonTransactions(ctx.season.id) : [];
    const summary = summarizeSeason(txs);

    const answer = await answerQuestion(parsed.data.question, summary);

    await db.insert(aiConversations).values({ farmerId: farmer.id, question: parsed.data.question, answer });

    return NextResponse.json({ answer });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: "Samahani, sikuweza kujibu. Jaribu tena." }, { status: 500 });
  }
}
