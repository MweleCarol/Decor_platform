import OpenAI, { toFile } from "openai";
import { env } from "../../config/env.js";

const CHAT_MODEL = "gpt-4o";
const IMAGE_MODEL = "gpt-image-1";

// Lazy initialization — only instantiate when a call is made,
// not at import time. This prevents a crash on startup when
// OPENAI_API_KEY is not yet set in .env.
let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set in .env. Add it before using AI features."
      );
    }
    _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return _client;
}

// ─── Chat completions ────────────────────────────────────────────────────────

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: Message[],
  jsonMode = false
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: CHAT_MODEL,
    messages,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content ?? "";
}

// ─── Image generation (text prompt → new image) ──────────────────────────────

export async function generateImage(prompt: string): Promise<string> {
  const response = await getClient().images.generate({
    model: IMAGE_MODEL,
    prompt,
    n: 1,
    size: "1024x1024",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image returned from OpenAI");
  return b64;
}

// ─── Image editing (room photo + prompt → redesigned room) ───────────────────

export async function editImage(
  imageBuffer: Buffer,
  filename: string,
  prompt: string
): Promise<string> {
  const file = await toFile(imageBuffer, filename, { type: "image/png" });

  const response = await getClient().images.edit({
    model: IMAGE_MODEL,
    image: file,
    prompt,
    n: 1,
    size: "1024x1024",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) throw new Error("No edited image returned from OpenAI");
  return b64;
}