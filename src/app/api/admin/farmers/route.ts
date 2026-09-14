import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { farmers, users } from "@/db/schema";
import { eq, like, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q")?.trim();

    let rows = await db
      .select({
        id: farmers.id,
        name: farmers.name,
        farmerCode: farmers.farmerCode,
        status: farmers.status,
        createdAt: farmers.createdAt,
        phone: users.phone,
      })
      .from(farmers)
      .innerJoin(users, eq(farmers.userId, users.id))
      .orderBy(desc(farmers.createdAt));

    if (q) {
      const qLower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(qLower) ||
          r.farmerCode.toLowerCase().includes(qLower) ||
          r.phone.includes(q)
      );
    }

    return NextResponse.json({ farmers: rows });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: 403 });
    return NextResponse.json({ error: "Hitilafu." }, { status: 500 });
  }
}
