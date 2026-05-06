import { NextResponse } from "next/server";

export const runtime = "nodejs";

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

function buildFallbackReply(messages: ChatMessage[]) {
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "";
  const prompt = latestUserMessage.toLowerCase();

  const recommendations: string[] = [];

  if (/airport|flight|pickup|drop.?off/.test(prompt)) {
    recommendations.push(
      "For airport travel, look for sedans or compact SUVs with easy luggage space and flexible pickup times.",
    );
  }

  if (/family|kids|children|baby|group|friends|people|seats?/.test(prompt)) {
    recommendations.push(
      "For families or groups, an SUV or van is usually the safest starting point for passenger room and bags.",
    );
  }

  if (/budget|cheap|affordable|save|economy|low cost/.test(prompt)) {
    recommendations.push(
      "If budget matters most, start with economy cars and compare daily price, mileage policy, and fuel terms before booking.",
    );
  }

  if (/luxury|premium|executive|vip|business/.test(prompt)) {
    recommendations.push(
      "If you want something premium, check luxury sedans or upscale SUVs for comfort, style, and smoother longer trips.",
    );
  }

  if (/suv|road trip|mountain|rough|cargo|luggage/.test(prompt)) {
    recommendations.push(
      "For road trips or extra luggage, an SUV gives you a better balance of comfort, storage, and visibility.",
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "I can help narrow it down by budget, trip type, passenger count, and whether you need airport pickup or extra luggage space.",
    );
  }

  return `${recommendations.join(" ")} Tell me your budget, number of passengers, and trip type, and I will suggest the best fit.`;
}

export async function POST(request: Request) {
  const rawApiKey = process.env.GROQ_API_KEY;
  const apiKey = rawApiKey
    ?.trim()
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim();

  console.log(
    "[chat] groq key fingerprint:",
    apiKey
      ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (len=${apiKey.length})`
      : "NONE",
  );

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

  if (!apiKey) {
    return NextResponse.json({
      content: buildFallbackReply(messages),
      fallback: true,
      reason: "missing_api_key",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
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
          messages,
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!groqResponse.ok) {
      const details = await groqResponse.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Groq request failed.",
          status: groqResponse.status,
          details,
        },
        { status: 502 },
      );
    }

    const data = (await groqResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "Groq returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({
      content: buildFallbackReply(messages),
      fallback: true,
      reason: "groq_fetch_failed",
    });
  } finally {
    clearTimeout(timeout);
  }
}

