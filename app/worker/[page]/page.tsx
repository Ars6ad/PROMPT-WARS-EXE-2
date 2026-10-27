'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  HardHat,
  MapPin,
  MessageCircle,
  Mic,
  ScanLine,
  ShieldAlert,
  WalletCards,
  WifiOff,
} from 'lucide-react';
import { WorkerShell, Listen } from '@/components/Shell';
import { SafetyForm } from '@/components/SafetyForm';
import { worker } from '@/lib/data';
import { useDemo } from '@/components/DemoProvider';

const badge = (severity: string) => severity === 'High' ? 'alert' : severity === 'Medium' ? 'warn' : '';

function AttendanceAction() {
  const { state, checkIn, checkOut } = useDemo();
  const [notice, setNotice] = useState('');
  const checked = state.attendance.status === 'checked-in';
  const done = state.attendance.status === 'checked-out';

  function act() {
    const result = checked ? checkOut() : checkIn();
    setNotice(result.message);
  }

  return <>
    <button className="btn primary" onClick={act} disabled={done}>
      {done ? <><CheckCircle2 size={18} />Shift complete</> : checked ? <><CheckCircle2 size={18} />Check out</> : <><Clock size={18} />Check in</>}
    </button>
    {notice && <p role="status" className="muted" style={{ fontSize: 13, marginBottom: 0 }}>{notice}</p>}
  </>;
}

export default function WorkerPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = use(params);
  const { state, ready } = useDemo();

  if (!ready) return <WorkerShell title="Loading your workspace"><div className="card"><p className="muted">Loading locally saved demo data…</p></div></WorkerShell>;

  const attendance = state.attendance;
  const latestReport = state.reports[0];
  const checkedIn = attendance.status === 'checked-in';
  const shiftDone = attendance.status === 'checked-out';

  if (page === 'dashboard') return <WorkerShell>
    <div className="dashboard-heading">
      <div>
        <div className="eyebrow">Your workspace</div>
        <p className="muted">Tuesday, 27 October · {worker.role}</p>
      </div>
      <Link href="/worker/shift" className="dashboard-date"><CalendarDays size={16} /> Today&apos;s shift</Link>
    </div>

    <section className="card signature-card worker-status-card">
      <div className="status-card-top"><span className="chip">Today&apos;s shift</span><span className="status-card-live"><span aria-hidden="true" /> {shiftDone ? 'Complete' : checkedIn ? 'Live now' : 'Starts at 9:00 AM'}</span></div>
      <h2>{checkedIn ? 'You are checked in' : shiftDone ? 'Your shift is complete' : 'Ready when you are'}</h2>
      <p className="muted"><MapPin size={15} /> {attendance.worksite}</p>
      <AttendanceAction />
      {attendance.checkedInAt && <p className="muted status-card-caption">Recorded check-in: {attendance.checkedInAt}</p>}
    </section>

    <section className="worker-summary-grid" aria-label="Your work summary">
      <Link className="card summary-card" href="/worker/pay">
        <div className="summary-icon"><WalletCards size={19} /></div>
        <span>Estimated pay</span>
        <strong>₹18,420</strong>
        <small>Expected 31 Oct <ChevronRight size={14} /></small>
      </Link>
      <Link className="card summary-card" href="/worker/shift">
        <div className="summary-icon pale"><Clock size={19} /></div>
        <span>This week</span>
        <strong>58 hours</strong>
        <small>11 overtime hours <ChevronRight size={14} /></small>
      </Link>
    </section>

    <section className="worker-section" aria-labelledby="day-plan-heading">
      <div className="section-heading"><div><div className="eyebrow">At a glance</div><h2 id="day-plan-heading">Your day</h2></div><Link href="/worker/shift">View shift</Link></div>
      <div className="card day-plan">
        <div className="plan-row"><div className="plan-icon active"><CheckCircle2 size={18} /></div><div><b>{checkedIn ? 'Shift in progress' : shiftDone ? 'Shift completed' : 'Check in at 9:00 AM'}</b><span>Nehru Metro Site · Gate B</span></div><time>{checkedIn ? 'Now' : shiftDone ? 'Done' : '9:00 AM'}</time></div>
        <div className="plan-row"><div className="plan-icon"><Coffee size={18} /></div><div><b>Meal break</b><span>One-hour break is planned today</span></div><time>1:00 PM</time></div>
        <div className="plan-row"><div className="plan-icon"><Clock size={18} /></div><div><b>Shift finish</b><span>Confirm your finish when you leave site</span></div><time>6:00 PM</time></div>
      </div>
    </section>

    <section className="worker-section" aria-labelledby="quick-actions-heading">
      <div className="section-heading"><div><div className="eyebrow">Stay informed</div><h2 id="quick-actions-heading">Quick actions</h2></div></div>
      <div className="quick-action-grid">
        <Link className="quick-action" href="/worker/pay"><WalletCards size={20} /><span><b>Review pay</b><small>Hours, overtime and estimate</small></span><ChevronRight size={18} /></Link>
        <Link className="quick-action" href="/worker/safety"><ShieldAlert size={20} /><span><b>Speak up safely</b><small>Report a concern, anonymously if needed</small></span><ChevronRight size={18} /></Link>
        <Link className="quick-action" href="/worker/feedback"><MessageCircle size={20} /><span><b>Share feedback</b><small>Tell us how this week feels</small></span><ChevronRight size={18} /></Link>
      </div>
    </section>

    <section className="skill-nudge" aria-labelledby="skill-nudge-heading">
      <div className="skill-nudge-icon"><BadgeCheck size={21} /></div>
      <div><div className="eyebrow">Keep growing</div><h2 id="skill-nudge-heading">Your skill passport</h2><p>2 skills are verified and Masonry Assistant is in progress.</p><Link href="/worker/skills">View your skills <ChevronRight size={15} /></Link></div>
    </section>

    <section className="card safety-pulse" aria-label="Safety and rest update">
      <div className="safety-pulse-icon"><AlertTriangle size={20} /></div>
      <div><h3>Rest check</h3><p>You have worked 58 hours this week. If rest time feels unsafe, speak to your supervisor or use the feedback flow.</p><Link href="/worker/feedback">Share feedback <ChevronRight size={15} /></Link></div>
    </section>

    {latestReport && <section className="recent-report" aria-label="Latest safety report"><BadgeCheck size={18} /><span><b>Latest safety report: {latestReport.status}</b><small>{latestReport.id} · {latestReport.category}</small></span><Link href="/worker/safety" aria-label="View your safety reports"><ChevronRight size={18} /></Link></section>}
  </WorkerShell>;

  if (page === 'shift') return <WorkerShell title="Your shift">
    <div className="card"><span className={'chip ' + (checkedIn ? '' : 'warn')}>{checkedIn ? 'Checked in' : 'Scheduled today'}</span><h2>9:00 AM – 6:00 PM</h2><p className="muted">{attendance.worksite}<br />Supervisor: Ramesh Patel · 1-hour break</p><AttendanceAction /><button className="btn soft" style={{ marginLeft: 8 }}><ScanLine size={17} />QR check-in demo</button></div>
    <div className="notice" style={{ marginTop: 16 }}><WifiOff size={16} /> This browser demo stores actions locally first. A production service must confirm them before payroll approval.</div>
  </WorkerShell>;

  if (page === 'pay') return <WorkerShell title="Your pay">
    <div className="card"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><span className="chip">Estimated · October</span><div className="big">₹18,420</div><p className="muted">Payment expected: 31 Oct</p></div><Listen /></div><div className="bar"><i style={{ width: '76%' }} /></div><p className="muted">Recorded regular hours <b>176</b> · Approved overtime <b>11</b></p><hr /><p>Base wages <b style={{ float: 'right' }}>₹16,000</b></p><p>Overtime (₹180/hr) <b style={{ float: 'right' }}>₹1,980</b></p><p>Travel allowance <b style={{ float: 'right' }}>₹800</b></p><p>Deductions <b style={{ float: 'right' }}>−₹360</b></p><h3>Net payable <span style={{ float: 'right' }}>₹18,420</span></h3></div>
    <p className="notice">You worked 11 approved overtime hours. At your workplace-configured rate, this adds ₹1,980 to your estimated pay.</p>
    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}><button className="btn primary"><MessageCircle size={17} />Ask about this pay</button><button className="btn soft"><Download size={17} />Print</button></div><p className="muted" style={{ fontSize: 12 }}>Estimated earnings are separate from approved payroll and confirmed payment.</p>
  </WorkerShell>;

  if (page === 'safety') return <WorkerShell title="Safety support">
    <p className="muted">Your report helps make work safer. In immediate danger, use your site emergency process as well.</p><SafetyForm /><h3 style={{ marginTop: 28 }}>Your reports</h3>{state.reports.map(r => <div className="card" style={{ marginBottom: 10 }} key={r.id}><span className={'chip ' + badge(r.severity)}>{r.severity} · {r.status}</span><h3>{r.id} · {r.category}</h3><p className="muted">{r.detail}</p><small className="muted">{r.submittedAt} · {r.anonymous ? 'Anonymous' : 'Named report'}</small></div>)}
  </WorkerShell>;

  if (page === 'feedback') return <WorkerShell title="Your voice">
    <div className="card"><span className="chip">Anonymous by default</span><h2>Did you get enough rest between shifts?</h2><div style={{ display: 'flex', gap: 12, fontSize: 30 }}>{['😞', '🙁', '😐', '🙂', '😄'].map(x => <button className="btn soft" aria-label={`Rate ${x}`} key={x}><span>{x}</span></button>)}</div><p className="muted">Your response is only shown in groups of 5 or more.</p><button className="btn primary"><Mic size={17} />Record feedback (demo)</button></div>
  </WorkerShell>;

  return <WorkerShell title={page === 'skills' ? 'Skill passport' : 'Your profile'}>
    <div className="card"><HardHat color="var(--orange)" /><h2>{worker.name}</h2><p className="muted">Worker-entered profile · Construction Helper</p><h3>Verified skills</h3><p><span className="chip">✓ PPE Basics</span> <span className="chip">✓ Scaffold Safety</span> <span className="chip">In progress · Masonry Assistant</span></p><p className="muted">Employer verified: PPE Basics, Scaffold Safety</p><button className="btn primary"><Download size={17} />Share profile card</button></div>
  </WorkerShell>;
}
