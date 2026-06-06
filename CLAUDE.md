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
- When mapping CSV columns, only send column headers and up to 3 sample values per column to the Claude API — never send full column data
- The schema mapper prompt must never include more than 500 tokens of sample data total

### Engagement File Export
- When Jan exports a .portfolioiq file, display a one-time confirmation: 'This file contains client portfolio data. Store and share it securely.'
- Log the export event to aiCallLog with action: 'ENGAGEMENT_EXPORT'

### Error Sanitization
- Before any error is logged or reported externally, strip all application names, vendor names, cost figures, and user counts from the error context
- Errors may include screen name, action type, and error code only

### Auto-Save
- The auto-save confirmation toast must include: 'Saved locally — this file contains client data.'
- Auto-save events are logged to aiCallLog with action: 'AUTO_SAVE'

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

## When Uncertain
Stop and ask before writing code.

## Commits
Commit after each significant build: [Sprint N] Description