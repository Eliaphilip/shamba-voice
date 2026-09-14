"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ExtractionResult = {
  type: "expense" | "sale" | null;
  category: string | null;
  activity: string | null;
  amount: number | null;
  crop: string | null;
  quantityLabel: string | null;
  missingFields: string[];
  confidence: number;
};

type Phase = "idle" | "listening" | "processing" | "review" | "clarify" | "saving";

interface VoiceContextValue {
  openRecorder: () => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used inside <VoiceProvider>");
  return ctx;
}

const CATEGORY_LABELS: Record<string, string> = {
  expense: "Matumizi",
  sale: "Mauzo",
};

export function VoiceProvider({ children, onSaved }: { children: React.ReactNode; onSaved?: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [voiceRecordingId, setVoiceRecordingId] = useState<string | null>(null);
  const [clarifyValue, setClarifyValue] = useState("");
  const [manualText, setManualText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const speechSupported =
    typeof window !== "undefined" && ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);

  const runExtraction = useCallback(async (text: string) => {
    setPhase("processing");
    setError(null);
    try {
      const res = await fetch("/api/voice/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Sauti haikueleweka. Jaribu tena.");
        setPhase("idle");
        return;
      }
      setExtraction(data.extraction);
      setVoiceRecordingId(data.voiceRecordingId);
      if (data.extraction.missingFields.includes("amount")) {
        setPhase("clarify");
      } else {
        setPhase("review");
      }
    } catch {
      setError("Mtandao una tatizo. Rekodi imehifadhiwa kwenye simu, itajaribu tena baadaye.");
      setPhase("idle");
    }
  }, []);

  const openRecorder = useCallback(() => {
    setSheetOpen(true);
    setPhase("idle");
    setExtraction(null);
    setTranscript("");
    setManualText("");
    setClarifyValue("");
    setError(null);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "sw-TZ";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setPhase("listening");
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setTranscript(text);
      runExtraction(text);
    };
    recognition.onerror = () => {
      setError("Sikukuelewa vizuri. Tafadhali jaribu tena au andika badala yake.");
      setPhase("idle");
    };
    recognition.onend = () => {
      setPhase((p) => (p === "listening" ? "idle" : p));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [speechSupported, runExtraction]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const submitManualText = useCallback(() => {
    if (!manualText.trim()) return;
    setTranscript(manualText);
    runExtraction(manualText);
  }, [manualText, runExtraction]);

  const submitClarify = useCallback(() => {
    const amount = Number(clarifyValue);
    if (!amount || amount <= 0) return;
    setExtraction((prev) => (prev ? { ...prev, amount, missingFields: prev.missingFields.filter((f) => f !== "amount") } : prev));
    setPhase("review");
  }, [clarifyValue]);

  const confirmSave = useCallback(async () => {
    if (!extraction || !extraction.type || !extraction.amount) return;
    setPhase("saving");
    try {
      const res = await fetch("/api/voice/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          voiceRecordingId,
          type: extraction.type,
          category: extraction.category || (extraction.type === "sale" ? "Mauzo" : "Nyingine"),
          activity: extraction.activity,
          amount: extraction.amount,
          crop: extraction.crop,
          quantityLabel: extraction.quantityLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Imeshindikana kuhifadhi.");
        setPhase("review");
        return;
      }
      setSheetOpen(false);
      setPhase("idle");
      showToast("✓ Rekodi imehifadhiwa");
      onSaved?.();
      window.dispatchEvent(new CustomEvent("sv:transaction-saved"));
    } catch {
      setError("Mtandao una tatizo. Jaribu tena.");
      setPhase("review");
    }
  }, [extraction, voiceRecordingId, onSaved]);

  const closeSheet = useCallback(() => {
    recognitionRef.current?.stop();
    setSheetOpen(false);
    setPhase("idle");
  }, []);

  return (
    <VoiceContext.Provider value={{ openRecorder }}>
      {children}

      {sheetOpen && (
        <div
          className="sheet-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSheet();
          }}
        >
          <div className="sheet">
            {(phase === "idle" || phase === "listening") && (
              <div className="text-center">
                <h3 className="text-[19px] mb-5">Ongea na Shamba</h3>
                <button
                  onClick={phase === "listening" ? stopListening : speechSupported ? startListening : undefined}
                  className={`mic-btn mx-auto ${phase === "listening" ? "recording" : ""}`}
                  aria-label={phase === "listening" ? "Inarekodi... bonyeza kuacha" : "Bonyeza kuanza kurekodi"}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3z" />
                    <path d="M19 11a7 7 0 01-14 0M12 18v3" />
                  </svg>
                </button>
                <p className="mt-4 text-[14px] text-[color:var(--ink-soft)]">
                  {phase === "listening" ? "Ninasikiliza... sema ulichofanya leo" : "Bonyeza na sema ulichofanya leo"}
                </p>
                {!speechSupported && (
                  <p className="mt-2 text-[12.5px] text-[color:var(--ink-faint)]">
                    Kivinjari chako hakiungi mkono sauti moja kwa moja — andika chini badala yake.
                  </p>
                )}
                <div className="mt-5 flex gap-2">
                  <input
                    className="input-field"
                    placeholder='Mfano: "Nimenunua mbolea kwa elfu themanini"'
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitManualText()}
                  />
                  <button className="btn-secondary !px-4" onClick={submitManualText}>Tuma</button>
                </div>
                {error && <p className="mt-3 text-sm text-[#B4432C]">{error}</p>}
                <button className="mt-5 text-[13.5px] text-[color:var(--ink-faint)]" onClick={closeSheet}>Ghairi</button>
              </div>
            )}

            {phase === "processing" && (
              <div className="text-center py-6">
                <div className="flex items-end justify-center gap-1 h-6 mb-4">
                  {[30, 70, 100, 55, 85, 40, 65].map((h, i) => (
                    <i key={i} className="wave-bar" style={{ height: `${h}%`, background: "var(--green)", animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="text-[14.5px] text-[color:var(--ink-soft)]">Ninachakata...</p>
              </div>
            )}

            {phase === "clarify" && extraction && (
              <div>
                <h3 className="text-[19px] mb-4">Nimeelewa hivi</h3>
                <div className="bg-[#FBF0E4] border border-[#E9D3AC] rounded-xl p-4 mb-4">
                  <p className="text-[14.5px] text-[color:var(--soil)] font-semibold">Umenunua kwa shilingi ngapi?</p>
                  <div className="flex gap-2.5 mt-3">
                    <input
                      className="input-field"
                      type="number"
                      inputMode="numeric"
                      autoFocus
                      placeholder="Mfano: 80000"
                      value={clarifyValue}
                      onChange={(e) => setClarifyValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitClarify()}
                    />
                    <button className="btn-primary !px-4 !py-0" onClick={submitClarify}>Tuma</button>
                  </div>
                </div>
                <ExtractionRows extraction={extraction} />
                <button className="btn-secondary w-full mt-2" onClick={closeSheet}>Ghairi</button>
              </div>
            )}

            {(phase === "review" || phase === "saving") && extraction && (
              <div>
                <h3 className="text-[19px] mb-4">Nimeelewa hivi</h3>
                <ExtractionRows extraction={extraction} />
                {error && <p className="text-sm text-[#B4432C] mb-3">{error}</p>}
                <div className="flex gap-3 mt-5">
                  <button className="btn-secondary flex-1" onClick={closeSheet} disabled={phase === "saving"}>
                    ✎ Rekebisha
                  </button>
                  <button className="btn-primary flex-1" onClick={confirmSave} disabled={phase === "saving"}>
                    {phase === "saving" ? "Inahifadhi..." : "✓ Ndiyo, hifadhi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ color: "#8FD19E" }}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <span>{toast}</span>
      </div>
    </VoiceContext.Provider>
  );
}

function ExtractionRows({ extraction }: { extraction: ExtractionResult }) {
  const rows = [
    { k: "Aina", v: extraction.type ? CATEGORY_LABELS[extraction.type] : "—" },
    { k: "Kipengele", v: extraction.category || "—" },
    { k: "Kiasi", v: extraction.amount ? `TZS ${extraction.amount.toLocaleString("en-US")}` : "—" },
    ...(extraction.activity ? [{ k: "Shughuli", v: extraction.activity }] : []),
    ...(extraction.crop ? [{ k: "Zao", v: extraction.crop }] : []),
    ...(extraction.quantityLabel ? [{ k: "Kiasi/Idadi", v: extraction.quantityLabel }] : []),
  ];
  return (
    <div className="flex flex-col">
      {rows.map((r) => (
        <div key={r.k} className="flex justify-between items-center py-2.5 border-b border-[color:var(--line)] last:border-b-0">
          <span className="text-[13.5px] text-[color:var(--ink-faint)]">{r.k}</span>
          <span className="text-[15px] font-semibold text-[color:var(--forest)]">{r.v}</span>
        </div>
      ))}
    </div>
  );
}
