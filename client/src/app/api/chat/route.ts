import { readFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";

import { NextResponse } from "next/server";
import {
  buildProjectFallbackReply,
  buildProjectKnowledgeContext,
} from "@/lib/chatbot-project-knowledge";

export const runtime = "nodejs";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

const GEMINI_FALLBACK_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
];

const GEMINI_REQUEST_TIMEOUT_MS = 25000;
const GEMINI_TOTAL_TIMEOUT_MS = 45000;
const GEMINI_RETRY_DELAY_MS = 800;
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

const ASSISTANT_SYSTEM_PROMPT =
  "You are AutoRent Assistant for the AutoRental platform. Help with vehicle recommendations and platform questions about bookings, renter signup, peer host applications, company registration, verification, payments, wallets, and admin approvals. Use the provided project knowledge as your source of truth for app-specific details. If something is not confirmed in the project knowledge, say so clearly. Keep answers concise, accurate, practical, and well structured.";

const ENV_FILE_CANDIDATES = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "client", ".env.local"),
  path.resolve(process.cwd(), "client", ".env"),
];

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages: ChatMessage[];
};

function normalizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((message) => {
    if (!message || typeof message !== "object") return [];

    const role = "role" in message ? message.role : undefined;
    const content = "content" in message ? message.content : undefined;

    if (
      (role === "system" || role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim()
    ) {
      return [{ role, content: content.trim() }];
    }

    return [];
  });
}

function normalizeEnvValue(input: string | undefined | null) {
  return (
    input
      ?.replace(/^\uFEFF/, "")
      .replace(/[\u200B-\u200D\u2060]/g, "")
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1")
      .trim() ?? ""
  );
}

function extractEnvValue(fileContents: string, key: string) {
  const match = fileContents.match(
    new RegExp(`^\\s*${key}\\s*=\\s*(.+)\\s*$`, "m"),
  );

  if (!match) return "";

  return normalizeEnvValue(match[1]?.replace(/\s+#.*$/, ""));
}

async function loadAIConfig() {
  let geminiApiKey = normalizeEnvValue(process.env.GEMINI_API_KEY);
  let geminiModel =
    normalizeEnvValue(process.env.GEMINI_MODEL) || DEFAULT_GEMINI_MODEL;
  let groqApiKey = normalizeEnvValue(process.env.GROQ_API_KEY);
  let groqModel =
    normalizeEnvValue(process.env.GROQ_MODEL) || DEFAULT_GROQ_MODEL;
  let source = "process.env";

  for (const envPath of ENV_FILE_CANDIDATES) {
    try {
      const fileContents = await readFile(envPath, "utf8");
      const foundGeminiKey = extractEnvValue(fileContents, "GEMINI_API_KEY");
      const foundGeminiModel = extractEnvValue(fileContents, "GEMINI_MODEL");
      const foundGroqKey = extractEnvValue(fileContents, "GROQ_API_KEY");
      const foundGroqModel = extractEnvValue(fileContents, "GROQ_MODEL");

      if (foundGeminiKey && !geminiApiKey) {
        geminiApiKey = foundGeminiKey;
        geminiModel = foundGeminiModel || DEFAULT_GEMINI_MODEL;
        source = envPath;
      }

      if (foundGroqKey && !groqApiKey) {
        groqApiKey = foundGroqKey;
        groqModel = foundGroqModel || DEFAULT_GROQ_MODEL;
        if (!geminiApiKey) source = envPath;
      }
    } catch {
      continue;
    }
  }

  return {
    geminiApiKey,
    geminiModel,
    groqApiKey,
    groqModel,
    source,
  };
}

function httpsPostJson(
  url: string,
  bodyObj: unknown,
  timeoutMs = 20000,
): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(bodyObj);
    let settled = false;
    let timer: NodeJS.Timeout | null = null;

    function finishResolve(value: { status: number; data: string }) {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve(value);
    }

    function finishReject(error: Error) {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      reject(error);
    }

    const req = https.request(
      urlObj,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        res.on("end", () => {
          finishResolve({
            status: res.statusCode || 200,
            data: responseData,
          });
        });
        res.on("error", (err) => finishReject(err));
      },
    );

    timer = setTimeout(() => {
      req.destroy();
      finishReject(
        new Error(`HTTPS request timed out after ${timeoutMs}ms`),
      );
    }, timeoutMs);

    req.on("timeout", () => {
      req.destroy();
      finishReject(
        new Error(`HTTPS request timed out after ${timeoutMs}ms`),
      );
    });

    req.on("error", (err) => {
      finishReject(err);
    });

    req.write(postData);
    req.end();
  });
}

class GeminiHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "GeminiHttpError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<{ content: string; model: string }> {
  const systemContext = `${ASSISTANT_SYSTEM_PROMPT}\n\n${buildProjectKnowledgeContext(messages)}`;

  const contents = [
    {
      role: "user",
      parts: [{ text: systemContext }],
    },
    {
      role: "model",
      parts: [
        {
          text: "Understood. I am AutoRent Assistant, ready to help users with vehicle recommendations, bookings, verification, hosting, and platform inquiries.",
        },
      ],
    },
    ...messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
  ];

  const primaryModel = model || DEFAULT_GEMINI_MODEL;
  const candidateModels = [primaryModel, ...GEMINI_FALLBACK_MODELS].filter(
    (m, idx, arr) => arr.indexOf(m) === idx,
  );

  const deadline = Date.now() + GEMINI_TOTAL_TIMEOUT_MS;
  let lastError: Error | null = null;

  for (const candidate of candidateModels) {
    const maxAttempts = candidate === primaryModel ? 2 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 1000) break;

      const timeoutMs = Math.min(GEMINI_REQUEST_TIMEOUT_MS, remainingMs);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${candidate}:generateContent?key=${apiKey}`;
        const response = await httpsPostJson(
          url,
          {
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800,
            },
          },
          timeoutMs,
        );

        if (response.status < 200 || response.status >= 300) {
          throw new GeminiHttpError(
            `Gemini (${candidate}) HTTP ${response.status}: ${response.data}`,
            response.status,
          );
        }

        const data = JSON.parse(response.data) as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string; thought?: boolean }>;
            };
          }>;
        };

        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .filter((part) => part.thought !== true && part.text?.trim())
          .map((part) => part.text)
          .join("")
          .trim();

        if (!text) {
          throw new Error(`Gemini (${candidate}) returned empty candidate content.`);
        }

        return { content: text, model: candidate };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        const isTimeout = /timed out|timeout/i.test(lastError.message);
        const isNonRetryableStatus =
          err instanceof GeminiHttpError &&
          !RETRYABLE_STATUS_CODES.has(err.status);
        const canRetry =
          attempt < maxAttempts &&
          !isTimeout &&
          !isNonRetryableStatus &&
          Date.now() + GEMINI_RETRY_DELAY_MS < deadline;

        console.warn(
          `[chat] Gemini (${candidate}) attempt ${attempt}/${maxAttempts} failed:`,
          lastError.message,
        );

        if (canRetry) {
          await sleep(GEMINI_RETRY_DELAY_MS);
          continue;
        }

        break;
      }
    }

    if (Date.now() >= deadline) break;
  }

  throw lastError || new Error("Gemini call failed.");
}

async function callGroq(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const groqMessages = [
    { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
    { role: "system", content: buildProjectKnowledgeContext(messages) },
    ...messages.filter((m) => m.role !== "system"),
  ];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: groqMessages,
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Groq HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("Groq returned empty choice content.");
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = normalizeMessages(body.messages);
  if (!messages.length) {
    return NextResponse.json(
      { error: "Body must include a non-empty messages array." },
      { status: 400 },
    );
  }

  const { geminiApiKey, geminiModel, groqApiKey, groqModel, source } =
    await loadAIConfig();

  // 1. Try Gemini if configured
  if (geminiApiKey) {
    try {
      const result = await callGemini(geminiApiKey, geminiModel, messages);
      return NextResponse.json({
        content: result.content,
        provider: "gemini",
        model: result.model,
      });
    } catch (geminiError) {
      console.warn(
        "[chat] Gemini request failed, attempting fallback:",
        geminiError instanceof Error ? geminiError.message : geminiError,
      );
    }
  }

  // 2. Try Groq if configured
  if (groqApiKey) {
    try {
      const content = await callGroq(groqApiKey, groqModel, messages);
      return NextResponse.json({
        content,
        provider: "groq",
        model: groqModel,
      });
    } catch (groqError) {
      console.warn(
        "[chat] Groq request failed, attempting fallback:",
        groqError instanceof Error ? groqError.message : groqError,
      );
    }
  }

  // 3. Graceful Fallback
  let fallbackContent: string;
  try {
    fallbackContent = buildProjectFallbackReply(messages);
  } catch (fallbackError) {
    console.error("[chat] Fallback reply failed:", fallbackError);
    fallbackContent =
      "I'm having trouble reaching the assistant right now. Please try again in a moment, or ask about vehicle categories, bookings, or becoming a host.";
  }

  return NextResponse.json({
    content: fallbackContent,
    fallback: true,
    reason:
      geminiApiKey || groqApiKey
        ? "ai_service_unavailable"
        : "missing_api_key",
    debug: {
      source,
      hasGeminiKey: Boolean(geminiApiKey),
      hasGroqKey: Boolean(groqApiKey),
    },
  });
}
