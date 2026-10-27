import { describe, expect, it } from 'vitest';
import {
  adminSafeReport,
  createInitialDemoState,
  parsePersistedDemoState,
  safetyReportInputSchema,
  serializeDemoState,
} from './demo-state';

describe('demo-state boundary', () => {
  it('accepts the seeded state and returns a typed copy', () => {
    const parsed = parsePersistedDemoState(serializeDemoState(createInitialDemoState(), 1_000), 1_001);
    expect(parsed?.attendance.worksite).toBe('Nehru Metro Site · Zone B');
    expect(parsed?.reports).toHaveLength(3);
  });

  it('rejects malformed, oversized, and unknown persisted values', () => {
    expect(parsePersistedDemoState('{bad json')).toBeNull();
    expect(parsePersistedDemoState('x'.repeat(75_001))).toBeNull();
    const state = createInitialDemoState();
    expect(parsePersistedDemoState(JSON.stringify({ version: 1, expiresAt: 2_000, state: { ...state, unexpected: true } }), 1_000)).toBeNull();
  });

  it('rejects expired demo sessions and legacy unwrapped state', () => {
    const state = createInitialDemoState();
    expect(parsePersistedDemoState(serializeDemoState(state, 1_000), 1_000 + (31 * 60 * 1_000))).toBeNull();
    expect(parsePersistedDemoState(JSON.stringify(state), 1_000)).toBeNull();
  });

  it('bounds report input before it reaches application state', () => {
    expect(safetyReportInputSchema.safeParse({ category: 'Missing PPE', detail: 'short', severity: 'High', anonymous: true }).success).toBe(false);
    expect(safetyReportInputSchema.safeParse({ category: 'Missing PPE', detail: 'Helmets are missing near the entrance.', severity: 'High', anonymous: true }).success).toBe(true);
  });

  it('removes identity fields before a report reaches the admin presentation layer', () => {
    const namedReport = createInitialDemoState().reports.find(report => !report.anonymous);
    if (!namedReport) throw new Error('Named seed report is required for this test.');
    expect(adminSafeReport(namedReport)).not.toHaveProperty('reporterName');
  });
});
