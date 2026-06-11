# PortfolioIQ — Product Backlog
Ideas and enhancements not in the current build scope.
Add items here instead of implementing mid-session.
Review before each new session to see if priorities have changed.

---

## High Priority (next 1-3 sessions)
- [ ] **Legal — get a lawyer to draft the EULA before Jan runs her first real engagement.** Key clauses: AI advisory limitation, data accuracy disclaimer, scope limitation, analyst professional responsibility, limitation of liability.
- [ ] Configuration screen UI — analyst name, firm, currency, auto-save settings
- [ ] In-app feedback button — captures current screen and sanitized state, emails Ken
- [ ] Data collection Excel template — standard template Jan gives clients before engagement
- [ ] Pre-engagement checklist — what data Jan should request and from whom
- [ ] Offline mode and connection resilience — detect network unavailability in ipcBridge.callClaude(), add CONNECTION_STATUS indicator, ensure all non-AI screens work fully offline (GitHub Issue #7)
- [ ] Scoring breakdown per application — structured scoring_breakdown object required from Claude in Session 2; cannot be retrofitted later (GitHub Issue #8)
- [ ] AI uncertainty flags — structured uncertainty_flags required from Claude in Session 2; requires_human_review drives HITL flagging (GitHub Issue #9)
- [ ] Re-upload data after initial load — Re-upload Data button from sidebar/Dashboard; re-runs schema mapper without losing validations; warns Jan if validated fields change (reset to PENDING); confirm if new file has fewer apps; RE_UPLOAD_DATA reducer action (GitHub Issue #15, Session 2)
- [ ] Admin-configurable blocked fields per engagement — platform-level global blocks (Ken) + engagement-level client-specific blocks (Jan); excluded from buildScoringPrompt(); logged to audit trail with action: FIELD_BLOCKED; stored in engagementConfig.clientBlockedFields (GitHub Issue #16, Session 3–4)
- [ ] Data Quality & Coverage screen — between Mapping Review and AI Scoring; three groups: Fully Scorable / Partially Scorable / Unscorable; coverage table; HITL gate before AI Scoring; uses existing validatePortfolio(); add SHOW_DATA_QUALITY to SCREENS map (GitHub Issue #17, Session 2)
- [ ] COTS replacement suggestions for Retire and Modernize dispositions — must be in buildScoringPrompt() from Session 2; replacement_suggestions array in scoring response; Jan confirms each before PDF; disclaimer required on every display; never include pricing or support status (GitHub Issue #18, Session 2)

## Medium Priority (Phase 1b)
- [ ] **AI provider abstraction layer** — src/utils/aiProvider.js routes all AI calls; normalised response shape across providers; Phase 1a Anthropic only; Phase 2 adds OpenAI + Azure OpenAI; provider set in analystConfig.aiModel, overridable per engagement (GitHub Issue #19, design Session 2)
- [ ] **Legal protection layer — disclaimers and EULA** — EULA screen (Session 1 pre-session prep), persistent footer disclaimer (all screens), inline validation confirmation (Session 6), strengthened report disclaimer + scope limitation (Session 7), mapping approval data accuracy statement; see GitHub Issue #14
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
