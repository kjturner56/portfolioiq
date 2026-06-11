# PortfolioIQ — Product Backlog
Ideas and enhancements not in the current build scope.
Add items here instead of implementing mid-session.
Review before each new session to see if priorities have changed.

---

## High Priority (next 1-3 sessions)
- [ ] Configuration screen UI — analyst name, firm, currency, auto-save settings
- [ ] In-app feedback button — captures current screen and sanitized state, emails Ken
- [ ] Data collection Excel template — standard template Jan gives clients before engagement
- [ ] Pre-engagement checklist — what data Jan should request and from whom
- [ ] Offline mode and connection resilience — detect network unavailability in ipcBridge.callClaude(), add CONNECTION_STATUS indicator, ensure all non-AI screens work fully offline (GitHub Issue #7)
- [ ] Scoring breakdown per application — structured scoring_breakdown object required from Claude in Session 2; cannot be retrofitted later (GitHub Issue #8)
- [ ] AI uncertainty flags — structured uncertainty_flags required from Claude in Session 2; requires_human_review drives HITL flagging (GitHub Issue #9)

## Medium Priority (Phase 1b)
- [ ] **Phase 1b — Electron wrapper (self-implementation)** — Ken implements independently using Claude Code; main.js + packaging config only, React unchanged; see GitHub Issue #13 for full task checklist (est. 2–3 sessions)
- [ ] Dependency mapping between applications — directed app-A depends-on app-B; retirement recommendations flag dependency risks; Session 4 data model, Session 5 display (GitHub Issue #10)
- [ ] Business capability mapping — capability_tags per app (HR, Finance, Operations, Sales, IT, Legal); enables over-investment analysis; Session 3 data entry, Session 5 heat map (GitHub Issue #11)
- [ ] AES-256 encryption for .portfolioiq files
- [ ] Full HMAC key validation in Electron main process
- [ ] issued_to email check against Electron credential store
- [ ] Dev test key rotation before Phase 1b distribution
- [ ] Auto-save to disk via Electron fs module

## Low Priority (Phase 2+)
- [ ] SSO/SAML authentication via Clerk or Auth0
- [ ] Supabase region selection for EU clients
- [ ] Penetration test
- [ ] SOC 2 readiness assessment
- [ ] Vendor security questionnaire for Anthropic API
- [ ] Jan training program
- [ ] Pricing page and terms of service
- [ ] Data Processing Agreement template

## Ideas (unscoped)
- [ ] Direct-to-IT-Director sales channel (bypasses Jan as partner)
- [ ] Multi-engagement support (Jan working two clients simultaneously)
- [ ] Mobile view for executive summary
- [ ] Slack integration for engagement updates
- [ ] Benchmark database — how does this portfolio compare to industry averages
