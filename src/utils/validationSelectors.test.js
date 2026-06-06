import {
  getValidationProgress,
  getUnvalidatedApps,
  isExportAllowed,
} from './validationSelectors';

const makeEntry = (status, overrides = {}) => ({
  status,
  aiRecommendation: 'Retain',
  analystDecision:  status === 'PENDING' ? '' : 'Retain',
  overrideReason:   null,
  validatedAt:      status === 'PENDING' ? null : '2026-06-06T10:00:00Z',
  validatedBy:      status === 'PENDING' ? '' : 'Ken',
  ...overrides,
});

const mixedStates = {
  'app-001': makeEntry('ACCEPTED'),
  'app-002': makeEntry('OVERRIDDEN', { overrideReason: 'Client strategy change' }),
  'app-003': makeEntry('PENDING'),
  'app-004': makeEntry('ESCALATED'),
  'app-005': makeEntry('EXCLUDED'),
};

const allPending = {
  'app-001': makeEntry('PENDING'),
  'app-002': makeEntry('PENDING'),
};

const allValidated = {
  'app-001': makeEntry('ACCEPTED'),
  'app-002': makeEntry('OVERRIDDEN'),
  'app-003': makeEntry('EXCLUDED'),
};

describe('getValidationProgress', () => {
  test('counts each status correctly', () => {
    const result = getValidationProgress(mixedStates);
    expect(result.total).toBe(5);
    expect(result.pending).toBe(1);
    expect(result.accepted).toBe(1);
    expect(result.overridden).toBe(1);
    expect(result.escalated).toBe(1);
    expect(result.excluded).toBe(1);
  });

  test('percentComplete is 80 when 4 of 5 validated', () => {
    const result = getValidationProgress(mixedStates);
    expect(result.percentComplete).toBe(80);
  });

  test('percentComplete is 0 when all pending', () => {
    const result = getValidationProgress(allPending);
    expect(result.percentComplete).toBe(0);
  });

  test('percentComplete is 100 when all validated', () => {
    const result = getValidationProgress(allValidated);
    expect(result.percentComplete).toBe(100);
  });

  test('canExport is false when any app is PENDING', () => {
    expect(getValidationProgress(mixedStates).canExport).toBe(false);
    expect(getValidationProgress(allPending).canExport).toBe(false);
  });

  test('canExport is true when no apps are PENDING', () => {
    expect(getValidationProgress(allValidated).canExport).toBe(true);
  });

  test('empty validationStates returns zeros and canExport false', () => {
    const result = getValidationProgress({});
    expect(result.total).toBe(0);
    expect(result.pending).toBe(0);
    expect(result.percentComplete).toBe(0);
    expect(result.canExport).toBe(false);
  });

  test('returns all seven keys', () => {
    const result = getValidationProgress(mixedStates);
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('pending');
    expect(result).toHaveProperty('accepted');
    expect(result).toHaveProperty('overridden');
    expect(result).toHaveProperty('escalated');
    expect(result).toHaveProperty('excluded');
    expect(result).toHaveProperty('percentComplete');
    expect(result).toHaveProperty('canExport');
  });
});

describe('getUnvalidatedApps', () => {
  test('returns only PENDING appIds', () => {
    const result = getUnvalidatedApps(mixedStates);
    expect(result).toEqual(['app-003']);
  });

  test('returns all appIds when all pending', () => {
    const result = getUnvalidatedApps(allPending);
    expect(result).toHaveLength(2);
    expect(result).toContain('app-001');
    expect(result).toContain('app-002');
  });

  test('returns empty array when all validated', () => {
    expect(getUnvalidatedApps(allValidated)).toEqual([]);
  });

  test('returns empty array for empty input', () => {
    expect(getUnvalidatedApps({})).toEqual([]);
  });
});

describe('isExportAllowed', () => {
  test('returns false when any app is PENDING', () => {
    expect(isExportAllowed(mixedStates)).toBe(false);
    expect(isExportAllowed(allPending)).toBe(false);
  });

  test('returns true when no apps are PENDING', () => {
    expect(isExportAllowed(allValidated)).toBe(true);
  });

  test('returns true for mix of ACCEPTED, OVERRIDDEN, ESCALATED, EXCLUDED', () => {
    const states = {
      'app-001': makeEntry('ACCEPTED'),
      'app-002': makeEntry('OVERRIDDEN'),
      'app-003': makeEntry('ESCALATED'),
      'app-004': makeEntry('EXCLUDED'),
    };
    expect(isExportAllowed(states)).toBe(true);
  });

  test('returns false for empty validationStates', () => {
    expect(isExportAllowed({})).toBe(false);
  });
});
