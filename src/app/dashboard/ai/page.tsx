"use client";

import { useRef, useState } from "react";

type Msg = { role: "q" | "a"; text: string };

const SUGGESTED = [
  "Nimetumia pesa kiasi gani mpaka sasa?",
  "Nimeuza kiasi gani?",
  "Natumia pesa nyingi wapi?",
  "Msimu huu nimepata faida?",
  "Ni zao gani limenipa faida zaidi?",
];

export default function AIAssistantPage() {
  const [log, setLog] = useState<Msg[]>([
    { role: "a", text: "Habari! Uliza chochote kuhusu matumizi, mauzo au faida ya shamba lako." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  async function ask(question: string) {
    if (!question.trim() || sending) return;
    setLog((l) => [...l, { role: "q", text: question }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setLog((l) => [...l, { role: "a", text: res.ok ? data.answer : data.error || "Samahani, sikuweza kujibu." }]);
    } catch {
      setLog((l) => [...l, { role: "a", text: "Mtandao una tatizo. Jaribu tena." }]);
    } finally {
      setSending(false);
      setTimeout(() => logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="px-5 pt-5 pb-8 max-w-[640px] flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-full bg-[color:var(--forest)] flex items-center justify-center flex-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--paper)]">
            <path d="M21 11.5a8.4 8.4 0 01-8.9 8.4 9 9 0 01-3.6-.8L3 20l1-4.5A8.4 8.4 0 0112.5 3a8.4 8.4 0 018.5 8.5z" />
          </svg>
        </div>
        <h1 className="text-[19px]">Uliza Shamba Voice</h1>
      </div>

      <div ref={logRef} className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {log.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "q" ? "farmer ml-auto" : "system"}`} style={m.role === "q" ? { background: "var(--cream)", color: "var(--ink)", marginLeft: "auto" } : {}}>
            {m.text}
          </div>
        ))}
        {sending && <div className="bubble" style={{ background: "var(--cream)" }}>...</div>}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTED.map((q) => (
          <button key={q} onClick={() => ask(q)} className="bg-[color:var(--paper)] border border-[color:var(--line)] rounded-full px-3.5 py-2 text-[12.5px] text-[color:var(--ink-soft)] hover:border-[color:var(--green-soft)]">
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="input-field !rounded-full"
          placeholder="Andika swali lako..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
        />
        <button onClick={() => ask(input)} disabled={sending} className="w-11 h-11 rounded-full bg-[color:var(--forest)] flex items-center justify-center flex-none disabled:opacity-60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[color:var(--paper)]">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
