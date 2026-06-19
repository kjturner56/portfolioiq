# Session 1: Session Start Screen + Key Validation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the React app and deliver a working Session Start screen with New Engagement (key validation), Resume Engagement (file import), and Quick Demo modes.

**Architecture:** Vite + React 18 app. All external calls route through `window.api` (mocked by `ipcBridge.js` in Phase 1a). Global state via a single `AppContext` reducer. Conditional rendering in `App.jsx` drives screen transitions — no React Router. Key validation is a pure function in `keyValidation.js` so it can be unit-tested independently of React.

**Tech Stack:** React 18, Vite 5, Vitest, @testing-library/react, @testing-library/user-event, jsdom

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `package.json` + `vite.config.js` | Create | Vite scaffold + Vitest config + `npm start` alias |
| `src/constants/colors.js` | Create | Dark Enterprise color palette — all hex lives here |
| `src/constants/config.js` | Create | Key regex, supported versions, session mode flag |
| `src/constants/demoData.js` | Create | 15-app Nexus Global Solutions static dataset |
| `src/utils/keyValidation.js` | Create | Pure `validateKey(keyString)` — format + expiry check |
| `src/utils/ipcBridge.js` | Create | `window.api` dev mock — delegates to keyValidation |
| `src/context/AppContext.js` | Create | Global state + reducer (SET_KEY, SET_SCREEN, LOAD_DEMO, RESTORE_ENGAGEMENT) |
| `src/App.jsx` | Create | Root — maps `currentScreen` to component |
| `src/main.jsx` | Create | Vite entry point, wraps App in AppContext.Provider |
| `src/components/DataUpload.jsx` | Create | Stub placeholder — replaced Session 2 |
| `src/components/ValidationQueueStub.jsx` | Create | Stub placeholder — replaced Session 6 |
| `src/components/SessionStart.jsx` | Create | Logo + three-card layout shell |
| `src/components/SessionStart/NewEngagement.jsx` | Create | Key input + auto-validate + Start button |
| `src/components/SessionStart/ResumeEngagement.jsx` | Create | Drag-and-drop file import |
| `src/components/SessionStart/QuickDemo.jsx` | Create | Demo launcher |
| `.env.example` | Create | `VITE_SECRET_KEY` placeholder + dev test key |
| `.env` | Create (local) | Actual dev secret — gitignored |

---

## Task 1: Scaffold Vite + React 18

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

> These dev dependencies (`vitest`, `@testing-library/*`, `jsdom`) are required for TDD. They are `devDependencies` only — zero impact on the production bundle.

- [ ] **Step 1: Create the Vite project**

```bash
cd /home/krturner/LAB/portfolioiq
npm create vite@latest . -- --template react
```

When prompted "Current directory is not empty. Remove existing files and continue?" — select **No, keep existing files**. Vite will add only missing files.

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install --save-dev vitest @testing-library/react @testing-library/user-event jsdom
```

- [ ] **Step 3: Configure Vitest in `vite.config.js`**

Replace the generated `vite.config.js` with:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 4: Add `start` script alias to `package.json`**

Open `package.json`. In the `"scripts"` section, add:

```json
"start": "vite",
"test": "vitest run",
"test:watch": "vitest"
```

`npm start` now maps to `vite` (runs dev server at `localhost:5173`).

- [ ] **Step 5: Create `.env.example` and `.env`**

`.env.example` (commit this):
```
# Dev secret — used for Phase 1a key validation bypass
VITE_SECRET_KEY=dev_secret_replace_in_production

# Dev test engagement key (use this during Sessions 1–7)
# VITE_DEV_TEST_KEY=PIQ-DEV0-TEST-KEY1-2345-6789
```

`.env` (gitignored — create locally):
```
VITE_SECRET_KEY=dev_secret_replace_in_production
```

Verify `.env` is in `.gitignore` (it already is from the existing `.gitignore`).

- [ ] **Step 6: Verify scaffold runs**

```bash
npm start
```

Expected: Vite dev server starts at `http://localhost:5173` with the default React scaffold page (Vite + React logo). Stop the server with Ctrl+C.

- [ ] **Step 7: Verify tests run**

```bash
npm test
```

Expected output:
```
No test files found, exiting with code 0
```

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html src/ .env.example
git commit -m "[Session 1] Scaffold Vite + React 18, Vitest setup"
```

---

## Task 2: Constants — `colors.js` and `config.js`

**Files:**
- Create: `src/constants/colors.js`
- Create: `src/constants/config.js`
- Create: `src/constants/colors.test.js`
- Create: `src/constants/config.test.js`

- [ ] **Step 1: Write failing test for colors**

Create `src/constants/colors.test.js`:

```js
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module './colors'`

- [ ] **Step 3: Create `src/constants/colors.js`**

```js
export const COLORS = {
  BG_BASE:        '#070a10',
  BG_SURFACE:     '#111827',
  BG_ELEVATED:    '#1a1d27',
  BG_OVERLAY:     '#0f1117',
  BORDER_SUBTLE:  '#1f2937',
  BORDER_DEFAULT: '#374151',
  BORDER_FOCUS:   '#4b5563',
  TEXT_PRIMARY:   '#f9fafb',
  TEXT_SECONDARY: '#d1d5db',
  TEXT_MUTED:     '#6b7280',
  TEXT_FAINT:     '#4b5563',
  AMBER:          '#f59e0b',
  AMBER_HOVER:    '#fbbf24',
  AMBER_DIM:      '#f59e0b22',
  BLUE:           '#3b82f6',
  BLUE_DIM:       '#3b82f618',
  GREEN:          '#10b981',
  GREEN_DIM:      '#10b98118',
  RED:            '#ef4444',
  RED_DIM:        '#ef444418',
  INVEST:         '#10b981',
  MIGRATE:        '#3b82f6',
  TOLERATE:       '#f59e0b',
  ELIMINATE:      '#ef4444',
};
```

- [ ] **Step 4: Write failing test for config**

Create `src/constants/config.test.js`:

```js
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
```

- [ ] **Step 5: Create `src/constants/config.js`**

```js
export const CONFIG = {
  SESSION_MODE:       false,
  SUPPORTED_VERSIONS: ['2.3'],
  AI_MODEL:           'claude-sonnet-4-6',
  KEY_FORMAT_REGEX:   /^PIQ-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, // 29 chars
  DEV_TEST_KEY:       'PIQ-DEV0-TEST-KEY1-2345-6789',
};
```

- [ ] **Step 6: Run tests — verify all pass**

```bash
npm test
```

Expected: 2 test files, 4 tests — all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/constants/
git commit -m "[Session 1] Add colors.js and config.js constants"
```

---

## Task 3: Demo Dataset — `demoData.js`

**Files:**
- Create: `src/constants/demoData.js`
- Create: `src/constants/demoData.test.js`

- [ ] **Step 1: Write failing test**

Create `src/constants/demoData.test.js`:

```js
import { DEMO_ENGAGEMENT } from './demoData';

test('demo dataset has exactly 15 applications', () => {
  expect(DEMO_ENGAGEMENT.applications).toHaveLength(15);
});

test('every app has required fields', () => {
  DEMO_ENGAGEMENT.applications.forEach(app => {
    expect(app.id, `${app.name} missing id`).toBeDefined();
    expect(app.name, `app missing name`).toBeDefined();
    expect(['Retain','Modernize','Retire','Replace']).toContain(app.ai_disposition);
    expect(['Tolerate','Invest','Migrate','Eliminate']).toContain(app.time_classification);
    expect(['Low','Medium','High']).toContain(app.security_risk_level);
    expect(app.technical_debt_score).toBeGreaterThanOrEqual(0);
    expect(app.technical_debt_score).toBeLessThanOrEqual(100);
    expect(app.business_value_score).toBeGreaterThanOrEqual(0);
    expect(app.business_value_score).toBeLessThanOrEqual(100);
  });
});

test('demo engagement has metadata', () => {
  expect(DEMO_ENGAGEMENT.metadata.client_name).toBe('Nexus Global Solutions');
  expect(DEMO_ENGAGEMENT.metadata.portfolioiq_version).toBe('2.3');
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module './demoData'`

- [ ] **Step 3: Create `src/constants/demoData.js`**

```js
export const DEMO_ENGAGEMENT = {
  metadata: {
    portfolioiq_version: '2.3',
    engagement_id:       'demo-001',
    client_name:         'Nexus Global Solutions',
    client_code:         'NGS-DEMO',
    analyst:             'Demo Mode',
    created_at:          '2026-06-05T09:00:00',
    last_updated:        '2026-06-05T09:00:00',
    session_count:       1,
    schema_version:      'v2.3',
    engagement_key_id:   'demo',
    key_expires_at:      '2099-12-31',
  },
  applications: [
    {
      id: 'app-001', name: 'SAP ERP', vendor: 'SAP',
      lifecycle_stage: 'Current', support_status: 'In Support',
      annual_cost: 840000, active_user_count: 620,
      ai_disposition: 'Retain', ai_confidence: 0.91,
      technical_debt_score: 18, business_value_score: 88,
      security_posture_score: 15, security_risk_level: 'Low',
      time_classification: 'Invest',
      ai_reasoning: 'Core ERP system supporting critical finance and supply chain operations. High user adoption and current support status. Strong investment case.',
    },
    {
      id: 'app-002', name: 'Salesforce CRM', vendor: 'Salesforce',
      lifecycle_stage: 'Current', support_status: 'In Support',
      annual_cost: 390000, active_user_count: 310,
      ai_disposition: 'Retain', ai_confidence: 0.88,
      technical_debt_score: 12, business_value_score: 82,
      security_posture_score: 10, security_risk_level: 'Low',
      time_classification: 'Invest',
      ai_reasoning: 'Modern SaaS CRM with strong adoption. No technical debt concerns. Supports critical sales and customer service capabilities.',
    },
    {
      id: 'app-003', name: 'Microsoft 365', vendor: 'Microsoft',
      lifecycle_stage: 'Current', support_status: 'In Support',
      annual_cost: 210000, active_user_count: 850,
      ai_disposition: 'Retain', ai_confidence: 0.95,
      technical_debt_score: 8, business_value_score: 45,
      security_posture_score: 8, security_risk_level: 'Low',
      time_classification: 'Tolerate',
      ai_reasoning: 'Universal productivity platform. Low technical debt and high adoption, though business value score reflects commodity nature. Tolerate indefinitely.',
    },
    {
      id: 'app-004', name: 'ServiceNow ITSM', vendor: 'ServiceNow',
      lifecycle_stage: 'Current', support_status: 'In Support',
      annual_cost: 520000, active_user_count: 180,
      ai_disposition: 'Retain', ai_confidence: 0.87,
      technical_debt_score: 22, business_value_score: 79,
      security_posture_score: 20, security_risk_level: 'Low',
      time_classification: 'Invest',
      ai_reasoning: 'ITSM backbone supporting all IT service delivery. Recent upgrade cycle keeps technical debt low. Strategic platform.',
    },
    {
      id: 'app-005', name: 'Oracle HCM', vendor: 'Oracle',
      lifecycle_stage: 'Aging', support_status: 'In Support',
      annual_cost: 310000, active_user_count: 95,
      ai_disposition: 'Retain', ai_confidence: 0.72,
      technical_debt_score: 42, business_value_score: 38,
      security_posture_score: 35, security_risk_level: 'Medium',
      time_classification: 'Tolerate',
      ai_reasoning: 'Aging HCM platform with declining adoption as headcount stabilises. Adequate technical fit for now. Monitor for replacement opportunity.',
    },
    {
      id: 'app-006', name: 'LegacyDB', vendor: 'Oracle',
      lifecycle_stage: 'End of Life', support_status: 'End of Life',
      annual_cost: 142000, active_user_count: 12,
      ai_disposition: 'Retire', ai_confidence: 0.91,
      technical_debt_score: 95, business_value_score: 22,
      security_posture_score: 88, security_risk_level: 'High',
      time_classification: 'Eliminate',
      ai_reasoning: 'End-of-life database with no vendor support. High security risk. Only 12 active users with no critical service dependencies. Priority retirement candidate.',
    },
    {
      id: 'app-007', name: 'COBOL Payroll', vendor: 'Custom',
      lifecycle_stage: 'End of Life', support_status: 'Unsupported',
      annual_cost: 98000, active_user_count: 8,
      ai_disposition: 'Retire', ai_confidence: 0.89,
      technical_debt_score: 92, business_value_score: 18,
      security_posture_score: 92, security_risk_level: 'High',
      time_classification: 'Eliminate',
      ai_reasoning: 'Custom COBOL application with no maintainable codebase. Payroll capability now fully covered by SAP ERP. Immediate retirement recommended.',
    },
    {
      id: 'app-008', name: 'Custom Reporting Portal', vendor: 'Custom',
      lifecycle_stage: 'Aging', support_status: 'In Support',
      annual_cost: 45000, active_user_count: 28,
      ai_disposition: 'Retire', ai_confidence: 0.78,
      technical_debt_score: 68, business_value_score: 30,
      security_posture_score: 55, security_risk_level: 'Medium',
      time_classification: 'Tolerate',
      ai_reasoning: 'Legacy custom reporting tool with significant technical debt. Reporting capability being migrated to Salesforce dashboards. Retire once migration completes.',
    },
    {
      id: 'app-009', name: 'FTP File Server', vendor: 'Custom',
      lifecycle_stage: 'End of Life', support_status: 'Unsupported',
      annual_cost: 22000, active_user_count: 15,
      ai_disposition: 'Retire', ai_confidence: 0.94,
      technical_debt_score: 88, business_value_score: 15,
      security_posture_score: 95, security_risk_level: 'High',
      time_classification: 'Eliminate',
      ai_reasoning: 'Unsupported FTP server representing a significant security vulnerability. File transfer capability available via M365 SharePoint. Immediate retirement required.',
    },
    {
      id: 'app-010', name: 'PeopleSoft HR', vendor: 'Oracle',
      lifecycle_stage: 'End of Life', support_status: 'End of Extended Support',
      annual_cost: 420000, active_user_count: 240,
      ai_disposition: 'Modernize', ai_confidence: 0.85,
      technical_debt_score: 74, business_value_score: 72,
      security_posture_score: 70, security_risk_level: 'High',
      time_classification: 'Migrate',
      ai_reasoning: 'High-value HR platform approaching end of extended support. Migration to Workday or Oracle Cloud HCM recommended within 18 months. High technical debt but business-critical.',
    },
    {
      id: 'app-011', name: 'Custom Dev Portal', vendor: 'Custom',
      lifecycle_stage: 'Aging', support_status: 'In Support',
      annual_cost: 85000, active_user_count: 65,
      ai_disposition: 'Modernize', ai_confidence: 0.76,
      technical_debt_score: 61, business_value_score: 58,
      security_posture_score: 48, security_risk_level: 'Medium',
      time_classification: 'Migrate',
      ai_reasoning: 'Developer portal with growing technical debt. Strong developer adoption makes retirement risky. Refactor or re-platform on a modern framework recommended.',
    },
    {
      id: 'app-012', name: 'SharePoint 2010', vendor: 'Microsoft',
      lifecycle_stage: 'End of Life', support_status: 'End of Life',
      annual_cost: 78000, active_user_count: 145,
      ai_disposition: 'Modernize', ai_confidence: 0.88,
      technical_debt_score: 82, business_value_score: 62,
      security_posture_score: 80, security_risk_level: 'High',
      time_classification: 'Migrate',
      ai_reasoning: 'SharePoint 2010 is end-of-life and a security liability. High intranet adoption makes direct retirement impractical. Migrate to SharePoint Online immediately.',
    },
    {
      id: 'app-013', name: 'Custom Analytics Platform', vendor: 'Custom',
      lifecycle_stage: 'Aging', support_status: 'In Support',
      annual_cost: 190000, active_user_count: 88,
      ai_disposition: 'Replace', ai_confidence: 0.82,
      technical_debt_score: 72, business_value_score: 70,
      security_posture_score: 60, security_risk_level: 'Medium',
      time_classification: 'Migrate',
      ai_reasoning: 'Custom analytics platform with significant maintenance burden. Tableau or Power BI would deliver equivalent capability with lower TCO. Replace recommended.',
    },
    {
      id: 'app-014', name: 'Legacy Project Tracker', vendor: 'Custom',
      lifecycle_stage: 'Aging', support_status: 'In Support',
      annual_cost: 35000, active_user_count: 42,
      ai_disposition: 'Replace', ai_confidence: 0.79,
      technical_debt_score: 58, business_value_score: 40,
      security_posture_score: 42, security_risk_level: 'Medium',
      time_classification: 'Tolerate',
      ai_reasoning: 'Custom project tracking tool predating the ServiceNow PPM module. Migrate users to ServiceNow PPM to consolidate tooling and reduce maintenance overhead.',
    },
    {
      id: 'app-015', name: 'Vendor Invoice Portal', vendor: 'Custom',
      lifecycle_stage: 'Aging', support_status: 'In Support',
      annual_cost: 62000, active_user_count: 55,
      ai_disposition: 'Replace', ai_confidence: 0.81,
      technical_debt_score: 65, business_value_score: 55,
      security_posture_score: 58, security_risk_level: 'Medium',
      time_classification: 'Migrate',
      ai_reasoning: 'Custom vendor portal with growing technical debt. Coupa or SAP Ariba would replace with a supported, integrated solution. Budget for replacement in next cycle.',
    },
  ],
};
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/constants/demoData.js src/constants/demoData.test.js
git commit -m "[Session 1] Add Nexus Global Solutions demo dataset (15 apps)"
```

---

## Task 4: `keyValidation.js` — Pure Validation Function

**Files:**
- Create: `src/utils/keyValidation.js`
- Create: `src/utils/keyValidation.test.js`

**Phase 1a note:** Full HMAC-SHA256 signature verification moves to the Electron main process in Phase 1b. Phase 1a validates format (regex) and expiry, and accepts the hardcoded `DEV_TEST_KEY` (`PIQ-DEV0-TEST-KEY1-2345-6789`) for development testing. Any other well-formed key returns `{ valid: false, error: 'Key not recognized in Phase 1a' }` — this is expected behavior until Session 8 builds the key generator.

- [ ] **Step 1: Write failing tests**

Create `src/utils/keyValidation.test.js`:

```js
import { validateKey } from './keyValidation';

describe('validateKey — format checks', () => {
  test('rejects empty string', () => {
    const result = validateKey('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with too few groups', () => {
    const result = validateKey('PIQ-A3F2-9K12-MN45-PQ78');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with wrong prefix', () => {
    const result = validateKey('ABC-DEV0-TEST-KEY1-2345-6789');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with lowercase characters', () => {
    const result = validateKey('PIQ-dev0-test-key1-2345-6789');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('rejects key with special characters', () => {
    const result = validateKey('PIQ-A3F!-9K12-MN45-PQ78-XY23');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid key format');
  });

  test('strips whitespace before validating', () => {
    // Dev test key with leading/trailing spaces should still validate
    const result = validateKey('  PIQ-DEV0-TEST-KEY1-2345-6789  ');
    expect(result.valid).toBe(true);
  });
});

describe('validateKey — dev test key', () => {
  test('accepts dev test key and returns engagement details', () => {
    const result = validateKey('PIQ-DEV0-TEST-KEY1-2345-6789');
    expect(result.valid).toBe(true);
    expect(result.clientName).toBe('Dev Engagement');
    expect(result.appLimit).toBe(150);
    expect(result.analysisLimit).toBe(10);
    expect(result.features.advisor).toBe(true);
    expect(result.daysRemaining).toBeGreaterThan(0);
  });

  test('dev test key result includes engagementId and expiresAt', () => {
    const result = validateKey('PIQ-DEV0-TEST-KEY1-2345-6789');
    expect(result.engagementId).toBeDefined();
    expect(result.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('validateKey — unrecognized key', () => {
  test('valid format but unrecognized key returns error', () => {
    const result = validateKey('PIQ-A3F2-9K12-MN45-PQ78-XY23');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Key not recognized');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/utils/keyValidation.test.js
```

Expected: FAIL — `Cannot find module './keyValidation'`

- [ ] **Step 3: Create `src/utils/keyValidation.js`**

```js
import { CONFIG } from '../constants/config';

const DEV_PAYLOAD = {
  engagementId:    'dev-engagement-001',
  clientName:      'Dev Engagement',
  expiresAt:       '2027-12-31',
  appLimit:        150,
  analysisLimit:   10,
  features: {
    advisor:      true,
    signals:      true,
    export_pdf:   true,
    capability_map: false,
  },
};

export function validateKey(keyString) {
  const cleaned = (keyString ?? '').replace(/\s/g, '').toUpperCase();

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
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test src/utils/keyValidation.test.js
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/keyValidation.js src/utils/keyValidation.test.js
git commit -m "[Session 1] Add keyValidation.js — format + expiry check (Phase 1a)"
```

---

## Task 5: `ipcBridge.js` — `window.api` Dev Mock

**Files:**
- Create: `src/utils/ipcBridge.js`
- Create: `src/utils/ipcBridge.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/utils/ipcBridge.test.js`:

```js
import { vi } from 'vitest';

// Mock keyValidation before importing ipcBridge
vi.mock('./keyValidation', () => ({
  validateKey: vi.fn((key) =>
    key === 'PIQ-DEV0-TEST-KEY1-2345-6789'
      ? { valid: true, clientName: 'Dev Engagement', daysRemaining: 200 }
      : { valid: false, error: 'Key not recognized in Phase 1a. Use the dev test key or wait for Session 8.' }
  ),
}));

import ipcBridge from './ipcBridge';

describe('ipcBridge.validateKey', () => {
  test('returns { data, error } shape on valid key', async () => {
    const result = await ipcBridge.validateKey('PIQ-DEV0-TEST-KEY1-2345-6789');
    expect(result.error).toBeNull();
    expect(result.data.valid).toBe(true);
    expect(result.data.clientName).toBe('Dev Engagement');
  });

  test('returns { data, error } shape on invalid key', async () => {
    const result = await ipcBridge.validateKey('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX');
    expect(result.error).toBeNull();
    expect(result.data.valid).toBe(false);
    expect(result.data.error).toBeDefined();
  });
});

describe('ipcBridge.getCredential', () => {
  test('returns null data for unknown credential', async () => {
    const result = await ipcBridge.getCredential('NONEXISTENT_KEY');
    expect(result.data).toBeNull();
    expect(result.error).toContain('NONEXISTENT_KEY');
  });
});

describe('ipcBridge.callClaude', () => {
  test('returns stubbed error in Phase 1a', async () => {
    const result = await ipcBridge.callClaude('test prompt', {});
    expect(result.data).toBeNull();
    expect(result.error).toContain('Session 2');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/utils/ipcBridge.test.js
```

Expected: FAIL — `Cannot find module './ipcBridge'`

- [ ] **Step 3: Create `src/utils/ipcBridge.js`**

```js
import { validateKey as _validateKey } from './keyValidation';

const ipcBridge = {
  async validateKey(keyString) {
    try {
      const data = _validateKey(keyString);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  },

  async saveFile(filename, content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { data: { path: filename }, error: null };
  },

  async callClaude(_prompt, _options) {
    return { data: null, error: 'Claude API not yet wired — implemented in Session 2.' };
  },

  async getCredential(key) {
    const value = import.meta.env[`VITE_${key}`] ?? null;
    return {
      data:  value,
      error: value ? null : `Credential ${key} not found in .env`,
    };
  },
};

if (!window.api) {
  window.api = ipcBridge;
}

export default ipcBridge;
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test src/utils/ipcBridge.test.js
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/ipcBridge.js src/utils/ipcBridge.test.js
git commit -m "[Session 1] Add ipcBridge.js — window.api dev mock"
```

---

## Task 6: `AppContext.js` — Global State

**Files:**
- Create: `src/context/AppContext.js`
- Create: `src/context/AppContext.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/context/AppContext.test.js`:

```js
import { appReducer, initialState } from './AppContext';

describe('appReducer', () => {
  test('SET_KEY stores key data', () => {
    const key = { valid: true, clientName: 'Acme Corp', daysRemaining: 28 };
    const next = appReducer(initialState, { type: 'SET_KEY', payload: key });
    expect(next.engagementKey).toEqual(key);
  });

  test('SET_SCREEN updates currentScreen', () => {
    const next = appReducer(initialState, { type: 'SET_SCREEN', payload: 'DATA_UPLOAD' });
    expect(next.currentScreen).toBe('DATA_UPLOAD');
  });

  test('LOAD_DEMO sets isDemoMode and engagement', () => {
    const dataset = { applications: [] };
    const next = appReducer(initialState, { type: 'LOAD_DEMO', payload: dataset });
    expect(next.isDemoMode).toBe(true);
    expect(next.engagement).toEqual(dataset);
  });

  test('RESTORE_ENGAGEMENT sets engagement without demo mode', () => {
    const file = { metadata: { client_name: 'Acme' }, applications: [] };
    const next = appReducer(
      { ...initialState, isDemoMode: true },
      { type: 'RESTORE_ENGAGEMENT', payload: file }
    );
    expect(next.engagement).toEqual(file);
    expect(next.isDemoMode).toBe(false);
  });

  test('unknown action returns state unchanged', () => {
    const next = appReducer(initialState, { type: 'UNKNOWN' });
    expect(next).toEqual(initialState);
  });

  test('initialState has expected shape', () => {
    expect(initialState.currentScreen).toBe('SESSION_START');
    expect(initialState.engagementKey).toBeNull();
    expect(initialState.engagement).toBeNull();
    expect(initialState.isDemoMode).toBe(false);
    expect(initialState.sessionMode).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/context/AppContext.test.js
```

Expected: FAIL — `Cannot find module './AppContext'`

- [ ] **Step 3: Create `src/context/AppContext.js`**

```js
import { createContext, useContext, useReducer } from 'react';
import { CONFIG } from '../constants/config';

export const initialState = {
  sessionMode:    CONFIG.SESSION_MODE,
  engagementKey:  null,
  engagement:     null,
  isDemoMode:     false,
  currentScreen:  'SESSION_START',
};

export function appReducer(state, action) {
  switch (action.type) {
    case 'SET_KEY':
      return { ...state, engagementKey: action.payload };
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'LOAD_DEMO':
      return { ...state, engagement: action.payload, isDemoMode: true };
    case 'RESTORE_ENGAGEMENT':
      return { ...state, engagement: action.payload, isDemoMode: false };
    default:
      return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test src/context/AppContext.test.js
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/AppContext.js src/context/AppContext.test.js
git commit -m "[Session 1] Add AppContext — global state with reducer"
```

---

## Task 7: `main.jsx`, `App.jsx`, and Stub Screens

**Files:**
- Modify: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/components/DataUpload.jsx`
- Create: `src/components/ValidationQueueStub.jsx`
- Create: `src/App.test.jsx`

- [ ] **Step 1: Write failing test for App routing**

Create `src/App.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { AppContext } from './context/AppContext';
import App from './App';

function renderWithState(currentScreen) {
  const state = {
    currentScreen,
    engagementKey: null,
    engagement: null,
    isDemoMode: false,
    sessionMode: false,
  };
  return render(
    <AppContext.Provider value={{ state, dispatch: () => {} }}>
      <App />
    </AppContext.Provider>
  );
}

test('renders SessionStart when currentScreen is SESSION_START', () => {
  renderWithState('SESSION_START');
  expect(screen.getByText('PortfolioIQ')).toBeInTheDocument();
});

test('renders DataUpload stub when currentScreen is DATA_UPLOAD', () => {
  renderWithState('DATA_UPLOAD');
  expect(screen.getByText(/Upload Data/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/App.test.jsx
```

Expected: FAIL — `Cannot find module './App'`

- [ ] **Step 3: Create `src/components/DataUpload.jsx`**

```jsx
import { COLORS } from '../constants/colors';

export default function DataUpload() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: COLORS.TEXT_MUTED, fontSize: 14 }}>
        Upload Data — coming in Session 2
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ValidationQueueStub.jsx`**

```jsx
import { COLORS } from '../constants/colors';

export default function ValidationQueueStub() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: COLORS.TEXT_MUTED, fontSize: 14 }}>
        Validation Queue — coming in Session 6
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `src/App.jsx`**

```jsx
import { useApp } from './context/AppContext';
import SessionStart from './components/SessionStart';
import DataUpload from './components/DataUpload';
import ValidationQueueStub from './components/ValidationQueueStub';

const SCREENS = {
  SESSION_START:    SessionStart,
  DATA_UPLOAD:      DataUpload,
  VALIDATION_QUEUE: ValidationQueueStub,
};

export default function App() {
  const { state } = useApp();
  const Screen = SCREENS[state.currentScreen] ?? SessionStart;
  return <Screen />;
}
```

- [ ] **Step 6: Update `src/main.jsx`**

Replace the generated content with:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider } from './context/AppContext';
import App from './App';
import './utils/ipcBridge'; // installs window.api mock

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
```

- [ ] **Step 7: Create a stub `SessionStart.jsx` to unblock the App test**

Create `src/components/SessionStart.jsx` (full implementation in Task 8 — this stub makes the App test pass now):

```jsx
import { COLORS } from '../constants/colors';

export default function SessionStart() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 3, color: COLORS.TEXT_PRIMARY, textTransform: 'uppercase' }}>
          PortfolioIQ
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run tests — verify all pass**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 9: Commit**

```bash
git add src/main.jsx src/App.jsx src/App.test.jsx src/components/DataUpload.jsx src/components/ValidationQueueStub.jsx src/components/SessionStart.jsx
git commit -m "[Session 1] Add App routing, stub screens, and ipcBridge wiring"
```

---

## Task 8: `SessionStart.jsx` — Full Card Shell

**Files:**
- Modify: `src/components/SessionStart.jsx`
- Create: `src/components/SessionStart.test.jsx`
- Create: `src/components/SessionStart/NewEngagement.jsx` (stub)
- Create: `src/components/SessionStart/ResumeEngagement.jsx` (stub)
- Create: `src/components/SessionStart/QuickDemo.jsx` (stub)

- [ ] **Step 1: Write failing tests**

Create `src/components/SessionStart.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContext } from '../context/AppContext';
import { initialState } from '../context/AppContext';
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/components/SessionStart.test.jsx
```

Expected: FAIL — card label / `data-mode` attribute tests fail.

- [ ] **Step 3: Create sub-component stubs**

`src/components/SessionStart/NewEngagement.jsx`:
```jsx
export default function NewEngagement() {
  return <div data-testid="new-engagement-form">New Engagement Form</div>;
}
```

`src/components/SessionStart/ResumeEngagement.jsx`:
```jsx
export default function ResumeEngagement() {
  return <div data-testid="resume-form">Resume Form</div>;
}
```

`src/components/SessionStart/QuickDemo.jsx`:
```jsx
export default function QuickDemo() {
  return <div data-testid="quick-demo-panel">Quick Demo Panel</div>;
}
```

- [ ] **Step 4: Replace `src/components/SessionStart.jsx` with full implementation**

```jsx
import { useState } from 'react';
import { COLORS } from '../constants/colors';
import NewEngagement from './SessionStart/NewEngagement';
import ResumeEngagement from './SessionStart/ResumeEngagement';
import QuickDemo from './SessionStart/QuickDemo';

const MODES = [
  {
    id:          'new',
    label:       'NEW ENGAGEMENT',
    labelColor:  COLORS.AMBER,
    title:       'Start fresh with a new client',
    desc:        'Upload client data and run AI analysis.',
    note:        'Requires an engagement key',
    Content:     NewEngagement,
  },
  {
    id:          'resume',
    label:       'RESUME ENGAGEMENT',
    labelColor:  COLORS.BLUE,
    title:       'Continue a project already in progress',
    desc:        'Import your .portfolioiq file. Key is auto-detected.',
    note:        'Key auto-detected from file',
    Content:     ResumeEngagement,
  },
  {
    id:          'demo',
    label:       'QUICK DEMO',
    labelColor:  COLORS.GREEN,
    title:       'Explore with sample data',
    desc:        'No key needed. All features available. Nothing is saved.',
    note:        'No key · No data stored',
    Content:     QuickDemo,
  },
];

export default function SessionStart() {
  const [activeMode, setActiveMode] = useState(null);

  function handleCardClick(modeId) {
    setActiveMode(prev => (prev === modeId ? null : modeId));
  }

  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: 3, color: COLORS.TEXT_PRIMARY, textTransform: 'uppercase' }}>
          PortfolioIQ
        </div>
        <div style={{ fontSize: 11, letterSpacing: 4, color: COLORS.TEXT_FAINT, textTransform: 'uppercase', marginTop: 4 }}>
          by Telority
        </div>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 780 }}>
        {MODES.map(({ id, label, labelColor, title, desc, note, Content }) => {
          const isActive = activeMode === id;
          return (
            <div
              key={id}
              data-mode={id}
              data-active={String(isActive)}
              onClick={() => handleCardClick(id)}
              style={{
                flex: 1,
                background: COLORS.BG_SURFACE,
                border: `1px solid ${isActive ? labelColor : COLORS.BORDER_SUBTLE}`,
                borderRadius: 12,
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: labelColor, marginBottom: 12 }}>
                {label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: COLORS.TEXT_MUTED, lineHeight: 1.5, marginBottom: 16 }}>
                {desc}
              </div>
              <div style={{ fontSize: 11, color: COLORS.TEXT_FAINT }}>
                {note}
              </div>

              {isActive && (
                <div
                  style={{ marginTop: 20, borderTop: `1px solid ${COLORS.BORDER_SUBTLE}`, paddingTop: 20 }}
                  onClick={e => e.stopPropagation()}
                >
                  <Content />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 40, fontSize: 10, color: COLORS.TEXT_FAINT }}>
        PortfolioIQ v2.3 · Phase 1a
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests — verify all pass**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/SessionStart.jsx src/components/SessionStart.test.jsx src/components/SessionStart/
git commit -m "[Session 1] SessionStart card shell — three-mode layout with expand/collapse"
```

---

## Task 9: `NewEngagement.jsx` — Key Input + Auto-Validate

**Files:**
- Modify: `src/components/SessionStart/NewEngagement.jsx`
- Create: `src/components/SessionStart/NewEngagement.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/SessionStart/NewEngagement.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppContext } from '../../context/AppContext';
import { initialState } from '../../context/AppContext';
import NewEngagement from './NewEngagement';

// Mock window.api
const mockValidateKey = vi.fn();
beforeEach(() => {
  window.api = { validateKey: mockValidateKey };
  mockValidateKey.mockReset();
});

function renderNewEngagement(dispatch = vi.fn()) {
  return render(
    <AppContext.Provider value={{ state: initialState, dispatch }}>
      <NewEngagement />
    </AppContext.Provider>
  );
}

test('renders key input field', () => {
  renderNewEngagement();
  expect(screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX')).toBeInTheDocument();
});

test('Start Engagement button is disabled initially', () => {
  renderNewEngagement();
  expect(screen.getByRole('button', { name: /start engagement/i })).toBeDisabled();
});

test('auto-validates when full 29-char key is typed', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement();
  const input = screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX');
  await userEvent.type(input, 'PIQ-DEV0-TEST-KEY1-2345-6789');
  await waitFor(() => expect(mockValidateKey).toHaveBeenCalledWith('PIQ-DEV0-TEST-KEY1-2345-6789'));
});

test('shows green confirmation on valid key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-DEV0-TEST-KEY1-2345-6789'
  );
  await waitFor(() => expect(screen.getByText(/Key Validated/i)).toBeInTheDocument());
  expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
});

test('enables Start Engagement button on valid key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-DEV0-TEST-KEY1-2345-6789'
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /start engagement/i })).toBeEnabled()
  );
});

test('shows red error on invalid key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: false, error: 'Key not recognized' },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'
  );
  await waitFor(() => expect(screen.getByText(/Key not recognized/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /start engagement/i })).toBeDisabled();
});

test('shows amber warning on expired key', async () => {
  mockValidateKey.mockResolvedValue({
    data: { valid: false, expired: true, error: 'Key expired on 2025-01-01', allowExport: true, clientName: 'Old Client' },
    error: null,
  });
  renderNewEngagement();
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'
  );
  await waitFor(() => expect(screen.getByText(/expired/i)).toBeInTheDocument());
  expect(screen.getByRole('button', { name: /start engagement/i })).toBeDisabled();
});

test('clicking Start dispatches SET_KEY and SET_SCREEN', async () => {
  const dispatch = vi.fn();
  mockValidateKey.mockResolvedValue({
    data: { valid: true, clientName: 'Acme Corp', expiresAt: '2027-01-01', daysRemaining: 200, appLimit: 150, analysisLimit: 10 },
    error: null,
  });
  renderNewEngagement(dispatch);
  await userEvent.type(
    screen.getByPlaceholderText('PIQ-XXXX-XXXX-XXXX-XXXX-XXXX'),
    'PIQ-DEV0-TEST-KEY1-2345-6789'
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /start engagement/i })).toBeEnabled()
  );
  await userEvent.click(screen.getByRole('button', { name: /start engagement/i }));
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SET_KEY' }));
  expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SCREEN', payload: 'DATA_UPLOAD' });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/components/SessionStart/NewEngagement.test.jsx
```

Expected: multiple FAILs — stub component doesn't implement any of this.

- [ ] **Step 3: Implement `src/components/SessionStart/NewEngagement.jsx`**

```jsx
import { useState } from 'react';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { useApp } from '../../context/AppContext';

export default function NewEngagement() {
  const { dispatch } = useApp();
  const [keyValue, setKeyValue]       = useState('');
  const [keyResult, setKeyResult]     = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  async function handleKeyChange(e) {
    const raw   = e.target.value;
    const upper = raw.toUpperCase();
    setKeyValue(upper);

    if (CONFIG.KEY_FORMAT_REGEX.test(upper)) {
      setIsValidating(true);
      const { data } = await window.api.validateKey(upper);
      setIsValidating(false);
      setKeyResult(data);
    } else {
      setKeyResult(null);
    }
  }

  function handleStart() {
    if (!keyResult?.valid) return;
    dispatch({ type: 'SET_KEY',    payload: keyResult });
    dispatch({ type: 'SET_SCREEN', payload: 'DATA_UPLOAD' });
  }

  const isValid   = keyResult?.valid === true;
  const isExpired = keyResult?.expired === true;
  const isError   = keyResult && !isValid && !isExpired;

  return (
    <div>
      {/* Label */}
      <div style={{ fontSize: 10, letterSpacing: 1, color: COLORS.TEXT_MUTED, textTransform: 'uppercase', marginBottom: 6 }}>
        Engagement Key
      </div>

      {/* Input */}
      <input
        value={keyValue}
        onChange={handleKeyChange}
        placeholder="PIQ-XXXX-XXXX-XXXX-XXXX-XXXX"
        style={{
          width:        '100%',
          background:   COLORS.BG_OVERLAY,
          border:       `1px solid ${isValid ? COLORS.GREEN : isExpired ? COLORS.AMBER : isError ? COLORS.RED : COLORS.BORDER_DEFAULT}`,
          borderRadius: 6,
          padding:      '10px 14px',
          fontFamily:   'monospace',
          fontSize:     13,
          letterSpacing: 2,
          color:        COLORS.TEXT_PRIMARY,
          outline:      'none',
          boxSizing:    'border-box',
        }}
      />

      {/* Validation result */}
      {isValidating && (
        <div style={{ marginTop: 8, fontSize: 11, color: COLORS.TEXT_MUTED }}>
          Validating…
        </div>
      )}

      {isValid && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.GREEN_DIM, border: `1px solid ${COLORS.GREEN}30`, fontSize: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.GREEN, marginBottom: 4 }}>
            ✓ Key Validated
          </div>
          <div style={{ color: COLORS.TEXT_SECONDARY }}>Client: {keyResult.clientName}</div>
          <div style={{ color: COLORS.TEXT_MUTED, marginTop: 2 }}>
            Expires {keyResult.expiresAt} · {keyResult.daysRemaining} days · {keyResult.appLimit} apps · {keyResult.analysisLimit} analyses
          </div>
        </div>
      )}

      {isExpired && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.AMBER_DIM, border: `1px solid ${COLORS.AMBER}30`, fontSize: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.AMBER, marginBottom: 4 }}>
            ⚠ Key Expired
          </div>
          <div style={{ color: COLORS.TEXT_SECONDARY }}>{keyResult.error}</div>
          <div style={{ color: COLORS.TEXT_MUTED, marginTop: 2 }}>
            You can view and export this engagement. Contact Ken Turner to renew.
          </div>
        </div>
      )}

      {isError && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.RED_DIM, border: `1px solid ${COLORS.RED}30`, fontSize: 11 }}>
          <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.RED, marginBottom: 4 }}>
            ✕ Invalid Key
          </div>
          <div style={{ color: COLORS.TEXT_SECONDARY }}>{keyResult.error}</div>
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!isValid}
        aria-label="Start Engagement"
        style={{
          marginTop:     12,
          width:         '100%',
          background:    isValid ? COLORS.AMBER : COLORS.BORDER_SUBTLE,
          color:         isValid ? '#000' : COLORS.TEXT_FAINT,
          border:        'none',
          borderRadius:  6,
          padding:       10,
          fontSize:      11,
          fontWeight:    800,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor:        isValid ? 'pointer' : 'not-allowed',
        }}
      >
        Start Engagement →
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test src/components/SessionStart/NewEngagement.test.jsx
```

Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SessionStart/NewEngagement.jsx src/components/SessionStart/NewEngagement.test.jsx
git commit -m "[Session 1] NewEngagement — key input with auto-validate and Start button"
```

---

## Task 10: `ResumeEngagement.jsx` — File Drop Zone

**Files:**
- Modify: `src/components/SessionStart/ResumeEngagement.jsx`
- Create: `src/components/SessionStart/ResumeEngagement.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/SessionStart/ResumeEngagement.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppContext } from '../../context/AppContext';
import { initialState } from '../../context/AppContext';
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/components/SessionStart/ResumeEngagement.test.jsx
```

Expected: FAIL — stub component doesn't implement any of this.

- [ ] **Step 3: Implement `src/components/SessionStart/ResumeEngagement.jsx`**

```jsx
import { useRef, useState } from 'react';
import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { useApp } from '../../context/AppContext';

export default function ResumeEngagement() {
  const { dispatch }        = useApp();
  const fileInputRef        = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError]   = useState(null);

  async function processFile(file) {
    setFileError(null);
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      setFileError('Invalid file format — this does not appear to be a PortfolioIQ engagement file.');
      return;
    }

    const version = data?.metadata?.portfolioiq_version;
    if (!CONFIG.SUPPORTED_VERSIONS.includes(version)) {
      setFileError(`Unsupported file version: ${version ?? 'unknown'}. Please update PortfolioIQ.`);
      return;
    }

    dispatch({ type: 'RESTORE_ENGAGEMENT', payload: data });
    dispatch({ type: 'SET_SCREEN',         payload: 'VALIDATION_QUEUE' });
  }

  function handleFileInput(e) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  return (
    <div>
      <div
        onDragEnter={() => setIsDragging(true)}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border:       `1px dashed ${isDragging ? COLORS.BLUE : COLORS.BORDER_DEFAULT}`,
          borderRadius: 8,
          padding:      24,
          textAlign:    'center',
          cursor:       'pointer',
          background:   isDragging ? COLORS.BLUE_DIM : 'transparent',
          transition:   'border-color 0.15s, background 0.15s',
        }}
      >
        <div style={{ fontSize: 24, color: COLORS.BORDER_DEFAULT, marginBottom: 8 }}>⇩</div>
        <div style={{ fontSize: 11, color: COLORS.TEXT_MUTED }}>Drop .portfolioiq file here</div>
        <div style={{ fontSize: 10, color: COLORS.TEXT_FAINT, marginTop: 4 }}>or click to browse</div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".portfolioiq,.json"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {fileError && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 6, background: COLORS.RED_DIM, border: `1px solid ${COLORS.RED}30`, fontSize: 11, color: COLORS.RED }}>
          {fileError}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test src/components/SessionStart/ResumeEngagement.test.jsx
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/SessionStart/ResumeEngagement.jsx src/components/SessionStart/ResumeEngagement.test.jsx
git commit -m "[Session 1] ResumeEngagement — file drop zone with version validation"
```

---

## Task 11: `QuickDemo.jsx` — Demo Launcher

**Files:**
- Modify: `src/components/SessionStart/QuickDemo.jsx`
- Create: `src/components/SessionStart/QuickDemo.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/SessionStart/QuickDemo.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AppContext } from '../../context/AppContext';
import { initialState } from '../../context/AppContext';
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test src/components/SessionStart/QuickDemo.test.jsx
```

Expected: FAIL — stub doesn't match.

- [ ] **Step 3: Add `DASHBOARD` stub screen to `App.jsx`**

First create the stub:

`src/components/DashboardStub.jsx`:
```jsx
import { COLORS } from '../constants/colors';
export default function DashboardStub() {
  return (
    <div style={{ background: COLORS.BG_BASE, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: COLORS.TEXT_MUTED, fontSize: 14 }}>Dashboard — coming in Session 5</div>
    </div>
  );
}
```

Then add it to `src/App.jsx` SCREENS map:

```jsx
import DashboardStub from './components/DashboardStub';

const SCREENS = {
  SESSION_START:    SessionStart,
  DATA_UPLOAD:      DataUpload,
  VALIDATION_QUEUE: ValidationQueueStub,
  DASHBOARD:        DashboardStub,       // ← add this line
};
```

- [ ] **Step 4: Implement `src/components/SessionStart/QuickDemo.jsx`**

```jsx
import { COLORS } from '../../constants/colors';
import { useApp } from '../../context/AppContext';
import { DEMO_ENGAGEMENT } from '../../constants/demoData';

export default function QuickDemo() {
  const { dispatch } = useApp();

  function handleLaunchDemo() {
    dispatch({ type: 'LOAD_DEMO',  payload: DEMO_ENGAGEMENT });
    dispatch({ type: 'SET_SCREEN', payload: 'DASHBOARD' });
  }

  return (
    <div>
      <div style={{
        display:      'inline-block',
        background:   COLORS.GREEN_DIM,
        border:       `1px solid ${COLORS.GREEN}30`,
        color:        COLORS.GREEN,
        fontSize:     9,
        fontWeight:   700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        padding:      '3px 8px',
        borderRadius: 4,
        marginBottom: 10,
      }}>
        DEMO MODE
      </div>

      <div style={{ fontSize: 11, color: COLORS.TEXT_MUTED, lineHeight: 1.6, marginBottom: 12 }}>
        Loads <strong style={{ color: COLORS.TEXT_SECONDARY }}>Nexus Global Solutions</strong> — 15 sample applications across all four dispositions (Retain, Modernize, Retire, Replace) and Gartner TIME quadrants.
      </div>

      <div style={{ fontSize: 10, color: COLORS.TEXT_FAINT, marginBottom: 14 }}>
        Exports show "DEMO MODE" watermark.
      </div>

      <button
        onClick={handleLaunchDemo}
        aria-label="Launch Demo"
        style={{
          width:         '100%',
          background:    'transparent',
          color:         COLORS.GREEN,
          border:        `1px solid ${COLORS.GREEN}44`,
          borderRadius:  6,
          padding:       10,
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor:        'pointer',
        }}
      >
        Launch Demo →
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Run all tests — verify everything passes**

```bash
npm test
```

Expected: all test files, all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/SessionStart/QuickDemo.jsx src/components/SessionStart/QuickDemo.test.jsx src/components/DashboardStub.jsx src/App.jsx
git commit -m "[Session 1] QuickDemo — demo launcher with DEMO_ENGAGEMENT dataset"
```

---

## Task 12: Manual Smoke Test

**No new files.**

- [ ] **Step 1: Start the dev server**

```bash
npm start
```

Expected: Vite dev server starts at `http://localhost:5173`.

- [ ] **Step 2: Verify Session Start screen**

Open `http://localhost:5173`. Confirm:
- Dark background (`#070a10`)
- "PortfolioIQ" heading in white, "by Telority" in faint grey
- Three cards side-by-side: NEW ENGAGEMENT (amber label), RESUME ENGAGEMENT (blue), QUICK DEMO (green)

- [ ] **Step 3: Test New Engagement flow**

Click the NEW ENGAGEMENT card. Confirm it expands. Type the dev test key: `PIQ-DEV0-TEST-KEY1-2345-6789`. Confirm:
- Input auto-uppercases
- Green "✓ Key Validated" block appears with "Dev Engagement" client name
- "Start Engagement →" button becomes active (amber)
- Clicking Start navigates to "Upload Data — coming in Session 2" stub

- [ ] **Step 4: Test Resume Engagement flow**

Navigate back (refresh). Click RESUME ENGAGEMENT. Confirm drop zone renders. Create a test file:

```bash
echo '{"metadata":{"portfolioiq_version":"2.3","client_name":"Test"},"applications":[]}' > /tmp/test.portfolioiq
```

Drop or browse to `/tmp/test.portfolioiq`. Confirm: navigates to "Validation Queue — coming in Session 6".

Test an invalid file: drop a plain `.txt` file. Confirm red error message appears without crashing.

- [ ] **Step 5: Test Quick Demo flow**

Refresh. Click QUICK DEMO. Confirm DEMO MODE badge, "Nexus Global Solutions", 15 sample apps description. Click "Launch Demo →". Confirm navigates to "Dashboard — coming in Session 5".

- [ ] **Step 6: Check console for errors**

Open browser DevTools → Console. Confirm no errors or warnings during any flow.

- [ ] **Step 7: Run full test suite one final time**

```bash
npm test
```

Expected: all tests PASS.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "[Session 1] Complete — Session Start screen + Key validation working"
```

---

## Acceptance Checklist

- [ ] `npm start` opens at `localhost:5173` with Session Start screen
- [ ] Dark Enterprise theme: `#070a10` background, amber/blue/green card labels
- [ ] New Engagement: dev key `PIQ-DEV0-TEST-KEY1-2345-6789` auto-validates, shows green confirmation
- [ ] New Engagement: invalid key shows red error, expired key shows amber warning
- [ ] New Engagement: Start button disabled until valid key
- [ ] New Engagement: Start navigates to DataUpload stub
- [ ] Resume: drop zone accepts `.portfolioiq` / `.json` files
- [ ] Resume: corrupt/unsupported file shows inline error without crashing
- [ ] Resume: valid file navigates to ValidationQueueStub
- [ ] Quick Demo: loads 15-app Nexus dataset, navigates to DashboardStub
- [ ] `window.api` available in browser DevTools console
- [ ] No hex colors in components — all from `COLORS`
- [ ] No `<form>` tags anywhere
- [ ] `npm test` — all tests pass
