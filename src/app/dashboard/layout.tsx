import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getFarmerByUserId } from "@/lib/farm";
import { DashboardFrame } from "@/components/DashboardFrame";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "farmer") redirect("/login");

  const farmer = await getFarmerByUserId(user.id);
  if (!farmer) redirect("/login");

  return <DashboardFrame farmerName={farmer.name}>{children}</DashboardFrame>;
}
