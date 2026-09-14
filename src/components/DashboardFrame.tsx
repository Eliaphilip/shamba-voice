"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { VoiceProvider } from "./voice/VoiceProvider";
import { BottomNav, DesktopNav } from "./DashboardNav";

export function DashboardFrame({
  children,
  farmerName,
}: {
  children: React.ReactNode;
  farmerName: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <VoiceProvider>
      <div className="min-h-screen bg-[color:var(--cream)] pb-24 md:pb-8">
        <header className="sticky top-0 z-40 bg-[color:var(--cream)]/95 backdrop-blur border-b border-[color:var(--line)]">
          <div className="max-w-[980px] mx-auto flex items-center justify-between px-5 py-3.5">
            <Link href="/dashboard" className="flex items-center gap-2 font-[family-name:var(--font-display)] font-semibold text-[16px] text-[color:var(--forest)]">
              <span className="w-[24px] h-[24px] rounded-full bg-[color:var(--green)] flex items-center justify-center flex-none">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" fill="var(--cream)"/></svg>
              </span>
              Shamba Voice
            </Link>
            <DesktopNav />
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-[13.5px] text-[color:var(--ink-soft)]">{farmerName}</span>
              <button onClick={logout} className="text-[13px] text-[color:var(--ink-faint)] hover:text-[color:var(--forest)]">Toka</button>
            </div>
          </div>
        </header>

        <main className="max-w-[980px] mx-auto">{children}</main>

        <BottomNav />
      </div>
    </VoiceProvider>
  );
}
