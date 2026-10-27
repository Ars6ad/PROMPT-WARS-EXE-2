export type PayInput = {
  basePaise: number;
  overtimeMinutes: number;
  overtimeRatePaisePerHour: number;
  allowancesPaise?: number;
  deductionsPaise?: number;
};

export type FatigueInput = {
  shiftHours: number;
  restHours: number;
  weeklyHours: number;
  nightShifts: number;
};

function assertNonNegativeSafeInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${label} must be a non-negative whole number.`);
}

/** Store Indian rupees as integer paise to avoid floating-point payroll drift. */
export function calculatePayPaise(input: PayInput) {
  const allowancesPaise = input.allowancesPaise ?? 0;
  const deductionsPaise = input.deductionsPaise ?? 0;

  assertNonNegativeSafeInteger(input.basePaise, 'Base pay');
  assertNonNegativeSafeInteger(input.overtimeMinutes, 'Overtime minutes');
  assertNonNegativeSafeInteger(input.overtimeRatePaisePerHour, 'Overtime rate');
  assertNonNegativeSafeInteger(allowancesPaise, 'Allowances');
  assertNonNegativeSafeInteger(deductionsPaise, 'Deductions');

  const overtimePaise = Math.round((input.overtimeMinutes * input.overtimeRatePaisePerHour) / 60);
  const grossPaise = input.basePaise + overtimePaise + allowancesPaise;
  return { overtimePaise, grossPaise, netPaise: grossPaise - deductionsPaise };
}

export function formatINR(paise: number) {
  if (!Number.isSafeInteger(paise)) throw new RangeError('Paise must be a whole number.');
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);
}

/** Backward-compatible display helper for seed data expressed in whole rupees. */
export function estimatePay(base: number, regularHours: number, overtimeHours: number, rate: number, allowances = 0, deductions = 0) {
  void regularHours;
  return calculatePayPaise({
    basePaise: base * 100,
    overtimeMinutes: overtimeHours * 60,
    overtimeRatePaisePerHour: rate * 100,
    allowancesPaise: allowances * 100,
    deductionsPaise: deductions * 100,
  }).netPaise / 100;
}

export function fatigueRisk({ shiftHours, restHours, weeklyHours, nightShifts }: FatigueInput) {
  for (const [label, value] of Object.entries({ shiftHours, restHours, weeklyHours, nightShifts })) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`${label} must be a non-negative number.`);
  }

  const reasons: string[] = [];
  if (shiftHours > 12) reasons.push('Shift exceeds 12 hours');
  if (restHours < 10) reasons.push('Less than 10 hours rest');
  if (weeklyHours > 60) reasons.push('More than 60 hours this week');
  if (nightShifts > 3) reasons.push('More than 3 consecutive night shifts');
  return { level: shiftHours > 12 ? 'high' : reasons.length ? 'warning' : 'stable', reasons } as const;
}

export function sanitizeReport<T extends { anonymous: boolean; workerName?: string; workerId?: string }>(report: T) {
  if (!report.anonymous) return report;
  const { workerName: _workerName, workerId: _workerId, ...safe } = report;
  return safe;
}
