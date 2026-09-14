"use client";

import { useEffect, useState } from "react";

type Overview = {
  totalFarmers: number;
  activeFarmers: number;
  totalRecordings: number;
  totalTransactions: number;
  recordingStatusBreakdown: { status: string; count: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Inasubiri",
  transcribed: "Imeandikwa",
  extracted: "Imechambuliwa",
  needs_clarification: "Inahitaji Ufafanuzi",
  confirmed: "Imethibitishwa",
  failed: "Imeshindwa",
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <p className="text-[color:var(--ink-faint)] text-sm">Inapakia...</p>;

  return (
    <div>
      <h1 className="text-[24px] mb-6">Muhtasari wa Mfumo</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Wakulima" value={data.totalFarmers} />
        <StatCard label="Wakulima Hai" value={data.activeFarmers} />
        <StatCard label="Rekodi za Sauti" value={data.totalRecordings} />
        <StatCard label="Miamala" value={data.totalTransactions} />
      </div>

      <h2 className="text-[18px] mb-4">Ufuatiliaji wa AI — Hali ya Rekodi za Sauti</h2>
      <div className="card divide-y divide-[color:var(--line)]">
        {data.recordingStatusBreakdown.length === 0 && (
          <p className="px-5 py-6 text-[color:var(--ink-faint)] text-sm">Hakuna rekodi bado.</p>
        )}
        {data.recordingStatusBreakdown.map((s) => (
          <div key={s.status} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-[14.5px]">{STATUS_LABELS[s.status] || s.status}</span>
            <span className="font-semibold text-[color:var(--forest)]">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <div className="text-[12.5px] text-[color:var(--ink-faint)] mb-2">{label}</div>
      <div className="font-[family-name:var(--font-display)] text-[28px] font-semibold text-[color:var(--forest)]">{value.toLocaleString("en-US")}</div>
    </div>
  );
}
