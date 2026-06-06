import { formatCurrency, formatDate } from './formatters';

describe('formatCurrency', () => {
  test('formats whole-dollar amounts with $ and commas', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  test('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  test('rounds fractional cents (no decimal)', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235');
  });

  test('formats small amounts', () => {
    expect(formatCurrency(840000)).toBe('$840,000');
  });

  test('supports non-USD currencies', () => {
    const result = formatCurrency(1000, 'EUR');
    expect(result).toContain('1,000');
    expect(result).toMatch(/€|EUR/);
  });
});

describe('formatDate', () => {
  test('formats ISO date string as Month D, YYYY', () => {
    expect(formatDate('2026-06-05')).toBe('Jun 5, 2026');
  });

  test('formats single-digit day without leading zero', () => {
    expect(formatDate('2026-01-03')).toBe('Jan 3, 2026');
  });

  test('formats two-digit day', () => {
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });

  test('handles datetime strings by using date portion only', () => {
    expect(formatDate('2026-06-05T09:00:00')).toBe('Jun 5, 2026');
  });
});
