import { generateText } from "ai";
import { getChatModel, isOpenAIConfigured } from "./ai-model";
import { SeasonSummary, formatTZS } from "./calc";

/**
 * PRD Rule 3 / Section 16: the calculation engine computes; the AI only explains.
 * This module builds a deterministic Kiswahili answer from `summary` first.
 * If OPENAI_API_KEY is set, we optionally ask OpenAI (via the Vercel AI SDK)
 * to rephrase that same answer more conversationally — but we pass it the
 * already-computed numbers as fixed facts, never asking it to do arithmetic
 * itself.
 */

export function answerFromData(question: string, summary: SeasonSummary): string {
  const q = question.toLowerCase();

  if (/(tumia|matumizi).*(kiasi gani|ngapi)/.test(q) || (q.includes("tumia") && !q.includes("wapi"))) {
    return `Mpaka sasa umetumia ${formatTZS(summary.totalExpenses)} msimu huu.`;
  }

  if (/(uza|mauzo).*(kiasi gani|ngapi)/.test(q) || q.includes("nimeuza")) {
    return `Umeuza jumla ya ${formatTZS(summary.totalSales)} msimu huu.`;
  }

  if (q.includes("faida")) {
    if (summary.grossMargin >= 0) {
      return `Ndiyo, una faida ya ${formatTZS(summary.grossMargin)} mpaka sasa (mauzo ukiondoa matumizi).`;
    }
    return `Bado hujafikia faida — matumizi yamezidi mauzo kwa ${formatTZS(Math.abs(summary.grossMargin))}.`;
  }

  if (q.includes("wapi") || (q.includes("pesa") && q.includes("nyingi"))) {
    if (summary.largestExpenseCategory) {
      const amt = summary.expensesByCategory[summary.largestExpenseCategory];
      return `Matumizi makubwa zaidi ni ${summary.largestExpenseCategory} — ${formatTZS(amt)} mpaka sasa.`;
    }
    return "Bado hujaweka rekodi ya matumizi msimu huu.";
  }

  if (q.includes("zao") && q.includes("faida")) {
    const entries = Object.entries(summary.salesByCrop).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return "Bado hujarekodi mauzo ya zao lolote msimu huu.";
    const [topCrop, amount] = entries[0];
    return `${topCrop} ndilo limekupa mauzo mengi zaidi — ${formatTZS(amount)}.`;
  }

  return `Mpaka sasa: matumizi ${formatTZS(summary.totalExpenses)}, mauzo ${formatTZS(summary.totalSales)}, tofauti ${formatTZS(summary.grossMargin)}.`;
}

const REPHRASE_SYSTEM_PROMPT = `You are Shamba Voice, a calm and concise Kiswahili farm assistant for a Tanzanian smallholder farmer.
You will be given a question and a factual answer that already contains correct, pre-calculated numbers.
Rephrase the answer in natural, warm, conversational Tanzanian Kiswahili in 1-2 short sentences.
Do NOT change any numbers. Do NOT add new numbers or claims. Do NOT add disclaimers.`;

export async function answerQuestion(question: string, summary: SeasonSummary): Promise<string> {
  const factualAnswer = answerFromData(question, summary);

  if (!isOpenAIConfigured()) return factualAnswer;

  try {
    const { text } = await generateText({
      model: getChatModel(),
      system: REPHRASE_SYSTEM_PROMPT,
      prompt: `Swali: ${question}\nJibu la ukweli (nambari ni sahihi, usibadilishe): ${factualAnswer}`,
      maxOutputTokens: 200,
      abortSignal: AbortSignal.timeout(6000),
    });
    return text.trim() || factualAnswer;
  } catch {
    return factualAnswer;
  }
}
