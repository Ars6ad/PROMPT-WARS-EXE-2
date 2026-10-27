'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Coffee,
  Download,
  HardHat,
  Languages,
  MapPin,
  MessageCircle,
  Mic,
  ScanLine,
  ShieldAlert,
  UserRoundCheck,
  WalletCards,
  WifiOff,
} from 'lucide-react';
import { getLocalizedShiftBriefing, LanguagePicker, supportedLanguages, useAccessibilityTools, VoiceBriefing } from '@/components/AccessibilityTools';
import { Listen, WorkerShell } from '@/components/Shell';
import { SafetyForm } from '@/components/SafetyForm';
import { worker } from '@/lib/data';
import { useDemo } from '@/components/DemoProvider';

const badge = (severity: string) => severity === 'High' ? 'alert' : severity === 'Medium' ? 'warn' : '';

function AttendanceAction() {
  const { state, checkIn, checkOut } = useDemo();
  const [notice, setNotice] = useState('');
  const checkedIn = state.attendance.status === 'checked-in';
  const completed = state.attendance.status === 'checked-out';

  function act() {
    const result = checkedIn ? checkOut() : checkIn();
    setNotice(result.message);
  }

  return <>
    <button className="btn primary" onClick={act} disabled={completed}>
      {completed ? <><CheckCircle2 size={18} />Shift complete</> : checkedIn ? <><CheckCircle2 size={18} />Check out</> : <><Clock size={18} />Check in</>}
    </button>
    {notice && <p role="status" className="muted" style={{ fontSize: 13, marginBottom: 0 }}>{notice}</p>}
  </>;
}

function DayPlan({ checkedIn, shiftDone }: { checkedIn: boolean; shiftDone: boolean }) {
  const progressLabel = checkedIn ? 'Shift in progress' : shiftDone ? 'Shift completed' : 'Arrive and check in';
  const steps = [
    { icon: CheckCircle2, title: progressLabel, detail: 'Nehru Metro Site · Gate B. Confirm arrival before starting work.', time: checkedIn ? 'Now' : shiftDone ? 'Done' : '9:00 AM', active: true },
    { icon: UserRoundCheck, title: 'Team handover and safety brief', detail: 'Check today’s task, hazards, PPE and the person leading the shift.', time: '9:05 AM' },
    { icon: Coffee, title: 'Recovery break', detail: 'Take a short planned break; tell the lead if workload or heat makes a break unsafe.', time: '10:45 AM' },
    { icon: Coffee, title: 'Meal break', detail: 'One-hour meal break. Your cover should be arranged before you step away.', time: '1:00 PM' },
    { icon: ClipboardCheck, title: 'Task and fatigue check', detail: 'Review remaining work, report hazards and ask for support before the final work block.', time: '3:15 PM' },
    { icon: Clock, title: 'Handover and check out', detail: 'Confirm work is handed over, log any concern, then check out when leaving site.', time: '6:00 PM' },
  ];

  return <div className="card day-plan">
    {steps.map(({ icon: Icon, title, detail, time, active }) => <div className="plan-row" key={title}>
      <div className={`plan-icon ${active ? 'active' : ''}`}><Icon size={18} /></div>
      <div><b>{title}</b><span>{detail}</span></div>
      <time>{time}</time>
    </div>)}
  </div>;
}

export default function WorkerPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = use(params);
  const { state, ready } = useDemo();
  const { language } = useAccessibilityTools();

  if (!ready) return <WorkerShell title="Loading your workspace"><div className="card"><p className="muted">Loading locally saved demo data…</p></div></WorkerShell>;

  const attendance = state.attendance;
  const latestReport = state.reports[0];
  const checkedIn = attendance.status === 'checked-in';
  const shiftDone = attendance.status === 'checked-out';
  const shiftBriefing = getLocalizedShiftBriefing(language.code, `Today is Tuesday, 27 October. Your shift is from 9:00 AM to 6:00 PM at ${attendance.worksite}. Start by checking in at Gate B, then join the safety handover at 9:05 AM. A recovery break is planned for 10:45 AM, your meal break is at 1:00 PM, and the afternoon safety check is at 3:15 PM. Before leaving, hand over unfinished work, report any hazard, and check out at 6:00 PM.`);

  if (page === 'dashboard') return <WorkerShell voiceSummary={shiftBriefing}>
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

    <VoiceBriefing title="Hear your shift plan" summary={shiftBriefing} />

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
      <div className="section-heading"><div><div className="eyebrow">A safer shift rhythm</div><h2 id="day-plan-heading">Your workday flow</h2></div><Link href="/worker/shift">View shift</Link></div>
      <DayPlan checkedIn={checkedIn} shiftDone={shiftDone} />
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

  if (page === 'shift') return <WorkerShell title="Your shift" voiceSummary={shiftBriefing}>
    <section className="card"><span className={`chip ${checkedIn ? '' : 'warn'}`}>{checkedIn ? 'Checked in' : 'Scheduled today'}</span><h2>9:00 AM – 6:00 PM</h2><p className="muted">{attendance.worksite}<br />Supervisor: Ramesh Patel · 1-hour meal break</p><AttendanceAction /><button className="btn soft" style={{ marginLeft: 8 }} type="button"><ScanLine size={17} />QR check-in demo</button></section>
    <VoiceBriefing title="Your step-by-step shift" summary={shiftBriefing} />
    <section className="worker-section"><DayPlan checkedIn={checkedIn} shiftDone={shiftDone} /></section>
    <p className="notice" style={{ marginTop: 16 }}><WifiOff size={16} /> This browser demo stores actions locally first. A production service must confirm them before payroll approval.</p>
  </WorkerShell>;

  if (page === 'pay') {
    const payBriefing = 'Your estimated October pay is 18,420 rupees, expected on 31 October. This includes 16,000 rupees base wages, 1,980 rupees for 11 approved overtime hours, and an 800 rupee travel allowance, less 360 rupees in deductions. This is an estimate until payroll approves it.';
    return <WorkerShell title="Your pay" voiceSummary={payBriefing}>
      <section className="card"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><span className="chip">Estimated · October</span><div className="big">₹18,420</div><p className="muted">Payment expected: 31 Oct</p></div><Listen text={payBriefing} label="Read your pay estimate aloud" /></div><div className="bar"><i style={{ width: '76%' }} /></div><p className="muted">Recorded regular hours <b>176</b> · Approved overtime <b>11</b></p><hr /><p>Base wages <b style={{ float: 'right' }}>₹16,000</b></p><p>Overtime (₹180/hr) <b style={{ float: 'right' }}>₹1,980</b></p><p>Travel allowance <b style={{ float: 'right' }}>₹800</b></p><p>Deductions <b style={{ float: 'right' }}>−₹360</b></p><h3>Net payable <span style={{ float: 'right' }}>₹18,420</span></h3></section>
      <p className="notice">You worked 11 approved overtime hours. At your workplace-configured rate, this adds ₹1,980 to your estimated pay.</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}><button className="btn primary" type="button"><MessageCircle size={17} />Ask about this pay</button><button className="btn soft" type="button"><Download size={17} />Print</button></div><p className="muted" style={{ fontSize: 12 }}>Estimated earnings are separate from approved payroll and confirmed payment.</p>
    </WorkerShell>;
  }

  if (page === 'safety') {
    const safetyBriefing = 'Safety support is available at any point in your shift. If there is immediate danger, use your site emergency process first. To report a concern here, choose what happened, select urgency, add a short description, then choose whether to report anonymously before sending.';
    return <WorkerShell title="Safety support" voiceSummary={safetyBriefing}>
      <p className="muted">Your report helps make work safer. In immediate danger, use your site emergency process as well.</p>
      <VoiceBriefing title="Hear how to report a concern" summary={safetyBriefing} />
      <SafetyForm />
      <h2 style={{ marginTop: 28 }}>Your reports</h2>
      {state.reports.map(report => <section className="card" style={{ marginBottom: 10 }} key={report.id}><span className={`chip ${badge(report.severity)}`}>{report.severity} · {report.status}</span><h3>{report.id} · {report.category}</h3><p className="muted">{report.detail}</p><small className="muted">{report.submittedAt} · {report.anonymous ? 'Anonymous' : 'Named report'}</small></section>)}
    </WorkerShell>;
  }

  if (page === 'feedback') {
    const feedbackBriefing = 'This feedback is anonymous by default. First choose how you feel about rest between shifts. Then, if you want, use the record feedback demo to add more detail. Results are only shown to the organisation in groups of five or more.';
    return <WorkerShell title="Your voice" voiceSummary={feedbackBriefing}>
      <VoiceBriefing title="Hear how feedback is protected" summary={feedbackBriefing} />
      <section className="card"><span className="chip">Anonymous by default</span><h2>Did you get enough rest between shifts?</h2><div style={{ display: 'flex', gap: 12, fontSize: 30 }}>{['😞', '🙁', '😐', '🙂', '😄'].map(face => <button className="btn soft" type="button" aria-label={`Rate ${face}`} key={face}><span>{face}</span></button>)}</div><p className="muted">Your response is only shown in groups of 5 or more.</p><button className="btn primary" type="button"><Mic size={17} />Record feedback (demo)</button></section>
    </WorkerShell>;
  }

  const profileBriefing = `Asha Kumar, Construction Helper. Your profile shows two verified skills: PPE Basics and Scaffold Safety. Masonry Assistant is in progress. You can choose one of ${supportedLanguages.length} voice languages below, then use the Listen control from any worker page.`;
  return <WorkerShell title={page === 'skills' ? 'Skill passport' : 'Your profile'} voiceSummary={profileBriefing}>
    <section className="card"><HardHat color="var(--orange)" /><h2>{worker.name}</h2><p className="muted">Worker-entered profile · Construction Helper</p><h3>Verified skills</h3><p><span className="chip">✓ PPE Basics</span> <span className="chip">✓ Scaffold Safety</span> <span className="chip">In progress · Masonry Assistant</span></p><p className="muted">Employer verified: PPE Basics, Scaffold Safety</p><button className="btn primary" type="button"><Download size={17} />Share profile card</button></section>
    <section className="card profile-accessibility" aria-labelledby="worker-voice-settings">
      <div className="profile-accessibility-heading"><Languages size={21} /><div><div className="eyebrow">Personal accessibility</div><h2 id="worker-voice-settings">Language and read-aloud</h2></div></div>
      <p className="muted">Choose the language FairShift requests from your device voice. Read-aloud is optional and never starts by itself.</p>
      <LanguagePicker />
      <p className="muted" style={{ fontSize: 12 }}>The exact voice depends on voices installed in your browser or operating system. Your written shift details remain available at all times.</p>
    </section>
  </WorkerShell>;
}
