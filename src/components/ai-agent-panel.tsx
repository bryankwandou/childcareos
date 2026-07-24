"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, ShieldCheck } from "lucide-react";

export function AiAgentPanel() {
  const [prompt, setPrompt] = useState("The Sunflower room has eight children and two active staff. One staff member needs to leave for ten minutes. What should the director do before changing the assignment?");
  const [answer, setAnswer] = useState("Ask a real operational question. The agent can advise, but it cannot authorize a safety action.");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const payload = await response.json();
      setAnswer(payload.answer ?? payload.error ?? "No response was returned.");
    } catch {
      setAnswer("The agent is unreachable. No operational state was changed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface assurance-card agent-card">
      <div className="surface-heading"><div><span className="kicker">Groq operations agent</span><h2>Reason without bypassing policy</h2></div><Bot /></div>
      <form onSubmit={submit}><label className="field">Operational scenario<textarea rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label><button className="button button-dark full" disabled={loading}>{loading ? "Analyzing scenario…" : <><Send size={16} /> Ask operations agent</>}</button></form>
      <div className="agent-answer" aria-live="polite"><ShieldCheck /><p>{answer}</p></div>
    </section>
  );
}
