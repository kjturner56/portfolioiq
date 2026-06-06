import { COLORS } from './colors';

test('COLORS exports required keys', () => {
  const required = [
    'BG_BASE', 'BG_SURFACE', 'BG_ELEVATED', 'BG_OVERLAY',
    'BORDER_SUBTLE', 'BORDER_DEFAULT', 'BORDER_FOCUS',
    'TEXT_PRIMARY', 'TEXT_SECONDARY', 'TEXT_MUTED', 'TEXT_FAINT',
    'AMBER', 'AMBER_HOVER', 'AMBER_DIM',
    'BLUE', 'BLUE_DIM', 'GREEN', 'GREEN_DIM', 'RED', 'RED_DIM',
    'INVEST', 'MIGRATE', 'TOLERATE', 'ELIMINATE',
  ];
  required.forEach(key => {
    expect(COLORS[key], `Missing COLORS.${key}`).toBeDefined();
    expect(COLORS[key]).toMatch(/^#[0-9a-fA-F]{3,8}$/);
  });
});
