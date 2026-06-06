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