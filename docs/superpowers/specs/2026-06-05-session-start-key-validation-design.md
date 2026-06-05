# Session 1 Design: Session Start Screen + Key Validation
**PortfolioIQ Phase 1a | 2026-06-05**

---

## What This Covers

Session 1 of Phase 1a build sequence. Delivers the first thing Jan sees when she opens PortfolioIQ: the session start screen with three engagement modes (New, Resume, Demo) and the engagement key validation system that gates access to each new client engagement.

Pseudocode reference: `docs/PortfolioIQ_Standalone_Pseudocode.md` v2.3 — Sprint 11 (Engagement Key System), Sprint 10 (Engagement File Architecture).

---

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| Visual style | Dark Enterprise | Deep navy/dark, amber brand accent. Matches consulting-grade product positioning. |
| Key input UX | Paste + auto-validate | Validation fires when full 29-char key is detected. No button click to validate — just one [Start Engagement] button. |
| Scaffold | Vite + React 18 | CRA is deprecated. Vite with a `start` script alias in `package.json`. |
| Email check | Skip in Phase 1a | No auth system in local `npm start`. HMAC signature + expiry check is sufficient. Phase 1b Electron adds email check. |
| Key format | `PIQ-XXXX-XXXX-XXXX-XXXX-XXXX` | 5 groups of 4 chars. Authoritative example: `PIQ-A3F2-9K12-MN45-PQ78-XY23`. CLAUDE.md updated. |

---

## File Structure

```
portfolioiq/
  src/
    components/
      SessionStart.jsx
      SessionStart/
        NewEngagement.jsx
        ResumeEngagement.jsx
        QuickDemo.jsx
    constants/
      colors.js
      config.js
    context/
      AppContext.js
    utils/
      ipcBridge.js
      keyValidation.js
    hooks/
    App.jsx
    main.jsx
  .env                  (VITE_SECRET_KEY=...)
  .env.example          (VITE_SECRET_KEY=your_secret_here)
```

---

## Color Palette (`src/constants/colors.js`)

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

---

## AppContext Initial State

```js
const initialState = {
  sessionMode:    false,       // read from config, never mutated at runtime
  engagementKey:  null,        // set after key validation
  engagement:     null,        // set after file import or new engagement start
  isDemoMode:     false,
  currentScreen:  'SESSION_START',
};
```

`currentScreen` drives top-level routing. No React Router in Phase 1a — App.jsx uses conditional rendering.

**Dispatch actions introduced in Session 1:**
- `SET_KEY` — stores validated key data in `engagementKey`
- `SET_SCREEN` — navigates between screens
- `LOAD_DEMO` — loads Nexus demo dataset into `engagement`, sets `isDemoMode: true`
- `RESTORE_ENGAGEMENT` — restores full state from imported `.portfolioiq` file

---

## `keyValidation.js` — Pure Function

Validates `PIQ-XXXX-XXXX-XXXX-XXXX-XXXX` format keys. No React dependencies.

**Steps:**
1. Strip whitespace, uppercase
2. Regex check: `/^PIQ-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/` (28 chars total)
3. Strip `PIQ-` prefix and dashes to get base64url-encoded payload
4. Decode → parse `{ signature, payload }`
5. Check expiry against today's date (Phase 1a skips HMAC and email checks)
6. Return `{ valid, engagementId, clientName, expiresAt, daysRemaining, appLimit, analysisLimit, features }` on success
7. Return `{ valid: false, expired: true, allowExport: true, ... }` on expired key
8. Return `{ valid: false, error: '...' }` on format/parse failure

**Phase 1a security boundary:** HMAC-SHA256 signature verification belongs in the Electron main process so `SECRET_KEY` never touches the renderer. Phase 1a validates format + expiry only. Phase 1b Electron adds full HMAC verification and `issued_to` email check.

---

## `ipcBridge.js` — `window.api` Dev Mock

Installs `window.api` when Electron hasn't already (i.e., during `npm start`).

| Method | Phase 1a behaviour |
|---|---|
| `validateKey(keyString)` | Calls `keyValidation.js`, returns `{ data, error }` |
| `saveFile(filename, content)` | Triggers browser download via blob URL |
| `callClaude(prompt, options)` | Stubbed — returns error; implemented Session 2 |
| `getCredential(key)` | Reads from `import.meta.env.VITE_${key}` |

All methods return `{ data, error }` shape per CLAUDE.md rule.

---

## Session Start Screen — Component Design

### `SessionStart.jsx`

- Renders logo block (`PORTFOLIOIQ` / `by Telority`) + three mode cards
- State: `activeMode = null | 'new' | 'resume' | 'demo'`
- Card click → `setActiveMode` → card expands inline
- All styles: inline, referencing `COLORS`

### `NewEngagement.jsx`

- State: `keyValue`, `keyResult`
- onChange: cleans input → if full 28-char key detected → `window.api.validateKey()` → `setKeyResult`
- Renders:
  - Monospace key input, auto-uppercases, letter-spacing
  - Validation result block (green valid / amber expired / red error) — visible once key is full length
  - `[Start Engagement →]` button — disabled until `keyResult.valid === true`
- On Start: `dispatch SET_KEY`, `dispatch SET_SCREEN → 'DATA_UPLOAD'`
- Expired key: shows amber banner "Key expired — you can view and export only. Contact Ken to renew." Disables Start button but does not block export.

### `ResumeEngagement.jsx`

- State: `isDragging`, `fileError`
- File input: hidden `<input type="file" accept=".portfolioiq,.json">` triggered by `divRef.onClick` (no `<form>` tag per CLAUDE.md)
- On file drop or input change:
  1. Read file as text → `JSON.parse`
  2. Validate `portfolioiq_version` is in `SUPPORTED_VERSIONS` (config)
  3. Re-validate key from `file.metadata.engagement_key_id` via `window.api.validateKey()`
  4. If valid → `dispatch RESTORE_ENGAGEMENT` → `SET_SCREEN → 'VALIDATION_QUEUE'`
  5. If expired → restore state + enter view/export mode
  6. If parse fails → show error inline

### `QuickDemo.jsx`

- No state
- On `[Launch Demo →]` click:
  - `dispatch LOAD_DEMO` (loads 15-app Nexus dataset from `src/constants/demoData.js`)
  - `dispatch SET_SCREEN → 'DASHBOARD'`
- Renders: dataset description, `DEMO MODE` badge, launch button

---

## Demo Dataset (`src/constants/demoData.js`)

Static JSON. 15 apps, Nexus Global Solutions, covering all four dispositions (Retain/Modernize/Retire/Replace) and all four TIME quadrants. Committed to the repo — no API call needed to launch demo. Exports from demo mode show "DEMO MODE" watermark (enforced in later sessions).

---

## `config.js` — Key Constants

```js
export const CONFIG = {
  SESSION_MODE:        false,
  SUPPORTED_VERSIONS:  ['2.3'],       // .portfolioiq files older than this are rejected
  AI_MODEL:            'claude-sonnet-4-6',
  KEY_FORMAT_REGEX:    /^PIQ-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
};
```

## Dev Testing — Engagement Keys

The Platform Admin key generator is built in Session 8. For Sessions 1–7, a pre-generated dev test key is committed to `.env.example` alongside the dev `VITE_SECRET_KEY`. Ken generates this test key once using a standalone Node.js script (not part of the React app). The test key encodes:
- `client_name: "Nexus Global Solutions"`
- `expires_at: "2027-01-01"` (far future — won't expire during development)
- `app_limit: 150`, `analysis_limit: 10`

In Phase 1a, `keyValidation.js` checks format + expiry only. HMAC verification is intentionally skipped until Phase 1b (Electron main process controls the secret key).

## `DATA_UPLOAD` Stub Screen

Session 1 dispatches `SET_SCREEN → 'DATA_UPLOAD'` after a valid key is accepted. The stub is a single component (`DataUpload.jsx`) with a placeholder heading "Upload Data — coming in Session 2" so the navigation works end-to-end. Replaced in full in Session 2.

---

## What Session 1 Does NOT Build

- AI schema mapper → Session 2
- Mapping review → Session 3
- Engagement file export/import (full) → Session 4
- Dashboard → Session 5
- Any screen beyond `SESSION_START` and `DATA_UPLOAD` stub

---

## Acceptance Criteria

- [ ] `npm start` opens app at `localhost:5173` with Session Start screen
- [ ] Dark Enterprise theme matches approved mockup
- [ ] New Engagement: key auto-validates on full input, valid key shows green confirmation, expired shows amber, invalid shows red
- [ ] New Engagement: `[Start Engagement →]` only enabled on valid key
- [ ] Resume: drag-and-drop zone accepts `.portfolioiq` and `.json` files
- [ ] Resume: invalid/corrupt file shows inline error, does not crash
- [ ] Quick Demo: loads Nexus dataset, navigates to stub Dashboard screen
- [ ] `window.api` is available in browser console via ipcBridge mock
- [ ] No hex colors in components — all from `COLORS`
- [ ] No `<form>` tags anywhere
