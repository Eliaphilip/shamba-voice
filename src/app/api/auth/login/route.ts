import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, SESSION_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Namba ya simu au neno la siri si sahihi." }, { status: 400 });
  }
  const { phone, password } = parsed.data;

  const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "Akaunti haipo. Tafadhali jisajili kwanza." }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Neno la siri si sahihi." }, { status: 401 });
  }

  await db.insert(auditLogs).values({ userId: user.id, action: "login" });

  const { token, expiresAt } = await createSession(user.id);
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  return res;
}
