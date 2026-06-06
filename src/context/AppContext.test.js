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

  test('initialState has engagementConfig with correct defaults', () => {
    expect(initialState.engagementConfig.clientName).toBe('');
    expect(initialState.engagementConfig.currency).toBeNull();
    expect(initialState.engagementConfig.appLimitWarningThreshold).toBe(0.8);
    expect(initialState.engagementConfig.includeAiCallLog).toBe(true);
    expect(initialState.engagementConfig.showCostData).toBe(true);
    expect(initialState.engagementConfig.scoringWeights.technicalDebt).toBe(0.25);
    expect(initialState.engagementConfig.scoringWeights.businessValue).toBe(0.25);
    expect(initialState.engagementConfig.scoringWeights.securityRisk).toBe(0.25);
    expect(initialState.engagementConfig.scoringWeights.cloudReadiness).toBe(0.25);
  });

  test('SET_ENGAGEMENT_CONFIG replaces engagementConfig entirely', () => {
    const config = { clientName: 'Nexus', engagementCode: 'NGS-001', currency: 'USD',
      appLimitWarningThreshold: 0.9, includeAiCallLog: false, showCostData: true,
      scoringWeights: { technicalDebt: 0.3, businessValue: 0.3, securityRisk: 0.2, cloudReadiness: 0.2 } };
    const next = appReducer(initialState, { type: 'SET_ENGAGEMENT_CONFIG', payload: config });
    expect(next.engagementConfig).toEqual(config);
  });

  test('UPDATE_ENGAGEMENT_CONFIG merges partial updates', () => {
    const next = appReducer(initialState, {
      type: 'UPDATE_ENGAGEMENT_CONFIG',
      payload: { clientName: 'Nexus Global', showCostData: false },
    });
    expect(next.engagementConfig.clientName).toBe('Nexus Global');
    expect(next.engagementConfig.showCostData).toBe(false);
    expect(next.engagementConfig.appLimitWarningThreshold).toBe(0.8);
  });

  test('scoring weights sum to 1.0 in default engagementConfig', () => {
    const w = initialState.engagementConfig.scoringWeights;
    const sum = Object.values(w).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
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

  test('initialState has empty validationStates', () => {
    expect(initialState.validationStates).toEqual({});
  });

  describe('INITIALIZE_VALIDATIONS', () => {
    const apps = [
      { id: 'app-001', ai_disposition: 'Retain' },
      { id: 'app-002', ai_disposition: 'Retire' },
    ];

    test('creates PENDING entries for non-demo mode', () => {
      const next = appReducer(initialState, {
        type: 'INITIALIZE_VALIDATIONS',
        payload: { apps, isDemoMode: false },
      });
      expect(next.validationStates['app-001'].status).toBe('PENDING');
      expect(next.validationStates['app-001'].aiRecommendation).toBe('Retain');
      expect(next.validationStates['app-001'].analystDecision).toBe('');
      expect(next.validationStates['app-001'].overrideReason).toBeNull();
      expect(next.validationStates['app-001'].validatedAt).toBeNull();
      expect(next.validationStates['app-001'].validatedBy).toBe('');
    });

    test('creates ACCEPTED entries for demo mode', () => {
      const next = appReducer(initialState, {
        type: 'INITIALIZE_VALIDATIONS',
        payload: { apps, isDemoMode: true },
      });
      expect(next.validationStates['app-001'].status).toBe('ACCEPTED');
      expect(next.validationStates['app-001'].validatedBy).toBe('demo');
      expect(next.validationStates['app-001'].validatedAt).toBeTruthy();
    });

    test('populates all apps', () => {
      const next = appReducer(initialState, {
        type: 'INITIALIZE_VALIDATIONS',
        payload: { apps, isDemoMode: false },
      });
      expect(Object.keys(next.validationStates)).toHaveLength(2);
    });
  });

  describe('VALIDATE_APP', () => {
    const withTwo = appReducer(initialState, {
      type: 'INITIALIZE_VALIDATIONS',
      payload: {
        apps: [{ id: 'app-001', ai_disposition: 'Retain' }, { id: 'app-002', ai_disposition: 'Retire' }],
        isDemoMode: false,
      },
    });

    test('updates status and analystDecision for a single app', () => {
      const next = appReducer(withTwo, {
        type: 'VALIDATE_APP',
        payload: { appId: 'app-001', status: 'ACCEPTED', analystDecision: 'Retain', validatedBy: 'Ken' },
      });
      expect(next.validationStates['app-001'].status).toBe('ACCEPTED');
      expect(next.validationStates['app-001'].analystDecision).toBe('Retain');
      expect(next.validationStates['app-002'].status).toBe('PENDING');
    });

    test('captures overrideReason on OVERRIDDEN', () => {
      const next = appReducer(withTwo, {
        type: 'VALIDATE_APP',
        payload: {
          appId: 'app-001', status: 'OVERRIDDEN',
          analystDecision: 'Retire', overrideReason: 'Client strategy change', validatedBy: 'Ken',
        },
      });
      expect(next.validationStates['app-001'].status).toBe('OVERRIDDEN');
      expect(next.validationStates['app-001'].overrideReason).toBe('Client strategy change');
    });
  });

  describe('RESET_VALIDATION', () => {
    const withValidated = () => {
      const s1 = appReducer(initialState, {
        type: 'INITIALIZE_VALIDATIONS',
        payload: { apps: [{ id: 'app-001', ai_disposition: 'Retain' }], isDemoMode: false },
      });
      return appReducer(s1, {
        type: 'VALIDATE_APP',
        payload: { appId: 'app-001', status: 'ACCEPTED', analystDecision: 'Retain', validatedBy: 'Ken' },
      });
    };

    test('resets status to PENDING and clears decision fields', () => {
      const next = appReducer(withValidated(), { type: 'RESET_VALIDATION', payload: 'app-001' });
      expect(next.validationStates['app-001'].status).toBe('PENDING');
      expect(next.validationStates['app-001'].analystDecision).toBe('');
      expect(next.validationStates['app-001'].overrideReason).toBeNull();
      expect(next.validationStates['app-001'].validatedAt).toBeNull();
    });

    test('preserves aiRecommendation after reset', () => {
      const next = appReducer(withValidated(), { type: 'RESET_VALIDATION', payload: 'app-001' });
      expect(next.validationStates['app-001'].aiRecommendation).toBe('Retain');
    });

    test('returns state unchanged for unknown appId', () => {
      const state = withValidated();
      const next = appReducer(state, { type: 'RESET_VALIDATION', payload: 'app-999' });
      expect(next.validationStates).toEqual(state.validationStates);
    });
  });
});
