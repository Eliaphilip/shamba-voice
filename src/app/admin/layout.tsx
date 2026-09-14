import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-[color:var(--cream)]">
      <header className="sticky top-0 z-40 bg-[color:var(--forest)] text-[color:var(--paper)]">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-[family-name:var(--font-display)] font-semibold text-[17px]">
            Shamba Voice — Admin
          </Link>
          <nav className="flex items-center gap-6 text-[14px]">
            <Link href="/admin" className="hover:opacity-80">Muhtasari</Link>
            <Link href="/admin/farmers" className="hover:opacity-80">Wakulima</Link>
            <AdminLogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
