import { NextResponse } from "next/server";
import { z } from "zod";
import { demoStore } from "@/lib/demo-store";

const schema = z.object({ rawObservation: z.string().min(12).max(4000) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "A specific staff observation is required." }, { status: 400 });
  }

  return NextResponse.json(demoStore.createIncident("maya", parsed.data.rawObservation));
}
