import { FIELD_REQUIREMENTS, CONFIDENCE_DEFINITION, SCORING_STATUS } from './fieldRequirements';

describe('FIELD_REQUIREMENTS', () => {
  test('REQUIRED contains name, lifecycle_stage, support_status', () => {
    const fields = FIELD_REQUIREMENTS.REQUIRED.map(f => f.field);
    expect(fields).toContain('name');
    expect(fields).toContain('lifecycle_stage');
    expect(fields).toContain('support_status');
  });

  test('RECOMMENDED contains the four expected fields', () => {
    const fields = FIELD_REQUIREMENTS.RECOMMENDED.map(f => f.field);
    expect(fields).toContain('vendor');
    expect(fields).toContain('annual_cost');
    expect(fields).toContain('active_user_count');
    expect(fields).toContain('incident_count_12mo');
  });

  test('OPTIONAL contains three scoring enhancement fields', () => {
    const fields = FIELD_REQUIREMENTS.OPTIONAL.map(f => f.field);
    expect(fields).toContain('technical_debt_score');
    expect(fields).toContain('business_value_score');
    expect(fields).toContain('security_posture_score');
    expect(fields).toHaveLength(3);
  });

  test('every entry has field, label, and reason', () => {
    const all = [
      ...FIELD_REQUIREMENTS.REQUIRED,
      ...FIELD_REQUIREMENTS.RECOMMENDED,
      ...FIELD_REQUIREMENTS.OPTIONAL,
    ];
    all.forEach(entry => {
      expect(entry.field).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.reason).toBeTruthy();
    });
  });
});

describe('CONFIDENCE_DEFINITION', () => {
  test('FULL threshold is highest (0.85)', () => {
    expect(CONFIDENCE_DEFINITION.FULL.min).toBe(0.85);
  });

  test('PARTIAL threshold is below FULL', () => {
    expect(CONFIDENCE_DEFINITION.PARTIAL.min).toBeLessThan(CONFIDENCE_DEFINITION.FULL.min);
    expect(CONFIDENCE_DEFINITION.PARTIAL.min).toBe(0.65);
  });

  test('LOW threshold is lowest (0.00)', () => {
    expect(CONFIDENCE_DEFINITION.LOW.min).toBe(0.00);
    expect(CONFIDENCE_DEFINITION.LOW.min).toBeLessThan(CONFIDENCE_DEFINITION.PARTIAL.min);
  });

  test('thresholds are in descending order FULL > PARTIAL > LOW', () => {
    expect(CONFIDENCE_DEFINITION.FULL.min).toBeGreaterThan(CONFIDENCE_DEFINITION.PARTIAL.min);
    expect(CONFIDENCE_DEFINITION.PARTIAL.min).toBeGreaterThan(CONFIDENCE_DEFINITION.LOW.min);
  });

  test('all entries have label and description', () => {
    Object.values(CONFIDENCE_DEFINITION).forEach(def => {
      expect(def.label).toBeTruthy();
      expect(def.description).toBeTruthy();
    });
  });
});

describe('SCORING_STATUS', () => {
  test('has FULL, PARTIAL, and UNSCORABLE', () => {
    expect(SCORING_STATUS.FULL).toBe('FULL');
    expect(SCORING_STATUS.PARTIAL).toBe('PARTIAL');
    expect(SCORING_STATUS.UNSCORABLE).toBe('UNSCORABLE');
  });
});
