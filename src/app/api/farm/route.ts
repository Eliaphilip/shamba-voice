import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { getFarmerByUserId, getActiveSeason, getSeasonHarvestTotal } from "@/lib/farm";
import { db } from "@/db";
import { farms, farmers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Haipo." }, { status: 404 });

    const ctx = await getActiveSeason(farmer.id);
    const harvest = ctx?.season ? await getSeasonHarvestTotal(ctx.season.id) : { total: 0, unit: "Mifuko" };

    return NextResponse.json({
      farmer: {
        farmerCode: farmer.farmerCode,
        name: farmer.name,
        preferredLanguage: farmer.preferredLanguage,
        locationApprox: farmer.locationApprox,
      },
      farm: ctx?.farm
        ? { name: ctx.farm.name, sizeAcres: ctx.farm.sizeAcres, primaryCrop: ctx.farm.primaryCrop }
        : null,
      season: ctx?.season ? { label: ctx.season.label, crop: ctx.season.crop, plantingDate: ctx.season.plantingDate } : null,
      harvest,
    });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: "Hitilafu." }, { status: 500 });
  }
}

const patchSchema = z.object({
  locationApprox: z.string().optional(),
  sizeAcres: z.number().positive().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const farmer = await getFarmerByUserId(user.id);
    if (!farmer) return NextResponse.json({ error: "Haipo." }, { status: 404 });

    const body = await req.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Taarifa si sahihi." }, { status: 400 });

    if (parsed.data.locationApprox !== undefined) {
      await db.update(farmers).set({ locationApprox: parsed.data.locationApprox }).where(eq(farmers.id, farmer.id));
    }
    if (parsed.data.sizeAcres !== undefined) {
      const ctx = await getActiveSeason(farmer.id);
      if (ctx?.farm) {
        await db.update(farms).set({ sizeAcres: parsed.data.sizeAcres }).where(eq(farms.id, ctx.farm.id));
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 401 });
    return NextResponse.json({ error: "Hitilafu." }, { status: 500 });
  }
}
