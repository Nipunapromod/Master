import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

const rateLimit = new Map<string, { count: number; resetsAt: number }>();
const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const SYSTEM_PROMPT = `You are Mastermind AI Coach, a careful academic tutor for Sri Lankan G.C.E. Advanced Level students studying Combined Mathematics, Physics, and Chemistry.
Explain concepts at A/L level, start simply, then show reasoning and relevant formulas. For calculations, state assumptions, show steps and check units. Encourage understanding, not copying. Do not claim a topic is in the official current syllabus unless the context supports that; say when unsure and recommend checking the official NIE syllabus or teacher. Do not invent past-paper references. Answer in the student's language when clear. If a problem is ambiguous, state the ambiguity and solve only under explicit assumptions.`;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    const text = await request.text();
    if (text.length > 60_000) {
      return NextResponse.json({ error: "This message is too long. Please shorten it and try again." }, { status: 413 });
    }
    payload = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const body = payload as { messages?: unknown; subject?: unknown };
  if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 20) {
    return NextResponse.json({ error: "Send between 1 and 20 chat messages." }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    if (!item || typeof item !== "object") return NextResponse.json({ error: "Invalid chat message." }, { status: 400 });
    const message = item as Record<string, unknown>;
    if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string" || !message.content.trim() || message.content.length > 5000) {
      return NextResponse.json({ error: "Each message must have a valid role and contain at most 5,000 characters." }, { status: 400 });
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }
  if (messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ error: "The latest message must be a student question." }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientKey = forwardedFor || request.headers.get("x-real-ip") || "unknown-client";
  const now = Date.now();
  const currentLimit = rateLimit.get(clientKey);
  if (currentLimit && currentLimit.resetsAt > now && currentLimit.count >= RATE_LIMIT_MAX) {
    return NextResponse.json({ error: "You have sent several questions recently. Take a short break and try again in a few minutes." }, { status: 429 });
  }
  if (!currentLimit || currentLimit.resetsAt <= now) rateLimit.set(clientKey, { count: 1, resetsAt: now + RATE_LIMIT_WINDOW_MS });
  else rateLimit.set(clientKey, { count: currentLimit.count + 1, resetsAt: currentLimit.resetsAt });

  const subject = typeof body.subject === "string" ? body.subject.slice(0, 100) : "Sri Lankan A/L Science and Mathematics";
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      demoMode: true,
      reply: "AI demo mode: live answers are not connected yet because OPENAI_API_KEY is not configured on the server. The interface is working, but I have not generated a live AI answer. Add the key to your deployment's server-side environment variables to enable tutoring.\n\nWhile setting it up, a useful study routine is: write down what the question gives you, identify the relevant principle or formula, solve one step at a time, and check the units and reasonableness of the result."
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + `\nStudent-selected subject context: ${subject}. Treat this as context, not proof about an official syllabus.` },
          ...messages
        ],
        max_completion_tokens: 1400
      }),
      signal: AbortSignal.timeout(35_000)
    });

    if (response.status === 429) return NextResponse.json({ error: "The AI service is busy or its usage limit was reached. Try again later." }, { status: 429 });
    if (!response.ok) {
      const details = await response.text();
      console.error("AI provider returned an error", response.status, details.slice(0, 500));
      return NextResponse.json({ error: "The AI service is temporarily unavailable. Check the server configuration and try again." }, { status: 502 });
    }
    const result = await response.json() as { choices?: Array<{ message?: { content?: string | null } }> };
    const reply = result.choices?.[0]?.message?.content?.trim();
    if (!reply) return NextResponse.json({ error: "The AI service returned an empty response. Try again." }, { status: 502 });
    return NextResponse.json({ reply, demoMode: false });
  } catch (error) {
    console.error("AI coach request failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "The AI service could not be reached. Please try again." }, { status: 502 });
  }
}