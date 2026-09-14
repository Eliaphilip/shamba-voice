import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, farmers, farms, seasons, consents, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, SESSION_COOKIE, generateFarmerCode } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Taarifa si sahihi" }, { status: 400 });
  }
  const { phone, password, name, primaryCrop, farmSizeAcres } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Namba hii ya simu tayari imesajiliwa." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ phone, passwordHash, role: "farmer" }).returning();

  const [farmer] = await db
    .insert(farmers)
    .values({ userId: user.id, farmerCode: generateFarmerCode(), name, preferredLanguage: "sw" })
    .returning();

  const [farm] = await db
    .insert(farms)
    .values({ farmerId: farmer.id, name: `Shamba la ${primaryCrop}`, primaryCrop, sizeAcres: farmSizeAcres })
    .returning();

  const currentYear = new Date().getFullYear();
  await db.insert(seasons).values({
    farmId: farm.id,
    label: `Msimu ${currentYear}`,
    crop: primaryCrop,
    plantingDate: new Date().toISOString(),
    isActive: true,
  });

  await db.insert(consents).values([
    { farmerId: farmer.id, type: "data_processing", granted: true },
    { farmerId: farmer.id, type: "voice_recording", granted: true },
  ]);

  await db.insert(auditLogs).values({ userId: user.id, action: "register", detail: `farmer:${farmer.farmerCode}` });

  const { token, expiresAt } = await createSession(user.id);
  const res = NextResponse.json({ ok: true, farmerCode: farmer.farmerCode });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return res;
}
