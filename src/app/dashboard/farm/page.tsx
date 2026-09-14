"use client";

import { useEffect, useState } from "react";

type Profile = {
  farmer: { farmerCode: string; name: string; preferredLanguage: string; locationApprox: string | null };
  farm: { name: string; sizeAcres: number | null; primaryCrop: string } | null;
  season: { label: string; crop: string; plantingDate: string | null } | null;
  harvest: { total: number; unit: string };
};

export default function FarmProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/farm").then((r) => r.json()).then((data) => {
      setProfile(data);
      setLocation(data.farmer?.locationApprox || "");
      setSize(data.farm?.sizeAcres ? String(data.farm.sizeAcres) : "");
    });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/farm", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        locationApprox: location || undefined,
        sizeAcres: size ? Number(size) : undefined,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) return <div className="px-5 pt-5 text-[color:var(--ink-faint)] text-sm">Inapakia...</div>;

  return (
    <div className="px-5 pt-5 pb-8 max-w-[640px]">
      <h1 className="text-[22px] mb-6">Wasifu wa Shamba</h1>

      <Section title="MKULIMA">
        <Row label="Jina" value={profile.farmer.name} />
        <Row label="Namba ya Mkulima" value={profile.farmer.farmerCode} />
        <Row label="Lugha" value={profile.farmer.preferredLanguage === "sw" ? "Kiswahili" : profile.farmer.preferredLanguage} />
      </Section>

      <Section title="SHAMBA">
        <Row label="Jina la shamba" value={profile.farm?.name || "—"} />
        <Row label="Zao kuu" value={profile.farm?.primaryCrop || "—"} />
        <Row label="Msimu" value={profile.season?.label || "—"} />
      </Section>

      <Section title="UZALISHAJI">
        <Row label="Mavuno ya msimu huu" value={`${profile.harvest.total} ${profile.harvest.unit}`} />
      </Section>

      <Section title="BADILISHA TAARIFA">
        <label className="flex flex-col gap-1.5 mb-4">
          <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Eneo (takriban)</span>
          <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mfano: Kilosa, Morogoro" />
        </label>
        <label className="flex flex-col gap-1.5 mb-4">
          <span className="text-[13.5px] font-medium text-[color:var(--ink-soft)]">Ukubwa wa shamba (ekari)</span>
          <input className="input-field" type="number" step="0.1" value={size} onChange={(e) => setSize(e.target.value)} />
        </label>
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? "Inahifadhi..." : saved ? "✓ Imehifadhiwa" : "Hifadhi Mabadiliko"}
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <div className="text-[12.5px] text-[color:var(--ink-faint)] font-semibold mb-2.5 tracking-wide">{title}</div>
      <div className="card p-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 text-[14.5px]">
      <span className="text-[color:var(--ink-faint)]">{label}</span>
      <span className="font-medium text-[color:var(--forest)]">{value}</span>
    </div>
  );
}
