"use client";

import { useState } from "react";
import { Buffer } from "buffer";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { ExternalLink, Link2, Radio, WalletCards } from "lucide-react";

type SolanaProvider = {
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
};

declare global {
  interface Window { solana?: SolanaProvider }
}

const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const memoProgram = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export function SolanaProofPanel() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("Connect an injected Solana wallet to create a real devnet audit proof.");
  const [busy, setBusy] = useState(false);

  async function connectWallet() {
    if (!window.solana) {
      setStatus("No injected Solana wallet was found. Install Phantom or another compatible wallet, then refresh.");
      return;
    }
    try {
      const connection = new Connection(rpcUrl, "confirmed");
      const result = await window.solana.connect();
      const publicKey = result.publicKey;
      setAddress(publicKey.toBase58());
      setBalance((await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL);
      setStatus("Wallet connected to the ChildcareOS devnet proof flow.");
    } catch {
      setStatus("Wallet connection was cancelled or failed.");
    }
  }

  async function requestDevnetSol() {
    if (!address) return;
    setBusy(true);
    try {
      const connection = new Connection(rpcUrl, "confirmed");
      const publicKey = new PublicKey(address);
      const airdropSignature = await connection.requestAirdrop(publicKey, 0.1 * LAMPORTS_PER_SOL);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: airdropSignature, ...latest }, "confirmed");
      setBalance((await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL);
      setStatus("0.1 devnet SOL was requested and confirmed.");
    } catch {
      setStatus("The public devnet faucet declined the request. Use faucet.solana.com and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function createProof() {
    if (!window.solana || !address) return;
    setBusy(true);
    try {
      const connection = new Connection(rpcUrl, "confirmed");
      const publicKey = new PublicKey(address);
      const latest = await connection.getLatestBlockhash("confirmed");
      const transaction = new Transaction({ feePayer: publicKey, recentBlockhash: latest.blockhash }).add(new TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
        programId: memoProgram,
        data: Buffer.from(`ChildcareOS MVP audit proof | Harbor House | ${new Date().toISOString()}`, "utf8"),
      }));
      const signed = await window.solana.signTransaction(transaction);
      const transactionSignature = await connection.sendRawTransaction(signed.serialize(), { skipPreflight: false });
      await connection.confirmTransaction({ signature: transactionSignature, ...latest }, "confirmed");
      setSignature(transactionSignature);
      setBalance((await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL);
      setStatus("Audit proof confirmed on Solana devnet.");
    } catch (error) {
      setStatus(error instanceof Error ? `Devnet proof failed: ${error.message}` : "Devnet proof failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="surface assurance-card solana-card">
      <div className="surface-heading"><div><span className="kicker">Solana devnet assurance</span><h2>Sign a tamper-evident audit proof</h2></div><Radio /></div>
      <div className="wallet-status"><WalletCards /><div><strong>{address ? `${address.slice(0, 5)}…${address.slice(-5)}` : "Wallet disconnected"}</strong><p>{balance === null ? "Devnet balance not loaded" : `${balance.toFixed(4)} devnet SOL`}</p></div></div>
      <p className="assurance-copy">This optional proof records a timestamped ChildcareOS memo on devnet. It does not replace center records or authorize any safety action.</p>
      {!address ? <button className="button button-dark full" onClick={connectWallet}><Link2 size={16} /> Connect Solana wallet</button> : <div className="proof-actions"><button onClick={requestDevnetSol} disabled={busy}>Request devnet SOL</button><button onClick={createProof} disabled={busy}>{busy ? "Submitting…" : "Create devnet proof"}</button></div>}
      <div className="proof-result" aria-live="polite"><span>{status}</span>{signature && <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noreferrer">View confirmed transaction <ExternalLink size={14} /></a>}</div>
    </section>
  );
}
