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
});
