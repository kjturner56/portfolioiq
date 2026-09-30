import { render, screen } from '@testing-library/react';
import AdvisoryFooter from './AdvisoryFooter';
import { CONFIG } from '../constants/config';
import { COLORS } from '../constants/colors';

test('renders the exact advisory disclaimer text', () => {
  render(<AdvisoryFooter />);
  expect(screen.getByText(CONFIG.DISCLAIMERS.ADVISORY_FOOTER)).toBeInTheDocument();
});

test('uses TEXT_DISCLAIMER color and stays fixed to the bottom', () => {
  render(<AdvisoryFooter />);
  const footer = screen.getByRole('contentinfo');
  expect(footer).toHaveStyle({ color: COLORS.TEXT_DISCLAIMER, position: 'fixed', bottom: '0px' });
});

test('TEXT_DISCLAIMER meets WCAG AA contrast on BG_BASE but stays dimmer than body text', () => {
  const luminance = (hex) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (fg, bg) => {
    const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  };
  expect(contrast(COLORS.TEXT_DISCLAIMER, COLORS.BG_BASE)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(COLORS.TEXT_DISCLAIMER, COLORS.BG_BASE))
    .toBeLessThan(contrast(COLORS.TEXT_SECONDARY, COLORS.BG_BASE));
});

test('is not dismissible — no buttons or close controls', () => {
  render(<AdvisoryFooter />);
  const footer = screen.getByRole('contentinfo');
  expect(footer.querySelectorAll('button, [role="button"], a')).toHaveLength(0);
});
