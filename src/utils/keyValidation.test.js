import { validateKey } from './keyValidation';

describe('validateKey — format checks', () => {
  test('rejects empty string', () => {
    const result = validateKey('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with too few groups', () => {
    const result = validateKey('PIQ-A3F2-9K12-MN45-PQ78');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with wrong prefix', () => {
    const result = validateKey('ABC-DEV0-TEST-KEY1-2345-6789');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with lowercase characters', () => {
    const result = validateKey('PIQ-dev0-test-key1-2345-6789');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with special characters', () => {
    const result = validateKey('PIQ-A3F!-9K12-MN45-PQ78-XY23');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('strips whitespace before validating', () => {
    // Dev test key with leading/trailing spaces should still validate
    const result = validateKey('  PIQ-DEV0-TEST-KEY1-2345-6789  ');
    expect(result.valid).toBe(true);
  });
});

describe('validateKey — dev test key', () => {
  test('accepts dev test key and returns engagement details', () => {
    const result = validateKey('PIQ-DEV0-TEST-KEY1-2345-6789');
    expect(result.valid).toBe(true);
    expect(result.clientName).toBe('Dev Engagement');
    expect(result.appLimit).toBe(150);
    expect(result.analysisLimit).toBe(10);
    expect(result.features.advisor).toBe(true);
    expect(result.daysRemaining).toBeGreaterThan(0);
  });

  test('dev test key result includes engagementId and expiresAt', () => {
    const result = validateKey('PIQ-DEV0-TEST-KEY1-2345-6789');
    expect(result.engagementId).toBeDefined();
    expect(result.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('validateKey — unrecognized key', () => {
  test('valid format but unrecognized key returns error', () => {
    const result = validateKey('PIQ-A3F2-9K12-MN45-PQ78-XY23');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Key not recognized');
  });
});
