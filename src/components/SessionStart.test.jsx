import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '../context/AppContext.jsx';
import { initialState } from '../context/AppContext.jsx';
import SessionStart from './SessionStart';

function renderSessionStart() {
  return render(
    <AppContext.Provider value={{ state: initialState, dispatch: () => {} }}>
      <SessionStart />
    </AppContext.Provider>
  );
}

test('renders logo and sublogo', () => {
  renderSessionStart();
  expect(screen.getByText('PortfolioIQ')).toBeInTheDocument();
  expect(screen.getByText('by Telority')).toBeInTheDocument();
});

test('renders all three mode card labels', () => {
  renderSessionStart();
  expect(screen.getByText('NEW ENGAGEMENT')).toBeInTheDocument();
  expect(screen.getByText('RESUME ENGAGEMENT')).toBeInTheDocument();
  expect(screen.getByText('QUICK DEMO')).toBeInTheDocument();
});

test('clicking New Engagement expands that card', async () => {
  renderSessionStart();
  const card = screen.getByText('NEW ENGAGEMENT').closest('[data-mode]');
  await userEvent.click(card);
  expect(card).toHaveAttribute('data-active', 'true');
});

test('clicking an active card collapses it', async () => {
  renderSessionStart();
  const card = screen.getByText('NEW ENGAGEMENT').closest('[data-mode]');
  await userEvent.click(card);
  await userEvent.click(card);
  expect(card).toHaveAttribute('data-active', 'false');
});

test('only one card is active at a time', async () => {
  renderSessionStart();
  const newCard = screen.getByText('NEW ENGAGEMENT').closest('[data-mode]');
  const demoCard = screen.getByText('QUICK DEMO').closest('[data-mode]');
  await userEvent.click(newCard);
  await userEvent.click(demoCard);
  expect(newCard).toHaveAttribute('data-active', 'false');
  expect(demoCard).toHaveAttribute('data-active', 'true');
});
