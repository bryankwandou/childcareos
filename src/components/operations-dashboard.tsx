"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, BadgeCheck, Bell, CheckCircle2, ClipboardPlus, DoorOpen, ShieldAlert, ShieldCheck, Users, UserRoundCheck } from "lucide-react";
import { BrandMark } from "./brand-mark";
import { evaluateCheckIn } from "@/lib/safety";

type EventItem = { time: string; title: string; detail: string; tone: "good" | "warn" | "bad" };
type ApiPayload = {
  error?: string;
  message?: string;
  decision?: { message?: string; allowed?: boolean };
  room?: { activeChildren: number; activeStaff: number };
  urgentAlert?: boolean;
  attemptId?: string;
  id?: string;
  summary?: string;
  notice?: string;
  finalized?: boolean;
  guardianNotified?: boolean;
};

async function safePost(path: string, body: Record<string, string | number>) {
  try {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: response.ok, payload: await response.json() as ApiPayload };
  } catch {
    return { ok: false, payload: { error: "Connection unavailable. The action remains blocked until the server can verify it." } as ApiPayload };
  }
}

export function OperationsDashboard() {
  const [children, setChildren] = useState(7);
  const [staff, setStaff] = useState(2);
  const [guardian, setGuardian] = useState("Elena Torres");
  const [checkInResult, setCheckInResult] = useState("Ready for the next check-in attempt.");
  const [pickupResult, setPickupResult] = useState("Select a pickup record to verify identity and authorization.");
  const [pickupAttemptId, setPickupAttemptId] = useState<string | null>(null);
  const [pickupAllowed, setPickupAllowed] = useState(false);
  const [observation, setObservation] = useState("Maya slipped beside the water table and had a small red mark on her left knee. Staff applied a cold pack for five minutes. Maya returned to play.");
  const [incident, setIncident] = useState<{ id: string; summary: string; notice: string; finalized: boolean; guardianNotified: boolean } | null>(null);
  const [events, setEvents] = useState<EventItem[]>([
    { time: "9:12", title: "Pickup list updated", detail: "Noah Lee · authorization removed by director", tone: "warn" },
    { time: "8:54", title: "Check-in completed", detail: "Maya Chen · Sunflower room", tone: "good" },
    { time: "8:41", title: "Ratio warning", detail: "Sunflower room reached 7 of 8 places", tone: "warn" },
  ]);

  const ratioDecision = useMemo(() => evaluateCheckIn({ activeChildren: children, activeStaff: staff, ratioLimit: 4, roomCapacity: 12 }), [children, staff]);
  const maximum = staff * 4;
  const occupancy = maximum > 0 ? Math.min(100, Math.round((children / maximum) * 100)) : 100;

  async function attemptCheckIn() {
    const { ok, payload } = await safePost("/api/check-in", { roomId: "sunflower" });
    const message = payload.decision?.message ?? payload.error;
    setCheckInResult(message ?? "Check-in blocked pending server verification.");
    if (payload.room) setChildren(payload.room.activeChildren);
    setEvents((items) => [{ time: "Now", title: ok ? "Check-in completed" : "Check-in blocked", detail: message ?? "Server verification unavailable.", tone: ok ? "good" : "bad" }, ...items]);
  }

  async function updateStaff(nextStaff: number) {
    const { payload } = await safePost("/api/staff", { roomId: "sunflower", activeStaff: Math.max(0, nextStaff) });
    if (payload.room) setStaff(payload.room.activeStaff);
    setCheckInResult(payload.message ?? payload.error ?? "Staff update blocked pending server verification.");
    if (payload.urgentAlert) setEvents((items) => [{ time: "Now", title: "Urgent ratio alert", detail: payload.message ?? "Current occupancy is outside the ratio boundary.", tone: "bad" }, ...items]);
  }

  async function verifyPickup() {
    const guardianId = guardian === "Noah Lee" ? "noah" : "elena";
    const { ok, payload } = await safePost("/api/pickup/verify", { childId: "maya", guardianId });
    const message = payload.decision?.message ?? payload.error;
    setPickupResult(message ?? "Pickup remains blocked pending server verification.");
    setPickupAttemptId(payload.attemptId ?? null);
    setPickupAllowed(Boolean(payload.decision?.allowed));
    setEvents((items) => [{ time: "Now", title: ok ? "Pickup verified" : "Pickup blocked", detail: `${guardian} · ${message ?? "Server verification unavailable."}`, tone: ok ? "good" : "bad" }, ...items]);
  }

  async function completePickup() {
    if (!pickupAttemptId) return;
    const { ok, payload } = await safePost("/api/pickup/complete", { attemptId: pickupAttemptId });
    setPickupResult(payload.message ?? payload.error ?? "Checkout remains blocked.");
    if (ok) setPickupAllowed(false);
  }

  async function createDraft(event: FormEvent) {
    event.preventDefault();
    const { ok, payload } = await safePost("/api/incidents/draft", { rawObservation: observation });
    if (ok && payload.id && payload.summary && payload.notice) setIncident({ id: payload.id, summary: payload.summary, notice: payload.notice, finalized: Boolean(payload.finalized), guardianNotified: Boolean(payload.guardianNotified) });
  }

  async function updateIncident(action: "finalize" | "notify") {
    if (!incident) return;
    const { ok, payload } = await safePost(`/api/incidents/${action}`, { incidentId: incident.id });
    if (ok) setIncident({ ...incident, finalized: Boolean(payload.finalized), guardianNotified: Boolean(payload.guardianNotified) });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <BrandMark />
        <div className="center-card"><span>Center</span><strong>Harbor House</strong><small>Portland, Oregon</small></div>
        <nav aria-label="Application navigation">
          <a className="active" href="#overview"><DoorOpen /> Overview</a>
          <a href="#rooms"><Users /> Rooms</a>
          <a href="#pickup"><UserRoundCheck /> Pickup</a>
          <a href="#incidents"><ClipboardPlus /> Incidents</a>
        </nav>
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Public site</Link>
      </aside>

      <section className="workspace">
        <header className="workspace-header"><div><span className="kicker">Tuesday · Live operations</span><h1>Good morning, Jordan.</h1><p>Two rooms are open. One safety boundary is approaching.</p></div><button className="icon-button" aria-label="Notifications"><Bell /></button></header>

        <div className="summary-grid" id="overview">
          <article><span>Children checked in</span><strong>{children + 6}</strong><small>Across two rooms</small></article>
          <article><span>Active staff</span><strong>{staff + 2}</strong><small>All assignments confirmed</small></article>
          <article className="attention"><span>Needs attention</span><strong>{ratioDecision.allowed ? 1 : 2}</strong><small>Sunflower ratio boundary</small></article>
          <article><span>Pickup changes</span><strong>1</strong><small>One authorization revoked</small></article>
        </div>

        <div className="dashboard-grid">
          <section className="surface room-control" id="rooms">
            <div className="surface-heading"><div><span className="kicker">Live ratio engine</span><h2>Sunflower room</h2></div><span className={`decision-pill ${ratioDecision.allowed ? "good" : "bad"}`}>{ratioDecision.allowed ? "Within ratio" : "Hard block active"}</span></div>
            <div className="ratio-visual"><div className="ratio-number"><strong>{children}</strong><span>children</span></div><div className="ratio-track"><span style={{ width: `${occupancy}%` }} /></div><div className="ratio-number right"><strong>{maximum || 0}</strong><span>ratio maximum</span></div></div>
            <div className="control-row"><label>Active staff<button onClick={() => updateStaff(staff - 1)}>−</button><strong>{staff}</strong><button onClick={() => updateStaff(staff + 1)}>+</button></label><button className="button button-primary" onClick={attemptCheckIn}>Attempt next check-in</button></div>
            <div className={`result-box ${ratioDecision.allowed ? "good" : "bad"}`}>{ratioDecision.allowed ? <ShieldCheck /> : <ShieldAlert />}<div><strong>{ratioDecision.allowed ? "Server check ready" : "Admission disabled"}</strong><p>{checkInResult}</p></div></div>
          </section>

          <section className="surface timeline">
            <div className="surface-heading"><div><span className="kicker">Audit trail</span><h2>Recent decisions</h2></div></div>
            <div className="event-list">{events.slice(0, 5).map((item, index) => <div className="event" key={`${item.time}-${index}`}><span className={`event-icon ${item.tone}`}>{item.tone === "good" ? <CheckCircle2 /> : <AlertTriangle />}</span><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></div>)}</div>
          </section>

          <section className="surface" id="pickup">
            <div className="surface-heading"><div><span className="kicker">Pickup verification</span><h2>Verify before release</h2></div><BadgeCheck /></div>
            <label className="field">Pickup person<select value={guardian} onChange={(event) => setGuardian(event.target.value)}><option>Elena Torres</option><option>Noah Lee</option></select></label>
            <div className={`result-box ${pickupResult.startsWith("Pickup verified") ? "good" : pickupResult.startsWith("Pickup blocked") ? "bad" : "neutral"}`}><ShieldCheck /><div><strong>{guardian}</strong><p>{pickupResult}</p></div></div>
            <button className="button button-dark full" onClick={verifyPickup}>Verify identity and authorization</button>
            {pickupAllowed && <button className="button button-primary full secondary-action" onClick={completePickup}>Complete checkout</button>}
          </section>

          <section className="surface" id="incidents">
            <div className="surface-heading"><div><span className="kicker">Incident drafting</span><h2>Start from observed facts</h2></div><ClipboardPlus /></div>
            <form onSubmit={createDraft}><label className="field">Staff observation<textarea value={observation} onChange={(event) => setObservation(event.target.value)} rows={5} /></label><button className="button button-dark full">Create review draft</button></form>
            {incident && <div className="draft-card"><span>{incident.finalized ? "Finalized" : "Draft · Review required"}</span><p>{incident.summary}</p><small>{incident.guardianNotified ? "Guardian notification recorded." : incident.notice}</small><div className="draft-actions">{!incident.finalized && <button onClick={() => updateIncident("finalize")}>Finalize reviewed report</button>}{incident.finalized && !incident.guardianNotified && <button onClick={() => updateIncident("notify")}>Notify guardian</button>}</div></div>}
          </section>
        </div>
      </section>
    </main>
  );
}
