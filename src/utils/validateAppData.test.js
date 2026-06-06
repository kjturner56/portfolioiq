import { validateAppData } from './validateAppData';

const fullApp = {
  name: 'SAP ERP',
  lifecycle_stage: 'Current',
  support_status: 'In Support',
  vendor: 'SAP',
  annual_cost: 840000,
  active_user_count: 620,
  incident_count_12mo: 3,
};

const partialApp = {
  name: 'Legacy App',
  lifecycle_stage: 'End of Life',
  support_status: 'End of Support',
  // missing all RECOMMENDED fields
};

const unscorableApp = {
  // missing name and lifecycle_stage and support_status
  vendor: 'Unknown',
};

const missingOneRecommended = {
  name: 'App X',
  lifecycle_stage: 'Current',
  support_status: 'In Support',
  vendor: 'Vendor X',
  annual_cost: 100000,
  active_user_count: 50,
  // missing incident_count_12mo
};

describe('validateAppData — FULL', () => {
  test('returns FULL when all required and recommended fields present', () => {
    const result = validateAppData(fullApp);
    expect(result.scoringStatus).toBe('FULL');
    expect(result.missingRequired).toHaveLength(0);
    expect(result.missingRecommended).toHaveLength(0);
    expect(result.confidenceAdjustment).toBe(0);
  });

  test('FULL explanation mentions all fields present', () => {
    const result = validateAppData(fullApp);
    expect(result.explanation).toMatch(/all required and recommended/i);
  });
});

describe('validateAppData — PARTIAL', () => {
  test('returns PARTIAL when required present but some recommended missing', () => {
    const result = validateAppData(partialApp);
    expect(result.scoringStatus).toBe('PARTIAL');
    expect(result.missingRequired).toHaveLength(0);
    expect(result.missingRecommended.length).toBeGreaterThan(0);
  });

  test('confidence adjustment is -0.05 per missing recommended field', () => {
    const result = validateAppData(partialApp);
    const expected = -(result.missingRecommended.length * 0.05);
    expect(result.confidenceAdjustment).toBeCloseTo(expected);
  });

  test('missing one recommended gives -0.05 adjustment', () => {
    const result = validateAppData(missingOneRecommended);
    expect(result.scoringStatus).toBe('PARTIAL');
    expect(result.missingRecommended).toHaveLength(1);
    expect(result.confidenceAdjustment).toBeCloseTo(-0.05);
  });

  test('PARTIAL explanation lists missing recommended fields', () => {
    const result = validateAppData(partialApp);
    expect(result.explanation).toMatch(/partial scoring/i);
    expect(result.explanation).toMatch(/recommended/i);
  });
});

describe('validateAppData — UNSCORABLE', () => {
  test('returns UNSCORABLE when any required field is missing', () => {
    const result = validateAppData(unscorableApp);
    expect(result.scoringStatus).toBe('UNSCORABLE');
    expect(result.missingRequired.length).toBeGreaterThan(0);
  });

  test('UNSCORABLE confidenceAdjustment is 0', () => {
    const result = validateAppData(unscorableApp);
    expect(result.confidenceAdjustment).toBe(0);
  });

  test('UNSCORABLE explanation mentions missing required fields', () => {
    const result = validateAppData(unscorableApp);
    expect(result.explanation).toMatch(/cannot score/i);
    expect(result.explanation).toMatch(/required/i);
  });

  test('missing only name → UNSCORABLE', () => {
    const app = { lifecycle_stage: 'Current', support_status: 'In Support', vendor: 'X' };
    const result = validateAppData(app);
    expect(result.scoringStatus).toBe('UNSCORABLE');
    expect(result.missingRequired.map(f => f.field)).toContain('name');
  });

  test('null field values count as missing', () => {
    const app = { name: null, lifecycle_stage: 'Current', support_status: 'In Support' };
    const result = validateAppData(app);
    expect(result.scoringStatus).toBe('UNSCORABLE');
  });

  test('empty string field values count as missing', () => {
    const app = { name: '', lifecycle_stage: 'Current', support_status: 'In Support' };
    const result = validateAppData(app);
    expect(result.scoringStatus).toBe('UNSCORABLE');
  });
});

describe('validateAppData — return shape', () => {
  test('always returns all five keys', () => {
    [fullApp, partialApp, unscorableApp].forEach(app => {
      const result = validateAppData(app);
      expect(result).toHaveProperty('scoringStatus');
      expect(result).toHaveProperty('missingRequired');
      expect(result).toHaveProperty('missingRecommended');
      expect(result).toHaveProperty('confidenceAdjustment');
      expect(result).toHaveProperty('explanation');
    });
  });
});
