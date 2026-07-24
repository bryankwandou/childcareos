import { NextResponse } from "next/server";
import { z } from "zod";
import { buildAgentMessages } from "@/lib/agent";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ prompt: z.string().min(12).max(3000) });
const analysisSchema = z.object({
  situation: z.string(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  policyBlock: z.boolean(),
  immediateActions: z.array(z.string()),
  verifyBeforeProceeding: z.array(z.string()),
  escalation: z.string(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Describe a specific operational scenario." }, { status: 400 });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "The operations agent is not configured." }, { status: 503 });

  try {
    const room = demoStore.getSnapshot().rooms.find((item) => item.id === "sunflower");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_completion_tokens: 700,
        response_format: { type: "json_object" },
        messages: buildAgentMessages(parsed.data.prompt, room),
      }),
      signal: AbortSignal.timeout(25000),
    });

    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ error: payload.error?.message ?? "The operations agent could not respond." }, { status: 502 });
    const content = payload.choices?.[0]?.message?.content;
    const analysis = analysisSchema.safeParse(content ? JSON.parse(content) : null);
    if (!analysis.success) return NextResponse.json({ error: "The operations agent returned an invalid safety analysis." }, { status: 502 });
    const answer = [
      `Situation: ${analysis.data.situation}`,
      `Immediate actions: ${analysis.data.immediateActions.join(" ")}`,
      `Verify before proceeding: ${analysis.data.verifyBeforeProceeding.join(" ")}`,
      `Escalation: ${analysis.data.escalation}`,
    ].join("\n\n");
    return NextResponse.json({ answer, analysis: analysis.data, model: payload.model, room });
  } catch {
    return NextResponse.json({ error: "The operations agent timed out. No safety action was changed." }, { status: 504 });
  }
}
