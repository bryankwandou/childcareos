import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ roomId: z.string(), activeStaff: z.number().int().min(0).max(20) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "A valid staff assignment is required." }, { status: 400 });
  try {
    return NextResponse.json(demoStore.updateStaff(parsed.data.roomId, parsed.data.activeStaff));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Staff update failed." }, { status: 404 });
  }
}
