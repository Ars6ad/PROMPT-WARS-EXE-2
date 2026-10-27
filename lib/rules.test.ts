import { describe, expect, it } from 'vitest';
import { calculatePayPaise, estimatePay, fatigueRisk, formatINR, sanitizeReport } from './rules';

describe('fairness rules', () => {
  it('calculates estimated overtime pay', () => {
    expect(estimatePay(16000, 176, 11, 180, 800, 360)).toBe(18420);
  });

  it('uses paise rather than decimal floats for payroll', () => {
    const pay = calculatePayPaise({
      basePaise: 1_600_000,
      overtimeMinutes: 660,
      overtimeRatePaisePerHour: 18_000,
      allowancesPaise: 80_000,
      deductionsPaise: 36_000,
    });
    expect(pay).toEqual({ overtimePaise: 198_000, grossPaise: 1_878_000, netPaise: 1_842_000 });
    expect(formatINR(pay.netPaise)).toBe('₹18,420.00');
  });

  it('rounds a partial overtime hour to the nearest paise', () => {
    expect(calculatePayPaise({ basePaise: 0, overtimeMinutes: 1, overtimeRatePaisePerHour: 10_000 }).overtimePaise).toBe(167);
  });

  it('rejects unsafe negative or fractional payroll input', () => {
    expect(() => calculatePayPaise({ basePaise: -1, overtimeMinutes: 0, overtimeRatePaisePerHour: 0 })).toThrow(RangeError);
    expect(() => calculatePayPaise({ basePaise: 1, overtimeMinutes: 0.5, overtimeRatePaisePerHour: 0 })).toThrow(RangeError);
  });

  it('explains fatigue warnings without overstating risk', () => {
    expect(fatigueRisk({ shiftHours: 8, restHours: 9, weeklyHours: 61, nightShifts: 0 })).toEqual({
      level: 'warning',
      reasons: ['Less than 10 hours rest', 'More than 60 hours this week'],
    });
  });

  it('prioritises a very long shift as high risk', () => {
    expect(fatigueRisk({ shiftHours: 13, restHours: 12, weeklyHours: 40, nightShifts: 0 }).level).toBe('high');
  });

  it('returns a stable status when no fatigue threshold is crossed', () => {
    expect(fatigueRisk({ shiftHours: 8, restHours: 12, weeklyHours: 40, nightShifts: 2 })).toEqual({ level: 'stable', reasons: [] });
  });

  it('rejects impossible fatigue inputs', () => {
    expect(() => fatigueRisk({ shiftHours: -1, restHours: 12, weeklyHours: 40, nightShifts: 0 })).toThrow(RangeError);
  });

  it('removes identity from anonymous reports', () => {
    expect(sanitizeReport({ anonymous: true, workerName: 'Asha', workerId: '1', detail: 'PPE' })).toEqual({ anonymous: true, detail: 'PPE' });
  });

  it('preserves identity fields for a named report', () => {
    expect(sanitizeReport({ anonymous: false, workerName: 'Asha', workerId: '1', detail: 'PPE' })).toEqual({
      anonymous: false,
      workerName: 'Asha',
      workerId: '1',
      detail: 'PPE',
    });
  });
});
