import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { farmers, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminFarmerActionSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => null);
    const parsed = adminFarmerActionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Ombi si sahihi." }, { status: 400 });

    const { farmerId, action } = parsed.data;
    const status = action === "suspend" ? "suspended" : action === "activate" ? "active" : "deleted";

    await db.update(farmers).set({ status }).where(eq(farmers.id, farmerId));
    await db.insert(auditLogs).values({ userId: admin.id, action: `admin_${action}_farmer`, detail: farmerId });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 403 });
    return NextResponse.json({ error: "Hitilafu." }, { status: 500 });
  }
}
