import { DEMO_ENGAGEMENT } from './demoData';

test('demo dataset has exactly 15 applications', () => {
  expect(DEMO_ENGAGEMENT.applications).toHaveLength(15);
});

test('every app has required fields', () => {
  DEMO_ENGAGEMENT.applications.forEach(app => {
    expect(app.id, `${app.name} missing id`).toBeDefined();
    expect(app.name, `app missing name`).toBeDefined();
    expect(['Retain','Modernize','Retire','Replace']).toContain(app.ai_disposition);
    expect(['Tolerate','Invest','Migrate','Eliminate']).toContain(app.time_classification);
    expect(['Low','Medium','High']).toContain(app.security_risk_level);
    expect(app.technical_debt_score).toBeGreaterThanOrEqual(0);
    expect(app.technical_debt_score).toBeLessThanOrEqual(100);
    expect(app.business_value_score).toBeGreaterThanOrEqual(0);
    expect(app.business_value_score).toBeLessThanOrEqual(100);
  });
});

test('demo engagement has metadata', () => {
  expect(DEMO_ENGAGEMENT.metadata.client_name).toBe('Nexus Global Solutions');
  expect(DEMO_ENGAGEMENT.metadata.portfolioiq_version).toBe('2.3');
});
