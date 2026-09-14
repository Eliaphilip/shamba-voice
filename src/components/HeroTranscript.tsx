"use client";

import { useEffect, useState } from "react";

type Line = { who: "farmer" | "system" | "confirm"; text: string };

const script: Line[] = [
  { who: "farmer", text: '"Leo nimelipa vibarua elfu hamsini kwa ajili ya kulima mahindi."' },
  { who: "system", text: "Nimeandika: Vibarua — TZS 50,000, Kulima Mahindi. Ni sahihi?" },
  { who: "farmer", text: '"Ndiyo."' },
  { who: "confirm", text: "✓ Rekodi imehifadhiwa" },
];

export default function HeroTranscript() {
  const [visible, setVisible] = useState<Line[]>([]);

  useEffect(() => {
    let idx = 0;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const step = () => {
      if (cancelled) return;
      if (idx >= script.length) {
        timeoutId = setTimeout(() => {
          setVisible([]);
          idx = 0;
          step();
        }, 2600);
        return;
      }
      setVisible((prev) => [...prev, script[idx]]);
      const delay = script[idx].who === "farmer" ? 1400 : 1600;
      idx++;
      timeoutId = setTimeout(step, delay);
    };
    step();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="transcript" aria-live="polite">
      {visible.map((line, i) => (
        <div
          key={i}
          className={
            line.who === "confirm"
              ? "flex items-center gap-2 self-end rounded-full border-[1.5px] px-4 py-2 text-[13.5px] font-semibold"
              : `bubble ${line.who}`
          }
          style={
            line.who === "confirm"
              ? { borderColor: "var(--green)", color: "var(--green-soft)" }
              : undefined
          }
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}
