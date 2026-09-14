"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CROPS = ["Mahindi", "Maharage", "Mpunga", "Nyanya", "Vitunguu", "Alizeti", "Muhogo"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [primaryCrop, setPrimaryCrop] = useState("Mahindi");
  const [farmSizeAcres, setFarmSizeAcres] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("Tafadhali kubali matumizi ya taarifa zako kuendelea.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          password,
          primaryCrop,
          farmSizeAcres: farmSizeAcres ? Number(farmSizeAcres) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindikana kujisajili.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Hitilafu ya mtandao. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] font-semibold text-[19px] text-[color:var(--forest)] mb-10 justify-center">
          <span className="w-[30px] h-[30px] rounded-full bg-[color:var(--green)] flex items-center justify-center flex-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" fill="var(--cream)"/></svg>
          </span>
          Shamba Voice
        </Link>

        <div className="card p-8 shadow-lg">
          <h1 className="text-[26px] mb-1.5">Anza kutumia</h1>
          <p className="text-[15px] text-[color:var(--ink-soft)] mb-7">Dakika moja tu, kisha unaweza kuongea na shamba lako.</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Jina lako</span>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Eliya Mushi" required />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Namba ya simu</span>
              <input className="input-field" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" required />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Neno la siri</span>
              <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Angalau herufi 4" required />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Zao kuu</span>
                <select className="input-field" value={primaryCrop} onChange={(e) => setPrimaryCrop(e.target.value)}>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Ukubwa (ekari)</span>
                <input className="input-field" type="number" step="0.1" min="0" value={farmSizeAcres} onChange={(e) => setFarmSizeAcres(e.target.value)} placeholder="Hiari" />
              </label>
            </div>

            <label className="flex items-start gap-2.5 text-[13px] text-[color:var(--ink-soft)] mt-1">
              <input type="checkbox" className="mt-0.5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              Nakubali Shamba Voice kuhifadhi rekodi za sauti na taarifa za shamba langu ili kunisaidia kufuatilia matumizi na mauzo. Sitashiriki taarifa hizi bila ruhusa yangu.
            </label>

            {error && <p className="text-sm text-[#B4432C] bg-[#FBEAE5] border border-[#EFC7BA] rounded-lg px-3 py-2.5">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-1">
              {loading ? "Inasajili..." : "Anza Kutumia"}
            </button>
          </form>

          <p className="text-center text-[14px] text-[color:var(--ink-soft)] mt-6">
            Una akaunti tayari?{" "}
            <Link href="/login" className="text-[color:var(--forest)] font-semibold">Ingia</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
