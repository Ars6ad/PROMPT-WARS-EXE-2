'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  ChevronRight,
  Clock,
  History,
  Home,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Settings,
  ShieldAlert,
  User,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { LanguagePicker, VoiceButton } from '@/components/AccessibilityTools';

const workerLinks = [
  ['/worker/dashboard', 'Home', Home],
  ['/worker/shift', 'Shifts', Clock],
  ['/worker/safety', 'Safety', ShieldAlert],
  ['/worker/profile', 'Profile', User],
] as const;

const adminLinks = [
  ['dashboard', 'Overview', LayoutDashboard],
  ['workers', 'Workers', UsersRound],
  ['safety', 'Safety', ShieldAlert],
  ['insights', 'Insights', Lightbulb],
  ['pay-queries', 'Pay queries', WalletCards],
  ['audit', 'Audit history', History],
  ['settings', 'Settings', Settings],
] as const;

type ShellProps = {
  children: React.ReactNode;
  title?: string;
  voiceSummary?: string;
};

export function WorkerShell({ children, title = 'Good morning, Asha', voiceSummary }: ShellProps) {
  const pathname = usePathname();
  const spokenSummary = voiceSummary ?? `${title}. Your FairShift worker workspace is ready. Use the page headings and links to review your shift, pay, safety support, and profile.`;

  return <main id="main-content" className="shell worker">
    <header className="nav">
      <div>
        <div className="eyebrow">FairShift · Worker app</div>
        <h1 className="title">{title}</h1>
      </div>
      <div className="app-top-actions" aria-label="Accessibility and profile controls">
        <LanguagePicker compact />
        <VoiceButton text={spokenSummary} label={`Read ${title} aloud`} compact />
        <Link href="/worker/profile" className="avatar" aria-label="Open Asha Kumar profile">AK</Link>
      </div>
    </header>
    {children}
    <nav className="bottom" aria-label="Worker navigation">
      {workerLinks.map(([href, label, Icon]) => <Link href={href} key={href} aria-current={pathname === href ? 'page' : undefined}><Icon size={19} />{label}</Link>)}
    </nav>
  </main>;
}

export function Listen({ text, label = 'Read this information aloud' }: { text?: string; label?: string }) {
  return <VoiceButton text={text ?? 'FairShift information is ready to read aloud.'} label={label} />;
}

export function AdminShell({ children, title, voiceSummary }: Required<Pick<ShellProps, 'children' | 'title'>> & Pick<ShellProps, 'voiceSummary'>) {
  const pathname = usePathname();
  const spokenSummary = voiceSummary ?? `${title}. Your FairShift operations workspace is ready. Review the information on this page, then choose the next support action.`;

  return <main id="main-content" className="shell admin-shell">
    <aside className="admin-side">
      <Link href="/admin/dashboard" className="brand" aria-label="FairShift admin home">FairShift</Link>
      <nav aria-label="Admin navigation">
        {adminLinks.map(([slug, label, Icon]) => {
          const href = `/admin/${slug}`;
          return <Link href={href} key={slug} aria-current={pathname === href ? 'page' : undefined}><Icon size={17} /><span>{label}</span></Link>;
        })}
      </nav>
      <footer>
        <Link href="/admin/settings" className="admin-user" aria-label="Open Priya Sharma profile and accessibility settings">
          <span>PS</span>
          <div><b>Priya Sharma</b><br />Operations manager</div>
          <ChevronRight size={15} />
        </Link>
        <Link href="/" className="admin-logout"><LogOut size={16} />Exit demo</Link>
      </footer>
    </aside>
    <header className="nav admin-topbar">
      <div>
        <div className="eyebrow">FairShift · Workforce operations</div>
        <h1 className="title">{title}</h1>
      </div>
      <div className="app-top-actions" aria-label="Accessibility and account controls">
        <LanguagePicker compact />
        <VoiceButton text={spokenSummary} label={`Read ${title} aloud`} compact />
        <button className="btn soft icon-only" aria-label="View notifications" type="button"><Bell size={18} /></button>
        <Link className="btn soft exit-demo" href="/">Exit demo</Link>
      </div>
    </header>
    <nav className="tabs" aria-label="Admin navigation">
      {adminLinks.map(([slug, label]) => {
        const href = `/admin/${slug}`;
        return <Link href={href} key={slug} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>;
      })}
    </nav>
    {children}
  </main>;
}
