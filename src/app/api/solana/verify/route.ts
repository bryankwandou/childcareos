import { NextResponse } from "next/server";
import bs58 from "bs58";
import { Buffer } from "buffer";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";
import { isChildcareOsMemo } from "@/lib/solana-proof";

const signatureSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{80,90}$/);
const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export async function GET(request: Request) {
  const signature = new URL(request.url).searchParams.get("signature");
  const parsed = signatureSchema.safeParse(signature);
  if (!parsed.success) return NextResponse.json({ error: "Provide a valid Solana transaction signature." }, { status: 400 });

  try {
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com", "confirmed");
    const transaction = await connection.getParsedTransaction(parsed.data, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
    if (!transaction) return NextResponse.json({ error: "Transaction was not found on Solana devnet." }, { status: 404 });

    let memo = "";
    for (const instruction of transaction.transaction.message.instructions) {
      if ("program" in instruction && instruction.program === "spl-memo") memo = String(instruction.parsed);
      if ("programId" in instruction && instruction.programId.equals(memoProgram) && "data" in instruction) memo = Buffer.from(bs58.decode(instruction.data)).toString("utf8");
    }

    const signer = transaction.transaction.message.accountKeys.find((account) => account.signer)?.pubkey.toBase58() ?? null;
    return NextResponse.json({
      verified: isChildcareOsMemo(memo) && transaction.meta?.err === null,
      cluster: "devnet",
      signature: parsed.data,
      signer,
      memo,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      transactionSucceeded: transaction.meta?.err === null,
      explorerUrl: `https://explorer.solana.com/tx/${parsed.data}?cluster=devnet`,
    });
  } catch {
    return NextResponse.json({ error: "Solana devnet verification is temporarily unavailable." }, { status: 502 });
  }
}
