import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ incidentId: z.string().uuid() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "A valid incident is required." }, { status: 400 });
  try {
    return NextResponse.json(demoStore.finalizeIncident(parsed.data.incidentId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Finalization failed." }, { status: 404 });
  }
}
