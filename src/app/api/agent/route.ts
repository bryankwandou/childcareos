import { NextResponse } from "next/server";
import { z } from "zod";
import { buildAgentMessages } from "@/lib/agent";

const schema = z.object({ prompt: z.string().min(12).max(3000) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Describe a specific operational scenario." }, { status: 400 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "The operations agent is not configured." }, { status: 503 });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_completion_tokens: 700,
        messages: buildAgentMessages(parsed.data.prompt),
      }),
      signal: AbortSignal.timeout(25000),
    });

    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ error: payload.error?.message ?? "The operations agent could not respond." }, { status: 502 });
    return NextResponse.json({ answer: payload.choices?.[0]?.message?.content ?? "No answer was returned.", model: payload.model });
  } catch {
    return NextResponse.json({ error: "The operations agent timed out. No safety action was changed." }, { status: 504 });
  }
}
