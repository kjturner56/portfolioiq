import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppContext } from '../../context/AppContext.jsx';
import { initialState } from '../../context/AppContext.jsx';
import NewEngagement from './NewEngagement';

// Mock window.api
const mockValidateKey = vi.fn();
beforeEach(() => {
  window.api = { validateKey: mockValidateKey };
  mockValidateKey.mockReset();
});

function renderNewEngagement(dispatch = vi.fn()) {
  return render(
    <AppContext.Provider value={{ state: initialState, dispatch }}>
      <NewEngagement />
    </AppContext.Provider>
  );
}

test('renders key input field', () => {
  renderNewEngagement();
  expect(screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX')).toBeInTheDocument();
});

test('Start Engagement button is disabled initially', () => {
  renderNewEngagement();
  expect(screen.getByRole('button', { name: /start engagement/i })).toBeDisabled();
});

test('auto-validates when full 29-char key is typed', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement();
  const input = screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX');
  await userEvent.type(input, 'PIQ-DEV0-TEST-KEY1-2345-6789');
  await waitFor(() => expect(mockValidateKey).toHaveBeenCalledWith('PIQ-DEV0-TEST-KEY1-2345-6789'));
});

test('shows green confirmation on valid key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-DEV0-TEST-KEY1-2345-6789'
  );
  await waitFor(() => expect(screen.getByText(/Key Validated/i)).toBeInTheDocument());
  expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
});

test('enables Start Engagement button on valid key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-DEV0-TEST-KEY1-2345-6789'
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /start engagement/i })).toBeEnabled()
  );
});

test('shows red error on invalid key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: false, error: 'Key not recognized' },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'
  );
  await waitFor(() => expect(screen.getByText(/Key not recognized/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /start engagement/i })).toBeDisabled();
});

test('shows amber warning on expired key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: false, expired: true, error: 'Key expired on 2025-01-01', allowExport: true, clientName: 'Old Client' },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'
  );
  await waitFor(() => expect(screen.getByText(/expired/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /start engagement/i })).toBeDisabled();
});

test('clicking Start dispatches SET_KEY and SET_SCREEN', async () => {
  const dispatch = vi.fn();
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement(dispatch);
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-DEV0-TEST-KEY1-2345-6789'
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /start engagement/i })).toBeEnabled()
  );
  await userEvent.click(screen.getByRole('button', { name: /start engagement/i }));
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_KEY' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SCREEN', payload: 'DATA_UPLOAD' });
});
