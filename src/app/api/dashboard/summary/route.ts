import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getFarmerByUserId, getActiveSeason, getSeasonTransactions, getSeasonHarvestTotal } from "@/lib/farm";
import { summarizeSeason } from "@/lib/calc";

export async function GET() {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Wasifu wa mkulima haujapatikana." }, { status: 404 });

    const ctx = await getActiveSeason(farmer.id);
    if (!ctx?.season) {
      return NextResponse.json({ farmer: { name: farmer.name }, season: null });
    }

    const txs = await getSeasonTransactions(ctx.season.id);
    const summary = summarizeSeason(txs);
    const harvest = await getSeasonHarvestTotal(ctx.season.id);

    return NextResponse.json({
      farmer: { name: farmer.name, farmerCode: farmer.farmerCode },
      farm: { name: ctx.farm.name, primaryCrop: ctx.farm.primaryCrop },
      season: { id: ctx.season.id, label: ctx.season.label, crop: ctx.season.crop },
      summary,
      harvest,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: "Hitilafu imetokea." }, { status: 500 });
  }
}
