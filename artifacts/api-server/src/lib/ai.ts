/**
 * AI text generation — Groq (fast, free tier) via the Vercel AI SDK.
 *
 * Swappable: to move to another provider later (Gemini, OpenAI, …), add its
 * @ai-sdk/* package and change the `model` line below. Everything that calls
 * generateAIText() stays unchanged.
 */
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// The AI SDK's Groq provider reads GROQ_API_KEY.
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/** True when a Groq API key is configured. */
export function hasAIKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

/**
 * Single-shot prompt → raw text output from the model.
 * Throws a clear error if no API key is configured.
 */
export async function generateAIText(system: string, prompt: string): Promise<string> {
  if (!hasAIKey()) {
    throw new Error("Groq API key not configured — set GROQ_API_KEY.");
  }

  const { text } = await generateText({
    model: groq(MODEL),
    system,
    prompt,
  });

  return text;
}
