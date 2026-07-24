import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ attemptId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "A valid verification attempt is required." }, { status: 400 });
  const result = demoStore.completePickup(parsed.data.attemptId);
  return NextResponse.json(result, { status: result.completed ? 200 : 409 });
}
