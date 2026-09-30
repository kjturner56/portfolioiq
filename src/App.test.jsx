import { render, screen } from '@testing-library/react';
import { AppContext } from './context/AppContext.jsx';
import App from './App';
import { CONFIG } from './constants/config';

function renderWithState(currentScreen) {
  const state = {
    currentScreen,
    engagementKey: null,
    engagement: null,
    isDemoMode: false,
    sessionMode: false,
  };
  return render(
    <AppContext.Provider value={{ state, dispatch: () => {} }}>
      <App />
    </AppContext.Provider>
  );
}

test('renders SessionStart when currentScreen is SESSION_START', () => {
  renderWithState('SESSION_START');
  expect(screen.getByText('PortfolioIQ')).toBeInTheDocument();
});

test('renders DataUpload stub when currentScreen is DATA_UPLOAD', () => {
  renderWithState('DATA_UPLOAD');
  expect(screen.getByText(/Upload Data/i)).toBeInTheDocument();
});

test.each(['SESSION_START', 'DATA_UPLOAD', 'VALIDATION_QUEUE', 'DASHBOARD'])(
  'renders the advisory footer disclaimer on %s',
  (currentScreen) => {
    renderWithState(currentScreen);
    expect(screen.getByText(CONFIG.DISCLAIMERS.ADVISORY_FOOTER)).toBeInTheDocument();
  }
);
