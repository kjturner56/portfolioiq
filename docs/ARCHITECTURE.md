# PortfolioIQ — Current-State Architecture

**Baseline:** `main` at commit `511b54d` (2026-09-30) · Phase 1a · 194 tests in 18 test files, all passing · CI green

This document describes PortfolioIQ **as it exists in this repository today**. It does not propose changes. Where the code and the project documentation differ, both are stated and left unresolved.

When the code changes, update the baseline line above and the sections affected. References point to files, components, functions, document sections, issues and decision records rather than line numbers, so they stay valid as code moves.

---

## 1. Status legend and sources

| Label | Meaning |
|---|---|
| **Implemented** | Working code in `src/`, exercised by tests |
| **Stubbed** | Code exists but returns placeholder data or provides only a partial implementation of the documented capability |
| **Documented only** | Described in CLAUDE.md, the pseudocode, BACKLOG.md or GitHub issues; no code yet |
| **Documented conflict** | Sources disagree; both sides are recorded in [§14](#14-documented-conflicts-and-divergences) |

**Sources used:** the `src/` tree, `package.json`, `vite.config.js`, `index.html`, `.env.example`, `.github/workflows/ci.yml`, `CLAUDE.md`, `docs/PortfolioIQ_Standalone_Pseudocode.md` (v2.3, "the pseudocode"), `docs/DECISIONS.md`, `docs/BACKLOG.md`, `docs/SESSION_PLANNING.md`, the Session 1 design spec in `docs/superpowers/specs/`, open GitHub issues, and the GitHub branch ruleset on `main`.

---

## 2. System context and deployment phases

| Phase | Description | Status |
|---|---|---|
| **1a** | React 18 single-page app built with Vite, run locally with `npm start` (Vite dev server) | **Implemented** — this repository |
| **1b** | The same React code wrapped in an Electron desktop app; real `window.api` in the Electron main process | **Documented only** — CLAUDE.md "Phase 1b — Electron wrapper rules", pseudocode "Phase 1 — Final Definition", issue #13 |
| **2** | Web SaaS at app.getportfolioiq.com with Supabase persistence and Stripe billing, same React codebase | **Documented only** — CLAUDE.md "Architecture", pseudocode "Overview" |

The pseudocode "Overview" also describes an existing proof-of-concept web app (Supabase, Vercel, ServiceNow connector, CSV upload) at app.getportfolioiq.com. **That code is not in this repository**, and nothing here depends on it.

Phase 1 intent (pseudocode "Phase 1 — Final Definition"): client portfolio data stays on the analyst's machine; the only external runtime call is the Claude API; the `.portfolioiq` engagement file is the persistence layer; engagement keys control access. None of the data-handling parts of this are built yet (see §6–§9).

---

## 3. Application architecture

*Sources: `index.html`, `src/main.jsx`, `src/App.jsx`, `package.json`, DECISIONS.md "Architecture".*

```
index.html
  └─ src/main.jsx
       ├─ import './utils/ipcBridge'      ← side effect: sets window.api if not already set
       └─ <React.StrictMode>
            └─ <ErrorBoundary>            ← class component, catches render errors
                 └─ <AppProvider>         ← AppContext: useReducer(appReducer, initialState)
                      └─ <App>
                           ├─ SCREENS[state.currentScreen]   (defaults to SessionStart)
                           └─ <AdvisoryFooter>               (fixed, every screen)
```

- **Build and runtime:** Vite 6 with `@vitejs/plugin-react`. Runtime dependencies are `react` and `react-dom` only. `recharts` is named in CLAUDE.md "Libraries" but **is not installed**. — *Implemented*
- **Routing:** no router. `App` looks up `state.currentScreen` in a `SCREENS` map (`SESSION_START`, `DATA_UPLOAD`, `VALIDATION_QUEUE`, `DASHBOARD`) and falls back to `SessionStart` for unknown values. Navigation is the `SET_SCREEN` reducer action. The choice is recorded in DECISIONS.md ("No React Router in Phase 1a"). — *Implemented*
- **Styling:** inline styles only, with colors from `src/constants/colors.js` (DECISIONS.md "Inline styles over Tailwind"). `index.html` has no page-level CSS, so the browser's default body margin applies. — *Implemented*
- **Global state:** a single React context (`src/context/AppContext.jsx`) with a reducer (DECISIONS.md "AppContext reducer over useState"). No other state library. — *Implemented*
- **Persistent footer:** `AdvisoryFooter` is rendered by `App` below every screen, and `App` adds matching bottom padding (`CONFIG.FOOTER_HEIGHT`). — *Implemented* (PR #22)

---

## 4. Components and modules

### Screens and components (`src/components/`)

| Module | Responsibility | Status |
|---|---|---|
| `SessionStart` | Landing screen with three mode cards (New, Resume, Demo); clicking a card expands its child component | **Implemented** |
| `SessionStart/NewEngagement` | Engagement key input; validates automatically when the text matches the key format; **Start Engagement** stores the key and navigates to `DATA_UPLOAD` | **Implemented** |
| `SessionStart/ResumeEngagement` | Drag-and-drop or file picker for `.portfolioiq`/`.json`; parses JSON, checks version, restores, navigates to `VALIDATION_QUEUE` | **Implemented** (limited validation — see §6) |
| `SessionStart/QuickDemo` | Loads the built-in demo engagement and navigates to `DASHBOARD` | **Implemented** |
| `AdvisoryFooter` | Fixed, non-dismissible advisory disclaimer (`CONFIG.DISCLAIMERS.ADVISORY_FOOTER`, color `TEXT_DISCLAIMER`) | **Implemented** |
| `ErrorBoundary` | Catches render errors; shows the error message and a Reload button. A class component (React requires classes for error boundaries) | **Implemented** |
| `DataUpload` | Placeholder text: "Upload Data — coming in Session 2" | **Stubbed** |
| `ValidationQueueStub` | Placeholder text: "Validation Queue — coming in Session 6" | **Stubbed** |
| `DashboardStub` | Placeholder text: "Dashboard — coming in Session 5" | **Stubbed** |

No screen offers navigation back to Session Start; a page reload resets all state.

### Utilities (`src/utils/`)

| Module | Responsibility | Status |
|---|---|---|
| `ipcBridge` | Phase 1a mock of `window.api` (see §8), plus `validateScoringResponse` | **Mixed** — see §7, §8 |
| `keyValidation.validateKey` | Key format regex check, dev-key match, expiry check (no HMAC) | **Implemented** |
| `validateAppData` | Classifies one app record as FULL / PARTIAL / UNSCORABLE using `FIELD_REQUIREMENTS`; computes the confidence penalty (0.05 per missing recommended field) and an explanation | **Implemented**, no caller in the running app |
| `validatePortfolio` | Aggregates `validateAppData` over a portfolio: counts per group, missing-field summary, `canProceed` (false only when every app is unscorable) | **Implemented**, no caller in the running app |
| `validationSelectors` | `getValidationProgress`, `getUnvalidatedApps`, `isExportAllowed` over the validation states | **Implemented**, no caller in the running app |
| `formatters` | `formatCurrency`, `formatDate` | **Implemented**, no caller in the running app |

### Constants (`src/constants/`)

| Module | Contents | Status |
|---|---|---|
| `config` | `CONFIG` (session mode flag, supported file versions, AI model id, key regex, dev test key, loading states, connection states, disclaimer text, footer height) and `REQUIRED_APP_FIELDS` | **Implemented** |
| `colors` | Color tokens (backgrounds, borders, text levels including `TEXT_DISCLAIMER`, accents, disposition colors) | **Implemented** |
| `fieldRequirements` | `FIELD_REQUIREMENTS` (REQUIRED, RECOMMENDED tiers), `CONFIDENCE_DEFINITION`, `SCORING_STATUS` | **Implemented** |
| `demoData` | `DEMO_ENGAGEMENT`: one engagement file-shaped object with metadata and 15 pre-scored applications | **Implemented** |

**Not present:** `src/hooks/` is listed in CLAUDE.md "File Structure" but does not exist. There is no `aiProvider.js` (§7) and no `engagementFile` utility (CLAUDE.md "File Structure" names one).

---

## 5. State model (`AppContext`)

*Sources: `src/context/AppContext.jsx` (`initialState`, `appReducer`, `AppProvider`, `useApp`); CLAUDE.md "Rules", "AI Schema Mapper"; pseudocode "Configuration Architecture", "Human-in-the-Loop Architecture".*

### `initialState`

| Key | Default | Purpose |
|---|---|---|
| `sessionMode` | `CONFIG.SESSION_MODE` (`false`) | Session-mode flag |
| `sessionId` | `crypto.randomUUID()` | Per-load session id |
| `engagementKey` | `null` | Result of key validation |
| `engagement` | `null` | Loaded engagement (demo or restored file) |
| `isDemoMode` | `false` | Demo flag |
| `currentScreen` | `'SESSION_START'` | Screen routing |
| `aiCallLog` | `[]` | AI/audit event log (append-only by design) |
| `engagementConfig` | client name/code, currency, app-limit warning threshold (0.8), include AI log, show cost data, `scoringWeights` {technicalDebt, businessValue, securityRisk, cloudReadiness: 0.25 each} | Per-engagement settings |
| `analystConfig` | analyst/firm name (empty), USD, `MM/DD/YYYY`, auto-save 15 min, `aiModel`, confidence threshold 0.75, show AI reasoning | Analyst preferences |
| `validationStates` | `{}` | HITL status per app id |
| `connectionStatus` | `UNKNOWN` | Online/offline indicator state |
| `mappingProposal` | `null` | AI schema mapping proposal under review |

### Reducer actions (17)

| Action | Effect | Dispatched by a component today? |
|---|---|---|
| `SET_KEY` | Stores key validation result | Yes — `NewEngagement` |
| `SET_SCREEN` | Changes screen | Yes — `NewEngagement`, `ResumeEngagement`, `QuickDemo` |
| `LOAD_DEMO` | Sets `engagement`, `isDemoMode: true` | Yes — `QuickDemo` |
| `RESTORE_ENGAGEMENT` | Sets `engagement`, `isDemoMode: false` | Yes — `ResumeEngagement` |
| `ADD_AI_CALL` | Appends to `aiCallLog` (never mutates or removes) | No |
| `SET_ANALYST_CONFIG` / `UPDATE_ANALYST_CONFIG` | Replace / merge `analystConfig` | No |
| `SET_ENGAGEMENT_CONFIG` / `UPDATE_ENGAGEMENT_CONFIG` | Replace / merge `engagementConfig` | No |
| `INITIALIZE_VALIDATIONS` | Creates a validation entry per app: PENDING, or ACCEPTED with `validatedBy: 'demo'` in demo mode | No |
| `VALIDATE_APP` | Merges an update into one app's validation entry | No |
| `RESET_VALIDATION` | Returns one app to PENDING | No |
| `SET_CONNECTION_STATUS` | Sets `connectionStatus` | No |
| `SET_MAPPING_PROPOSAL` | Stores a mapping proposal | No |
| `CONFIRM_MAPPING` | Marks one mapping CONFIRMED | No |
| `CORRECT_MAPPING` | Marks one mapping CORRECTED with the analyst's target field | No |
| `APPROVE_MAPPING` | Sets `canProceedToScoring: true` only if every required field's mapping is CONFIRMED or CORRECTED | No |

All 17 actions are covered by reducer tests. `APPROVE_MAPPING` keeps its own copy of the required-field list, with a comment to keep it in sync with `FIELD_REQUIREMENTS.REQUIRED`.

---

## 6. Data flows

### Implemented today

*Sources: `SessionStart/*` components, `keyValidation`, `ipcBridge.validateKey`, `AppContext` reducer.*

```
Session Start
│
├─ NEW ENGAGEMENT
│    key text ─(matches KEY_FORMAT_REGEX)→ window.api.validateKey → keyValidation.validateKey
│      → result shown (valid / expired / invalid)
│      → [Start Engagement] (valid only) → SET_KEY → SET_SCREEN DATA_UPLOAD → placeholder
│
├─ RESUME ENGAGEMENT
│    file (drop or picker) → FileReader.readAsText → JSON.parse
│      → metadata.portfolioiq_version ∈ SUPPORTED_VERSIONS ?
│      → RESTORE_ENGAGEMENT(file contents) → SET_SCREEN VALIDATION_QUEUE → placeholder
│
└─ QUICK DEMO
     DEMO_ENGAGEMENT (in-bundle constant) → LOAD_DEMO → SET_SCREEN DASHBOARD → placeholder
```

Observed limits of the implemented flows:
- **Resume** checks JSON syntax and the version field only. It doesn't validate the rest of the file's structure, check the engagement key, or restore validation states, mapping or configuration.
- **Demo** doesn't dispatch `INITIALIZE_VALIDATIONS`, so `validationStates` stays empty after the demo loads.
- **New Engagement** stores the key result but doesn't populate `engagementConfig.clientName`.
- Nothing is written to disk, and nothing reaches the network.

### Documented target flow — not implemented

*Sources: pseudocode "Sprint 1: AI Schema Mapper", "Sprint 5: End-to-End Flow", "Sprint 10: Engagement File Architecture"; CLAUDE.md "Data Handling Rules for AI Touchpoints".*

```
CSV/Excel upload → extract headers + samples → window.api.mapSchema (Claude) → PROPOSED mapping
  → Mapping Review (analyst confirms/corrects; Approve Mapping) → apply mapping, load applications
  → validateAppData per app (UNSCORABLE never sent to Claude)
  → window.api.scoreApplication per app (Claude) → validateScoringResponse
  → Dashboard / AI Analysis & Signals / Validation Queue (HITL) → PDF report
Engagement file: export (.portfolioiq), import (restores decisions, mapping, summary), auto-save
```

---

## 7. AI/LLM integration

*Sources: `ipcBridge` (`callClaude`, `scoreApplication`, `mapSchema`, `validateScoringResponse`); CLAUDE.md "Architecture — Thin Client Boundary", "AI Provider Abstraction", "AI Scoring", "AI Schema Mapper"; issues #7, #8, #9, #18, #19.*

| Element | Current state | Status |
|---|---|---|
| Claude API calls | None. `ipcBridge.callClaude` returns an error saying it isn't wired yet | **Stubbed** |
| `window.api.scoreApplication(appData)` | Returns a fixed placeholder result: `Retain`, three zero scores in `scoring_breakdown`, all-false `uncertainty_flags`, empty `replacement_suggestions`, `Invest`, confidence 0 | **Stubbed** |
| `window.api.mapSchema(headers, samples)` | Returns an empty proposal: no mappings, all headers unmapped, all required fields unmapped, `canProceedToScoring: false` | **Stubbed** |
| `validateScoringResponse` | Checks: object shape; disposition ∈ {Retain, Modernize, Retire, Replace}; confidence 0–1; `scoring_breakdown` object with known scores 0–100; `uncertainty_flags` object with boolean `requires_human_review`. Returns errors as `{code, message, context}` | **Implemented**, exported for tests only; no production caller |
| Permitted-field allowlist for prompts | A comment in `ipcBridge` lists the permitted fields; not enforced in code | **Documented only** |
| `buildScoringPrompt`, `buildMappingPrompt`, rule-based pre-filter, retry/timeout/rate limiting | Required behind `window.api` (CLAUDE.md) | **Documented only** |
| `src/utils/aiProvider.js` (provider abstraction, Anthropic first) | Does not exist | **Documented only** — CLAUDE.md, #19 |
| Model selection | `CONFIG.AI_MODEL` and `analystConfig.aiModel` are both `claude-sonnet-4-6`; neither is read by any call yet | **Implemented** (values only) |
| AI Portfolio Advisor, `buildAdvisorContext`, 10-turn cap | — | **Documented only** — CLAUDE.md "Rules", pseudocode "Sprint 6" |
| AI call logging (`aiCallLog` actions such as `MAPPING_CORRECTED`, `ENGAGEMENT_EXPORT`, `AUTO_SAVE`) | Reducer action exists; nothing dispatches it | **Stubbed** |

Documented rules not yet exercised by code (CLAUDE.md):
- The mapper sends only column headers plus up to 3 sample values per column, with no more than 500 tokens of samples, and returns a *proposed* mapping only.
- Scoring requests a structured `scoring_breakdown`, `uncertainty_flags`, and `replacement_suggestions` (for Retire and Modernize only).
- Responses are validated before storage.
- Unscorable apps are never sent to Claude.

---

## 8. External interfaces

*Sources: `ipcBridge`, `ResumeEngagement`, `.env.example`; CLAUDE.md "IPC Bridge"; pseudocode "Overview", "Sprint 9", "Sprint 10".*

### `window.api` (Phase 1a mock in `src/utils/ipcBridge.js`)

The bridge assigns itself to `window.api` only if `window.api` is not already defined. Components reach it through `window.api`, never by importing it. Today `NewEngagement` is the only component that calls it, and only `validateKey`.

| Method | Phase 1a behaviour | Status |
|---|---|---|
| `validateKey(key)` | Calls `keyValidation.validateKey`; returns `{data, error}` | **Implemented** |
| `saveFile(filename, content)` | Triggers a browser download (Blob + anchor) | **Implemented**, no caller |
| `saveAnalystConfig(config)` | Downloads `analyst_config.json` via the browser | **Implemented**, no caller |
| `loadAnalystConfig()` | Parses `VITE_ANALYST_CONFIG` from the build environment, if set | **Implemented**, no caller |
| `getCredential(key)` | Returns `import.meta.env['VITE_' + key]` | **Implemented**, no caller |
| `callClaude`, `scoreApplication`, `mapSchema` | Placeholders (see §7) | **Stubbed** |

### Other interfaces

| Interface | Current state | Status |
|---|---|---|
| Local file read | `ResumeEngagement` reads `.portfolioiq`/`.json` through the browser `FileReader` | **Implemented** |
| Local file write | Browser download only (above) | **Implemented**, unused |
| Network | No network calls anywhere in `src/` | — |
| Anthropic Claude API | — | **Documented only** |
| CSV/Excel ingestion | — | **Documented only** (pseudocode "Sprint 1") |
| ServiceNow, Freshservice, Jira and generic REST connectors | — | **Documented only** (Phase 2 per pseudocode "Phase 1 — Final Definition") |
| Supabase, Stripe | Not in dependencies or code | **Documented only** (Phase 2) |
| Electron IPC (`preload.js`, `contextBridge`, `ipcMain`) | — | **Documented only** (CLAUDE.md Phase 1b rules, #13) |

---

## 9. Security boundaries

*Sources: CLAUDE.md "Architecture — Thin Client Boundary", "IPC Bridge", "Phase 1b — Electron wrapper rules", "Key Format"; DECISIONS.md "Security & Privacy"; `keyValidation`, `ipcBridge`, `demoData`, `.env.example`; issues #5, #6.*

| Boundary | Current state | Status |
|---|---|---|
| **Thin client / `window.api`** | Components call only `window.api`, never `fetch` or `fs`. In Phase 1a the "backend" (`ipcBridge.js`) is a module running in the same browser context, attached to `window.api`, so the boundary is a code convention rather than a process boundary. | **Implemented** (by convention) |
| **Engagement key validation** | A format regex (`PIQ-` + five groups of 4) plus an exact match against `CONFIG.DEV_TEST_KEY`, which returns a built-in dev payload with an expiry date. Any other well-formed key is rejected as not recognized. No HMAC; DECISIONS.md "Skip HMAC in Phase 1a". The dev key lives in committed config (#6 tracks its removal before Phase 1b). | **Implemented** (dev-only) |
| **HMAC-SHA256 signed keys, secret in the main process** | — | **Documented only** (pseudocode "Sprint 11", CLAUDE.md "Key Format") |
| **Environment variables** | Vite bundles `VITE_*` variables into the renderer. `.env.example` defines `VITE_SECRET_KEY` (marked as not a real secret in Phase 1a) and a commented `VITE_DEV_TEST_KEY`. `.env` is git-ignored. | **Implemented** |
| **Engagement file protection** | Plain JSON; `metadata.encrypted: false` in demo data. AES-256 is planned. | **Documented only** (#5) |
| **Electron hardening** | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, preload with `contextBridge`, bundle only the build output | **Documented only** (CLAUDE.md Phase 1b rules) |
| **Data minimization to AI** | Permitted-field list (comment only); header-plus-sample limits for the mapper | **Documented only** |
| **Error sanitization** (strip app/vendor/cost/user-count data before logging) | No logging or error-reporting code exists | **Documented only** (CLAUDE.md "Error Sanitization") |
| **Import error hygiene** (no file contents in logged errors) | `ResumeEngagement` shows errors in the UI only; no logging | **Implemented** (nothing logged) |
| **Data residency** | All state is in memory in the browser tab and lost on reload; nothing is persisted or transmitted | **Implemented** |

---

## 10. Human decision points (HITL)

*Sources: `SessionStart/*`, `AppContext` reducer, `validationSelectors`, `AdvisoryFooter`; CLAUDE.md "Human-in-the-Loop (HITL) Rules", "Legal Protection Rules", "AI Schema Mapper"; pseudocode "Human-in-the-Loop Architecture"; issue #14.*

| Decision point | UI | State / logic | Status |
|---|---|---|---|
| Choose engagement mode (New / Resume / Demo) | Yes | — | **Implemented** |
| Enter and accept an engagement key | Yes | `SET_KEY` | **Implemented** |
| Review the AI mapping: confirm, correct, approve before scoring | No | `CONFIRM_MAPPING`, `CORRECT_MAPPING`, `APPROVE_MAPPING` (required fields must be CONFIRMED/CORRECTED) | **State implemented, no UI** |
| Validate each AI disposition: PENDING, ACCEPTED, OVERRIDDEN, ESCALATED, EXCLUDED | No | `INITIALIZE_VALIDATIONS`, `VALIDATE_APP`, `RESET_VALIDATION`; demo apps are pre-accepted | **State implemented, no UI** |
| Override requires a reason of at least 10 characters | No | Not enforced in the reducer | **Documented only** |
| Export and PDF locked until no app is PENDING | No | `isExportAllowed`, `getValidationProgress().canExport` | **Selectors implemented, no UI** |
| Progress indicator ("X of Y apps validated") | No | `getValidationProgress` | **Selector implemented, no UI** |
| Accept action shows inline professional-judgment text | No | — | **Documented only** |
| Confirm each replacement suggestion before the report | No | — | **Documented only** |
| Data Quality & Coverage gate before AI scoring | No | `validatePortfolio` exists | **Documented only** (#17) |
| Persistent advisory disclaimer on every screen | Yes | `AdvisoryFooter` | **Implemented** |
| EULA acceptance (`analystConfig.accepted_eula`) before Session Start | No | `accepted_eula` is not in `initialState` | **Documented only** — deferred until lawyer-drafted text exists (CLAUDE.md, DECISIONS.md 2026-09-30, #14) |

---

## 11. Configuration

*Sources: `config.js`, `colors.js`, `fieldRequirements.js`, `AppContext` `initialState`, `.env.example`; pseudocode "Configuration Architecture"; CLAUDE.md "Configuration and Validation Rules".*

- **Fixed constants (`CONFIG`):**
  - `SESSION_MODE` (false)
  - `SUPPORTED_VERSIONS` (`['2.3']`)
  - `AI_MODEL`
  - `KEY_FORMAT_REGEX`
  - `DEV_TEST_KEY`
  - `LOADING_STATES`, `CONNECTION_STATUS`
  - `DISCLAIMERS.ADVISORY_FOOTER`
  - `FOOTER_HEIGHT`

  The pseudocode lists `KEY_FORMAT_REGEX`, `SUPPORTED_VERSIONS`, the permitted API fields and the Gartner disclaimer as never user-configurable. The last two don't exist in code yet. — *Implemented (partially)*
- **Field requirements:**
  - REQUIRED: `name`, `lifecycle_stage`, `support_status`.
  - RECOMMENDED: `vendor`, `annual_cost`, `active_user_count`, `incident_count_12mo`.

  There is no OPTIONAL tier in code (it was removed in commit `d27b24b`). — *Implemented*
- **Confidence definitions:** FULL ≥ 0.85, PARTIAL ≥ 0.65, LOW ≥ 0.00 (`CONFIDENCE_DEFINITION`). — *Implemented* (constants only)
- **Analyst settings:** defaults in `initialState.analystConfig`. They're meant to be stored in `analyst_config.json`, outside the engagement file (DECISIONS.md). The load/save bridge methods exist, but nothing calls them, and there is no settings UI (#1). — *Stubbed*
- **Engagement settings:** defaults in `initialState.engagementConfig`, including the four scoring weights at 0.25 each, which match the pseudocode "Engagement Settings" defaults. No UI, and no scorer reads them yet. — *Stubbed*
- **Session mode:** `sessionMode` is in state, but no persistence code exists for the CLAUDE.md "SESSION_MODE check before every data persistence operation" rule to apply to. — *Stubbed*
- **Theme:** color tokens in `colors.js`. Components reference tokens, with the exceptions noted in §14. — *Implemented*
- **Environment:** `VITE_SECRET_KEY` and optional `VITE_DEV_TEST_KEY` (`.env.example`), and `VITE_ANALYST_CONFIG`, read by `loadAnalystConfig`. — *Implemented*

---

## 12. Testing and CI/CD

*Sources: `package.json`, `vite.config.js` (`test` block), `src/test/setup.js`, `.github/workflows/ci.yml`, GitHub branch ruleset; DECISIONS.md 2026-09-28 (CI).*

- **Framework:** Vitest 4 with the jsdom environment, Testing Library (`react`, `user-event`, `jest-dom`), and global test APIs. Scripts: `npm test` (single run), `npm run test:watch`. — *Implemented*
- **What's covered:**
  - components: SessionStart and children, App routing and footer, AdvisoryFooter, ErrorBoundary
  - the full reducer
  - `ipcBridge` return shapes and `validateScoringResponse`
  - all utilities
  - constants (colors, config, field requirements, demo data)

  Tests sit next to the source files as `*.test.js(x)`. — *Implemented*
- **CI:** GitHub Actions workflow `CI`, job `Test and build`, runs on every push to `main` and every pull request. Ubuntu, Node 20, npm cache, then `npm ci`, `npm test`, `npm run build`. It uses no secrets and no `.env`. — *Implemented*
- **Branch protection:** a repository ruleset on `main`:
  - pull request required (0 approvals)
  - status check `Test and build` required, and strict (the branch must be up to date)
  - force pushes blocked
  - deletion blocked

  Behaviour verified on 2026-09-30 (PRs #20, #21). — *Implemented*
- **Not present:** linting (ESLint is in BACKLOG.md), coverage reporting, end-to-end/browser tests, and any deployment (CD). Phase 1a is local-only. BACKLOG.md holds the Phase 1b release workflow and Phase 2 web deploy items.

---

## 13. Known future architecture (documented only)

| Area | What is documented | Sources |
|---|---|---|
| **Electron wrapper (Phase 1b)** | `main.js` with a real `window.api` via `ipcMain` (HMAC key validation, file save, Claude calls, credentials via safeStorage); `preload.js` with `contextBridge`; hardened `webPreferences`; `base: './'` in Vite config; conditional dev/prod loading; standard window lifecycle; electron-builder packaging of the build output only; code signing; auto-update. `electron-vite` noted as a candidate build tool. | CLAUDE.md Phase 1b rules; pseudocode "Phase 1 — Final Definition" (Phase 1b, Session 10); #13; BACKLOG.md "Phase 1b" |
| **Engagement file** | `.portfolioiq` JSON with `metadata`, `source` (mapping), `applications` (scores, signals, decisions), `summary`; export with a one-time data-custody confirmation; import that restores decisions and mapping and checks the key; auto-save every 15 minutes with crash recovery | Pseudocode "Sprint 10"; CLAUDE.md "Engagement File Export", "Auto-Save"; Session 4 |
| **Key system and Platform Admin** | HMAC-signed keys carrying limits and feature flags; key generation screen for the platform administrator | Pseudocode "Sprint 11", "Sprint 12"; Session 8 |
| **AI pipeline** | Schema mapper, mapping review UI, scoring with breakdown, uncertainty flags, replacement suggestions, TIME classification; AI Analysis & Signals screen; Validation Queue; AI Portfolio Advisor | Pseudocode Sprints 1, 2, 6, 7, 8; CLAUDE.md AI sections; #8, #9, #17, #18, #19; Sessions 2–6 |
| **Reporting** | PDF report from a sanitized `buildReportData()` payload, with HITL disclaimers and a Gartner TIME disclaimer | CLAUDE.md "PDF Report", "HITL Rules"; #14; Session 7 |
| **Resilience** | Offline detection in `callClaude`, connection indicator | #7 |
| **Other backlog architecture** | Dependency mapping (#10), capability mapping (#11), client-blocked fields (#16), re-upload (#15), AES-256 files (#5) | Issues listed; BACKLOG.md |
| **Phase 2 SaaS** | Multi-tenant web app, Supabase, Stripe, tenant and platform admin, connectors | Pseudocode "Overview", "Sprint 9" |

Build sequence (pseudocode "Phase 1 — Final Definition"): Session 1 (done) → 2 AI Schema Mapper → 3 Mapping Review UI → 4 Engagement file → 5 Signals screen → 6 Validation Queue → 7 PDF → 8 Key generation → 9 End-to-end tests → 10 Electron build guide.

---

## 14. Documented conflicts and divergences

Recorded as found; not resolved here.

| Topic | Source A | Source B |
|---|---|---|
| Scoring dimensions and field names | `ipcBridge` stub, `validateScoringResponse` and `demoData` use three scores: `technical_debt_score`, `business_value_score`, `security_posture_score` | `engagementConfig.scoringWeights`, CLAUDE.md and the pseudocode "Engagement Settings" use four weight dimensions (technicalDebt, businessValue, securityRisk, cloudReadiness); #8 specifies `technical_debt`, `business_value`, `security_risk`, `cloud_readiness` objects with score, weight, contribution, label |
| Mapper sample size | Pseudocode "Sprint 1" and its config: 5 sample rows | CLAUDE.md "AI Schema Mapper": up to 3 sample values per column, ≤ 500 tokens total |
| Mapping output shape | Pseudocode `buildMappingPrompt`: `field_map`, `value_map`, `unmapped`, `critical_errors`, `confidence`, `coverage` | CLAUDE.md: `mappings[]` with per-column status, plus `unmappedColumns`, `unmappedRequiredFields`, `canProceedToScoring` (matches the `mapSchema` stub and reducer) |
| AI model id | Pseudocode "Updated Configuration": `claude-sonnet-4-5` | `CONFIG.AI_MODEL`, `analystConfig.aiModel` and the pseudocode "Analyst Settings": `claude-sonnet-4-6` |
| Override reason minimum | Pseudocode "Updated Configuration": `OVERRIDE_MIN_RATIONALE` 50 | CLAUDE.md "HITL Rules", pseudocode "Human-in-the-Loop Architecture", DECISIONS.md: 10 characters |
| Engagement file encryption timing | Pseudocode "Sprint 10": optional AES-256 in Phase 2 | #5 and BACKLOG.md: AES-256 in Phase 1b |
| Phase 1b implementer | CLAUDE.md "Architecture" and the pseudocode Phase 1b heading: a separate Electron developer | Pseudocode Session 10 text and #13: the project owner directing Claude Code |
| Field requirement tiers | Pseudocode "Field Requirements" still lists an OPTIONAL tier | `fieldRequirements.js` has REQUIRED and RECOMMENDED only (OPTIONAL removed in `d27b24b`) |
| Error shape | CLAUDE.md: all errors are `{ code, message, context }` | `ipcBridge.validateKey`, `callClaude`, `loadAnalystConfig`, `getCredential`, `saveAnalystConfig` and `keyValidation.validateKey` return plain strings; `validateScoringResponse` uses the object shape |
| Hardcoded values in components | CLAUDE.md: no hex colors in components; no hardcoded analyst, firm or contact information | `NewEngagement` and `ErrorBoundary` use `'#000'`; `SessionStart` shows a hardcoded company byline; `NewEngagement`'s expiry message names a specific contact person |
| Component style | CLAUDE.md "Rules": functional components only | `ErrorBoundary` is a class component |
| Gartner disclaimer | CLAUDE.md: include the disclaimer whenever the TIME framework is displayed | `QuickDemo` card text mentions "Gartner TIME quadrants"; no disclaimer text exists in `src/` |
| File locations | CLAUDE.md "File Structure": `AppContext.js`, `src/hooks/`, an `engagementFile` utility | `AppContext.jsx`; no `hooks/` folder; no `engagementFile` utility |
| Libraries | CLAUDE.md "Libraries": React 18, Recharts | Recharts not installed |

---

## 15. Source index

| Area | Files and documents |
|---|---|
| Entry and shell | `index.html`, `src/main.jsx`, `src/App.jsx`, `vite.config.js`, `package.json` |
| Screens | `src/components/SessionStart.jsx`, `src/components/SessionStart/*`, `DataUpload.jsx`, `ValidationQueueStub.jsx`, `DashboardStub.jsx`, `AdvisoryFooter.jsx`, `ErrorBoundary.jsx` |
| State | `src/context/AppContext.jsx` |
| Bridge and utilities | `src/utils/ipcBridge.js`, `keyValidation.js`, `validateAppData.js`, `validatePortfolio.js`, `validationSelectors.js`, `formatters.js` |
| Constants | `src/constants/config.js`, `colors.js`, `fieldRequirements.js`, `demoData.js` |
| Tests and CI | `src/**/*.test.js(x)`, `src/test/setup.js`, `.github/workflows/ci.yml` |
| Environment | `.env.example`, `.gitignore` |
| Project documentation | `CLAUDE.md`; `docs/PortfolioIQ_Standalone_Pseudocode.md` (v2.3); `docs/DECISIONS.md`; `docs/BACKLOG.md`; `docs/SESSION_PLANNING.md`; `docs/superpowers/specs/2026-06-05-session-start-key-validation-design.md` |
| Issue tracker | GitHub issues #1–#11, #13–#19 (open), PRs #20–#22 |
