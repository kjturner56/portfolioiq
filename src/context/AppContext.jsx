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
  validationStates:  {},
  connectionStatus:  CONFIG.CONNECTION_STATUS.UNKNOWN,
  mappingProposal:   null,
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
    case 'INITIALIZE_VALIDATIONS': {
      const { apps, isDemoMode: demo } = action.payload;
      const validationStates = {};
      apps.forEach(app => {
        validationStates[app.id] = {
          status:           demo ? 'ACCEPTED' : 'PENDING',
          aiRecommendation: app.ai_disposition ?? '',
          analystDecision:  demo ? app.ai_disposition ?? '' : '',
          overrideReason:   null,
          validatedAt:      demo ? new Date().toISOString() : null,
          validatedBy:      demo ? 'demo' : '',
        };
      });
      return { ...state, validationStates };
    }
    case 'VALIDATE_APP': {
      const { appId, ...update } = action.payload;
      return {
        ...state,
        validationStates: {
          ...state.validationStates,
          [appId]: { ...state.validationStates[appId], ...update },
        },
      };
    }
    case 'RESET_VALIDATION': {
      const appId = action.payload;
      const existing = state.validationStates[appId];
      if (!existing) return state;
      return {
        ...state,
        validationStates: {
          ...state.validationStates,
          [appId]: {
            ...existing,
            status:         'PENDING',
            analystDecision: '',
            overrideReason:  null,
            validatedAt:     null,
            validatedBy:     '',
          },
        },
      };
    }
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_MAPPING_PROPOSAL':
      return { ...state, mappingProposal: action.payload };
    case 'CONFIRM_MAPPING': {
      if (!state.mappingProposal) return state;
      const { sourceColumn } = action.payload;
      return {
        ...state,
        mappingProposal: {
          ...state.mappingProposal,
          mappings: state.mappingProposal.mappings.map(m =>
            m.sourceColumn === sourceColumn ? { ...m, status: 'CONFIRMED' } : m
          ),
        },
      };
    }
    case 'CORRECT_MAPPING': {
      if (!state.mappingProposal) return state;
      const { sourceColumn, targetField, analystOverride } = action.payload;
      return {
        ...state,
        mappingProposal: {
          ...state.mappingProposal,
          mappings: state.mappingProposal.mappings.map(m =>
            m.sourceColumn === sourceColumn
              ? { ...m, status: 'CORRECTED', targetField, analystOverride }
              : m
          ),
        },
      };
    }
    case 'APPROVE_MAPPING': {
      if (!state.mappingProposal) return state;
      // sync with FIELD_REQUIREMENTS.REQUIRED in fieldRequirements.js
      const REQUIRED_FIELDS = ['name', 'lifecycle_stage', 'support_status'];
      const allRequiredConfirmed = REQUIRED_FIELDS.every(field => {
        const mapping = state.mappingProposal.mappings.find(m => m.targetField === field);
        return mapping && (mapping.status === 'CONFIRMED' || mapping.status === 'CORRECTED');
      });
      if (!allRequiredConfirmed) return state;
      return {
        ...state,
        mappingProposal: { ...state.mappingProposal, canProceedToScoring: true },
      };
    }
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
