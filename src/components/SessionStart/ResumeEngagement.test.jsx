import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppContext } from '../../context/AppContext.jsx';
import { initialState } from '../../context/AppContext.jsx';
import ResumeEngagement from './ResumeEngagement';

function renderResume(dispatch = vi.fn()) {
  return render(
    <AppContext.Provider value={{ state: initialState, dispatch }}>
      <ResumeEngagement />
    </AppContext.Provider>
  );
}

function makeFile(content, name = 'test.portfolioiq') {
  return new File([JSON.stringify(content)], name, { type: 'application/json' });
}

const validEngagement = {
  metadata: { portfolioiq_version: '2.3', client_name: 'Acme Corp', engagement_key_id: 'demo' },
  applications: [],
};

test('renders drop zone with correct text', () => {
  renderResume();
  expect(screen.getByText(/Drop \.portfolioiq file here/i)).toBeInTheDocument();
  expect(screen.getByText(/click to browse/i)).toBeInTheDocument();
});

test('dispatches RESTORE_ENGAGEMENT and SET_SCREEN on valid file', async () => {
  const dispatch = vi.fn();
  renderResume(dispatch);
  const input = document.querySelector('input[type="file"]');
  await userEvent.upload(input, makeFile(validEngagement));
  await waitFor(() =>
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'RESTORE_ENGAGEMENT' }))
  );
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SCREEN', payload: 'VALIDATION_QUEUE' });
});

test('shows error on unparseable file', async () => {
  renderResume();
  const input = document.querySelector('input[type="file"]');
  await userEvent.upload(input, new File(['not json {{{'], 'bad.portfolioiq'));
  await waitFor(() =>
    expect(screen.getByText(/Invalid file format/i)).toBeInTheDocument()
  );
});

test('shows error on unsupported version', async () => {
  renderResume();
  const input = document.querySelector('input[type="file"]');
  const oldFile = { metadata: { portfolioiq_version: '1.0' }, applications: [] };
  await userEvent.upload(input, makeFile(oldFile));
  await waitFor(() =>
    expect(screen.getByText(/Unsupported file version/i)).toBeInTheDocument()
  );
});
