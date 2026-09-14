/**
 * Deterministic calculation engine.
 *
 * PRD Rule (Section 16 / 26): the LLM must never perform financial arithmetic.
 * All totals, margins, and comparisons are computed here with plain arithmetic
 * over the farmer's actual recorded transactions. The AI layer (src/lib/ai.ts)
 * only *explains* these numbers in natural Kiswahili — it never derives them.
 */

export type TxType = "expense" | "sale";

export interface TxLike {
  type: TxType;
  category: string;
  amount: number;
  crop?: string | null;
  occurredAt: string;
}

export interface SeasonSummary {
  totalExpenses: number;
  totalSales: number;
  grossMargin: number;
  expensesByCategory: Record<string, number>;
  salesByCrop: Record<string, number>;
  largestExpenseCategory: string | null;
  transactionCount: number;
}

export function summarizeSeason(transactions: TxLike[]): SeasonSummary {
  let totalExpenses = 0;
  let totalSales = 0;
  const expensesByCategory: Record<string, number> = {};
  const salesByCrop: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === "expense") {
      totalExpenses += tx.amount;
      expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;
    } else if (tx.type === "sale") {
      totalSales += tx.amount;
      const crop = tx.crop || "Nyingine";
      salesByCrop[crop] = (salesByCrop[crop] || 0) + tx.amount;
    }
  }

  let largestExpenseCategory: string | null = null;
  let largestAmount = -Infinity;
  for (const [category, amount] of Object.entries(expensesByCategory)) {
    if (amount > largestAmount) {
      largestAmount = amount;
      largestExpenseCategory = category;
    }
  }

  return {
    totalExpenses,
    totalSales,
    grossMargin: totalSales - totalExpenses,
    expensesByCategory,
    salesByCrop,
    largestExpenseCategory,
    transactionCount: transactions.length,
  };
}

/** Projects remaining cost-to-harvest using a simple linear run-rate over elapsed days. */
export function projectRemainingCost(
  transactions: TxLike[],
  seasonStart: Date,
  estimatedHarvestDate: Date,
  now: Date = new Date()
): { dailyBurnRate: number; projectedAdditionalCost: number; daysRemaining: number } {
  const elapsedDays = Math.max(1, Math.ceil((now.getTime() - seasonStart.getTime()) / 86_400_000));
  const daysRemaining = Math.max(0, Math.ceil((estimatedHarvestDate.getTime() - now.getTime()) / 86_400_000));
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const dailyBurnRate = totalExpenses / elapsedDays;
  return {
    dailyBurnRate,
    projectedAdditionalCost: Math.round(dailyBurnRate * daysRemaining),
    daysRemaining,
  };
}

export function formatTZS(amount: number): string {
  const rounded = Math.round(amount);
  return `TZS ${rounded.toLocaleString("en-US")}`;
}
