"use client";

import { useEffect, useState } from "react";

type Line = { who: "farmer" | "system" | "confirm"; text: string };

const SCRIPT: Line[] = [
  { who: "farmer", text: '"Leo nimelipa vibarua elfu hamsini kwa ajili ya kulima mahindi."' },
  { who: "system", text: "Nimeandika: Vibarua — TZS 50,000, Kulima Mahindi. Ni sahihi?" },
  { who: "farmer", text: '"Ndiyo."' },
  { who: "confirm", text: "✓ Rekodi imehifadhiwa" },
];

export default function HeroTranscript() {
  const [visible, setVisible] = useState<Line[]>([]);

  useEffect(() => {
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      if (idx >= SCRIPT.length) {
        timer = setTimeout(() => {
          setVisible([]);
          idx = 0;
          step();
        }, 2600);
        return;
      }
      setVisible((v) => [...v, SCRIPT[idx]]);
      const delay = SCRIPT[idx].who === "farmer" ? 1400 : 1600;
      idx++;
      timer = setTimeout(step, delay);
    };

    step();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="demo-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[13.5px] text-ink-faint font-semibold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
          Eliya, Shamba la Mahindi
        </div>
        <div className="status-live">
          <span className="pulse" />
          Moja kwa moja
        </div>
      </div>

      <div className="min-h-[150px] flex flex-col gap-2.5">
        {visible.map((line, i) =>
          line.who === "confirm" ? (
            <div
              key={i}
              className="self-end border-[1.5px] border-green-soft text-green-soft font-semibold rounded-full px-4 py-2 text-[13.5px]"
            >
              {line.text}
            </div>
          ) : (
            <div key={i} className={`bubble ${line.who}`}>
              {line.text}
            </div>
          )
        )}
      </div>

      <div className="h-px bg-line my-4" />
      <div className="flex items-center gap-3 text-ink-faint text-[13px]">
        <div className="flex items-end gap-[2.5px] h-4">
          {[40, 90, 60, 100, 50, 75].map((h, i) => (
            <span
              key={i}
              className="wave-bar"
              style={{ height: `${h}%`, animationDelay: `${i * 0.1}s`, background: "var(--green-soft)" }}
            />
          ))}
        </div>
        <span>Ninasikiliza kupitia sauti...</span>
      </div>
    </div>
  );
}
