import { openai } from "@ai-sdk/openai";

/**
 * Central OpenAI model helper for the Vercel AI SDK.
 *
 * All LLM calls in the app go through here so the model can be swapped
 * in one place. Requires `OPENAI_API_KEY` to be set; otherwise callers
 * should fall back to the deterministic rule-based logic.
 *
 * Override the default model with `OPENAI_MODEL` (e.g. "gpt-4o").
 */
export function getChatModel() {
  return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}
