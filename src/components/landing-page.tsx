import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardCheck, ShieldCheck, UsersRound } from "lucide-react";
import { BrandMark } from "./brand-mark";

const proof = [
  { value: "<500ms", label: "target decision time" },
  { value: "2", label: "non-negotiable hard blocks" },
  { value: "0", label: "automatic guardian notices" },
];

export function LandingPage() {
  return (
    <main>
      <header className="site-header">
        <div className="shell nav-row">
          <Link href="/" className="focus-ring"><BrandMark /></Link>
          <nav aria-label="Primary navigation">
            <a href="#product">Product</a>
            <a href="#workflow">Workflow</a>
            <Link href="/guardian">Guardian view</Link>
          </nav>
          <Link href="/dashboard" className="button button-dark">Open live demo <ArrowRight size={16} /></Link>
        </div>
      </header>

      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> Center safety system online</div>
            <h1>The ratio is never wrong. The wrong person never picks up.</h1>
            <p>ChildcareOS gives directors and front-desk teams a live operating picture, then blocks the two mistakes that cannot be handled with a warning.</p>
            <div className="hero-actions">
              <Link href="/dashboard" className="button button-primary">Run the safety demo <ArrowRight size={17} /></Link>
              <a href="#product" className="text-link">See how it works</a>
            </div>
            <div className="proof-row">
              {proof.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
            </div>
          </div>
          <div className="hero-panel" aria-label="Room safety preview">
            <div className="panel-top"><span>Tuesday · 9:18 AM</span><span className="live-pill">Live</span></div>
            <div className="room-feature">
              <div>
                <span className="kicker">Sunflower room</span>
                <strong>7 children · 2 staff</strong>
                <p>One place remains before the 1:4 ratio boundary.</p>
              </div>
              <div className="ratio-ring"><span>7</span><small>/ 8</small></div>
            </div>
            <div className="safety-line"><ShieldCheck size={19} /><div><strong>Next check-in is allowed</strong><span>Server evaluation will run again before admission.</span></div></div>
            <div className="safety-line muted"><BadgeCheck size={19} /><div><strong>Pickup list synced</strong><span>14 active authorizations checked this morning.</span></div></div>
          </div>
        </div>
      </section>

      <section id="product" className="section shell">
        <div className="section-heading"><span className="kicker">Built for the front desk</span><h2>Three workflows. One calm operating picture.</h2></div>
        <div className="feature-grid">
          <article><UsersRound /><span>01</span><h3>Live ratio control</h3><p>Every check-in is evaluated against active staff, legal ratio, and licensed capacity on the server.</p></article>
          <article><ShieldCheck /><span>02</span><h3>Pickup hard block</h3><p>Linked is not the same as authorized. Revoked or unverified adults cannot reach checkout.</p></article>
          <article><ClipboardCheck /><span>03</span><h3>Grounded incident drafts</h3><p>Staff observations become a review-ready draft without inventing details or notifying a guardian automatically.</p></article>
        </div>
      </section>

      <section id="workflow" className="dark-section">
        <div className="shell workflow-grid">
          <div><span className="kicker light">The operating principle</span><h2>Warnings are easy to dismiss. Safety boundaries are not.</h2></div>
          <ol>
            <li><span>1</span><div><strong>Observe the current state</strong><p>Child count, staff assignment, capacity, and authorization data stay visible.</p></div></li>
            <li><span>2</span><div><strong>Evaluate before the action</strong><p>The decision happens before check-in or checkout can be completed.</p></div></li>
            <li><span>3</span><div><strong>Record the reason</strong><p>Every blocked action leaves an operationally useful, privacy-conscious audit event.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="cta shell">
        <div><span className="kicker">Interactive prototype</span><h2>Test the boundary yourself.</h2><p>Change staffing, attempt a check-in, verify a pickup, and draft an incident report.</p></div>
        <Link href="/dashboard" className="button button-primary">Open control room <ArrowRight size={17} /></Link>
      </section>

      <footer className="site-footer"><div className="shell"><BrandMark /><span>Safety operations for modern childcare centers.</span></div></footer>
    </main>
  );
}
