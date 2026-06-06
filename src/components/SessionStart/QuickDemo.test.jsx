import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppContext } from '../../context/AppContext.jsx';
import { initialState } from '../../context/AppContext.jsx';
import QuickDemo from './QuickDemo';

function renderQuickDemo(dispatch = vi.fn()) {
  return render(
    <AppContext.Provider value={{ state: initialState, dispatch }}>
      <QuickDemo />
    </AppContext.Provider>
  );
}

test('renders DEMO MODE badge', () => {
  renderQuickDemo();
  expect(screen.getByText('DEMO MODE')).toBeInTheDocument();
});

test('renders Nexus Global Solutions dataset description', () => {
  renderQuickDemo();
  expect(screen.getByText(/Nexus Global Solutions/)).toBeInTheDocument();
  expect(screen.getByText(/15 sample applications/)).toBeInTheDocument();
});

test('renders Launch Demo button', () => {
  renderQuickDemo();
  expect(screen.getByRole('button', { name: /launch demo/i })).toBeInTheDocument();
});

test('clicking Launch Demo dispatches LOAD_DEMO and SET_SCREEN', async () => {
  const dispatch = vi.fn();
  renderQuickDemo(dispatch);
  await userEvent.click(screen.getByRole('button', { name: /launch demo/i }));
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'LOAD_DEMO' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SCREEN', payload: 'DASHBOARD' });
});

test('LOAD_DEMO payload is DEMO_ENGAGEMENT', async () => {
  const dispatch = vi.fn();
  renderQuickDemo(dispatch);
  await userEvent.click(screen.getByRole('button', { name: /launch demo/i }));
  const loadDemoCall = dispatch.mock.calls.find(([a]) => a.type === 'LOAD_DEMO');
  expect(loadDemoCall[0].payload.metadata.client_name).toBe('Nexus Global Solutions');
  expect(loadDemoCall[0].payload.applications).toHaveLength(15);
});
