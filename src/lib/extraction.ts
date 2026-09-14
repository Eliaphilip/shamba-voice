/**
 * Extraction pipeline: Kiswahili transcript -> structured farm transaction.
 *
 * Two layers, matching PRD Section 23:
 *  1. Rule-based Kiswahili parser (below) — fast, free, works with zero configuration,
 *     and covers the common phrasings farmers actually use ("nimenunua mbolea kwa elfu
 *     themanini", "nimeuza mahindi kwa laki mbili na hamsini").
 *  2. Optional Claude API call (ANTHROPIC_API_KEY) for utterances the rule-based parser
 *     can't confidently resolve — strictly for *interpretation*, never for arithmetic
 *     (see src/lib/calc.ts for the deterministic math, per PRD Rule 3).
 *
 * PRD Rule 1 (Section 11 / 26): never invent a missing amount. If the amount can't be
 * found, the result comes back with missingFields=["amount"] and the caller must ask
 * the farmer directly rather than guess.
 */

export type ExtractedTransaction = {
  type: "expense" | "sale" | null;
  category: string | null;
  activity: string | null;
  amount: number | null;
  crop: string | null;
  quantityLabel: string | null;
  missingFields: string[];
  confidence: number;
};

// ---------- Kiswahili number-word parsing ----------

const UNITS: Record<string, number> = {
  moja: 1, mbili: 2, tatu: 3, nne: 4, tano: 5,
  sita: 6, saba: 7, nane: 8, tisa: 9,
};

const TEENS: Record<string, number> = {
  kumi: 10,
};

const TENS: Record<string, number> = {
  ishirini: 20, thelathini: 30, arobaini: 40, hamsini: 50,
  sitini: 60, sabini: 70, themanini: 80, tisini: 90,
};

const MAGNITUDES: Record<string, number> = { mia: 100, elfu: 1000, laki: 100000 };
const SMALL_WORD_SET = new Set([...Object.keys(UNITS), ...Object.keys(TEENS), ...Object.keys(TENS)]);
const NUMBER_WORD_SET = new Set([...SMALL_WORD_SET, ...Object.keys(MAGNITUDES), "na"]);

/**
 * Parses a contiguous run of Kiswahili number-words into a number.
 *
 * Kiswahili places the magnitude word BEFORE its multiplier ("elfu hamsini" = thousand-fifty
 * = 50,000 — the reverse of English "fifty thousand"). So for each magnitude word we look
 * *ahead* for the small number that multiplies it, then continue. Any small number-word not
 * attached to a magnitude is added directly (e.g. "...na hamsini" = "...and fifty").
 * "na" is just a connector and is skipped.
 */
function parseSwahiliNumberWords(tokens: string[]): number {
  let total = 0;
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i];

    if (t in MAGNITUDES) {
      let mult = 0;
      let j = i + 1;
      while (j < tokens.length && SMALL_WORD_SET.has(tokens[j])) {
        mult += UNITS[tokens[j]] ?? TEENS[tokens[j]] ?? TENS[tokens[j]] ?? 0;
        j++;
      }
      total += (mult || 1) * MAGNITUDES[t];
      i = j;
    } else if (SMALL_WORD_SET.has(t)) {
      total += UNITS[t] ?? TEENS[t] ?? TENS[t] ?? 0;
      i++;
    } else if (t === "na") {
      i++; // connector
    } else {
      break; // unrecognized token — stop consuming
    }
  }
  return total;
}

/** Finds the best amount in a Kiswahili transcript: digits first, then number-words. */
export function parseAmount(transcriptRaw: string): number | null {
  const transcript = transcriptRaw.toLowerCase();

  // 1. Explicit digits, e.g. "shilingi 80000", "TZS 50,000", "80000/="
  const digitMatch = transcript.match(/(\d[\d,]{2,})/);
  if (digitMatch) {
    const val = Number(digitMatch[1].replace(/,/g, ""));
    if (!Number.isNaN(val) && val > 0) return val;
  }

  const words = transcript.replace(/[.,!?]/g, " ").split(/\s+/).filter(Boolean);

  const extractRunAt = (start: number): string[] => {
    const run: string[] = [];
    let j = start;
    while (j < words.length && NUMBER_WORD_SET.has(words[j])) {
      run.push(words[j]);
      j++;
    }
    return run;
  };

  // 2. Prefer a number-word run right after an explicit cue ("kwa", "shilingi")
  for (let i = 0; i < words.length; i++) {
    if ((words[i] === "kwa" || words[i] === "shilingi") && i + 1 < words.length && NUMBER_WORD_SET.has(words[i + 1])) {
      const run = extractRunAt(i + 1);
      const val = parseSwahiliNumberWords(run);
      if (val > 0) return val;
    }
  }

  // 3. Otherwise, the first run that contains a real magnitude word (elfu/laki/mia) is a much
  //    safer signal of a monetary amount than a bare small number (which is often a quantity,
  //    e.g. "mifuko mawili" = two bags).
  for (let i = 0; i < words.length; i++) {
    if (words[i] in MAGNITUDES) {
      const run = extractRunAt(i);
      const val = parseSwahiliNumberWords(run);
      if (val > 0) return val;
    }
  }

  return null;
}

// ---------- Category / type / crop keyword maps ----------

const EXPENSE_CATEGORY_KEYWORDS: Array<{ match: RegExp; category: string; activity?: string }> = [
  { match: /mbolea/, category: "Mbolea" },
  { match: /mbegu/, category: "Mbegu" },
  { match: /dawa|sumu|viuatilifu/, category: "Dawa" },
  { match: /vibarua|kibarua/, category: "Vibarua" },
  { match: /usafiri|gari|pikipiki|mafuta/, category: "Usafiri" },
  { match: /kukodi|kodi ya shamba|kukodisha/, category: "Kukodi Shamba" },
];

const ACTIVITY_KEYWORDS: Array<{ match: RegExp; activity: string }> = [
  { match: /kulima|kulimia/, activity: "Kulima" },
  { match: /kupalilia/, activity: "Kupalilia" },
  { match: /kuvuna/, activity: "Kuvuna" },
  { match: /kupanda|kupandia/, activity: "Kupanda" },
  { match: /kunyunyizia/, activity: "Kunyunyizia dawa" },
];

const CROP_KEYWORDS: Array<{ match: RegExp; crop: string }> = [
  { match: /mahindi/, crop: "Mahindi" },
  { match: /maharage/, crop: "Maharage" },
  { match: /mpunga|mchele/, crop: "Mpunga" },
  { match: /nyanya/, crop: "Nyanya" },
  { match: /vitunguu/, crop: "Vitunguu" },
  { match: /alizeti/, crop: "Alizeti" },
  { match: /muhogo/, crop: "Muhogo" },
];

const SALE_KEYWORDS = /(nimeuza|nauza|niliuza|mauzo)/;
const EXPENSE_VERB_KEYWORDS = /(nimenunua|ninanunua|nililipa|nimelipa|nalipa)/;

export function extractFromTranscript(transcript: string): ExtractedTransaction {
  const lower = transcript.toLowerCase();
  const missingFields: string[] = [];

  // --- type ---
  let type: "expense" | "sale" | null = null;
  if (SALE_KEYWORDS.test(lower)) type = "sale";
  else if (EXPENSE_VERB_KEYWORDS.test(lower)) type = "expense";

  // --- category / activity ---
  let category: string | null = null;
  let activity: string | null = null;

  if (type === "sale") {
    category = "Mauzo";
  } else {
    for (const entry of EXPENSE_CATEGORY_KEYWORDS) {
      if (entry.match.test(lower)) {
        category = entry.category;
        break;
      }
    }
  }
  for (const entry of ACTIVITY_KEYWORDS) {
    if (entry.match.test(lower)) {
      activity = entry.activity;
      break;
    }
  }
  // Labour expense without an explicit category keyword but with an activity: treat as Vibarua
  if (!category && type === "expense" && activity) category = "Vibarua";

  // If we detected vibarua/labour spend but no type yet, assume expense
  if (!type && category) type = "expense";

  // --- crop ---
  let crop: string | null = null;
  for (const entry of CROP_KEYWORDS) {
    if (entry.match.test(lower)) {
      crop = entry.crop;
      break;
    }
  }

  // --- amount ---
  const amount = parseAmount(transcript);

  // --- quantity label (bags, people, litres) ---
  let quantityLabel: string | null = null;
  const bagMatch = lower.match(/(\d+)\s*(mfuko|mifuko)/);
  const peopleMatch = lower.match(/(\d+)\s*(mtu|watu)/);
  if (bagMatch) quantityLabel = `Mifuko ${bagMatch[1]}`;
  else if (peopleMatch) quantityLabel = `Watu ${peopleMatch[1]}`;

  // --- required-field checks (PRD Rule 1: never invent missing data) ---
  if (amount === null) missingFields.push("amount");
  if (type === null) missingFields.push("type");
  if (type !== "sale" && category === null) missingFields.push("category");

  // crude confidence score: proportion of key fields resolved
  const fieldsChecked = [type, category, amount];
  const resolved = fieldsChecked.filter((f) => f !== null).length;
  const confidence = resolved / fieldsChecked.length;

  return { type, category, activity, amount, crop, quantityLabel, missingFields, confidence };
}

// ---------- Optional LLM-assisted extraction (used when ANTHROPIC_API_KEY is set) ----------

const EXTRACTION_SYSTEM_PROMPT = `You extract structured farm-transaction data from a Tanzanian farmer's spoken Kiswahili sentence.
Respond with ONLY minified JSON, no prose, no markdown fences, matching exactly this shape:
{"type":"expense"|"sale"|null,"category":string|null,"activity":string|null,"amount":number|null,"crop":string|null,"quantityLabel":string|null}
Rules:
- amount must be a plain number in Tanzanian Shillings, or null if not stated. NEVER invent or estimate an amount.
- category should be a short Kiswahili noun (e.g. "Mbolea", "Vibarua", "Mauzo", "Usafiri", "Mbegu", "Dawa").
- If the sentence doesn't mention a value clearly, leave that field null rather than guessing.`;

export async function extractWithClaude(transcript: string): Promise<ExtractedTransaction | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: EXTRACTION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: transcript }],
      }),
      // Keep this fast — the farmer is waiting on a mobile connection.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.content || []).map((b: any) => b.text || "").join("").trim();
    const cleaned = text.replace(/^```json\s*|```$/g, "");
    const parsed = JSON.parse(cleaned);

    const missingFields: string[] = [];
    if (parsed.amount === null || parsed.amount === undefined) missingFields.push("amount");
    if (!parsed.type) missingFields.push("type");
    if (parsed.type !== "sale" && !parsed.category) missingFields.push("category");

    return {
      type: parsed.type ?? null,
      category: parsed.category ?? null,
      activity: parsed.activity ?? null,
      amount: typeof parsed.amount === "number" ? parsed.amount : null,
      crop: parsed.crop ?? null,
      quantityLabel: parsed.quantityLabel ?? null,
      missingFields,
      confidence: 0.9,
    };
  } catch {
    return null; // network hiccup or malformed response — fall back to rule-based result
  }
}

/** Main entry point: tries the rule-based parser; escalates to Claude only if confidence is low and a key is configured. */
export async function extractTransaction(transcript: string): Promise<ExtractedTransaction> {
  const ruleBased = extractFromTranscript(transcript);
  if (ruleBased.confidence >= 0.66) return ruleBased;

  const llmResult = await extractWithClaude(transcript);
  return llmResult ?? ruleBased;
}
