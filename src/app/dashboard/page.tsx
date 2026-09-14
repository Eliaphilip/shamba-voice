"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useVoice } from "@/components/voice/VoiceProvider";

type Summary = {
  farmer: { name: string; farmerCode?: string };
  farm?: { name: string; primaryCrop: string } | null;
  season?: { label: string; crop: string } | null;
  summary?: {
    totalExpenses: number;
    totalSales: number;
    grossMargin: number;
    largestExpenseCategory: string | null;
  };
  harvest?: { total: number; unit: string };
};

type Tx = {
  id: string;
  type: "expense" | "sale";
  category: string;
  crop: string | null;
  amount: number;
  occurredAt: string;
};

const fmt = (n: number) => `TZS ${Math.round(n).toLocaleString("en-US")}`;

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "LEO";
  if (d.toDateString() === yesterday.toDateString()) return "JANA";
  return d.toLocaleDateString("sw-TZ", { day: "2-digit", month: "short" }).toUpperCase();
}

export default function DashboardHomePage() {
  const { openRecorder } = useVoice();
  const [data, setData] = useState<Summary | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [summaryRes, txRes] = await Promise.all([
      fetch("/api/dashboard/summary").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
    ]);
    setData(summaryRes);
    setTxs((txRes.transactions || []).slice(0, 4));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("sv:transaction-saved", handler);
    return () => window.removeEventListener("sv:transaction-saved", handler);
  }, [load]);

  const s = data?.summary;

  return (
    <div>
      <div className="px-5 pt-4">
        <h1 className="text-[25px]">Habari, {data?.farmer.name?.split(" ")[0] || "..."} 👋</h1>
        <p className="mt-1.5 text-sm text-[color:var(--ink-soft)]">
          <b className="text-[color:var(--forest)] font-semibold">{data?.farm?.name || "Shamba lako"}</b>
          {data?.season ? ` · ${data.season.label}` : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-7 px-5 md:px-0 mt-2">
        <div>
          {/* Mic hero */}
          <div className="relative overflow-hidden rounded-[22px] mt-4 px-6 pt-9 pb-7 text-center" style={{ background: "linear-gradient(165deg,#26432F,#1C331F)" }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 0%, rgba(183,134,44,0.16), transparent 55%)" }} />
            <button onClick={openRecorder} className="mic-btn mx-auto relative z-10" aria-label="Bonyeza kurekodi kwa sauti">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
                <path d="M19 11a7 7 0 01-14 0M12 18v3" />
              </svg>
            </button>
            <h2 className="text-[color:var(--paper)] text-[21px] mt-5 relative z-10">Ongea na Shamba</h2>
            <p className="text-[#CBD9C8] text-sm mt-2 relative z-10">Bonyeza na sema ulichofanya leo</p>
          </div>

          {/* Metrics */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between mb-3.5">
              <h3 className="text-[15px] text-[color:var(--ink-faint)] font-semibold font-[family-name:var(--font-body)]">MSIMU HUU</h3>
              <span className="text-[12.5px] text-[color:var(--ink-faint)]">{data?.season?.crop}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Matumizi" value={loading ? "…" : fmt(s?.totalExpenses || 0)} />
              <MetricCard label="Mauzo" value={loading ? "…" : fmt(s?.totalSales || 0)} />
              <MetricCard label="Tofauti" value={loading ? "…" : fmt(s?.grossMargin || 0)} accent />
              <MetricCard label="Mavuno" value={loading ? "…" : `${data?.harvest?.total || 0} ${data?.harvest?.unit || "Mifuko"}`} />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-2.5 mt-5">
              <QuickAction onClick={openRecorder} label="Rekodi" icon="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zM19 11a7 7 0 01-14 0M12 18v3" />
              <QuickAction href="/dashboard/records?filter=Mauzo" label="Mauzo" icon="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              <QuickAction href="/dashboard/records?filter=Matumizi" label="Matumizi" icon="M3 6h18v12H3zM3 10h18" />
              <QuickAction href="/dashboard/ai" label="Uliza AI" icon="M21 11.5a8.4 8.4 0 01-8.9 8.4 9 9 0 01-3.6-.8L3 20l1-4.5A8.4 8.4 0 0112.5 3a8.4 8.4 0 018.5 8.5z" />
            </div>
          </div>

          {/* Recent records preview */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-3.5">
              <h3 className="text-[15px] text-[color:var(--ink-faint)] font-semibold font-[family-name:var(--font-body)]">HIVI KARIBUNI</h3>
              <Link href="/dashboard/records" className="text-[13px] text-[color:var(--forest)] font-medium">Ona zote</Link>
            </div>
            <div className="card divide-y divide-[color:var(--line)]">
              {txs.length === 0 && !loading && (
                <div className="text-center py-10 px-4 text-[color:var(--ink-faint)]">
                  <p className="text-[14.5px] mb-4">Bado hujaweka rekodi yoyote.</p>
                  <button onClick={openRecorder} className="btn-primary">🎙 Rekodi</button>
                </div>
              )}
              {txs.map((t) => (
                <div key={t.id} className="flex items-center gap-3.5 px-4 py-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${t.type === "sale" ? "bg-[#E4EEE1]" : "bg-[#EFE8D4]"}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={t.type === "sale" ? "text-[color:var(--green)]" : "text-[color:var(--soil)]"}>
                      <path d={t.type === "sale" ? "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" : "M3 6h18v12H3zM3 10h18"} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold">{t.category}</div>
                    <div className="text-[12.5px] text-[color:var(--ink-faint)]">{t.crop || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[14.5px] font-semibold ${t.type === "expense" ? "text-[color:var(--soil)]" : "text-[color:var(--forest)]"}`}>
                      {t.type === "expense" ? "−" : "+"}{Math.round(t.amount).toLocaleString("en-US")}
                    </div>
                    <div className="text-[11.5px] text-[color:var(--ink-faint)]">{dayLabel(t.occurredAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:block pt-4">
          <AISidebarTeaser />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card px-4 pt-4 pb-3.5">
      <div className="text-[12.5px] text-[color:var(--ink-faint)] mb-1.5">{label}</div>
      <div className={`font-[family-name:var(--font-display)] text-[21px] font-semibold ${accent ? "text-[color:var(--gold)]" : "text-[color:var(--forest)]"}`}>{value}</div>
    </div>
  );
}

function QuickAction({ href, onClick, label, icon }: { href?: string; onClick?: () => void; label: string; icon: string }) {
  const inner = (
    <div className="card flex flex-col items-center gap-2 py-3.5 px-1.5 text-[12px] font-medium hover:border-[color:var(--green-soft)] transition-colors">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--green)]">
        <path d={icon} />
      </svg>
      {label}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return <button onClick={onClick} className="text-left w-full">{inner}</button>;
}

function AISidebarTeaser() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-[color:var(--forest)] flex items-center justify-center flex-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--paper)]">
            <path d="M21 11.5a8.4 8.4 0 01-8.9 8.4 9 9 0 01-3.6-.8L3 20l1-4.5A8.4 8.4 0 0112.5 3a8.4 8.4 0 018.5 8.5z" />
          </svg>
        </div>
        <span className="text-[14.5px] font-semibold text-[color:var(--forest)]">Uliza Shamba Voice</span>
      </div>
      <p className="text-[13.5px] text-[color:var(--ink-soft)] mb-4">Uliza kuhusu matumizi, mauzo au faida ya msimu wako.</p>
      <Link href="/dashboard/ai" className="btn-secondary w-full text-center block">Fungua Msaidizi wa AI</Link>
    </div>
  );
}
