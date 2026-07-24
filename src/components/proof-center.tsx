"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Activity, ArrowLeft, Bot, CheckCircle2, ExternalLink, Radio, Search, ShieldCheck } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { VERIFIED_DEVNET_SIGNATURE, VERIFIED_DEVNET_WALLET } from "@/lib/solana-proof";

type ProofResult = { verified?: boolean; signer?: string; memo?: string; slot?: number; blockTime?: number; explorerUrl?: string; error?: string };
type HealthResult = { status?: string; groqConfigured?: boolean; latencyMs?: number; solana?: { reachable?: boolean; cluster?: string; version?: string } };

export function ProofCenter() {
  const [signature, setSignature] = useState(VERIFIED_DEVNET_SIGNATURE);
  const [proof, setProof] = useState<ProofResult>({});
  const [health, setHealth] = useState<HealthResult>({});
  const [loading, setLoading] = useState(false);

  async function verify(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/solana/verify?signature=${encodeURIComponent(signature)}`);
      setProof(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/health").then((response) => response.json()).then(setHealth).catch(() => setHealth({ status: "degraded" }));
    void verify();
  }, []);

  return (
    <main className="proof-page">
      <header className="guardian-header"><BrandMark /><Link href="/"><ArrowLeft size={16} /> Back to site</Link></header>
      <section className="proof-shell">
        <motion.div className="proof-hero" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <span className="kicker">Public verification center</span><h1>Do not trust the claim. Verify the system.</h1><p>Check the live AI configuration, Solana devnet connectivity, and any ChildcareOS audit proof directly against public infrastructure.</p>
        </motion.div>
        <div className="proof-metrics">
          <article><Activity /><span>System status</span><strong>{health.status ?? "Checking…"}</strong><small>{health.latencyMs ? `${health.latencyMs} ms RPC check` : "Running live checks"}</small></article>
          <article><Bot /><span>Groq agent</span><strong>{health.groqConfigured ? "Configured" : "Unavailable"}</strong><small>Safety-constrained operations advice</small></article>
          <article><Radio /><span>Solana RPC</span><strong>{health.solana?.reachable ? "Devnet online" : "Checking…"}</strong><small>{health.solana?.version ? `Core ${health.solana.version}` : "Public RPC verification"}</small></article>
        </div>
        <section className="proof-verifier">
          <div><span className="kicker">On-chain evidence</span><h2>Verify a transaction signature</h2><p>The default signature is the production proof created with the supplied devnet wallet.</p><form onSubmit={verify}><input aria-label="Solana transaction signature" value={signature} onChange={(event) => setSignature(event.target.value)} /><button disabled={loading}><Search size={16} /> {loading ? "Verifying…" : "Verify on devnet"}</button></form></div>
          <motion.div className={`verification-result ${proof.verified ? "verified" : "pending"}`} layout>
            {proof.verified ? <CheckCircle2 /> : <ShieldCheck />}
            <div><span>{proof.verified ? "Confirmed ChildcareOS proof" : proof.error ?? "Checking transaction"}</span>{proof.verified && <><strong>{proof.signer === VERIFIED_DEVNET_WALLET ? "Expected signer matched" : "Signer recorded"}</strong><p>{proof.memo}</p><small>Slot {proof.slot} · {proof.blockTime ? new Date(proof.blockTime * 1000).toLocaleString() : "confirmed"}</small>{proof.explorerUrl && <a href={proof.explorerUrl} target="_blank" rel="noreferrer">Open Solana Explorer <ExternalLink size={14} /></a>}</>}</div>
          </motion.div>
        </section>
      </section>
    </main>
  );
}
