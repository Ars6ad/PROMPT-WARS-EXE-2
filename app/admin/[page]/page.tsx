'use client';

import { use, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  Languages,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import { LanguagePicker, VoiceBriefing, VoiceButton } from '@/components/AccessibilityTools';
import { AdminShell } from '@/components/Shell';
import { workers } from '@/lib/data';
import { useDemo } from '@/components/DemoProvider';
import { adminSafeReport, type ReportStatus } from '@/lib/demo-state';

const Metric = ({ icon: Icon, label, value, note, hot }: { icon: LucideIcon; label: string; value: string; note: string; hot?: boolean }) => <div className="card" style={hot ? { borderColor: 'var(--red)' } : {}}>
  <Icon color={hot ? 'var(--red)' : 'var(--orange)'} size={21} />
  <p className="muted">{label}</p>
  <div className="big">{value}</div>
  <small className={hot ? 'alert' : 'muted'}>{note}</small>
</div>;

const chip = (severity: string) => severity === 'High' ? 'alert' : severity === 'Medium' ? 'warn' : '';

export default function Admin({ params }: { params: Promise<{ page: string }> }) {
  const { page } = use(params);
  const { state, ready, resetDemo } = useDemo();

  if (!ready) return <AdminShell title="Loading operations"><div className="card"><p className="muted">Loading locally saved demo data…</p></div></AdminShell>;

  const openReports = state.reports.filter(report => !['Resolved', 'Closed'].includes(report.status));
  const dashboardBriefing = `Workforce health update. 50 workers are active across four sites. Today's attendance is ${state.attendance.status === 'checked-in' ? '96' : '94'} percent. There are ${openReports.length} open safety issues, including ${openReports.filter(report => report.severity === 'High').length} high-priority issue${openReports.filter(report => report.severity === 'High').length === 1 ? '' : 's'}. Five workers show a high fatigue risk. The first actions are to assign any unowned report, review rest periods, and adjust the roster rather than penalising workers.`;

  if (page === 'dashboard') return <AdminShell title="Workforce health" voiceSummary={dashboardBriefing}>
    <p className="muted">Connected local demo data · worker actions appear here after refresh-free updates.</p>
    <VoiceBriefing eyebrow="Manager briefing" title="Hear today’s action priorities" summary={dashboardBriefing} />
    <section className="grid metrics">
      <Metric icon={Users} label="Active workers" value="50" note="Across 4 sites" />
      <Metric icon={Clock} label="Today’s attendance" value={state.attendance.status === 'checked-in' ? '96%' : '94%'} note={state.attendance.status === 'checked-in' ? 'Asha checked in' : '+3% from last week'} />
      <Metric icon={AlertTriangle} label="Open safety issues" value={String(openReports.length)} note={`${openReports.filter(report => report.severity === 'High').length} high priority`} hot />
      <Metric icon={AlertTriangle} label="High fatigue risk" value="5" note="Review rest periods" hot />
      <Metric icon={WalletCards} label="Pay queries" value={String(state.payQueryCount)} note="Awaiting response" />
      <Metric icon={ShieldCheck} label="Workforce sentiment" value="76/100" note="Stable this week" />
    </section>
    <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', marginTop: 18 }}>
      <article className="card"><h2>Attention needed</h2><p className="notice">{openReports.filter(report => !report.owner).length || 'No'} open safety report{openReports.filter(report => !report.owner).length === 1 ? '' : 's'} need an owner. Assign a responsible manager and resolution date.</p><p className="notice">12 workers may not have enough rest time. Review the roster—not the worker.</p></article>
      <article className="card"><h2>Attendance trend</h2>{[72, 84, 76, 92, 88, state.attendance.status === 'checked-in' ? 96 : 94].map((value, index) => <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}><small>W{index + 1}</small><div className="bar" style={{ flex: 1 }}><i style={{ width: `${value}%` }} /></div><b>{value}%</b></div>)}</article>
    </section>
    <button className="btn soft" style={{ marginTop: 18 }} onClick={resetDemo} type="button">Reset connected demo data</button>
  </AdminShell>;

  if (page === 'workers') {
    const workerBriefing = `Worker directory. ${workers.length} workers are listed. The view shows assignment, attendance, fatigue support signals, verified skills, and issue counts. Anonymous reports and feedback never appear in worker profiles.`;
    return <AdminShell title="Worker directory" voiceSummary={workerBriefing}>
      <VoiceBriefing eyebrow="Manager briefing" title="Hear how to use the directory" summary={workerBriefing} />
      <label className="sr-only" htmlFor="worker-search">Search workers, sites, or roles</label><input id="worker-search" className="field" placeholder="Search workers, sites, or roles" />
      <section className="card scroll" style={{ marginTop: 16 }}><table className="table"><thead><tr><th>Worker</th><th>Site / role</th><th>Attendance</th><th>Fatigue</th><th>Skills</th><th>Signal</th></tr></thead><tbody>{workers.map((name, index) => <tr key={name}><td><b>{name}</b><br /><small className="muted">Worker ID FS-10{index}</small></td><td>{index % 2 ? 'Ward 4 · Attendant' : 'Metro Site · Helper'}</td><td>{index === 0 && state.attendance.status === 'checked-in' ? 'Checked in' : `${94 - index}%`}</td><td><span className={`chip ${index === 0 ? 'warn' : ''}`}>{index === 0 ? 'Needs attention' : 'Stable'}</span></td><td>2 verified</td><td>Open issues: {index === 0 ? state.reports.filter(report => !['Resolved', 'Closed'].includes(report.status)).length : index % 3}</td></tr>)}</tbody></table></section>
      <p className="muted">Anonymous reports and feedback never appear in worker profiles.</p>
    </AdminShell>;
  }

  if (page === 'safety') return <SafetyAdmin />;

  if (page === 'insights') {
    const insights = [
      ['Overtime hotspot', 'Nehru Metro Site · 64 overtime hours', 'Review roster and add backup staffing'],
      ['Rest-period review', '12 workers have back-to-back shift patterns', 'Review schedule and protect rest time'],
      ['Pay clarity', '8 questions relate to overtime calculation', 'Respond to pay queries with a plain-language breakdown'],
      ['PPE support', `${openReports.filter(report => report.category === 'Missing PPE').length} missing-PPE reports remain open`, 'Verify PPE inventory and schedule a safety briefing'],
    ];
    const insightsBriefing = `Fair work insights. Four support signals need attention: an overtime hotspot at Nehru Metro Site, back-to-back shifts affecting 12 workers, eight overtime pay questions, and ${openReports.filter(report => report.category === 'Missing PPE').length} open missing-PPE report${openReports.filter(report => report.category === 'Missing PPE').length === 1 ? '' : 's'}. These signals guide care and staffing; they are not disciplinary scores.`;
    return <AdminShell title="Fair work insights" voiceSummary={insightsBriefing}>
      <p className="muted">Support signals are explainable and designed to guide care, not punishment.</p>
      <VoiceBriefing eyebrow="Manager briefing" title="Hear workforce support signals" summary={insightsBriefing} />
      {insights.map(([title, detail, action]) => <article className="card" style={{ marginTop: 12 }} key={title}><span className="chip warn">Workforce support signal</span><h2>{title}</h2><p>{detail}</p><p className="muted"><b>Recommended action:</b> {action}</p><button className="btn soft" type="button">Why am I seeing this?</button></article>)}
    </AdminShell>;
  }

  if (page === 'pay-queries') {
    const payQueryBriefing = `${state.payQueryCount} pay queries are waiting for a response. These requests concern overtime hours. Use a plain-language pay breakdown, clearly distinguish estimates from approved payroll, and record the response.`;
    return <AdminShell title="Pay queries" voiceSummary={payQueryBriefing}>
      <VoiceBriefing eyebrow="Manager briefing" title="Hear pay-query priorities" summary={payQueryBriefing} />
      <section className="card scroll"><table className="table"><thead><tr><th>Ticket</th><th>Topic</th><th>Status</th><th>Received</th></tr></thead><tbody>{Array.from({ length: state.payQueryCount }, (_, index) => <tr key={index}><td>PAY-{121 + index}</td><td>Overtime hours question</td><td><span className="chip warn">Awaiting response</span></td><td>{index + 1} days ago</td></tr>)}</tbody></table></section>
    </AdminShell>;
  }

  if (page === 'audit') {
    const auditBriefing = state.audit.length ? `Audit history has ${state.audit.length} recent browser-demo action${state.audit.length === 1 ? '' : 's'}. The newest action is ${state.audit[0].action} on ${state.audit[0].target}, recorded ${state.audit[0].at}.` : 'There are no admin or worker actions recorded in this browser session yet.';
    return <AdminShell title="Audit history" voiceSummary={auditBriefing}>
      <VoiceBriefing eyebrow="Manager briefing" title="Hear recent audit activity" summary={auditBriefing} />
      <section className="card"><History color="var(--orange)" /><h2>Recent demo actions</h2>{state.audit.length ? state.audit.map((event, index) => <p key={index}><b>{event.action}</b> · {event.target}<br /><small className="muted">{event.at} · {event.actor}</small></p>) : <p className="muted">No admin or worker actions have been recorded in this browser session yet.</p>}</section>
    </AdminShell>;
  }

  const settingsBriefing = 'Workforce rules and accessibility settings. These are configurable workplace policies, not automatic legal compliance. Read-aloud works in the language selected below using a voice installed on the manager’s device. It never starts automatically and requires no microphone permission.';
  return <AdminShell title="Workforce rules" voiceSummary={settingsBriefing}>
    <VoiceBriefing eyebrow="Manager briefing" title="Hear rules and accessibility settings" summary={settingsBriefing} />
    <section className="card grid"><p className="notice">These are configurable workplace policies, not automatic legal compliance.</p>{[['Standard workday', '8 hours'], ['Overtime threshold', '8 hours/day'], ['Overtime multiplier', '1.5×'], ['Required rest interval', '10 hours'], ['Weekly hour warning', '60 hours'], ['Anonymous privacy minimum', '5 responses']].map(([label, value]) => <label key={label}>{label}<input className="field" defaultValue={value} /></label>)}<button className="btn primary" type="button">Save workplace rules</button></section>
    <section className="card profile-accessibility" aria-labelledby="admin-voice-settings">
      <div className="profile-accessibility-heading"><Languages size={21} /><div><div className="eyebrow">Personal accessibility</div><h2 id="admin-voice-settings">Language and read-aloud</h2></div></div>
      <p className="muted">Choose the language FairShift requests from your device voice for manager briefings and case summaries.</p>
      <LanguagePicker />
      <p className="muted" style={{ fontSize: 12 }}>Exact voices depend on your browser and device. Voice is a complement to the written operational record, not a replacement for it.</p>
    </section>
  </AdminShell>;
}

function SafetyAdmin() {
  const { state } = useDemo();
  const safetyBriefing = `Safety command center. ${state.reports.length} report${state.reports.length === 1 ? '' : 's'} are visible. ${state.reports.filter(report => !['Resolved', 'Closed'].includes(report.status)).length} remain open. Anonymous reporter identity is excluded from this administrative view. Give each report an owner, record corrective action, and add a resolution note before resolving it.`;
  return <AdminShell title="Safety command center" voiceSummary={safetyBriefing}>
    <p className="muted">Anonymous reporter identity is excluded from this administrative view. Resolution requires a note and worker verification follows.</p>
    <VoiceBriefing eyebrow="Manager briefing" title="Hear safety case priorities" summary={safetyBriefing} />
    <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))' }}>{state.reports.map(report => <SafetyCard key={report.id} report={adminSafeReport(report)} />)}</section>
  </AdminShell>;
}

function SafetyCard({ report }: { report: ReturnType<typeof adminSafeReport> }) {
  const { updateReport } = useDemo();
  const [owner, setOwner] = useState(report.owner ?? '');
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [note, setNote] = useState(report.resolutionNote ?? '');
  const [message, setMessage] = useState('');
  const cardBriefing = `${report.id}. ${report.severity} severity, ${report.category}. Current status: ${report.status}. ${report.detail}. ${report.anonymous ? 'The worker reported anonymously.' : 'This is a named report.'} ${report.owner ? `Current owner: ${report.owner}.` : 'No owner is assigned yet.'}`;

  function save() {
    const result = updateReport(report.id, { status, owner: owner || undefined, resolutionNote: note || undefined });
    setMessage(result.message);
  }

  return <article className="card"><span className={`chip ${chip(report.severity)}`}>{report.severity} · {report.status}</span><h2>{report.id} · {report.category}</h2><p>{report.detail}</p><p className="muted">Reporter: {report.anonymous ? 'Anonymous' : 'Named report'}</p><VoiceButton text={cardBriefing} label={`Read ${report.id} case summary aloud`} compact /><label className="sr-only" htmlFor={`owner-${report.id}`}>Assigned owner</label><select id={`owner-${report.id}`} className="field" value={owner} onChange={event => setOwner(event.target.value)}><option value="">Assign owner</option><option>Priya Sharma</option><option>Arun Mehta</option></select><label className="sr-only" htmlFor={`status-${report.id}`}>Incident status</label><select id={`status-${report.id}`} className="field" value={status} onChange={event => setStatus(event.target.value as ReportStatus)}><option>Reported</option><option>Acknowledged</option><option>Assigned</option><option>In progress</option><option>Resolved</option><option>Closed</option></select><label className="sr-only" htmlFor={`note-${report.id}`}>Corrective action or resolution note</label><textarea id={`note-${report.id}`} className="field" value={note} onChange={event => setNote(event.target.value)} placeholder="Corrective action / resolution note" style={{ marginTop: 8 }} /><button className="btn teal" style={{ marginTop: 8 }} onClick={save} type="button">{status === 'Resolved' ? <><CheckCircle2 size={17} />Mark resolved</> : 'Save incident update'}</button>{message && <p className="muted" role="status" style={{ fontSize: 13 }}>{message}</p>}</article>;
}
