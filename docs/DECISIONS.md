# PortfolioIQ — Product Decision Log
All significant architectural and product decisions are recorded here.
Claude Code adds an entry whenever it makes a decision not explicitly covered by the pseudocode.
Format: [Date] | Decision | Reasoning | Alternatives Considered

---

## Architecture

| Date | Decision | Reasoning | Alternatives |
|------|----------|-----------|--------------|
| 2026-06-05 | Vite + React 18 over CRA | CRA deprecated, Vite faster | CRA, manual webpack |
| 2026-06-05 | No React Router in Phase 1a | Simpler, maps cleanly to Electron | React Router, Wouter |
| 2026-06-05 | AppContext reducer over useState | Predictable state, easy to test | useState, Zustand, Redux |
| 2026-06-05 | Inline styles over Tailwind | Electron compatibility, no build step | Tailwind, CSS modules |
| 2026-06-05 | ipcBridge mock for Phase 1a | Enables dev without Electron | Direct fetch calls |

## Security & Privacy

| Date | Decision | Reasoning | Alternatives |
|------|----------|-----------|--------------|
| 2026-06-05 | Skip HMAC in Phase 1a | Secret key belongs in Electron main process | Client-side HMAC |
| 2026-06-05 | Skip email check in Phase 1a | No auth system in npm start | Config file email |
| 2026-06-05 | Permitted fields list in ipcBridge | Enforces data minimization at source | Per-call field filtering |
| 2026-06-05 | Append-only audit log | SOC 2 readiness, trust signal | Mutable log |

## Product

| Date | Decision | Reasoning | Alternatives |
|------|----------|-----------|--------------|
| 2026-06-05 | HITL validation required before export | Advisory tool, not decision engine | Auto-approve with override |
| 2026-06-05 | Five validation states | Covers all analyst actions | Binary accept/reject |
| 2026-06-05 | Override requires 10-char reason | Audit trail, forces reflection | Optional reason |
| 2026-06-05 | Three-tier field requirements | Clear UX for partial data | Binary required/optional |
| 2026-06-05 | Scoring weights from engagementConfig | Flexibility without breaking model | Hardcoded weights |
| 2026-06-05 | Analyst config separate from engagement file | Personal prefs should not travel with client data | Single config file |
| 2026-06-05 | GitHub Issues over Linear | GitHub MCP integration, zero extra tools | Linear, Notion |
