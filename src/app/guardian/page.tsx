import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export default function GuardianPage() {
  return (
    <main className="guardian-page">
      <header className="guardian-header"><BrandMark /><Link href="/"><ArrowLeft size={16} /> Back to site</Link></header>
      <section className="guardian-shell">
        <div className="guardian-intro"><span className="kicker">Guardian portal</span><h1>Maya is checked in and doing well.</h1><p>This view contains only records linked to your guardian account.</p></div>
        <div className="guardian-grid">
          <article className="child-card"><div className="child-avatar">MC</div><div><span>Sunflower room</span><h2>Maya Chen</h2><p><CheckCircle2 /> Checked in at 8:54 AM by Elena Torres</p></div></article>
          <article className="portal-card"><ShieldCheck /><span>Pickup authorization</span><h3>2 active people</h3><p>Elena Torres and Victor Chen may pick up Maya today.</p><button>View authorized list</button></article>
          <article className="portal-card"><CalendarDays /><span>Today</span><h3>Morning update</h3><p>Maya joined outdoor play and morning circle. No action is needed.</p><button>View daily activity</button></article>
          <article className="portal-card wide"><Clock3 /><span>Recent records</span><h3>Clear history, scoped to your family</h3><div className="record-row"><strong>Jul 22</strong><span>Checked out at 5:14 PM</span></div><div className="record-row"><strong>Jul 21</strong><span>Checked out at 4:48 PM</span></div></article>
        </div>
      </section>
    </main>
  );
}
