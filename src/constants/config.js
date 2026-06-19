export const CONFIG = {
  SESSION_MODE:       false,
  SUPPORTED_VERSIONS: ['2.3'],
  AI_MODEL:           'claude-sonnet-4-6',
  KEY_FORMAT_REGEX:   /^PIQ-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, // 29 chars
  DEV_TEST_KEY:       'PIQ-DEV0-TEST-KEY1-2345-6789',
  LOADING_STATES: {
    IDLE:    'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR:   'error',
  },
  CONNECTION_STATUS: {
    ONLINE:  'online',
    OFFLINE: 'offline',
    UNKNOWN: 'unknown',
  },
};

export const REQUIRED_APP_FIELDS = ['name', 'lifecycle_stage', 'support_status'];
