import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import {
  buildProjectFallbackReply,
  buildProjectKnowledgeContext,
} from "@/lib/chatbot-project-knowledge";

export const runtime = "nodejs";

const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

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

async function loadGroqConfig() {
  for (const envPath of ENV_FILE_CANDIDATES) {
    try {
      const fileContents = await readFile(envPath, "utf8");
      const apiKey = extractEnvValue(fileContents, "GROQ_API_KEY");

      if (!apiKey) {
        continue;
      }

      return {
        apiKey,
        model:
          extractEnvValue(fileContents, "GROQ_MODEL") || DEFAULT_GROQ_MODEL,
        source: envPath,
      };
    } catch {
      continue;
    }
  }

  const processApiKey = normalizeEnvValue(process.env.GROQ_API_KEY);
  const processModel = normalizeEnvValue(process.env.GROQ_MODEL);

  if (processApiKey) {
    return {
      apiKey: processApiKey,
      model: processModel || DEFAULT_GROQ_MODEL,
      source: "process.env",
    };
  }

  return {
    apiKey: "",
    model: processModel || DEFAULT_GROQ_MODEL,
    source: "not_found",
  };
}

function buildGroqMessages(messages: ChatMessage[]) {
  const systemMessages: ChatMessage[] = [
    { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
    {
      role: "system",
      content: buildProjectKnowledgeContext(messages),
    },
  ];

  const nonSystemMessages = messages.filter((message) => message.role !== "system");
  return [...systemMessages, ...nonSystemMessages];
}

function buildFallbackReply(messages: ChatMessage[]) {
  return buildProjectFallbackReply(messages);
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

  const { apiKey, model, source } = await loadGroqConfig();

  console.log(
    "[chat] groq config:",
    apiKey
      ? {
          source,
          model,
          fingerprint: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (len=${apiKey.length})`,
        }
      : { source, model, fingerprint: "NONE" },
  );

  if (!apiKey) {
    return NextResponse.json({
      content: buildFallbackReply(messages),
      fallback: true,
      reason: "missing_api_key",
      debug: {
        envPathChecked: ENV_FILE_CANDIDATES,
        source,
      },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const groqResponse = await fetch(
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
          messages: buildGroqMessages(messages),
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!groqResponse.ok) {
      const details = await groqResponse.text().catch(() => "");
      const lowerDetails = details.toLowerCase();

      if (
        groqResponse.status === 401 &&
        lowerDetails.includes("invalid_api_key")
      ) {
        return NextResponse.json({
          content: buildFallbackReply(messages),
          fallback: true,
          reason: "invalid_api_key",
          debug: {
            source,
            model,
            fingerprint: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (len=${apiKey.length})`,
          },
          error:
            "Groq rejected the API key from your env file. Replace GROQ_API_KEY in C:\\Users\\HP\\Videos\\autoRental\\client\\.env and restart the Next.js server.",
        });
      }

      return NextResponse.json({
        content: buildFallbackReply(messages),
        fallback: true,
        reason: "groq_http_error",
        error: "Groq request failed.",
        status: groqResponse.status,
        details,
        debug: { source, model },
      });
    }

    const data = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({
        content: buildFallbackReply(messages),
        fallback: true,
        reason: "empty_model_response",
        error: "Groq returned an empty response.",
        debug: { source, model },
      });
    }

    return NextResponse.json({ content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown fetch failure";

    return NextResponse.json({
      content: buildFallbackReply(messages),
      fallback: true,
      reason: "groq_fetch_failed",
      debug: {
        source,
        model,
        message,
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}
