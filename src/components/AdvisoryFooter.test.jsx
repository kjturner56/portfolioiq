import { render, screen } from '@testing-library/react';
import AdvisoryFooter from './AdvisoryFooter';
import { CONFIG } from '../constants/config';
import { COLORS } from '../constants/colors';

test('renders the exact advisory disclaimer text', () => {
  render(<AdvisoryFooter />);
  expect(screen.getByText(CONFIG.DISCLAIMERS.ADVISORY_FOOTER)).toBeInTheDocument();
});

test('uses TEXT_FAINT color and stays fixed to the bottom', () => {
  render(<AdvisoryFooter />);
  const footer = screen.getByRole('contentinfo');
  expect(footer).toHaveStyle({ color: COLORS.TEXT_FAINT, position: 'fixed', bottom: '0px' });
});

test('is not dismissible — no buttons or close controls', () => {
  render(<AdvisoryFooter />);
  const footer = screen.getByRole('contentinfo');
  expect(footer.querySelectorAll('button, [role="button"], a')).toHaveLength(0);
});
