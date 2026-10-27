import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  HardHat,
  Hospital,
  Languages,
  MapPin,
  Shield,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';

const Feature = ({ icon: Icon, title, children }: { icon: any; title: string; children: string }) => (
  <article className="card">
    <div className="iconbox"><Icon size={22} /></div>
    <h3>{title}</h3>
    <p className="muted">{children}</p>
  </article>
);

export default function Landing() {
  return (
    <>
      <header>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/" className="brand-lockup"><span className="brand-mark" aria-hidden="true">F</span>FairShift</Link>
          <div className="site-links">
            <a href="#how-it-works">How it works</a>
            <a href="#for-teams">For teams</a>
            <Link href="/privacy">Privacy</Link>
          </div>
          <Link className="btn primary" href="/login">Sign in <ArrowRight size={17} /></Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="landing hero-grid">
            <div>
              <div className="eyebrow">Workforce clarity · SDG 8</div>
              <h1>Fair work, made easy to see.</h1>
              <p className="muted" style={{ fontSize: 18 }}>
                FairShift gives frontline teams a clear view of shifts, estimated pay and safety support—while giving managers the context to respond responsibly.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 27 }}>
                <Link className="btn primary" href="/login?role=worker">Worker sign in <ArrowRight size={18} /></Link>
                <Link className="btn soft" href="/login?role=admin">Admin workspace</Link>
              </div>
            </div>

            <aside className="hero-product-preview" aria-labelledby="workspace-preview-title">
              <div className="preview-topbar">
                <div className="preview-brand" id="workspace-preview-title"><span className="preview-brand-mark" aria-hidden="true">F</span>FairShift worker workspace</div>
                <span>Today · 27 Oct</span>
              </div>
              <div className="preview-shift-card">
                <div className="preview-status"><CheckCircle2 size={15} /> Checked in</div>
                <strong>Morning shift</strong>
                <span><MapPin size={14} /> Nehru Metro Site</span>
                <div className="preview-shift-time"><Clock3 size={15} /> 9:00 AM – 6:00 PM <b>· Live</b></div>
              </div>
              <div className="preview-stat-grid">
                <div><WalletCards size={17} /><span>Estimated pay</span><strong>₹18,420</strong></div>
                <div><Clock3 size={17} /><span>This week</span><strong>58 hours</strong></div>
              </div>
              <div className="preview-safety-row">
                <ShieldCheck size={18} />
                <span><b>Safety support is ready.</b><small>Report concerns, with or without your name.</small></span>
              </div>
              <p className="preview-caption">One workday, visible in one place.</p>
            </aside>
          </div>
        </section>

        <section id="how-it-works" className="landing landing-section">
          <div className="section-top">
            <div><div className="eyebrow">One connected flow</div><h2 className="big">Built around everyday work.</h2></div>
            <p className="muted" style={{ maxWidth: 380, margin: 0 }}>Simple enough for a phone. Useful enough for a workforce team.</p>
          </div>
          <div className="feature-grid">
            <Feature icon={Clock3} title="Shift certainty">Check in, check out, and understand today’s assignment.</Feature>
            <Feature icon={WalletCards} title="Pay clarity">See hours, overtime, and estimated earnings in plain language.</Feature>
            <Feature icon={ShieldCheck} title="Safety voice">Report hazards with a named or anonymous path.</Feature>
            <Feature icon={Languages} title="Language first">Short labels, voice support, and regional-language-ready content.</Feature>
          </div>
        </section>

        <section id="for-teams" className="landing landing-section" style={{ paddingTop: 0 }}>
          <div className="section-top"><div><div className="eyebrow">Choose your workspace</div><h2 className="big">Separate views. Shared purpose.</h2></div></div>
          <div className="role-grid">
            <article className="card role-card"><div><HardHat size={27} /><h3>Worker app</h3><p className="muted">For shifts, pay, safety, feedback, and skills.</p></div><Link className="btn teal" href="/login?role=worker">Open worker sign in <ArrowRight size={17} /></Link></article>
            <article className="card role-card"><div><Hospital size={27} /><h3>Healthcare support</h3><p className="muted">The same simple workflows, mapped to wards and facilities.</p></div><Link className="btn soft" href="/login?role=worker">See worker demo <ArrowRight size={17} /></Link></article>
            <article className="card role-card"><div><BarChart3 size={27} /><h3>Admin dashboard</h3><p className="muted">For attendance, safety follow-up, and workforce support signals.</p></div><Link className="btn primary" href="/login?role=admin">Open admin sign in <ArrowRight size={17} /></Link></article>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div><Link href="/" className="brand-lockup"><span className="brand-mark" aria-hidden="true">F</span>FairShift</Link><p>Workforce fairness for India’s frontline teams.</p></div>
          <div><b style={{ color: 'var(--ink)' }}>Product</b><p><Link href="/login?role=worker">Worker sign in</Link> · <Link href="/login?role=admin">Admin sign in</Link></p><p><Link href="/about">About FairShift</Link> · <Link href="/privacy">Privacy</Link></p></div>
          <div><Shield size={17} /><p>Sample data only.<br />No legal or payroll advice.</p></div>
        </div>
      </footer>
    </>
  );
}
