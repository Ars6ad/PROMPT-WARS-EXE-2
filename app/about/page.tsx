import Link from 'next/link';

export default function About() {
  return <main id="main-content" className="shell worker">
    <Link href="/">← FairShift</Link>
    <div className="eyebrow" style={{ marginTop: 28 }}>UN Sustainable Development Goal 8</div>
    <h1 className="title">Decent work starts with information workers can use.</h1>
    <p className="muted">FairShift is a worker-trust and workforce-health prototype for frontline construction and support teams in India.</p>
    <div className="grid" style={{ marginTop: 22 }}>
      <section className="card"><h2>The gap</h2><p>Shift details, pay explanations, rest risks, and safety reporting are often fragmented or difficult to understand at the moment a worker needs them.</p></section>
      <section className="card"><h2>The response</h2><p>FairShift gives workers a simple daily view and a safety voice, while giving operations teams only the context needed to respond, assign follow-up, and improve working conditions.</p></section>
      <section className="card"><h2>The boundary</h2><p>It is not a surveillance tool, payroll authority, or legal-compliance engine. Signals are designed to prompt care and human review—not automated punishment.</p></section>
    </div>
  </main>;
}
