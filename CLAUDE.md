# PortfolioIQ — Claude Code Instructions

## Product
PortfolioIQ is an AI-powered application portfolio rationalization tool.
Full technical specification: docs/PortfolioIQ_Standalone_Pseudocode.md v2.3
Always read the pseudocode before writing any code.

## Architecture
One React codebase, three deployment targets:
- Phase 1a: React running locally (npm start) — BUILD THIS NOW
- Phase 1b: Matt wraps in Electron
- Phase 2: Web SaaS at app.getportfolioiq.com

## Architecture — Thin Client Boundary
React (the renderer) contains NO business logic for AI scoring, prompt construction, or response validation. These functions — buildScoringPrompt(), buildMappingPrompt(), validateScoringResponse(), the rule-based pre-filter, retry/timeout/rate-limit logic — live behind the window.api IPC boundary, never in src/utils/ as renderer-callable functions. React calls window.api.scoreApplication(appData) and window.api.mapSchema(headers, samples) and receives a finished, validated result. It never constructs a prompt, never calls Claude directly, and never validates a raw AI response itself.

In Phase 1a, this logic lives in the mocked ipcBridge.js module (still technically JS Claude Code writes, but architecturally treated as 'backend' — not imported by any React component, only called via window.api). In Phase 1b, this same logic moves into the Electron main process with zero changes to any React component. In Phase 2, it can move again to a real backend service with zero changes to any React component. This is why the boundary exists: the client must stay thin enough to swap the entire backend implementation three times without touching React.

Rationale: per architecture review, business logic (scoring rules, prompt templates, validation rules, confidence thresholds) must never live in the renderer, because the renderer is the layer most likely to be rewritten if the front end ever changes. Only UI state, form handling, and display logic belong in React components and src/utils/.

## Phase 1b — Electron wrapper rules (apply when this phase begins)
- Vite config must include `base: './'` in vite.config.js before any Electron build — without this, images and assets silently fail to load in the packaged app even though they work fine in npm start.
- main.js must load the app conditionally: `app.isPackaged ? mainWindow.loadFile(path.join(__dirname, 'index.html')) : mainWindow.loadURL('http://localhost:5173')` — dev loads the Vite server, production loads the built file.
- main.js must implement standard cross-platform window lifecycle handling — quit the app on window-all-closed except on macOS (process.platform !== 'darwin'), and recreate the window on activate if no windows remain open. This matches standard Electron app behavior users expect on each OS.
- BrowserWindow webPreferences must keep `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`. Never disable these for convenience. This is non-negotiable per the security architecture already defined for window.api.
- All access to Node.js or Electron APIs from React components must go through the existing window.api pattern via a preload.js file using contextBridge — never via direct require() in renderer code.
- When packaging, only bundle the Vite build output directory, not the full source tree or node_modules — configure electron-builder's files option accordingly.
- No React Router is used in Phase 1a or Phase 1b per existing architecture rules, so HashRouter vs BrowserRouter does not apply. Document this only in case routing is added later.

## IPC Bridge (CRITICAL)
Every external call routes through window.api — never call fetch() 
or fs directly from React components:
- window.api.callClaude() — AI analysis
- window.api.saveFile() — write to disk
- window.api.validateKey() — HMAC key validation
- window.api.getCredential() — secure credential access
In development (npm start) these are mocked in src/utils/ipcBridge.js

## Styling
Inline styles only. No Tailwind, no CSS modules.
All colors from src/constants/colors.js — never hardcode hex in components.

## Rules
- No HTML form tags — use onClick and onChange only
- Functional components only — no class components
- Global state in src/context/AppContext.js
- Engagement file is source of truth — not Supabase, not localStorage
- Never write a hex color directly in a component
- All async operations return {data, error} shape
- SESSION_MODE check before every data persistence operation
- Never console.log portfolio application data
- Audit log entries are append-only — never mutate or delete them
- All errors must use shape: { code, message, context } — never a plain string
- Use LOADING_STATES constants from config.js — never hardcode loading/error strings
- All currency formatting via formatCurrency() — never format inline
- All date formatting via formatDate() — never format inline
- Always include Gartner disclaimer when TIME framework is displayed or exported: 'TIME is a registered trademark of Gartner. PortfolioIQ is not affiliated with or endorsed by Gartner.'
- The AI Portfolio Advisor must use a buildAdvisorContext() function that constructs a sanitized portfolio summary using only permitted fields. Raw engagement objects are never passed directly to the Claude API. Conversation history is capped at 10 turns.

## Data Handling Rules for AI Touchpoints

### PDF Report
- The PDF renderer must only pull from a defined display field set — never pass the raw engagement state or full application objects to the PDF generator
- A buildReportData() function constructs the sanitized payload (implemented in Session 7)

### AI Schema Mapper
- When mapping CSV columns, the schema mapper (inside window.api.mapSchema(), not in the renderer) must only send column headers and up to 3 sample values per column to the Claude API — never send full column data
- The schema mapper prompt must never include more than 500 tokens of sample data total
- The schema mapper must return a PROPOSED mapping only — never an applied mapping
- Proposed mapping shape:
  ```js
  {
    mappings: [
      {
        sourceColumn: 'App Name',
        targetField: 'name',
        confidence: 0.95,
        aiReasoning: 'Exact match on common field name',
        status: 'PROPOSED' | 'CONFIRMED' | 'CORRECTED' | 'UNMAPPED',
        analystOverride: null | string,
      }
    ],
    unmappedColumns: [],
    unmappedRequiredFields: [],
    canProceedToScoring: boolean,
  }
  ```
- canProceedToScoring is false until every REQUIRED field mapping has status CONFIRMED or CORRECTED — never PROPOSED
- Scoring never starts until Jan explicitly clicks Approve Mapping
- Corrected mappings are logged to aiCallLog with action: 'MAPPING_CORRECTED'
- MAPPING_REVIEW is a screen in App.jsx SCREENS map
- mappingProposal: null in AppContext initialState
- Reducer actions: SET_MAPPING_PROPOSAL, CONFIRM_MAPPING, CORRECT_MAPPING, APPROVE_MAPPING

### AI Provider Abstraction
- All AI scoring calls must route through src/utils/aiProvider.js — never call the Anthropic API directly from components or ipcBridge
- Session 2 creates this utility with Anthropic as the only provider. Phase 2 adds OpenAI and Azure OpenAI adapters.
- Every provider adapter must return the identical response shape: { disposition, scoring_breakdown, uncertainty_flags, replacement_suggestions, time_classification, confidence, ai_reasoning }
- Provider is set in analystConfig.aiModel and can be overridden per engagement in engagementConfig

### AI Scoring
- The scoring prompt constructor (inside window.api.scoreApplication(), not in the renderer) must request a structured scoring_breakdown object — never free text scores
- The scoring prompt constructor must request structured uncertainty flags — data_conflicts, unusual_vendor, low_data_quality, low_confidence_reason, requires_human_review
- The scoring prompt constructor must request replacement_suggestions for Retire and Modernize dispositions only — empty array for Retain
- Claude API responses must be parsed and validated (via validateScoringResponse()) before being stored in the engagement file — never store a raw, unvalidated AI response
- Apps with requires_human_review: true must be visually flagged in the HITL validation queue
- replacement_suggestions are never auto-included in the report — Jan must confirm each one before report generation
- The replacement suggestion disclaimer must appear wherever suggestions are displayed: 'Replacement suggestions are AI-generated based on general market knowledge as of [analysis date]. They do not constitute a vendor recommendation or endorsement. Independent vendor evaluation is recommended before presenting options to clients.'
- Never suggest a specific vendor pricing or current support status — Claude's knowledge may be outdated

### Engagement File Export
- When Jan exports a .portfolioiq file, display a one-time confirmation: 'This file contains client portfolio data. Store and share it securely.'
- Log the export event to aiCallLog with action: 'ENGAGEMENT_EXPORT'

### Error Sanitization
- Before any error is logged or reported externally, strip all application names, vendor names, cost figures, and user counts from the error context
- Errors may include screen name, action type, and error code only

### Auto-Save
- The auto-save confirmation toast must include: 'Saved locally — this file contains client data.'
- Auto-save events are logged to aiCallLog with action: 'AUTO_SAVE'

## Legal Protection Rules

- Every screen must display a persistent advisory disclaimer in the footer: 'AI outputs are recommendations only — analyst validation required before client delivery.' Use TEXT_FAINT color. Never dismissible.
- The EULA must be accepted (accepted_eula: true in analystConfig) before Session Start renders. If not accepted, show EULA screen instead.
- The Accept action in the Validation Queue must render inline text before the action completes: 'By accepting, you confirm this recommendation reflects your professional judgment.' Not a blocking popup — inline only.

## Human-in-the-Loop (HITL) Rules

- Every AI disposition is a RECOMMENDATION, never a DECISION
- Validation states: PENDING, ACCEPTED, OVERRIDDEN, ESCALATED, EXCLUDED
- PENDING apps cannot appear in the PDF report — export is locked until 100% of apps are validated
- Override requires a reason (minimum 10 characters) — non-negotiable
- PDF report shows AI recommendation AND analyst decision where they differ, with override reason
- Executive summary must include: 'All recommendations have been reviewed and validated by [analystName]. This report is advisory only. Client decisions remain the sole responsibility of the client organization.'
- Dashboard must show HITL progress indicator: X of Y apps validated
- Demo mode apps are pre-validated (status ACCEPTED, validatedBy 'demo') — exempt from HITL requirement

## Coding Rules

- Every new screen component must use only useApp() for state — no prop drilling beyond one level
- Every new utility must be a pure function with no React dependencies
- Every new constant belongs in colors.js or config.js — never defined inline in a component
- No magic numbers anywhere — every numeric constant gets a named export in config.js
- Never hardcode analyst names, firm names, or contact information in any component, utility, or constant. All analyst identity references must come from analystConfig.analystName and analystConfig.firmName.

## Configuration and Validation Rules

- Scoring weights come from engagementConfig.scoringWeights — never hardcoded in the scorer
- AI model comes from analystConfig.aiModel — never hardcoded in API calls
- Every app must be run through validateAppData() before being sent to the Claude API
- Unscorable apps are never sent to the Claude API — they are flagged with status UNSCORABLE and explanation
- Partial apps are sent with a reduced field set and the prompt must acknowledge missing fields
- The dashboard and PDF report must show three groups: Fully Scored, Partially Scored, Unscorable
- Analyst config is stored in analyst_config.json — never inside the engagement file
- Scoring weights are never user-configurable from the UI beyond the six approved dimensions
- The following are never user-configurable: KEY_FORMAT_REGEX, SUPPORTED_VERSIONS, permitted API fields, Gartner disclaimer

### Resume Engagement Error Handling
- If .portfolioiq file import fails validation, the error logged must not include file contents
- Error context may only include: filename, file size, portfolioiq_version found, and error code

## File Structure
src/
  components/    — React screens
  utils/         — pure functions (ipcBridge, engagementFile, keyValidation)
  constants/     — colors.js, config.js
  context/       — AppContext.js
  hooks/         — custom React hooks

## Libraries
React 18, Recharts. No new npm packages without asking first.

## Key Format
PIQ-XXXX-XXXX-XXXX-XXXX-XXXX (HMAC-SHA256 signed, base64url encoded)
SECRET_KEY in .env for Phase 1a, Electron main process for Phase 1b

## Scoring Weights
Authoritative weights in pseudocode v2.3. Do not invent weights.

## Product Management
- Check docs/SESSION_PLANNING.md at the start of every session
- Check open GitHub Issues before writing any code
- Add an entry to docs/DECISIONS.md for every significant decision not covered by the pseudocode
- Add ideas that are out of scope to docs/BACKLOG.md instead of implementing them
- Close GitHub Issues with commit references when resolved
- Never implement a backlog item mid-session without explicit instruction

## When Uncertain
Stop and ask before writing code.

## Commits
Commit after each significant build: [Sprint N] Description