"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVoice } from "@/components/voice/VoiceProvider";

type Tx = {
  id: string;
  type: "expense" | "sale";
  category: string;
  crop: string | null;
  amount: number;
  occurredAt: string;
};

const FILTERS = ["Zote", "Matumizi", "Mauzo", "Vibarua", "Mbolea"];

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "LEO";
  if (d.toDateString() === yesterday.toDateString()) return "JANA";
  return d.toLocaleDateString("sw-TZ", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

export default function RecordsPage() {
  return (
    <Suspense fallback={<div className="px-5 pt-5 text-[color:var(--ink-faint)] text-sm">Inapakia...</div>}>
      <RecordsInner />
    </Suspense>
  );
}

function RecordsInner() {
  const { openRecorder } = useVoice();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "Zote";
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/transactions?filter=${encodeURIComponent(filter)}`);
    const data = await res.json();
    setTxs(data.transactions || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("sv:transaction-saved", handler);
    return () => window.removeEventListener("sv:transaction-saved", handler);
  }, [load]);

  const groups: Record<string, Tx[]> = {};
  for (const t of txs) {
    const label = dayLabel(t.occurredAt);
    (groups[label] = groups[label] || []).push(t);
  }

  return (
    <div className="px-5 pt-5">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-[22px]">Rekodi za Shamba</h1>
        <button onClick={openRecorder} className="text-[13.5px] font-semibold text-[color:var(--forest)]">🎙 Rekodi mpya</button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => router.push(`/dashboard/records?filter=${encodeURIComponent(f)}`)}
            className={`flex-none px-4 py-2 rounded-full text-[13.5px] font-medium border-[1.5px] transition-colors ${
              filter === f
                ? "bg-[color:var(--forest)] text-[color:var(--paper)] border-[color:var(--forest)]"
                : "bg-[color:var(--paper)] text-[color:var(--ink-soft)] border-[color:var(--line-strong)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {!loading && txs.length === 0 && (
        <div className="text-center py-16 text-[color:var(--ink-faint)]">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4">
            <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
            <path d="M19 11a7 7 0 01-14 0M12 18v3" />
          </svg>
          <p className="text-[14.5px] mb-4">Bado hujaweka rekodi ya aina hii.</p>
          <button onClick={openRecorder} className="btn-primary">🎙 Rekodi</button>
        </div>
      )}

      {Object.entries(groups).map(([day, items]) => (
        <div key={day} className="mb-6">
          <div className="text-[12.5px] text-[color:var(--ink-faint)] font-semibold mb-2.5 tracking-wide">{day}</div>
          <div className="card divide-y divide-[color:var(--line)]">
            {items.map((t) => (
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
                  <div className="text-[11.5px] text-[color:var(--ink-faint)]">
                    {new Date(t.occurredAt).toLocaleTimeString("sw-TZ", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
