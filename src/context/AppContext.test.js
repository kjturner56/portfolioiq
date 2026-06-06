import { appReducer, initialState } from './AppContext.jsx';

describe('appReducer', () => {
  test('SET_KEY stores key data', () => {
    const key = { valid: true, clientName: 'Acme Corp', daysRemaining: 28 };
    const next = appReducer(initialState, { type: 'SET_KEY', payload: key });
    expect(next.engagementKey).toEqual(key);
  });

  test('SET_SCREEN updates currentScreen', () => {
    const next = appReducer(initialState, { type: 'SET_SCREEN', payload: 'DATA_UPLOAD' });
    expect(next.currentScreen).toBe('DATA_UPLOAD');
  });

  test('LOAD_DEMO sets isDemoMode and engagement', () => {
    const dataset = { applications: [] };
    const next = appReducer(initialState, { type: 'LOAD_DEMO', payload: dataset });
    expect(next.isDemoMode).toBe(true);
    expect(next.engagement).toEqual(dataset);
  });

  test('RESTORE_ENGAGEMENT sets engagement without demo mode', () => {
    const file = { metadata: { client_name: 'Acme' }, applications: [] };
    const next = appReducer(
      { ...initialState, isDemoMode: true },
      { type: 'RESTORE_ENGAGEMENT', payload: file }
    );
    expect(next.engagement).toEqual(file);
    expect(next.isDemoMode).toBe(false);
  });

  test('unknown action returns state unchanged', () => {
    const next = appReducer(initialState, { type: 'UNKNOWN' });
    expect(next).toEqual(initialState);
  });

  test('initialState has expected shape', () => {
    expect(initialState.currentScreen).toBe('SESSION_START');
    expect(initialState.engagementKey).toBeNull();
    expect(initialState.engagement).toBeNull();
    expect(initialState.isDemoMode).toBe(false);
    expect(initialState.sessionMode).toBe(false);
  });

  test('initialState.sessionId is a valid UUID v4', () => {
    expect(initialState.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  test('SET_KEY preserves sessionId', () => {
    const key = { valid: true, clientName: 'Acme' };
    const next = appReducer(initialState, { type: 'SET_KEY', payload: key });
    expect(next.sessionId).toBe(initialState.sessionId);
  });

  test('initialState has empty aiCallLog', () => {
    expect(initialState.aiCallLog).toEqual([]);
  });

  test('ADD_AI_CALL appends entry to aiCallLog', () => {
    const entry = {
      timestamp: '2026-06-05T10:00:00Z',
      actor: 'system',
      action: 'score',
      resource: 'app-001',
      result: 'success',
      session_id: 'test-session-id',
      appId: 'app-001',
      appName: 'SAP ERP',
      fieldsScanned: 8,
      tokensUsed: 1200,
      model: 'claude-sonnet-4-6',
    };
    const next = appReducer(initialState, { type: 'ADD_AI_CALL', payload: entry });
    expect(next.aiCallLog).toHaveLength(1);
    expect(next.aiCallLog[0]).toEqual(entry);
  });

  test('initialState has analystConfig with correct defaults', () => {
    expect(initialState.analystConfig.analystName).toBe('');
    expect(initialState.analystConfig.currency).toBe('USD');
    expect(initialState.analystConfig.aiModel).toBe('claude-sonnet-4-6');
    expect(initialState.analystConfig.confidenceThreshold).toBe(0.75);
    expect(initialState.analystConfig.showAiReasoning).toBe(true);
    expect(initialState.analystConfig.autoSaveInterval).toBe(15);
  });

  test('SET_ANALYST_CONFIG replaces analystConfig entirely', () => {
    const config = { analystName: 'Ken Turner', firmName: 'Telority', currency: 'GBP',
      dateFormat: 'DD/MM/YYYY', autoSaveInterval: 30, aiModel: 'claude-sonnet-4-6',
      confidenceThreshold: 0.80, showAiReasoning: false };
    const next = appReducer(initialState, { type: 'SET_ANALYST_CONFIG', payload: config });
    expect(next.analystConfig).toEqual(config);
  });

  test('UPDATE_ANALYST_CONFIG merges partial updates', () => {
    const next = appReducer(initialState, {
      type: 'UPDATE_ANALYST_CONFIG',
      payload: { analystName: 'Ken Turner', currency: 'EUR' },
    });
    expect(next.analystConfig.analystName).toBe('Ken Turner');
    expect(next.analystConfig.currency).toBe('EUR');
    expect(next.analystConfig.aiModel).toBe('claude-sonnet-4-6');
  });

  test('ADD_AI_CALL appends without mutating prior entries', () => {
    const first = { appId: 'app-001', appName: 'SAP ERP' };
    const second = { appId: 'app-002', appName: 'Salesforce' };
    const s1 = appReducer(initialState, { type: 'ADD_AI_CALL', payload: first });
    const s2 = appReducer(s1, { type: 'ADD_AI_CALL', payload: second });
    expect(s2.aiCallLog).toHaveLength(2);
    expect(s2.aiCallLog[0]).toEqual(first);
    expect(s2.aiCallLog[1]).toEqual(second);
    // original s1 log is unchanged
    expect(s1.aiCallLog).toHaveLength(1);
  });
});
