import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ roomId: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "A room is required." }, { status: 400 });
  try {
    const result = demoStore.attemptCheckIn(parsed.data.roomId);
    return NextResponse.json(result, { status: result.decision.allowed ? 200 : 409 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Check-in failed." }, { status: 404 });
  }
}
