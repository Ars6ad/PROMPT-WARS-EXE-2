import { z } from 'zod';

export const reportStatuses = ['Reported', 'Acknowledged', 'Assigned', 'In progress', 'Resolved', 'Closed'] as const;
export const severities = ['Low', 'Medium', 'High'] as const;

export type ReportStatus = (typeof reportStatuses)[number];
export type Severity = (typeof severities)[number];
export type AttendanceStatus = 'scheduled' | 'checked-in' | 'checked-out';

const shortText = (max: number) => z.string().trim().min(1).max(max);
const reportStatusSchema = z.enum(reportStatuses);
const severitySchema = z.enum(severities);

const reportTimelineSchema = z.object({
  status: reportStatusSchema,
  at: shortText(100),
  note: shortText(500),
}).strict();

export const safetyReportSchema = z.object({
  id: z.string().regex(/^FS-[A-Z0-9-]{4,64}$/i),
  category: shortText(100),
  severity: severitySchema,
  status: reportStatusSchema,
  detail: shortText(2_000),
  submittedAt: shortText(100),
  anonymous: z.boolean(),
  reporterName: shortText(100).optional(),
  owner: shortText(100).optional(),
  resolutionNote: shortText(2_000).optional(),
  timeline: z.array(reportTimelineSchema).max(50),
}).strict();

const attendanceSchema = z.object({
  status: z.enum(['scheduled', 'checked-in', 'checked-out']),
  shiftId: shortText(100),
  worksite: shortText(200),
  scheduledStart: shortText(40),
  checkedInAt: shortText(100).optional(),
  checkedOutAt: shortText(100).optional(),
  actionIds: z.array(shortText(150)).max(50),
}).strict();

const auditEventSchema = z.object({
  at: shortText(100),
  actor: shortText(100),
  action: shortText(200),
  target: shortText(200),
}).strict();

export const demoStateSchema = z.object({
  attendance: attendanceSchema,
  reports: z.array(safetyReportSchema).max(100),
  audit: z.array(auditEventSchema).max(50),
  payQueryCount: z.number().int().min(0).max(10_000),
}).strict();

export type SafetyReport = z.infer<typeof safetyReportSchema>;
export type DemoState = z.infer<typeof demoStateSchema>;
export type SafetyReportInput = Pick<SafetyReport, 'category' | 'detail' | 'severity' | 'anonymous'>;
export type ReportUpdateInput = Pick<SafetyReport, 'status'> & Partial<Pick<SafetyReport, 'owner' | 'resolutionNote'>>;

export const safetyReportInputSchema = z.object({
  category: shortText(100),
  detail: z.string().trim().min(8).max(2_000),
  severity: severitySchema,
  anonymous: z.boolean(),
}).strict();

export const reportUpdateInputSchema = z.object({
  status: reportStatusSchema,
  owner: shortText(100).optional(),
  resolutionNote: shortText(2_000).optional(),
}).strict();

export const demoStorageKey = 'fairshift-demo-session-v4';
const maxStoredStateLength = 75_000;
export const demoSessionLifetimeMs = 30 * 60 * 1_000;

const persistedDemoSessionSchema = z.object({
  expiresAt: z.number().int().positive(),
  state: demoStateSchema,
  version: z.literal(1),
}).strict();

export function createInitialDemoState(): DemoState {
  return {
    attendance: {
      status: 'scheduled',
      shiftId: 'shift-asha-2026-10-27',
      worksite: 'Nehru Metro Site · Zone B',
      scheduledStart: '09:00',
      actionIds: [],
    },
    payQueryCount: 12,
    reports: [
      {
        id: 'FS-2048',
        category: 'Missing PPE',
        severity: 'High',
        status: 'In progress',
        detail: 'Helmets are missing near the scaffolding entrance.',
        submittedAt: 'Today, 9:18 AM',
        anonymous: true,
        owner: 'Priya Sharma',
        timeline: [
          { status: 'Reported', at: 'Today, 9:18 AM', note: 'Submitted anonymously' },
          { status: 'Acknowledged', at: 'Today, 9:32 AM', note: 'Safety desk notified' },
          { status: 'In progress', at: 'Today, 10:04 AM', note: 'PPE inventory is being checked' },
        ],
      },
      {
        id: 'FS-2029',
        category: 'Hygiene / sanitation',
        severity: 'Medium',
        status: 'Acknowledged',
        detail: 'Hand sanitiser is empty in Ward 4.',
        submittedAt: 'Yesterday',
        anonymous: true,
        timeline: [
          { status: 'Reported', at: 'Yesterday', note: 'Submitted anonymously' },
          { status: 'Acknowledged', at: 'Yesterday', note: 'Facilities team notified' },
        ],
      },
      {
        id: 'FS-2004',
        category: 'Unsafe equipment',
        severity: 'High',
        status: 'Resolved',
        detail: 'Damaged ladder replaced.',
        submittedAt: '14 Oct',
        anonymous: false,
        reporterName: 'Ravi Kumar',
        owner: 'Arun Mehta',
        resolutionNote: 'Damaged ladder removed and replaced before the next shift.',
        timeline: [
          { status: 'Reported', at: '14 Oct', note: 'Submitted' },
          { status: 'Acknowledged', at: '14 Oct', note: 'Supervisor notified' },
          { status: 'Resolved', at: '15 Oct', note: 'Damaged ladder replaced' },
        ],
      },
    ],
    audit: [],
  };
}

export function serializeDemoState(state: DemoState, now = Date.now()): string {
  return JSON.stringify({
    version: 1,
    expiresAt: now + demoSessionLifetimeMs,
    state,
  });
}

export function parsePersistedDemoState(raw: string | null, now = Date.now()): DemoState | null {
  if (!raw || raw.length > maxStoredStateLength) return null;

  try {
    const result = persistedDemoSessionSchema.safeParse(JSON.parse(raw));
    if (!result.success || result.data.expiresAt <= now) return null;
    return result.data.state;
  } catch {
    return null;
  }
}

/** Prevent administrator cards from receiving worker identity fields. */
export function adminSafeReport(report: SafetyReport): Omit<SafetyReport, 'reporterName'> {
  const { reporterName: _reporterName, ...safeReport } = report;
  return safeReport;
}

export function createDemoReportId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `FS-${uuid.replace(/-/g, '').slice(0, 12).toUpperCase()}`;

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) throw new Error('A cryptographically secure random generator is required.');

  const bytes = cryptoApi.getRandomValues(new Uint8Array(12));
  const random = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `FS-${random.toUpperCase()}`;
}
