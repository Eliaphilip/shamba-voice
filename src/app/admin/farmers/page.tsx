"use client";

import { useEffect, useState } from "react";

type Farmer = {
  id: string;
  name: string;
  farmerCode: string;
  status: string;
  createdAt: string;
  phone: string;
};

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/farmers?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setFarmers(data.farmers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(farmerId: string, action: "suspend" | "activate" | "delete") {
    if (action === "delete" && !confirm("Una uhakika unataka kufuta akaunti hii ya mkulima?")) return;
    await fetch("/api/admin/farmers/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ farmerId, action }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-[24px]">Wakulima</h1>
        <div className="flex gap-2">
          <input
            className="input-field !w-60"
            placeholder="Tafuta kwa jina, namba..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button onClick={load} className="btn-secondary !px-4">Tafuta</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="text-left text-[12.5px] text-[color:var(--ink-faint)] border-b border-[color:var(--line)]">
              <th className="px-5 py-3 font-semibold">Jina</th>
              <th className="px-5 py-3 font-semibold">Namba ya Mkulima</th>
              <th className="px-5 py-3 font-semibold">Simu</th>
              <th className="px-5 py-3 font-semibold">Hali</th>
              <th className="px-5 py-3 font-semibold text-right">Vitendo</th>
            </tr>
          </thead>
          <tbody>
            {!loading && farmers.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[color:var(--ink-faint)]">Hakuna wakulima waliopatikana.</td></tr>
            )}
            {farmers.map((f) => (
              <tr key={f.id} className="border-b border-[color:var(--line)] last:border-b-0">
                <td className="px-5 py-3.5 font-medium">{f.name}</td>
                <td className="px-5 py-3.5 text-[color:var(--ink-soft)]">{f.farmerCode}</td>
                <td className="px-5 py-3.5 text-[color:var(--ink-soft)]">{f.phone}</td>
                <td className="px-5 py-3.5">
                  <StatusPill status={f.status} />
                </td>
                <td className="px-5 py-3.5 text-right space-x-3">
                  {f.status !== "suspended" && (
                    <button onClick={() => act(f.id, "suspend")} className="text-[13px] text-[color:var(--soil)] font-medium">Simamisha</button>
                  )}
                  {f.status === "suspended" && (
                    <button onClick={() => act(f.id, "activate")} className="text-[13px] text-[color:var(--green)] font-medium">Rejesha</button>
                  )}
                  <button onClick={() => act(f.id, "delete")} className="text-[13px] text-[#B4432C] font-medium">Futa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-[#E4EEE1] text-[color:var(--green)]",
    suspended: "bg-[#FBF0E4] text-[color:var(--soil)]",
    deleted: "bg-[#FBEAE5] text-[#B4432C]",
  };
  const label: Record<string, string> = { active: "Hai", suspended: "Amesimamishwa", deleted: "Amefutwa" };
  return <span className={`px-2.5 py-1 rounded-full text-[12px] font-semibold ${map[status] || ""}`}>{label[status] || status}</span>;
}
