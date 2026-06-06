import { createContext, useContext, useReducer } from 'react';
import { CONFIG } from '../constants/config';

export const initialState = {
  sessionMode:    CONFIG.SESSION_MODE,
  engagementKey:  null,
  engagement:     null,
  isDemoMode:     false,
  currentScreen:  'SESSION_START',
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
