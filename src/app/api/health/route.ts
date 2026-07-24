import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";

export async function GET() {
  const startedAt = performance.now();
  try {
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed");
    const version = await connection.getVersion();
    return NextResponse.json({
      status: "operational",
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      solana: { reachable: true, cluster: "devnet", version: version["solana-core"] },
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: "degraded",
      groqConfigured: Boolean(process.env.GROQ_API_KEY),
      solana: { reachable: false, cluster: "devnet" },
      latencyMs: Math.round(performance.now() - startedAt),
      checkedAt: new Date().toISOString(),
    }, { status: 503 });
  }
}
