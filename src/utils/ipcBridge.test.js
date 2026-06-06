import { vi } from 'vitest';

// Mock keyValidation before importing ipcBridge
vi.mock('./keyValidation', () => ({
  validateKey: vi.fn((key) =>
    key === 'PIQ-DEV0-TEST-KEY1-2345-6789'
      ? { valid: true, clientName: 'Dev Engagement', daysRemaining: 200 }
      : { valid: false, error: 'Key not recognized in Phase 1a. Use the dev test key or wait for Session 8.' }
  ),
}));

import ipcBridge from './ipcBridge';

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
