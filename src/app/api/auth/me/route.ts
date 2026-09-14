import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFarmerByUserId } from "@/lib/farm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });

  const farmer = user.role === "farmer" ? await getFarmerByUserId(user.id) : null;
  return NextResponse.json({
    user: { id: user.id, phone: user.phone, role: user.role },
    farmer: farmer ? { id: farmer.id, name: farmer.name, farmerCode: farmer.farmerCode } : null,
  });
}
