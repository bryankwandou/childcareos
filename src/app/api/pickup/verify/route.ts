import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ childId: z.string(), guardianId: z.enum(["elena", "noah"]) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "A child and pickup person are required." }, { status: 400 });
  const result = demoStore.verifyPickup(parsed.data.childId, parsed.data.guardianId);
  return NextResponse.json(result, { status: result.decision.allowed ? 200 : 403 });
}
