/**
 * AI text generation — Google Gemini via the Vercel AI SDK.
 *
 * Swappable: to move back to OpenAI later, add `@ai-sdk/openai` and switch the
 * `model` line below to `openai(MODEL)`. Everything that calls generateAIText()
 * stays unchanged.
 */
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// The AI SDK's Google provider reads GOOGLE_GENERATIVE_AI_API_KEY. Accept the
// friendlier GEMINI_API_KEY as an alias so either env var works.
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/** True when a Gemini API key is configured. */
export function hasAIKey(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

/**
 * Single-shot prompt → raw text output from Gemini.
 * Throws a clear error if no API key is configured.
 */
export async function generateAIText(system: string, prompt: string): Promise<string> {
  if (!hasAIKey()) {
    throw new Error(
      "Gemini API key not configured — set GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY).",
    );
  }

  const { text } = await generateText({
    model: google(MODEL),
    system,
    prompt,
  });

  return text;
}
