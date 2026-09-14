"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindikana kuingia.");
        return;
      }
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Hitilafu ya mtandao. Jaribu tena.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        <Link href="/" className="flex items-center gap-2.5 font-[family-name:var(--font-display)] font-semibold text-[19px] text-[color:var(--forest)] mb-10 justify-center">
          <span className="w-[30px] h-[30px] rounded-full bg-[color:var(--green)] flex items-center justify-center flex-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3c-3 3-5 6-5 9a5 5 0 0010 0c0-3-2-6-5-9z" fill="var(--cream)"/></svg>
          </span>
          Shamba Voice
        </Link>

        <div className="card p-8 shadow-lg">
          <h1 className="text-[26px] mb-1.5">Karibu tena</h1>
          <p className="text-[15px] text-[color:var(--ink-soft)] mb-7">Ingia kuendelea na shamba lako.</p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Namba ya simu</span>
              <input
                className="input-field"
                type="tel"
                inputMode="tel"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Neno la siri</span>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="text-sm text-[#B4432C] bg-[#FBEAE5] border border-[#EFC7BA] rounded-lg px-3 py-2.5">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? "Inaingia..." : "Ingia"}
            </button>
          </form>

          <p className="text-center text-[14px] text-[color:var(--ink-soft)] mt-6">
            Huna akaunti?{" "}
            <Link href="/register" className="text-[color:var(--forest)] font-semibold">Jisajili</Link>
          </p>
        </div>

        <p className="text-center text-[12.5px] text-[color:var(--ink-faint)] mt-6">
          Akaunti ya admin ya majaribio: <code>0700000000</code> / <code>admin123</code>
        </p>
      </div>
    </div>
  );
}
