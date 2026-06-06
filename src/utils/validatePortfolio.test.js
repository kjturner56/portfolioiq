import { validatePortfolio } from './validatePortfolio';

const fullApp = {
  name: 'SAP ERP', lifecycle_stage: 'Current', support_status: 'In Support',
  vendor: 'SAP', annual_cost: 840000, active_user_count: 620, incident_count_12mo: 3,
};
const partialApp = {
  name: 'Legacy App', lifecycle_stage: 'End of Life', support_status: 'End of Support',
};
const unscorableApp = { vendor: 'Unknown' };

describe('validatePortfolio — counts', () => {
  test('counts fully, partially, and unscorable apps', () => {
    const result = validatePortfolio([fullApp, partialApp, unscorableApp]);
    expect(result.totalApps).toBe(3);
    expect(result.fullyScorable).toBe(1);
    expect(result.partiallyScorable).toBe(1);
    expect(result.unscorable).toBe(1);
  });

  test('all full apps → fullyScorable equals total', () => {
    const result = validatePortfolio([fullApp, fullApp]);
    expect(result.fullyScorable).toBe(2);
    expect(result.partiallyScorable).toBe(0);
    expect(result.unscorable).toBe(0);
  });

  test('all partial apps', () => {
    const result = validatePortfolio([partialApp, partialApp]);
    expect(result.partiallyScorable).toBe(2);
    expect(result.fullyScorable).toBe(0);
    expect(result.unscorable).toBe(0);
  });
});

describe('validatePortfolio — canProceed', () => {
  test('canProceed is true when at least one app is scorable', () => {
    const result = validatePortfolio([fullApp, unscorableApp]);
    expect(result.canProceed).toBe(true);
    expect(result.blockerMessage).toBeNull();
  });

  test('canProceed is true when mix of partial and unscorable', () => {
    const result = validatePortfolio([partialApp, unscorableApp]);
    expect(result.canProceed).toBe(true);
  });

  test('canProceed is false only when ALL apps are unscorable', () => {
    const result = validatePortfolio([unscorableApp, unscorableApp]);
    expect(result.canProceed).toBe(false);
    expect(result.blockerMessage).toBeTruthy();
  });

  test('blockerMessage explains what to fix', () => {
    const result = validatePortfolio([unscorableApp]);
    expect(result.blockerMessage).toMatch(/required fields/i);
  });
});

describe('validatePortfolio — missingFieldSummary', () => {
  test('aggregates missing fields across apps', () => {
    const result = validatePortfolio([partialApp, partialApp]);
    const vendorEntry = result.missingFieldSummary.find(f => f.field === 'vendor');
    expect(vendorEntry).toBeDefined();
    expect(vendorEntry.affectedAppCount).toBe(2);
  });

  test('sorted by affectedAppCount descending', () => {
    const result = validatePortfolio([fullApp, partialApp, partialApp]);
    const counts = result.missingFieldSummary.map(f => f.affectedAppCount);
    for (let i = 0; i < counts.length - 1; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i + 1]);
    }
  });

  test('returns empty summary when all apps are full', () => {
    const result = validatePortfolio([fullApp]);
    expect(result.missingFieldSummary).toHaveLength(0);
  });
});

describe('validatePortfolio — return shape', () => {
  test('returns all expected keys', () => {
    const result = validatePortfolio([fullApp]);
    expect(result).toHaveProperty('totalApps');
    expect(result).toHaveProperty('fullyScorable');
    expect(result).toHaveProperty('partiallyScorable');
    expect(result).toHaveProperty('unscorable');
    expect(result).toHaveProperty('missingFieldSummary');
    expect(result).toHaveProperty('canProceed');
    expect(result).toHaveProperty('blockerMessage');
  });

  test('handles empty array', () => {
    const result = validatePortfolio([]);
    expect(result.totalApps).toBe(0);
    expect(result.canProceed).toBe(false);
  });
});
