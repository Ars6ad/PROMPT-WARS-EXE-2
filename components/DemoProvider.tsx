'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createDemoReportId,
  createInitialDemoState,
  demoSessionLifetimeMs,
  demoStorageKey,
  parsePersistedDemoState,
  reportUpdateInputSchema,
  safetyReportInputSchema,
  serializeDemoState,
  type DemoState,
  type ReportStatus,
  type SafetyReport,
  type SafetyReportInput,
} from '@/lib/demo-state';

export type { DemoState, ReportStatus, SafetyReport, SafetyReportInput } from '@/lib/demo-state';

type ActionResult = { ok: boolean; message: string };
type SubmitReportResult = { ok: true; report: SafetyReport } | { ok: false; message: string };
type UpdateReportInput = { status: ReportStatus; owner?: string; resolutionNote?: string };

type ContextValue = {
  state: DemoState;
  ready: boolean;
  checkIn: () => ActionResult;
  checkOut: () => ActionResult;
  submitReport: (input: SafetyReportInput) => SubmitReportResult;
  updateReport: (id: string, input: UpdateReportInput) => ActionResult;
  resetDemo: () => void;
};

const DemoContext = createContext<ContextValue | null>(null);
const timestampFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
});

function stamp() {
  return timestampFormatter.format(new Date());
}

function addAuditEvent(state: DemoState, action: string, target: string): DemoState {
  return {
    ...state,
    audit: [{ at: stamp(), actor: 'Demo user', action, target }, ...state.audit].slice(0, 50),
  };
}

function saveDemoState(state: DemoState) {
  try {
    sessionStorage.setItem(demoStorageKey, serializeDemoState(state));
  } catch {
    // The prototype remains usable when a browser blocks or exhausts session storage.
  }
}

function removeDemoSession() {
  try {
    sessionStorage.removeItem(demoStorageKey);
  } catch {
    // Storage cleanup is best-effort in demo mode.
  }
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(createInitialDemoState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedState = parsePersistedDemoState(sessionStorage.getItem(demoStorageKey));
    if (storedState) setState(storedState);
    try {
      // Remove prior prototype data that was stored persistently before v4.
      localStorage.removeItem('fairshift-demo-state-v3');
    } catch {
      // The new session-only storage remains available when local storage is blocked.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveDemoState(state);
  }, [ready, state]);

  useEffect(() => {
    if (!ready) return;

    let expirationTimer: number | undefined;
    const expireDemoSession = () => {
      removeDemoSession();
      setState(createInitialDemoState());
    };
    const refreshExpiration = () => {
      if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
      expirationTimer = window.setTimeout(expireDemoSession, demoSessionLifetimeMs);
    };
    const activityEvents: Array<keyof DocumentEventMap> = ['click', 'keydown', 'pointerdown', 'touchstart'];

    refreshExpiration();
    activityEvents.forEach(eventName => document.addEventListener(eventName, refreshExpiration, { passive: true }));
    return () => {
      if (expirationTimer !== undefined) window.clearTimeout(expirationTimer);
      activityEvents.forEach(eventName => document.removeEventListener(eventName, refreshExpiration));
    };
  }, [ready]);

  const checkIn = useCallback((): ActionResult => {
    let result: ActionResult = { ok: false, message: 'You are already checked in.' };

    setState(current => {
      if (current.attendance.status === 'checked-in') return current;
      if (current.attendance.status === 'checked-out') {
        result = { ok: false, message: 'This demo shift is already complete.' };
        return current;
      }

      result = { ok: true, message: 'Your shift has been recorded.' };
      const next = {
        ...current,
        attendance: {
          ...current.attendance,
          status: 'checked-in' as const,
          checkedInAt: stamp(),
          actionIds: [...current.attendance.actionIds, `check-in-${crypto.randomUUID()}`],
        },
      };
      return addAuditEvent(next, 'Checked in', next.attendance.shiftId);
    });

    return result;
  }, []);

  const checkOut = useCallback((): ActionResult => {
    let result: ActionResult = { ok: false, message: 'Check in before checking out.' };

    setState(current => {
      if (current.attendance.status !== 'checked-in') return current;

      result = { ok: true, message: 'Check-out recorded. Your hours will be reviewed for payroll.' };
      const next = {
        ...current,
        attendance: {
          ...current.attendance,
          status: 'checked-out' as const,
          checkedOutAt: stamp(),
          actionIds: [...current.attendance.actionIds, `check-out-${crypto.randomUUID()}`],
        },
      };
      return addAuditEvent(next, 'Checked out', next.attendance.shiftId);
    });

    return result;
  }, []);

  const submitReport = useCallback((input: SafetyReportInput): SubmitReportResult => {
    const parsed = safetyReportInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: 'Review the safety report details and try again.' };

    const submittedAt = stamp();
    const report: SafetyReport = {
      id: createDemoReportId(),
      ...parsed.data,
      status: 'Reported',
      submittedAt,
      reporterName: parsed.data.anonymous ? undefined : 'Asha Kumar',
      timeline: [{
        status: 'Reported',
        at: submittedAt,
        note: parsed.data.anonymous ? 'Submitted anonymously' : 'Submitted by worker',
      }],
    };

    setState(current => addAuditEvent({ ...current, reports: [report, ...current.reports] }, 'Submitted safety report', report.id));
    return { ok: true, report };
  }, []);

  const updateReport = useCallback((id: string, input: UpdateReportInput): ActionResult => {
    const parsed = reportUpdateInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, message: 'Review the incident update and try again.' };
    if (parsed.data.status === 'Resolved' && !parsed.data.resolutionNote?.trim()) {
      return { ok: false, message: 'Add a resolution note before resolving this incident.' };
    }

    let result: ActionResult = { ok: false, message: 'Report could not be found.' };
    setState(current => {
      const report = current.reports.find(item => item.id === id);
      if (!report) return current;

      result = {
        ok: true,
        message: parsed.data.status === 'Resolved' ? 'Resolution saved. Worker verification is now pending.' : 'Incident updated.',
      };
      const reports = current.reports.map(item => item.id !== id ? item : {
        ...item,
        status: parsed.data.status,
        owner: parsed.data.owner || item.owner,
        resolutionNote: parsed.data.resolutionNote || item.resolutionNote,
        timeline: [...item.timeline, {
          status: parsed.data.status,
          at: stamp(),
          note: parsed.data.resolutionNote || `Status set to ${parsed.data.status}`,
        }],
      });
      return addAuditEvent({ ...current, reports }, `Updated safety status to ${parsed.data.status}`, id);
    });

    return result;
  }, []);

  const resetDemo = useCallback(() => {
    setState(createInitialDemoState());
    removeDemoSession();
  }, []);

  const value = useMemo(() => ({ state, ready, checkIn, checkOut, submitReport, updateReport, resetDemo }), [state, ready, checkIn, checkOut, submitReport, updateReport, resetDemo]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}
