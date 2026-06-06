import { createContext, useContext, useReducer } from 'react';
import { CONFIG } from '../constants/config';

export const initialState = {
  sessionMode:    CONFIG.SESSION_MODE,
  sessionId:      crypto.randomUUID(),
  engagementKey:  null,
  engagement:     null,
  isDemoMode:     false,
  currentScreen:  'SESSION_START',
  aiCallLog:      [],
  engagementConfig: {
    clientName:                 '',
    engagementCode:             '',
    currency:                   null,
    appLimitWarningThreshold:   0.8,
    includeAiCallLog:           true,
    showCostData:               true,
    scoringWeights: {
      technicalDebt:  0.25,
      businessValue:  0.25,
      securityRisk:   0.25,
      cloudReadiness: 0.25,
    },
  },
  analystConfig: {
    analystName:          '',
    firmName:             '',
    currency:             'USD',
    dateFormat:           'MM/DD/YYYY',
    autoSaveInterval:     15,
    aiModel:              'claude-sonnet-4-6',
    confidenceThreshold:  0.75,
    showAiReasoning:      true,
  },
};

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_KEY':
      return { ...state, engagementKey: action.payload };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'LOAD_DEMO':
      return { ...state, engagement: action.payload, isDemoMode: true };
    case 'RESTORE_ENGAGEMENT':
      return { ...state, engagement: action.payload, isDemoMode: false };
    case 'ADD_AI_CALL':
      return { ...state, aiCallLog: [...state.aiCallLog, action.payload] };
    case 'SET_ANALYST_CONFIG':
      return { ...state, analystConfig: action.payload };
    case 'UPDATE_ANALYST_CONFIG':
      return { ...state, analystConfig: { ...state.analystConfig, ...action.payload } };
    case 'SET_ENGAGEMENT_CONFIG':
      return { ...state, engagementConfig: action.payload };
    case 'UPDATE_ENGAGEMENT_CONFIG':
      return { ...state, engagementConfig: { ...state.engagementConfig, ...action.payload } };
    default:
      return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
