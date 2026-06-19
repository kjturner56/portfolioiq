import { vi } from 'vitest';

// Mock keyValidation before importing ipcBridge
vi.mock('./keyValidation', () => ({
  validateKey: vi.fn((key) =>
    key === 'PIQ-DEV0-TEST-KEY1-2345-6789'
      ? { valid: true, clientName: 'Dev Engagement', daysRemaining: 200 }
      : { valid: false, error: 'Key not recognized in Phase 1a. Use the dev test key or wait for Session 8.' }
  ),
}));

import ipcBridge, { validateScoringResponse } from './ipcBridge';

describe('ipcBridge.validateKey', () => {
  test('returns { data, error } shape on valid key', async () => {
    const result = await ipcBridge.validateKey('PIQ-DEV0-TEST-KEY1-2345-6789');
    expect(result.error).toBeNull();
    expect(result.data.valid).toBe(true);
    expect(result.data.clientName).toBe('Dev Engagement');
  });

  test('returns { data, error } shape on invalid key', async () => {
    const result = await ipcBridge.validateKey('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX');
    expect(result.error).toBeNull();
    expect(result.data.valid).toBe(false);
    expect(result.data.error).toBeDefined();
  });
});

describe('ipcBridge.getCredential', () => {
  test('returns null data for unknown credential', async () => {
    const result = await ipcBridge.getCredential('NONEXISTENT_KEY');
    expect(result.data).toBeNull();
    expect(result.error).toContain('NONEXISTENT_KEY');
  });
});

describe('ipcBridge.callClaude', () => {
  test('returns stubbed error in Phase 1a', async () => {
    const result = await ipcBridge.callClaude('test prompt', {});
    expect(result.data).toBeNull();
    expect(result.error).toContain('Session 2');
  });
});

describe('ipcBridge.loadAnalystConfig', () => {
  test('returns { data: null, error: null } when env var not set', async () => {
    const result = await ipcBridge.loadAnalystConfig();
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });
});

describe('ipcBridge.saveAnalystConfig', () => {
  test('returns { data, error } shape with path', async () => {
    const config = { analystName: 'Ken Turner', currency: 'USD' };
    const result = await ipcBridge.saveAnalystConfig(config);
    expect(result.error).toBeNull();
    expect(result.data.path).toBe('analyst_config.json');
  });
});

describe('ipcBridge.scoreApplication', () => {
  test('returns { data, error } shape with correct skeleton', async () => {
    const result = await ipcBridge.scoreApplication({ name: 'Test App' });
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  test('data.disposition is a string', async () => {
    const result = await ipcBridge.scoreApplication({});
    expect(typeof result.data.disposition).toBe('string');
  });

  test('data.uncertainty_flags.requires_human_review is boolean', async () => {
    const result = await ipcBridge.scoreApplication({});
    expect(typeof result.data.uncertainty_flags.requires_human_review).toBe('boolean');
  });

  test('data.replacement_suggestions is an array', async () => {
    const result = await ipcBridge.scoreApplication({});
    expect(Array.isArray(result.data.replacement_suggestions)).toBe(true);
  });

  test('data.scoring_breakdown has technical_debt_score, business_value_score, security_posture_score', async () => {
    const result = await ipcBridge.scoreApplication({});
    const sb = result.data.scoring_breakdown;
    expect(sb).toHaveProperty('technical_debt_score');
    expect(sb).toHaveProperty('business_value_score');
    expect(sb).toHaveProperty('security_posture_score');
  });

  test('data.confidence is a number', async () => {
    const result = await ipcBridge.scoreApplication({});
    expect(typeof result.data.confidence).toBe('number');
  });
});

describe('ipcBridge.mapSchema', () => {
  test('returns { data, error } shape', async () => {
    const result = await ipcBridge.mapSchema(['App Name', 'Vendor'], []);
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  test('data.canProceedToScoring is false', async () => {
    const result = await ipcBridge.mapSchema([], []);
    expect(result.data.canProceedToScoring).toBe(false);
  });

  test('data.unmappedColumns contains all passed headers', async () => {
    const headers = ['App Name', 'Vendor', 'Cost'];
    const result = await ipcBridge.mapSchema(headers, []);
    expect(result.data.unmappedColumns).toEqual(headers);
  });

  test('data.mappings is an empty array', async () => {
    const result = await ipcBridge.mapSchema(['App Name'], []);
    expect(Array.isArray(result.data.mappings)).toBe(true);
    expect(result.data.mappings).toHaveLength(0);
  });
});

const validResponse = () => ({
  disposition: 'Retain',
  confidence: 0.85,
  scoring_breakdown: {
    technical_debt_score: 72,
    business_value_score: 55,
    security_posture_score: 90,
  },
  uncertainty_flags: {
    data_conflicts: false,
    unusual_vendor: false,
    low_data_quality: false,
    low_confidence_reason: null,
    requires_human_review: false,
  },
  replacement_suggestions: [],
  time_classification: 'Invest',
  ai_reasoning: 'Well-maintained system.',
});

describe('validateScoringResponse', () => {
  test('returns valid: true for a correctly shaped response', () => {
    const result = validateScoringResponse(validResponse());
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('returns valid: false if response is null', () => {
    const result = validateScoringResponse(null);
    expect(result.valid).toBe(false);
    expect(result.error).not.toBeNull();
  });

  test('returns valid: false if response is a string', () => {
    const result = validateScoringResponse('Retain');
    expect(result.valid).toBe(false);
    expect(result.error).not.toBeNull();
  });

  test('returns valid: false if disposition is not in VALID_DISPOSITIONS', () => {
    const r = validResponse();
    r.disposition = 'Archive';
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('disposition');
  });

  test('returns valid: false if confidence is above 1.0', () => {
    const r = validResponse();
    r.confidence = 1.1;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('confidence');
  });

  test('returns valid: false if confidence is below 0.0', () => {
    const r = validResponse();
    r.confidence = -0.1;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('confidence');
  });

  test('returns valid: false if confidence is not a number', () => {
    const r = validResponse();
    r.confidence = '0.85';
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('confidence');
  });

  test('returns valid: false if scoring_breakdown is missing', () => {
    const r = validResponse();
    delete r.scoring_breakdown;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('scoring_breakdown');
  });

  test('returns valid: false if scoring_breakdown score is above 100', () => {
    const r = validResponse();
    r.scoring_breakdown.technical_debt_score = 101;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('scoring_breakdown.technical_debt_score');
  });

  test('returns valid: false if scoring_breakdown score is below 0', () => {
    const r = validResponse();
    r.scoring_breakdown.business_value_score = -1;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('scoring_breakdown.business_value_score');
  });

  test('returns valid: false if requires_human_review is not a boolean', () => {
    const r = validResponse();
    r.uncertainty_flags.requires_human_review = 'false';
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('uncertainty_flags.requires_human_review');
  });

  test('error shape has code, message, context fields on failure', () => {
    const result = validateScoringResponse(null);
    expect(result.error).toHaveProperty('code');
    expect(result.error).toHaveProperty('message');
    expect(result.error).toHaveProperty('context');
    expect(result.error.code).toBe('INVALID_SCORING_RESPONSE');
  });

  test('returns valid: true when confidence is exactly 0.0', () => {
    const r = validResponse();
    r.confidence = 0.0;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(true);
  });

  test('returns valid: true when confidence is exactly 1.0', () => {
    const r = validResponse();
    r.confidence = 1.0;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(true);
  });

  test('returns valid: true when a score is exactly 0', () => {
    const r = validResponse();
    r.scoring_breakdown.security_posture_score = 0;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(true);
  });

  test('returns valid: true when a score is exactly 100', () => {
    const r = validResponse();
    r.scoring_breakdown.technical_debt_score = 100;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(true);
  });

  test('returns valid: false if confidence is NaN', () => {
    const r = validResponse();
    r.confidence = NaN;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('confidence');
  });

  test('returns valid: false if a score field is NaN', () => {
    const r = validResponse();
    r.scoring_breakdown.technical_debt_score = NaN;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toContain('technical_debt_score');
  });

  test('returns valid: false if uncertainty_flags is missing', () => {
    const r = validResponse();
    delete r.uncertainty_flags;
    const result = validateScoringResponse(r);
    expect(result.valid).toBe(false);
    expect(result.error.context.field).toBe('uncertainty_flags');
  });
});
