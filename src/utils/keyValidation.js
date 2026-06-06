import { CONFIG } from '../constants/config';

const DEV_PAYLOAD = {
  engagementId:    'dev-engagement-001',
  clientName:      'Dev Engagement',
  expiresAt:       '2027-12-31',
  appLimit:        150,
  analysisLimit:   10,
  features: {
    advisor:        true,
    signals:        true,
    export_pdf:     true,
    capability_map: false,
  },
};

export function validateKey(keyString) {
  const cleaned = (keyString ?? '').replace(/\s/g, '');

  if (!CONFIG.KEY_FORMAT_REGEX.test(cleaned)) {
    return { valid: false, error: 'Invalid key format' };
  }

  if (cleaned === CONFIG.DEV_TEST_KEY) {
    const today = new Date().toISOString().slice(0, 10);
    if (DEV_PAYLOAD.expiresAt < today) {
      return {
        valid:       false,
        expired:     true,
        error:       `Key expired on ${DEV_PAYLOAD.expiresAt}`,
        allowExport: true,
        clientName:  DEV_PAYLOAD.clientName,
        expiresAt:   DEV_PAYLOAD.expiresAt,
      };
    }
    const msPerDay = 86400000;
    const daysRemaining = Math.ceil(
      (new Date(DEV_PAYLOAD.expiresAt) - new Date()) / msPerDay
    );
    return { valid: true, ...DEV_PAYLOAD, daysRemaining };
  }

  // Phase 1b: Electron main process adds HMAC verification here.
  // Phase 1a: any key other than DEV_TEST_KEY is unrecognized.
  return { valid: false, error: 'Key not recognized in Phase 1a. Use the dev test key or wait for Session 8.' };
}
