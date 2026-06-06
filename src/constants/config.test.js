import { CONFIG } from './config';

test('CONFIG.KEY_FORMAT_REGEX matches valid 29-char key', () => {
  expect(CONFIG.KEY_FORMAT_REGEX.test('PIQ-A3F2-9K12-MN45-PQ78-XY23')).toBe(true);
  expect(CONFIG.KEY_FORMAT_REGEX.test('PIQ-DEV0-TEST-KEY1-2345-6789')).toBe(true);
});

test('CONFIG.KEY_FORMAT_REGEX rejects malformed keys', () => {
  expect(CONFIG.KEY_FORMAT_REGEX.test('PIQ-XXXX-XXXX')).toBe(false);      // too short
  expect(CONFIG.KEY_FORMAT_REGEX.test('ABC-A3F2-9K12-MN45-PQ78-XY23')).toBe(false); // wrong prefix
  expect(CONFIG.KEY_FORMAT_REGEX.test('PIQ-a3f2-9k12-MN45-PQ78-XY23')).toBe(false); // lowercase
  expect(CONFIG.KEY_FORMAT_REGEX.test('PIQ-A3F2-9K12-MN45-PQ78-XY2!')).toBe(false); // special char
});

test('CONFIG.SUPPORTED_VERSIONS includes 2.3', () => {
  expect(CONFIG.SUPPORTED_VERSIONS).toContain('2.3');
});
