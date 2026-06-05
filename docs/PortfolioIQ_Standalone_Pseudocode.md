# PortfolioIQ — Standalone Product Pseudocode
## AI-Powered Application Portfolio Rationalization
### Ken Turner | June 2026
### Version 2.3 — Electron Architecture, Engagement File, Key System, API Connectors

---

## OVERVIEW

```
CURRENT STATE (June 2026):
  Proof of concept web app live at app.getportfolioiq.com
  React 18, inline styles (NOT Tailwind), Supabase, Vercel
  15 applications analyzed, Nexus Global Solutions demo tenant
  ServiceNow connector + CSV upload working
  Advisor.js built, not yet wired into App.js
  This is the PHASE 2 SaaS foundation — NOT Phase 1

PHASE 1 TARGET:
  Electron desktop app running on Jan's laptop
  Data never leaves Jan's machine
  Only external call: Claude API for AI analysis
  Engagement file (.portfolioiq) = persistence layer
  Engagement keys = Ken controls every engagement

DEPLOYMENT TARGETS:
  Phase 1 — Electron Desktop App (Jan's delivery tool)
    Runs on Jan's Windows or Mac laptop
    Phase 1a: React app built by Ken + Claude (npm start locally)
    Phase 1b: Matt wraps in Electron, code signs, distributes to Jan

  Phase 2 — Web SaaS (app.getportfolioiq.com)
    Paying subscribers, Supabase persistence, Stripe billing
    Same React codebase as Electron — different deployment

THE FOUR LAYERS:

LAYER 1 — DATA INGESTION
  Source: CSV, Excel, Freshservice API, Jira API,
          ServiceNow API, Generic REST API
    → AI Schema Mapper (Claude analyzes any column structure)
    → Mapping Review (human confirms, 30 seconds)
    → Universal Schema (normalized, ready for analysis)

  Phase 1 connector priority:
    1. CSV/Excel (already built — primary fallback)
    2. Freshservice (most common mid-market ITSM)
    3. Jira Service Management (common in PE-backed tech)
    4. Generic REST API (AI mapper handles any response)
    5. ServiceNow (working connector + PDI already exist)
    6. ManageEngine (Phase 2)

LAYER 2 — AI ANALYSIS ENGINE
  Universal Schema
    → AI Scoring: Technical Debt (0-100), Business Value (0-100),
                  Security Posture (0-100)
    → Gartner TIME Classification (Tolerate/Invest/Migrate/Eliminate)
    → Business Capability Mapping (blast radius analysis)
    → Signals Audit Trail (every point traceable to source data)
    → Full AI reasoning per application

LAYER 3 — GOVERNANCE
  Recommendations
    → Human Override Workflow (Accept/Override/Escalate)
    → Validation Queue with live pending badge
    → Decision Audit Log (who decided what, when, why)
    → Review Cadence (quarterly cycles — Phase 2)

LAYER 4 — PRESENTATION
  Findings
    → React Dashboard (KPIs, TIME chart, sortable table)
    → AI Analysis & Signals Screen (per-app signal breakdown)
    → Validation Queue Screen
    → AI Portfolio Advisor (conversational Q&A)
    → Scoring Methodology Screen
    → PDF Report (board-ready client deliverable)
    → Admin Section (Tenant Admin + Platform Admin)
```

---

## GAP 1: GARTNER TIME MODEL ALIGNMENT
### Industry standard framework — Tolerate, Invest, Migrate, Eliminate

```
PURPOSE:
  The Gartner TIME model is the industry standard for APM rationalization.
  IT Directors and CIOs recognize TIME immediately. PortfolioIQ must
  map its dispositions to TIME to be credible in enterprise conversations.

MAPPING — PortfolioIQ disposition → Gartner TIME:

  Retain    → Tolerate (low business value, good technical fit) OR
              Invest   (high business value, good technical fit)
  Modernize → Migrate  (high business value, poor technical fit)
  Retire    → Eliminate (low business value, poor technical fit)
  Replace   → Migrate  (high business value, poor technical fit) OR
              Eliminate (low business value, poor technical fit)

TIME QUADRANT LOGIC:

  FUNCTION classifyTIME(application):

    businessValue  = application.business_value_score   # 0-100
    technicalFit   = 100 - application.technical_debt_score  # invert debt

    IF businessValue >= 50 AND technicalFit >= 50:
      time_classification = "Invest"
      time_description    = "High value, good technical fit. Retain and enhance."

    ELSE IF businessValue >= 50 AND technicalFit < 50:
      time_classification = "Migrate"
      time_description    = "High value, poor technical fit. Modernize or replace."

    ELSE IF businessValue < 50 AND technicalFit >= 50:
      time_classification = "Tolerate"
      time_description    = "Lower value, acceptable technical fit. Tolerate until migration window."

    ELSE:  # businessValue < 50 AND technicalFit < 50
      time_classification = "Eliminate"
      time_description    = "Low value, poor technical fit. Candidate for retirement."

    RETURN {
      time_classification: time_classification,
      time_description:    time_description,
      portfolioiq_disposition: application.ai_disposition,
      business_value_score:    businessValue,
      technical_fit_score:     technicalFit,
    }


DISPLAY IN DASHBOARD:
  For each application show BOTH:
    - PortfolioIQ disposition: [Retain | Modernize | Retire | Replace]
    - Gartner TIME:            [Tolerate | Invest | Migrate | Eliminate]

  TIME QUADRANT CHART:
    X-axis: Business Value (0-100)
    Y-axis: Technical Fit (0-100)
    Each application plotted as a bubble (size = annual cost)
    Colored by TIME quadrant:
      Invest    = emerald green
      Migrate   = blue
      Tolerate  = amber
      Eliminate = red
    This is the standard APM executive visualization — clients recognize it immediately


AI SCORING PROMPT UPDATE:
  Add to buildScoringPrompt():

  "Also classify this application using the Gartner TIME framework:
   - Tolerate: lower business value, acceptable technical quality
   - Invest: high business value, good technical quality
   - Migrate: high business value, poor technical quality
   - Eliminate: low business value, poor technical quality
   Return time_classification as one of: Tolerate, Invest, Migrate, Eliminate"
```

---

## GAP 2: SCORING METHODOLOGY TRANSPARENCY
### Clients must understand HOW scores are calculated

```
PURPOSE:
  Enterprise clients — especially PE-backed with board accountability —
  will not trust AI scores they cannot explain. Every score must have
  a visible, documented methodology.

TECHNICAL DEBT SCORE (0-100) — METHODOLOGY:

  FUNCTION calculateTechnicalDebtScore(application):

    score = 0
    signals = {}

    # Lifecycle signals (max 30 points)
    IF application.lifecycle_stage == "End of Life":
      score += 30; signals["lifecycle"] = "End of Life (+30)"
    ELSE IF application.lifecycle_stage == "Aging":
      score += 15; signals["lifecycle"] = "Aging (+15)"
    ELSE IF application.lifecycle_stage == "Retired":
      score += 25; signals["lifecycle"] = "Retired (+25)"
    ELSE:
      score += 0;  signals["lifecycle"] = "Current (+0)"

    # Support status signals (max 25 points)
    IF application.support_status == "End of Life":
      score += 25; signals["support"] = "End of Life (+25)"
    ELSE IF application.support_status == "End of Extended Support":
      score += 15; signals["support"] = "End of Extended Support (+15)"
    ELSE IF application.support_status == "Unsupported":
      score += 20; signals["support"] = "Unsupported (+20)"
    ELSE:
      score += 0;  signals["support"] = "In Support (+0)"

    # Incident signals (max 20 points)
    recentIncidents = countIncidents(application.id, months=12)
    IF recentIncidents > 20:
      score += 20; signals["incidents"] = f"{recentIncidents} incidents/12mo (+20)"
    ELSE IF recentIncidents > 10:
      score += 12; signals["incidents"] = f"{recentIncidents} incidents/12mo (+12)"
    ELSE IF recentIncidents > 5:
      score += 6;  signals["incidents"] = f"{recentIncidents} incidents/12mo (+6)"

    # Duplicate functionality (max 15 points)
    IF application.duplicate_functionality:
      score += 15; signals["duplicate"] = "Duplicate functionality exists (+15)"

    # Infrastructure EOL (max 10 points)
    IF hasEOLInfrastructure(application.id):
      score += 10; signals["infrastructure"] = "Running on EOL infrastructure (+10)"

    RETURN {
      score:   min(score, 100),
      signals: signals,
      max_possible: 100
    }


BUSINESS VALUE SCORE (0-100) — METHODOLOGY:

  FUNCTION calculateBusinessValueScore(application):

    score = 0
    signals = {}

    # User count (max 30 points)
    IF application.active_user_count > 500:
      score += 30; signals["users"] = f"{application.active_user_count} users (+30)"
    ELSE IF application.active_user_count > 100:
      score += 20; signals["users"] = f"{application.active_user_count} users (+20)"
    ELSE IF application.active_user_count > 25:
      score += 10; signals["users"] = f"{application.active_user_count} users (+10)"

    # Business criticality via service dependencies (max 30 points)
    criticalServices = countCriticalServiceDependencies(application.id)
    IF criticalServices > 3:
      score += 30; signals["services"] = f"Supports {criticalServices} critical services (+30)"
    ELSE IF criticalServices > 1:
      score += 20; signals["services"] = f"Supports {criticalServices} critical services (+20)"
    ELSE IF criticalServices == 1:
      score += 10; signals["services"] = "Supports 1 critical service (+10)"

    # Annual cost investment (max 20 points — high investment = high value assumption)
    IF application.annual_cost > 500000:
      score += 20; signals["cost"] = f"${application.annual_cost:,}/yr (+20)"
    ELSE IF application.annual_cost > 100000:
      score += 12; signals["cost"] = f"${application.annual_cost:,}/yr (+12)"
    ELSE IF application.annual_cost > 25000:
      score += 6;  signals["cost"] = f"${application.annual_cost:,}/yr (+6)"

    # No replacement candidate (max 20 points)
    IF NOT application.replacement_candidate_exists:
      score += 20; signals["replacement"] = "No replacement identified (+20)"

    RETURN {
      score:   min(score, 100),
      signals: signals,
      max_possible: 100
    }


SCORING METHODOLOGY SCREEN:

  SCREEN ScoringMethodology:

    DISPLAY header: "How PortfolioIQ Calculates Scores"
    DISPLAY subtext: "All scores are calculated from your actual CMDB data.
                      No black box — every point is traceable to a data signal."

    SECTION "Technical Debt Score (0-100)":
      TABLE:
        Signal                    | Max Points | How It's Measured
        Lifecycle Stage           | 30         | End of Life=30, Aging=15, Retired=25, Current=0
        Support Status            | 25         | End of Life=25, End of Extended=15, Unsupported=20
        Incident Volume (12mo)    | 20         | >20 incidents=20, >10=12, >5=6
        Duplicate Functionality   | 15         | Duplicate exists=15
        EOL Infrastructure        | 10         | Running on EOL server or OS=10
        TOTAL POSSIBLE            | 100

    SECTION "Business Value Score (0-100)":
      TABLE:
        Signal                    | Max Points | How It's Measured
        Active User Count         | 30         | >500=30, >100=20, >25=10
        Critical Service Support  | 30         | >3 services=30, >1=20, 1=10
        Annual Cost Investment    | 20         | >$500K=20, >$100K=12, >$25K=6
        No Replacement Exists     | 20         | No replacement identified=20
        TOTAL POSSIBLE            | 100

    SECTION "Security Posture Score (0-100)":
      # See Gap 3 below

    SECTION "Gartner TIME Classification":
      DISPLAY 2x2 quadrant diagram:
        X-axis: Business Value | Y-axis: Technical Fit
        Quadrants: Invest | Migrate | Tolerate | Eliminate

    FOR each application IN portfolio:
      DISPLAY expandable row:
        App name → score → [View signal breakdown]
        ON expand: show each signal and its point contribution
```

---

## GAP 3: SECURITY POSTURE SCORING
### Third scoring dimension — required for PE-backed enterprise clients

```
PURPOSE:
  Security posture is a required scoring dimension for enterprise APM.
  PE-backed companies under board scrutiny need to see security risk
  quantified alongside technical debt and business value.

SECURITY POSTURE SCORE (0-100) — METHODOLOGY:
  Higher score = higher security risk (consistent with technical debt scoring)

  FUNCTION calculateSecurityPostureScore(application):

    score = 0
    signals = {}

    # Data classification risk (max 30 points)
    IF application.data_classification == "Restricted":
      score += 10; signals["data"] = "Restricted data classification (+10)"
    ELSE IF application.data_classification == "Confidential":
      score += 5;  signals["data"] = "Confidential data classification (+5)"

    # EOL software risk (max 30 points)
    IF application.support_status IN ["End of Life", "Unsupported"]:
      score += 30; signals["eol"] = "Unsupported/EOL software — no security patches (+30)"
    ELSE IF application.support_status == "End of Extended Support":
      score += 15; signals["eol"] = "End of extended support — reduced patch coverage (+15)"

    # EOL infrastructure risk (max 20 points)
    eolInfra = getEOLInfrastructure(application.id)
    IF eolInfra.count > 0:
      score += 20
      signals["infra"] = f"Running on {eolInfra.count} EOL server(s)/OS(es) (+20)"

    # Emergency change volume — proxy for instability (max 20 points)
    emergencyChanges = countEmergencyChanges(application.id, months=12)
    IF emergencyChanges > 10:
      score += 20; signals["changes"] = f"{emergencyChanges} emergency changes/12mo (+20)"
    ELSE IF emergencyChanges > 5:
      score += 10; signals["changes"] = f"{emergencyChanges} emergency changes/12mo (+10)"

    # No named owner — governance risk (max 10 points)
    IF NOT application.application_owner:
      score += 10; signals["owner"] = "No application owner assigned (+10)"

    RETURN {
      score:   min(score, 100),
      signals: signals,
      risk_level: "High" if score >= 70 else "Medium" if score >= 40 else "Low"
    }


SCHEMA ADDITIONS FOR SECURITY POSTURE:

  ADD to applications table:
    application_owner       TEXT    # Named owner/accountable role
    last_security_review    DATE    # Date of last security assessment
    vulnerability_count     INTEGER # Known open vulnerabilities
    patch_compliance_pct    INTEGER # 0-100, % of patches applied
    security_posture_score  INTEGER # 0-100, calculated

  ADD to infrastructure table:
    os_eol_date             DATE    # OS end of life date
    patch_status            TEXT    # Current / Patched / Behind / EOL
    encryption_at_rest      BOOLEAN
    encryption_in_transit   BOOLEAN


DASHBOARD UPDATES:

  ADD to KPI cards:
    "High Security Risk" — count of apps with security_posture_score >= 70

  ADD to application table columns:
    Security Risk column: Low / Medium / High badge

  ADD to application detail drawer:
    Security Posture section:
      Score: {score}/100 ({risk_level} Risk)
      Signal breakdown: each signal and its contribution
      Last security review: {date or "Never reviewed"}
      Patch compliance: {pct}%
      Application owner: {owner or "Unassigned — governance gap"}


AI SCORING PROMPT UPDATE:
  Add to buildScoringPrompt():

  "Also assess the security posture of this application.
   Consider:
   - Data classification (Restricted/Confidential = higher risk)
   - Support status (EOL/Unsupported = no security patches)
   - EOL infrastructure signals
   - Emergency change frequency (proxy for instability)
   - Whether an application owner is named
   Return security_risk as: Low, Medium, or High
   Return security_reasoning as 1-2 sentences explaining the key risk factors."
```

---

## GAP 4: BUSINESS CAPABILITY MAPPING
### Applications must be linked to business capabilities for blast radius analysis

```
PURPOSE:
  Without capability mapping, you cannot answer: "If we retire LegacyPayroll,
  which business capability loses coverage?" This is required for defensible
  rationalization decisions and is a core Gartner APM requirement.

BUSINESS CAPABILITY MODEL:

  capabilities table (already in schema — needs to be wired into scoring):
    id                UUID
    tenant_id         UUID
    name              TEXT    # e.g. "Payroll Processing", "Financial Reporting"
    description       TEXT
    business_domain   TEXT    # e.g. "Finance", "HR", "Supply Chain", "IT"
    criticality       TEXT    # Critical / High / Medium / Low
    parent_id         UUID    # For hierarchical capability model
    application_count INTEGER # How many apps support this capability


CAPABILITY MAPPING WORKFLOW:

  STEP 1 — Import or build capability model:
    OPTION A: Import from source system (LeanIX exports BCM natively)
    OPTION B: AI-generated capability model from application names
    OPTION C: Manual entry via simple form

  STEP 2 — Map applications to capabilities:
    FOR each application IN portfolio:
      SUGGEST capabilities based on:
        - Application name (e.g. "Payroll" → "Payroll Processing")
        - Application category
        - AI analysis
      HUMAN confirms or adjusts mapping
      STORE in relationships table: app_id → capability_id

  STEP 3 — Surface in scoring and blast radius:
    IF application supports a "Critical" capability AND
       application.ai_disposition IN ["Retire", "Eliminate"]:
       ADD warning: "This application supports a Critical business capability.
                     Retirement will impact: {capability.name}"


BLAST RADIUS ANALYSIS:

  FUNCTION analyzeBlastRadius(application_id):

    # Find all capabilities this application supports
    capabilities = getCapabilities(application_id)

    # Find other applications that support the same capabilities
    FOR each capability IN capabilities:
      otherApps = getOtherApplications(capability.id, exclude=application_id)
      IF otherApps is empty:
        capability.coverage_gap = TRUE   # retiring this app leaves capability uncovered
        capability.risk = "CRITICAL"
      ELSE:
        capability.coverage_gap = FALSE
        capability.backup_apps = otherApps

    # Find dependent services
    services = getDependentServices(application_id)

    # Find dependent infrastructure
    infrastructure = getDependentInfrastructure(application_id)

    RETURN {
      capabilities:       capabilities,
      coverage_gaps:      [c for c in capabilities if c.coverage_gap],
      dependent_services: services,
      infrastructure:     infrastructure,
      blast_radius_score: calculateBlastRadiusScore(capabilities, services)
    }


CAPABILITY COVERAGE DASHBOARD:

  SCREEN CapabilityMap:

    DISPLAY header: "Business Capability Coverage"
    DISPLAY subtext: "Applications mapped to business capabilities.
                      Red = capability at risk if recommended retirements proceed."

    FOR each business_domain IN ["Finance", "HR", "Supply Chain", "IT", "Operations"]:
      SECTION {business_domain}:
        FOR each capability IN domain.capabilities:
          ROW:
            capability.name
            application_count: {n} apps support this
            risk_indicator:
              IF any supporting app is "Retire" or "Eliminate":
                SHOW red warning: "At risk — {app_name} recommended for retirement"
              ELSE:
                SHOW green: "Covered"

    DISPLAY retirement impact summary:
      "If all recommended retirements proceed:
       - {n} capabilities will lose coverage
       - {n} capabilities will have reduced coverage
       - {n} capabilities will be unaffected"


AI SCORING PROMPT UPDATE:
  Add to buildScoringPrompt():

  "Also assess the business capability impact of this application.
   List the primary business capabilities this application supports
   based on its name, category, and description.
   Return capability_areas as a list of capability names (e.g. ['Payroll Processing',
   'Time & Attendance', 'Benefits Administration']).
   Return capability_risk as: Critical, High, Medium, or Low — based on how essential
   these capabilities are to business operations."
```

---

## GAP 5: REVIEW CADENCE AND GOVERNANCE WORKFLOW
### Scheduled review cycles and human decision management

```
PURPOSE:
  APM is not a one-time event. Enterprise best practice requires quarterly
  review cycles, defined decision authority, and a tracked governance process.
  This is what makes PortfolioIQ a subscription product — not a one-time tool.

REVIEW CYCLE MODEL:

  review_cycles table:
    id              UUID
    tenant_id       UUID
    cycle_name      TEXT      # e.g. "Q1 2026 Portfolio Review"
    cycle_quarter   TEXT      # "Q1", "Q2", "Q3", "Q4"
    cycle_year      INTEGER
    status          TEXT      # Planned / Active / In Review / Complete
    start_date      DATE
    review_deadline DATE      # When decisions must be made
    created_by      UUID
    approved_by     UUID
    apps_reviewed   INTEGER
    decisions_made  INTEGER
    created_at      TIMESTAMP


GOVERNANCE WORKFLOW:

  FUNCTION createReviewCycle(quarter, year, deadline):

    cycle = {
      cycle_name:      f"Q{quarter} {year} Portfolio Review",
      cycle_quarter:   f"Q{quarter}",
      cycle_year:      year,
      status:          "Active",
      start_date:      today(),
      review_deadline: deadline,
    }

    # Queue all applications for review
    FOR each application IN portfolio:
      createReviewItem(cycle.id, application.id)

    NOTIFY reviewers:
      "Q{quarter} {year} Portfolio Review is now active.
       {n} applications require review by {deadline}.
       {n} applications have AI recommendations pending your decision."

    RETURN cycle


  FUNCTION processDecision(application_id, decision, rationale, reviewer_id):

    # decision = "Accept" | "Override" | "Escalate"

    IF decision == "Accept":
      # Human accepts AI recommendation — no change to disposition
      STORE decision_record:
        application_id:    application_id
        decision:          "Accepted"
        ai_disposition:    application.ai_disposition
        final_disposition: application.ai_disposition
        rationale:         rationale
        reviewer_id:       reviewer_id
        decided_at:        now()
      UPDATE application: review_status = "Decided"

    ELSE IF decision == "Override":
      # Human disagrees with AI — must provide override disposition AND rationale
      REQUIRE: override_disposition IN ["Retain", "Modernize", "Retire", "Replace"]
      REQUIRE: rationale length >= 50 characters  # meaningful explanation required

      STORE decision_record:
        application_id:      application_id
        decision:            "Overridden"
        ai_disposition:      application.ai_disposition
        final_disposition:   override_disposition
        ai_confidence:       application.ai_confidence
        rationale:           rationale
        reviewer_id:         reviewer_id
        decided_at:          now()
      UPDATE application:
        planned_disposition: override_disposition
        review_status:       "Overridden"

    ELSE IF decision == "Escalate":
      # Reviewer uncertain — escalate to senior decision maker
      STORE decision_record:
        application_id:    application_id
        decision:          "Escalated"
        rationale:         rationale
        escalated_by:      reviewer_id
        escalated_at:      now()
        escalation_status: "Pending"
      UPDATE application: review_status = "Escalated"
      NOTIFY senior_reviewer: "Application {name} has been escalated for your decision."


DECISION AUDIT LOG:

  SCREEN DecisionAuditLog:

    DISPLAY header: "Decision Audit Log"
    DISPLAY subtext: "Complete record of all portfolio decisions.
                      Every decision is timestamped and attributed."

    FILTER options:
      [All Decisions] [Accepted] [Overridden] [Escalated] [Pending]
      Date range selector
      Reviewer filter

    TABLE:
      Columns: Application | AI Said | Decision | Final | Reviewer | Date | Rationale

      FOR each decision IN decisions:
        ROW:
          application.name
          ai_disposition    (with confidence %)
          decision badge:   [✓ Accepted] [⚡ Overridden] [↑ Escalated]
          final_disposition (if overridden, shown in amber)
          reviewer.name
          decided_at
          rationale (truncated, expandable)

    EXPORT button: Download as PDF or CSV for board/audit purposes


REVIEW DASHBOARD:

  SCREEN ReviewDashboard:

    DISPLAY header: "Q{n} {year} Portfolio Review"
    DISPLAY deadline: "Review deadline: {date} — {n} days remaining"

    PROGRESS BAR:
      {decided} of {total} applications reviewed ({pct}% complete)

    THREE COLUMNS:
      PENDING ({n}):
        List of applications awaiting review
        Sorted by: technical debt score DESC
        Each shows: AI disposition, confidence, cost, debt score
        [Review] button → opens decision modal

      DECIDED ({n}):
        Accepted: {n}
        Overridden: {n}
        Shows override rate — high override rate flags prompt quality issues

      ESCALATED ({n}):
        Applications waiting for senior decision
        Shows escalation age — flag overdue escalations

    ALERTS:
      IF deadline < 7 days AND pending > 0:
        SHOW amber warning: "{n} applications still need review before {date}"
      IF override_rate > 30%:
        SHOW info: "Override rate is {pct}%. Consider reviewing AI scoring methodology."


RECOMMENDATION CHANGE DETECTION:

  FUNCTION detectRecommendationChanges(application_id, new_analysis):

    previous_analysis = getMostRecentAnalysis(application_id)

    IF previous_analysis is null:
      RETURN { changed: false }  # First analysis

    IF new_analysis.ai_disposition != previous_analysis.ai_disposition:
      change = {
        changed:           true,
        application_name:  application.name,
        previous:          previous_analysis.ai_disposition,
        current:           new_analysis.ai_disposition,
        previous_date:     previous_analysis.analyzed_at,
        change_reason:     "Disposition changed between analysis cycles"
      }
      LOG change to recommendation_changes table
      NOTIFY reviewer: "AI recommendation for {name} changed from
                        {previous} to {current} since last review cycle."
      RETURN change

    RETURN { changed: false }


REVIEW CYCLE CONFIGURATION:

  config additions:
    "REVIEW_CYCLE_FREQUENCY": "quarterly",  # quarterly / biannual / annual
    "REVIEW_DEADLINE_DAYS":   30,            # days to complete review after cycle starts
    "OVERRIDE_MIN_RATIONALE": 50,            # minimum characters for override rationale
    "ESCALATION_TIMEOUT_DAYS": 7,            # days before escalation is flagged as overdue
    "NOTIFY_ON_CHANGE":       True,          # notify when AI changes recommendation
    "HIGH_OVERRIDE_RATE_THRESHOLD": 0.30,    # flag if override rate exceeds 30%
```

---

## SPRINT 6: AI PORTFOLIO ADVISOR
### Conversational Q&A against the portfolio data

```
PURPOSE:
  Natural language interface for IT Directors and CIOs to ask questions
  about the portfolio without navigating tables and charts.
  Mirrors the Semantic CMDB Search from the original Streamlit prototype.

PRESET QUESTIONS:
  # Shown as clickable buttons when advisor first opens
  [Which apps should we retire first and in what order?]
  [What's the total cost of all End of Life applications?]
  [Show me all high-criticality apps that are aging or end of life]
  [Which apps carry the most security risk?]
  [Explain the dependency risk if we retire LegacyDB]
  [Which apps are highest priority to modernize?]
  [What would the annual savings be if we retired all recommended apps?]
  [Which apps are most likely to have an outage in the next 6 months?]


ADVISOR ARCHITECTURE:

  SESSION CONSTRAINTS:
    MAX_QUERIES = 20 per session  # visible countdown, enforces responsible use
    SESSION_CONTEXT = full portfolio data stuffed into Claude context
    CONVERSATION_HISTORY = maintained across all messages in session


  FUNCTION buildAdvisorContext(apps):

    context = f"""
    PORTFOLIO SUMMARY:
    - Total Applications: {len(apps)}
    - Total Annual IT Spend: ${sum(costs)}
    - Disposition Breakdown: Retain={n}, Modernize={n}, Retire={n}, Replace={n}

    FULL APPLICATION PORTFOLIO:
    FOR each app:
      {app.name} ({app.vendor})
      Category: {category} | Lifecycle: {lifecycle} | Support: {support_status}
      AI Disposition: {disposition} (Confidence: {confidence}%)
      TIME Classification: {time_classification}
      Technical Debt: {debt}/100 | Business Value: {value}/100 | Security Risk: {security_risk}
      Annual Cost: ${cost} | Active Users: {users}
      Capabilities: {capability_areas}
      AI Reasoning: {reasoning}
    """
    RETURN context


  FUNCTION sendAdvisorMessage(userMessage, conversationHistory, apps):

    systemPrompt = f"""
    You are PortfolioIQ's AI Advisor — an expert in application portfolio
    rationalization and IT portfolio management.

    You have access to the enterprise application portfolio below.
    Answer questions accurately using this data. When relevant:
    - Reference specific application names and data points
    - Use the Gartner TIME model (Tolerate/Invest/Migrate/Eliminate)
    - Calculate financial impact when asked
    - Identify dependency risks for retirement scenarios
    - Provide ranked lists when asked about priorities
    - Be direct and actionable — this is a decision-support tool

    {buildAdvisorContext(apps)}
    """

    messages = conversationHistory + [{ role: "user", content: userMessage }]

    response = callClaudeAPI(
      model      = config.AI_MODEL,
      max_tokens = 1000,
      system     = systemPrompt,
      messages   = messages
    )

    RETURN response.content


  ADVISOR UI STATES:

    STATE 1 — Initial (no conversation):
      SHOW preset question grid (2 columns, 8 buttons)
      SHOW "Portfolio quick reference" expandable table
      SHOW query counter: "20/20 queries remaining"

    STATE 2 — Conversation active:
      SHOW message thread (user bubbles amber, AI bubbles dark)
      SHOW 4 preset question pills above input for quick pivots
      SHOW [New conversation] button to reset
      SHOW query counter — turns red below 5

    STATE 3 — Query limit reached:
      SHOW message: "Session query limit reached."
      SHOW [Start new session] button
      DISABLE input

    STATE 4 — Loading:
      SHOW animated dots in AI bubble while waiting for response
      DISABLE input and preset buttons


  ADVISOR QUERY LOGGING:
    FOR each query:
      LOG to advisor_queries table:
        tenant_id:    current tenant
        question:     user message
        response:     AI response
        preset_used:  boolean
        response_ms:  latency
        queried_at:   timestamp

    USE for: improving preset questions, identifying common pain points,
             product analytics
```

---

## SPRINT 1: AI SCHEMA MAPPER
*(unchanged from v1.0)*

### Purpose
Claude analyzes any incoming data structure and maps it to
the PortfolioIQ universal schema automatically. No hardcoded
column maps. Works with any CMDB export or API response.

---

### 1.1 ENTRY POINT — receiveSourceData(source)

```
FUNCTION receiveSourceData(source):

  IF source.type == "csv" OR source.type == "excel":
    rawData = parseFile(source.file)
    headers = extractHeaders(rawData)
    samples = extractSampleRows(rawData, count=5)

  ELSE IF source.type == "api":
    rawResponse = callAPI(
      url       = source.url,
      auth      = source.credentials,
      method    = "GET",
      endpoint  = source.endpoint
    )
    headers = extractFieldNames(rawResponse)
    samples = extractSampleRecords(rawResponse, count=5)

  ELSE IF source.type == "servicenow":
    rawData = fetchServiceNowCMDB(
      instance    = source.instance,
      username    = source.username,
      password    = source.password,
      tables      = ["cmdb_ci_business_app", "incident", "change_request"]
    )
    headers = extractHeaders(rawData)
    samples = extractSampleRows(rawData, count=5)

  mapping = runAISchemaMapper(headers, samples)
  RETURN mapping
```

---

### 1.2 AI SCHEMA MAPPER — runAISchemaMapper(headers, samples)

```
FUNCTION runAISchemaMapper(headers, samples):

  prompt = buildMappingPrompt(headers, samples)

  response = callClaudeAPI(
    model      = config.AI_MODEL,
    max_tokens = 1000,
    prompt     = prompt,
    format     = "json"
  )

  mapping = parseJSONResponse(response)
  mapping = validateMapping(mapping)

  RETURN mapping


FUNCTION buildMappingPrompt(headers, samples):

  universalSchema = [
    "name (required)",
    "vendor",
    "application_type       [Commercial Off-The-Shelf, Custom Built, SaaS, Open Source]",
    "application_category",
    "technology_stack",
    "environment            [On-Premise, Cloud SaaS, Cloud Hosted, Hybrid]",
    "lifecycle_stage        [Current, Aging, End of Life, Retired, Planned]",
    "support_status         [In Support, End of Extended Support, End of Life, Unsupported]",
    "operational_status",
    "planned_disposition    [Retain, Modernize, Retire, Replace, Evaluate]",
    "migration_strategy     [As Is, Refactor, Re-platform, Replace, Decommission]",
    "annual_cost            (numeric, USD)",
    "annual_license_cost    (numeric, USD)",
    "infrastructure_cost    (numeric, USD)",
    "support_labor_cost     (numeric, USD)",
    "active_user_count      (integer)",
    "data_classification    [Public, Internal, Confidential, Restricted]",
    "audience_type          [Internal, External, Both]",
    "duplicate_functionality       (boolean: yes/no/true/false/1/0)",
    "replacement_candidate_exists  (boolean: yes/no/true/false/1/0)",
    "technical_debt_score   (integer 0-100, if provided)",
    "application_owner      (text — name or role)",
    "description"
  ]

  prompt = """
  You are a data integration specialist for PortfolioIQ.

  Analyze the source data structure below and map each source
  column to the PortfolioIQ universal schema.

  PORTFOLIOIQ UNIVERSAL SCHEMA FIELDS:
  {universalSchema}

  SOURCE COLUMN HEADERS:
  {headers}

  SAMPLE DATA (5 rows):
  {samples}

  INSTRUCTIONS:
  1. Map each source column to the best matching universal schema field
  2. If a source column does not match any field, mark it as "unmapped"
  3. Identify value normalization rules for enum fields
  4. Flag the required field "name" — if not found, flag as critical error
  5. Assign an overall confidence score (0.0 to 1.0)
  6. Note any data quality issues

  RETURN ONLY valid JSON:
  {
    "field_map": { "source_column": "schema_field", ... },
    "value_map": { "schema_field": { "source_value": "normalized_value" } },
    "unmapped": ["column1"],
    "critical_errors": [],
    "warnings": [],
    "confidence": 0.94,
    "coverage": 0.78
  }
  """

  RETURN prompt
```

---

### 1.3 VALIDATE MAPPING

```
FUNCTION validateMapping(mapping):

  errors = []; warnings = []

  IF "name" NOT IN mapping.field_map.values():
    errors.append("CRITICAL: No field mapped to 'name'. Required.")

  IF mapping.confidence < 0.60:
    warnings.append(f"Low confidence mapping ({mapping.confidence}). Review carefully.")

  IF mapping.coverage < 0.40:
    warnings.append(f"Only {mapping.coverage * 100:.0f}% of schema fields covered.")

  FOR field, valueMap IN mapping.value_map.items():
    validEnums = getValidEnums(field)
    FOR sourceVal, normalizedVal IN valueMap.items():
      IF normalizedVal NOT IN validEnums:
        warnings.append(f"'{normalizedVal}' not valid for {field}")

  mapping.errors = errors; mapping.warnings = warnings
  RETURN mapping
```

---

## SPRINT 2: MAPPING REVIEW UI
*(unchanged from v1.0 — see original for full detail)*

---

## SPRINT 3: API CONNECTION CONFIGURATOR
*(unchanged from v1.0 — see original for full detail)*

---

## SPRINT 4: SESSION MODE
*(unchanged from v1.0 — see original for full detail)*

---

## SPRINT 5: END-TO-END FLOW — UPDATED

```
FUNCTION runFullPipeline(source):

  # Step 1: Ingest
  rawData = receiveSourceData(source)

  # Step 2: AI schema mapping
  mapping = runAISchemaMapper(rawData.headers, rawData.samples)

  # Step 3: Human mapping review
  SHOW MappingReview screen; WAIT for confirmation
  confirmedMapping = getUserConfirmedMapping()

  # Step 4: Apply mapping and load
  loadResult = applyMappingAndLoad(confirmedMapping, rawData)

  # Step 5: AI scoring — NOW INCLUDES all four dimensions
  FOR each application IN loadResult.applications:

    # Core scoring (unchanged)
    aiScore = runAIScoringEngine(application)

    # NEW: Gartner TIME classification (Gap 1)
    timeClass = classifyTIME(application)

    # NEW: Security posture scoring (Gap 3)
    securityScore = calculateSecurityPostureScore(application)

    # NEW: Business capability mapping (Gap 4)
    capabilityMap = mapToCapabilities(application)

    # NEW: Blast radius analysis (Gap 4)
    blastRadius = analyzeBlastRadius(application.id)

    # Store all results
    storeEnrichedAnalysis(aiScore, timeClass, securityScore, capabilityMap, blastRadius)

    UPDATE progress bar

  # Step 6: NEW — Check for recommendation changes vs previous cycle (Gap 5)
  FOR each application IN loadResult.applications:
    detectRecommendationChanges(application.id, aiScore)

  # Step 7: Navigate to dashboard
  NAVIGATE to Dashboard
```

---

## UPDATED CONFIGURATION

```python
config = {
  # AI
  "AI_MODEL":                    "claude-sonnet-4-5",
  "AI_MAX_TOKENS":               1000,
  "AI_PROMPT_VERSION":           "v2.0",
  "AI_RATE_LIMIT_DELAY":         0.5,

  # Mapping
  "MAPPING_CONFIDENCE_WARN":     0.60,
  "MAPPING_CONFIDENCE_BLOCK":    0.40,
  "SAMPLE_ROW_COUNT":            5,

  # Scoring thresholds
  "HIGH_DEBT_THRESHOLD":         70,
  "MEDIUM_DEBT_THRESHOLD":       40,
  "HIGH_SECURITY_THRESHOLD":     70,
  "MEDIUM_SECURITY_THRESHOLD":   40,
  "HIGH_CONFIDENCE":             0.85,
  "LOW_CONFIDENCE":              0.60,

  # TIME model
  "TIME_BUSINESS_VALUE_THRESHOLD": 50,   # above = Invest or Migrate
  "TIME_TECHNICAL_FIT_THRESHOLD":  50,   # above = Invest or Tolerate

  # Governance
  "REVIEW_CYCLE_FREQUENCY":      "quarterly",
  "REVIEW_DEADLINE_DAYS":        30,
  "OVERRIDE_MIN_RATIONALE":      50,     # min characters for override
  "ESCALATION_TIMEOUT_DAYS":     7,
  "NOTIFY_ON_CHANGE":            True,
  "HIGH_OVERRIDE_RATE_THRESHOLD": 0.30,

  # AI Advisor
  "ADVISOR_MAX_QUERIES":         20,     # per session
  "ADVISOR_MAX_TOKENS":          1000,

  # Session mode (Jan's version)
  "SESSION_MODE":                False,
  "SESSION_TIMEOUT_HOURS":       4,

  # Database
  "BATCH_SIZE":                  50,
}
```

---

## UPDATED ERROR HANDLING

```
ALL ORIGINAL ERROR SCENARIOS PLUS:

8. Business capability mapping fails
   → SKIP capability mapping for that application
   → CONTINUE with remaining scoring
   → FLAG application: "Capability mapping unavailable — assign manually"

9. TIME classification cannot be determined
   → REQUIRES both business_value_score AND technical_debt_score
   → IF either is missing: TIME = "Unclassified"
   → SHOW in UI: "TIME classification requires both scores"

10. Review cycle deadline exceeded with pending decisions
    → SHOW urgent alert: "Review deadline passed. {n} applications undecided."
    → NOTIFY tenant admin
    → EXTEND cycle by 7 days automatically with notification

11. Override rate exceeds threshold
    → SHOW info banner: "Override rate is {pct}% — above the 30% threshold.
       Consider reviewing AI scoring methodology or prompt version."
    → LOG for product analytics

12. Escalation timeout exceeded
    → AFTER {ESCALATION_TIMEOUT_DAYS} days: flag as "Overdue Escalation"
    → NOTIFY both escalating reviewer and senior reviewer
    → SHOW in review dashboard with red badge
```

---

## UPDATED DATA FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
│  CSV/Excel  ServiceNow  LeanIX  Planview  Freshservice  Any API  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     AI SCHEMA MAPPER                             │
│   Headers + 5 rows → Claude → JSON field mapping + value norms  │
│   Confidence score → Human mapping review → Confirmed mapping    │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     UNIVERSAL SCHEMA                             │
│   Normalized applications (34 fields + security + owner fields)  │
│   SESSION MODE: in memory  |  STANDARD: Supabase                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      AI ANALYSIS ENGINE                          │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Core Scoring    │  │ Gartner TIME │  │ Security Posture   │  │
│  │ Disposition     │  │ T/I/M/E      │  │ Score 0-100        │  │
│  │ Debt 0-100      │  │ Quadrant     │  │ Risk Level         │  │
│  │ Value 0-100     │  │ Plot coords  │  │ Signal breakdown   │  │
│  │ Confidence      │  └──────────────┘  └────────────────────┘  │
│  │ Reasoning       │  ┌──────────────────────────────────────┐   │
│  └─────────────────┘  │ Business Capability Mapping           │   │
│                       │ App → Capability → Coverage gaps      │   │
│                       │ Blast radius analysis                 │   │
│                       └──────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE LAYER (NEW)                        │
│  Review cycle management → Human decisions (Accept/Override/     │
│  Escalate) → Decision audit log → Change detection →            │
│  Board-ready reporting                                           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    REACT DASHBOARD                               │
│  KPI cards → TIME quadrant chart → Sortable table → Detail       │
│  drawer → Capability map → Security risk view →                  │
│  AI Portfolio Advisor (conversational Q&A) →                    │
│  Scoring Methodology screen → Review queue                       │
│  Jan's version: [End Session] wipes all data                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## SCHEMA ADDITIONS SUMMARY
*(Fields added in v2.0 to support the five gaps)*

```
applications table — ADD:
  time_classification     TEXT     # Tolerate / Invest / Migrate / Eliminate
  time_description        TEXT     # Explanation of TIME classification
  security_posture_score  INTEGER  # 0-100
  security_risk_level     TEXT     # Low / Medium / High
  security_reasoning      TEXT     # AI reasoning for security assessment
  capability_areas        JSONB    # List of business capabilities supported
  capability_risk         TEXT     # Critical / High / Medium / Low
  application_owner       TEXT     # Named owner
  review_status           TEXT     # Pending / Decided / Overridden / Escalated
  last_reviewed_at        TIMESTAMP
  last_reviewed_by        UUID

review_cycles table — NEW:
  id, tenant_id, cycle_name, cycle_quarter, cycle_year,
  status, start_date, review_deadline, created_by, approved_by,
  apps_reviewed, decisions_made, created_at

decision_records table — NEW:
  id, tenant_id, cycle_id, application_id,
  decision (Accept/Override/Escalate),
  ai_disposition, final_disposition, ai_confidence,
  rationale, reviewer_id, decided_at,
  escalated_to, escalation_status, escalation_resolved_at

recommendation_changes table — NEW:
  id, tenant_id, application_id,
  previous_disposition, current_disposition,
  previous_cycle_id, current_cycle_id,
  detected_at, notified_at

advisor_queries table — NEW:
  id, tenant_id, session_id,
  question, response, preset_used,
  response_ms, queried_at
```

---

## SPRINT 7: VALIDATION QUEUE
### The governance hook that makes the product sticky

```
PURPOSE:
  The Validation Queue is the feature that turns PortfolioIQ from a reporting
  tool into a workflow tool. It surfaces pending human decisions prominently,
  creates urgency with a live badge count, and gives reviewers a prioritized
  worklist. Without it, clients run the analysis once and drift away.
  With it, they come back every week because decisions are waiting.

  This is the stickiest feature in the subscription model.


NAVIGATION BADGE:

  The pending count appears everywhere in the UI — sidebar, header, tab title.
  It creates ambient urgency without being intrusive.

  FUNCTION getPendingCount():
    RETURN count of applications WHERE:
      review_status == "Pending"
      AND current review cycle is Active
      AND tenant_id == current tenant

  DISPLAY in navigation:
    "Validation Queue" + badge showing pending count
    Badge color:
      0 pending       → no badge shown
      1-5 pending     → amber badge
      6+ pending      → red badge
      Deadline < 7d   → red badge regardless of count

  DISPLAY in browser tab title:
    IF pending > 0:
      "(4) PortfolioIQ — Validation Queue"
    ELSE:
      "PortfolioIQ"

  UPDATE frequency:
    On page load
    After each decision is submitted
    Every 5 minutes via polling (no websocket needed at this scale)


VALIDATION QUEUE SCREEN:

  SCREEN ValidationQueue:

    HEADER:
      "Validation Queue"
      Subtext: "Review AI recommendations before they become decisions."

    CYCLE STATUS BAR:
      Current cycle: "Q2 2026 Portfolio Review"
      Deadline: "June 30, 2026 — {n} days remaining"
      Progress: [{decided} of {total} reviewed] [{pct}% complete]
      Progress bar color:
        > 80% complete     → emerald green
        50-80% complete    → amber
        < 50% complete     → red (especially if deadline approaching)

    ALERT BANNERS (shown when relevant):
      IF deadline < 7 days AND pending > 0:
        RED: "⚠ {n} applications must be reviewed before {deadline_date}.
              Decisions made after the deadline will be flagged as overdue."

      IF override_rate > 30%:
        AMBER: "ℹ Override rate is {pct}% this cycle — above the 30% threshold.
                Consider reviewing AI scoring methodology."

      IF escalation_overdue_count > 0:
        RED: "⚠ {n} escalated applications have not been resolved in
              {ESCALATION_TIMEOUT_DAYS} days."


    THREE-PANEL LAYOUT:

      PANEL 1 — PENDING ({n}):
        Sorted by: technical_debt_score DESC (highest risk first)
        Each card shows:
          App name (bold)
          AI Disposition badge: [Retain | Modernize | Retire | Replace]
          TIME Classification: [T | I | M | E] colored quadrant badge
          Technical Debt score bar
          Business Value score bar
          Security Risk badge: [Low | Medium | High]
          Annual Cost
          Confidence %
          [Review →] button — opens decision modal

        EMPTY STATE: "✓ All applications reviewed for this cycle."

      PANEL 2 — DECIDED ({n}):
        Accepted: {n}    Overridden: {n}    Override rate: {pct}%
        List of decided applications (compact):
          App name | Decision badge | Reviewer | Date

      PANEL 3 — ESCALATED ({n}):
        Each item shows:
          App name
          Escalated by: {reviewer}
          Escalated at: {date}
          Days waiting: {n}
          [Resolve] button — opens escalation resolution modal


  DECISION MODAL — openDecisionModal(application):

    DISPLAY full application context:
      App name, vendor, category
      AI Disposition + confidence
      TIME classification + description
      Technical Debt score + top 3 signals that drove it
      Business Value score + top 3 signals
      Security Risk + key risk factors
      Blast radius: dependent services and capabilities
      AI Reasoning (full text)

    DECISION BUTTONS:
      [✓ Accept AI Recommendation]
        → stores decision as "Accepted"
        → final_disposition = ai_disposition
        → optional rationale field (not required for Accept)
        → closes modal, moves app to Decided panel
        → updates pending badge count

      [⚡ Override]
        → SHOW override form:
          Override Disposition: [Retain | Modernize | Retire | Replace] (required)
          Rationale: textarea (REQUIRED, min 50 characters)
          Character counter shown: "47/50 minimum"
          [Confirm Override] button — disabled until rationale meets minimum
        → stores decision as "Overridden"
        → final_disposition = override_disposition
        → rationale stored in decision_records
        → updates override rate in cycle metrics

      [↑ Escalate]
        → SHOW escalation form:
          Reason for escalation: textarea (required)
          Escalate to: [dropdown of senior reviewers]
          [Confirm Escalation] button
        → stores decision as "Escalated"
        → NOTIFY escalatee via email/in-app
        → moves app to Escalated panel
        → starts escalation timeout clock

      [← Back] — closes modal without decision


  KEYBOARD NAVIGATION:
    While modal is open:
      A = Accept
      O = Override (focus on override form)
      E = Escalate
      Escape = Back
    In queue list:
      Arrow keys = navigate between applications
      Enter = open decision modal


  ESCALATION RESOLUTION MODAL — resolveEscalation(application):

    DISPLAY:
      Original reviewer's escalation reason
      Application context (same as decision modal)
      Days since escalation: {n}

    RESOLUTION OPTIONS:
      [Accept AI Recommendation]
      [Override] → requires disposition + rationale
      [Return to Reviewer] → sends back with senior reviewer notes

    ON resolve:
      UPDATE escalation_status = "Resolved"
      SET escalation_resolved_at = now()
      NOTIFY original reviewer of resolution
      MOVE app to Decided panel


  DATA QUALITY WARNINGS:
    IF application.active_user_count is null:
      SHOW inline: "⚠ User count missing — business value score may be understated"
    IF application.annual_cost is null:
      SHOW inline: "⚠ Cost data missing — savings calculation excludes this app"
    IF application.application_owner is null:
      SHOW inline: "⚠ No owner assigned — security posture score penalized"


  SESSION MODE BEHAVIOR (Jan's version):
    Validation Queue is simplified for session mode:
    - No review cycles — single engagement context
    - No deadlines
    - Decisions are Accept/Override only (no escalation — Jan is the only reviewer)
    - Decisions stored in memory only — cleared on session end
    - Override rationale still required — creates discipline in client-facing review
```

---

## SPRINT 8: AI ANALYSIS & SIGNALS SCREEN
### The defensibility layer — what Jan presents in the room

```
PURPOSE:
  When Jan tells a client "PortfolioIQ recommends retiring LegacyDB,"
  the client's first question is "why?" The AI reasoning in the detail
  drawer gives the answer in prose. The Signals screen shows the raw
  evidence — every data point that drove the recommendation, signal by
  signal. This is the screen that builds trust in AI recommendations.
  It's the difference between a recommendation and a defensible finding.

  For consulting engagements this is the primary presentation screen.
  For PE-backed clients with board accountability it's the audit trail.


NAVIGATION:
  Sidebar item: "AI Analysis & Signals"
  No badge needed — always available once analysis is complete


AI ANALYSIS & SIGNALS SCREEN:

  SCREEN AIAnalysisAndSignals:

    HEADER:
      "AI Analysis & Signals"
      Subtext: "Signal-by-signal breakdown of every AI recommendation.
                Each score is traceable to specific data in your CMDB."

    PORTFOLIO SUMMARY ROW:
      Analysis run: {date and time}
      Model: {model_version} | Prompt: {prompt_version}
      Applications analyzed: {n} | Failed: {n}
      Average confidence: {pct}%
      [Re-run Analysis] button (with confirmation: "This will re-analyze all
       applications and may change existing recommendations. Continue?")


    APPLICATION SELECTOR:
      Dropdown or search: "Select application to inspect"
      OR click any row in the signals table below


    SIGNALS TABLE (all applications, sortable):

      Columns:
        Application
        Disposition [badge]
        TIME [T/I/M/E badge]
        Confidence [%]
        Debt Score [bar + number]
        Value Score [bar + number]
        Security Risk [Low/Med/High badge]
        Data Quality [0-100% complete]
        [View Signals] button

      Sortable by: any column
      Filterable by: disposition, TIME classification, confidence band,
                     security risk level, data quality threshold

      DATA QUALITY COLUMN:
        Calculated as: fields_populated / total_fields * 100
        Color coded:
          >= 80% → emerald (good)
          50-79% → amber (partial)
          < 50%  → red (sparse — AI confidence will be low)


    APPLICATION SIGNAL DETAIL — openSignalDetail(application):

      LAYOUT: Side panel or expanded row

      SECTION 1 — DISPOSITION SUMMARY:
        AI Recommendation: [Retain | Modernize | Retire | Replace]
        Gartner TIME:       [Tolerate | Invest | Migrate | Eliminate]
        Confidence: {pct}% — [High | Medium | Low]
        Analyzed: {datetime} | Model: {version} | Prompt: {version}

        Confidence explanation:
          High (>85%):   "Strong signal coverage. Recommendation is well-supported."
          Medium (60-85%): "Moderate signal coverage. Key data points present."
          Low (<60%):    "Sparse data. {n} key fields missing. Review manually."


      SECTION 2 — TECHNICAL DEBT SIGNALS:
        Score: {n}/100  [score bar, color coded]

        SIGNAL BREAKDOWN TABLE:
          Signal                    | Your Data          | Points | Max
          Lifecycle Stage           | End of Life        | +30    | 30
          Support Status            | End of Life        | +25    | 25
          Incident Volume (12mo)    | 23 incidents       | +20    | 20
          Duplicate Functionality   | Yes                | +15    | 15
          EOL Infrastructure        | 2 EOL servers      | +10    | 10
          ──────────────────────────────────────────────────────────
          TOTAL                     |                    | 100    | 100

        MISSING SIGNALS (shown in red if data not present):
          "⚠ Emergency change data not available — score may be understated"
          "⚠ Infrastructure link not mapped — EOL server check skipped"


      SECTION 3 — BUSINESS VALUE SIGNALS:
        Score: {n}/100  [score bar]

        SIGNAL BREAKDOWN TABLE:
          Signal                    | Your Data          | Points | Max
          Active User Count         | 847 users          | +30    | 30
          Critical Service Support  | 3 critical svcs    | +30    | 30
          Annual Cost Investment    | $420K/yr           | +20    | 20
          No Replacement Exists     | No replacement     | +20    | 20
          ──────────────────────────────────────────────────────────
          TOTAL                     |                    | 100    | 100


      SECTION 4 — SECURITY POSTURE SIGNALS:
        Score: {n}/100  [score bar]  Risk Level: [High | Medium | Low]

        SIGNAL BREAKDOWN TABLE:
          Signal                    | Your Data          | Points | Max
          Data Classification       | Restricted         | +10    | 30
          EOL Software              | End of Life        | +30    | 30
          EOL Infrastructure        | 2 EOL servers      | +20    | 20
          Emergency Changes (12mo)  | 12 changes         | +20    | 20
          No Application Owner      | Owner missing      | +10    | 10
          ──────────────────────────────────────────────────────────
          TOTAL                     |                    | 90     | 100


      SECTION 5 — GARTNER TIME PLACEMENT:
        DISPLAY mini 2x2 quadrant with this app plotted:
          X-axis: Business Value ({n})
          Y-axis: Technical Fit ({100 - debt_score})
          App plotted as dot in correct quadrant
          Quadrant label highlighted: [Eliminate]
          Adjacent quadrant shown for context

        Interpretation:
          "Business Value: {n}/100 (below threshold of 50)
           Technical Fit:  {n}/100 (below threshold of 50)
           → Eliminate quadrant: low value AND poor technical fit.
             Priority candidate for retirement."


      SECTION 6 — BLAST RADIUS:
        IF application has dependent services or capabilities:
          "Retiring this application affects:"
          List of dependent services (name, criticality, coverage gap Y/N)
          List of capabilities at risk (name, other apps providing coverage)
          Blast Radius Score: {n}/100

        IF no dependencies:
          "✓ No critical service dependencies identified.
             Retirement impact is contained."


      SECTION 7 — AI REASONING (full text):
        The complete AI reasoning narrative
        Citation of which signals were weighted most heavily
        Confidence factors: what data was missing and how it affected confidence


      SECTION 8 — DATA QUALITY AUDIT:
        "Fields populated for this application:"
        TABLE showing every schema field:
          Field Name          | Value              | Status
          name                | LegacyDB           | ✓
          vendor              | Oracle             | ✓
          lifecycle_stage     | End of Life        | ✓
          annual_cost         | $142,000           | ✓
          active_user_count   | null               | ⚠ Missing
          application_owner   | null               | ⚠ Missing
          data_classification | Confidential       | ✓
          ...

        Data completeness: {n}% ({populated}/{total} fields)
        "Adding missing fields will improve AI confidence."
        [Edit Application Data] button → opens application edit form


  COMPARISON VIEW (optional — show two apps side by side):
    [Compare] button on any application
    Select second application from dropdown
    Shows both signal breakdowns side by side
    Useful for: "Should we retire LegacyDB or ProcureTrack first?"
    Jan will use this constantly in client presentations


  EXPORT FROM SIGNALS SCREEN:
    [Export Signal Report] → PDF with:
      Executive summary (disposition + TIME for all apps)
      Full signal breakdown for each Retire/Replace recommendation
      Data quality summary
      Methodology explanation
      Formatted for board presentation
    [Export to CSV] → raw signal data for all applications


  SESSION MODE BEHAVIOR (Jan's version):
    Full signals screen available — this is Jan's primary presentation tool
    [Export Signal Report] generates the client-facing PDF
    Client name (from session start) appears in the PDF header
    No persistent storage — export before ending session
```

---

## UPDATED NAVIGATION STRUCTURE

```
SIDEBAR NAVIGATION (in order):

  Portfolio Overview        — KPIs, donut chart, top candidates
  AI Analysis & Signals     — signal breakdown, TIME chart, data quality  [NEW Sprint 8]
  Validation Queue    [•4]  — pending decisions with live badge count      [NEW Sprint 7]
  Decision Audit Log        — complete decision history, exportable
  Capability Map            — business capability coverage and gaps
  Scoring Methodology       — how scores are calculated, signal weights
  AI Portfolio Advisor      — conversational Q&A against the portfolio
  Settings / Data Sources   — connectors, session config, tenant settings

SESSION MODE (Jan's version) — simplified navigation:
  Portfolio Overview        — KPIs and summary
  AI Analysis & Signals     — primary presentation screen
  Validation Queue          — simplified, single-reviewer, in-memory
  AI Portfolio Advisor      — conversational Q&A during client meeting
  [End Session]             — wipes all client data, returns to start
```

---

## UPDATED SCHEMA ADDITIONS

```
signals_audit table — NEW (supports Signals screen):
  id                    UUID
  tenant_id             UUID
  application_id        UUID
  analysis_id           UUID          # FK to ai_analyses
  signal_name           TEXT          # e.g. "lifecycle_stage"
  signal_value          TEXT          # e.g. "End of Life"
  points_awarded        INTEGER       # e.g. 30
  points_possible       INTEGER       # e.g. 30
  score_dimension       TEXT          # "technical_debt" | "business_value" | "security"
  data_present          BOOLEAN       # False if field was null
  created_at            TIMESTAMP

data_quality_scores table — NEW:
  id                    UUID
  tenant_id             UUID
  application_id        UUID
  fields_total          INTEGER       # total schema fields
  fields_populated      INTEGER       # non-null fields
  completeness_pct      INTEGER       # 0-100
  missing_critical      JSONB         # list of missing high-impact fields
  calculated_at         TIMESTAMP
```

---

## UPDATED DATA FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
│  CSV/Excel  ServiceNow  LeanIX  Planview  Freshservice  Any API  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                     AI SCHEMA MAPPER                             │
│   Headers + 5 rows → Claude → JSON field mapping + value norms  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                  AI ANALYSIS ENGINE                              │
│  Core Scoring · TIME · Security Posture · Capability Mapping     │
│  → signals_audit table (every signal stored for Signals screen)  │
│  → data_quality_scores table (completeness per application)      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    GOVERNANCE LAYER                              │
│  Validation Queue (pending badge) → Decision Modal →             │
│  Accept / Override / Escalate → Decision Audit Log               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    REACT DASHBOARD                               │
│                                                                  │
│  Portfolio Overview      — KPIs, chart, top candidates           │
│  AI Analysis & Signals   — signal breakdown, TIME, data quality  │
│  Validation Queue [•4]   — pending decisions, live badge         │
│  Decision Audit Log      — complete decision history             │
│  Capability Map          — business capability coverage          │
│  Scoring Methodology     — methodology transparency              │
│  AI Portfolio Advisor    — conversational Q&A                    │
│                                                                  │
│  Jan's session mode: simplified nav, export-first, data wipes   │
└──────────────────────────────────────────────────────────────────┘
```

---

## SPRINT 9: ADMIN SECTION
### Two tiers — Tenant Admin (client-facing) and Platform Admin (Ken-facing)

```
OVERVIEW:

  Two completely separate admin interfaces with different access levels.
  Never shown to the wrong user. Enforced at both UI and database level.

  TENANT ADMIN — the IT Director or CIO managing their own instance
    Access: any user with role = "admin" within their tenant
    Scope: their tenant only — cannot see other tenants
    URL:   /admin  (within the main app)

  PLATFORM ADMIN — Ken managing the entire PortfolioIQ platform
    Access: platform_admin role only — Ken (and Matt when needed)
    Scope: all tenants, all data, all system metrics
    URL:   /platform  (separate route, separate UI)

  ACCESS CONTROL RULE:
    IF user.role == "platform_admin":
      CAN access /platform AND /admin for any tenant
    ELSE IF user.role == "admin":
      CAN access /admin for their own tenant only
      CANNOT access /platform
    ELSE:
      CAN access the main app only
      CANNOT access /admin or /platform
```

---

### 9.1 TENANT ADMIN — /admin

```
PURPOSE:
  The IT Director or Jan manages their PortfolioIQ instance.
  Controls users, data sources, configuration, and sees their own logs.
  This is what a paying client uses day-to-day to manage their account.


TENANT ADMIN NAVIGATION:

  /admin/users          — User management
  /admin/data-sources   — Connector configuration
  /admin/configuration  — Product settings and thresholds
  /admin/logs           — Activity and analysis logs
  /admin/billing        — Subscription and usage
  /admin/session        — Session mode settings (Jan's version)


────────────────────────────────────────────────────────────────────
SCREEN: /admin/users — User Management
────────────────────────────────────────────────────────────────────

  HEADER: "Users & Access"
  SUBTEXT: "Manage who can access PortfolioIQ and what they can do."

  USER TABLE:
    Columns: Name | Email | Role | Last Active | Status | Actions
    Roles available:
      admin    — full access including this admin section
      reviewer — can view dashboard and submit decisions in queue
      viewer   — read-only access to dashboard and reports
      analyst  — can run analyses and view signals, no decisions

  ACTIONS PER USER:
    [Change Role] — dropdown selector
    [Deactivate]  — disables login without deleting data
    [Remove]      — removes from tenant (confirm required)
    [Resend Invite] — if invite not yet accepted

  INVITE NEW USER:
    [+ Invite User] button → modal:
      Email address (required)
      Role (required)
      Personal message (optional)
      [Send Invite] → Supabase sends invite email
      Invite appears in table as "Pending" until accepted

  SESSION MODE NOTE (Jan's version):
    IF SESSION_MODE == true:
      HIDE billing section
      SHOW simplified user list: Jan only (single reviewer)
      SHOW: "Session mode — single reviewer, no persistent users"


────────────────────────────────────────────────────────────────────
SCREEN: /admin/data-sources — Connector Configuration
────────────────────────────────────────────────────────────────────

  HEADER: "Data Sources"
  SUBTEXT: "Configure how PortfolioIQ connects to your CMDB or
            accepts data uploads."

  CONNECTED SOURCES TABLE:
    Columns: Source | Type | Status | Last Sync | Records | Actions

    FOR each configured connector:
      ROW:
        source_name      e.g. "Nexus ServiceNow"
        type             ServiceNow / Freshservice / CSV / Jira / Manual
        status badge:    [Connected] [Error] [Syncing] [Never Synced]
        last_sync        datetime or "Never"
        record_count     number of applications loaded
        Actions:
          [Sync Now]     → triggers immediate sync
          [Edit]         → opens connector config modal
          [View Log]     → shows sync history for this source
          [Disconnect]   → removes credentials (confirm required)

  ADD NEW SOURCE:
    [+ Add Data Source] button → opens APIConnectionConfigurator
    (see Sprint 3 spec)

  SYNC SCHEDULE CONFIGURATION:
    Per connector:
      Sync frequency: [Manual] [Daily] [Weekly] [Monthly]
      Sync time: time picker (for scheduled syncs)
      Notify on failure: email address

  CSV UPLOAD HISTORY:
    Table showing all manual CSV uploads:
      Uploaded by | Date | File name | Records loaded | Status
      [Download original file] | [Re-process] | [Delete]


────────────────────────────────────────────────────────────────────
SCREEN: /admin/configuration — Product Settings
────────────────────────────────────────────────────────────────────

  HEADER: "Configuration"
  SUBTEXT: "Control how PortfolioIQ analyzes and scores your portfolio."

  SECTION: AI Analysis Settings
    AI Model:
      Current: claude-sonnet-4-5
      [Change model] — dropdown (advanced users only)
      Warning: "Changing the model will affect recommendation consistency
                across review cycles."

    Confidence thresholds:
      High confidence minimum:   [85]% — slider 50-100
      Low confidence warning:    [60]% — slider 30-80
      Block below confidence:    [40]% — slider 0-60

    Batch size:
      Applications per API call: [15] — slider 5-50
      Note: "Larger batches are faster but cost more per run."

    Auto-analyze on upload:
      Toggle: [ON / OFF]
      If ON: analysis runs automatically after CSV upload or sync
      If OFF: user triggers analysis manually

  SECTION: Scoring Thresholds
    Technical Debt:
      High debt threshold:       [70] — slider
      Medium debt threshold:     [40] — slider

    Security Posture:
      High security risk:        [70] — slider
      Medium security risk:      [40] — slider

    TIME Model:
      Business value threshold:  [50] — slider (above = Invest or Migrate)
      Technical fit threshold:   [50] — slider (above = Invest or Tolerate)

    NOTE: "Changing thresholds will not re-run existing analyses.
           Run a new analysis cycle to apply updated thresholds."

  SECTION: Governance Settings
    Review cycle frequency:
      [Quarterly] [Biannual] [Annual] [Manual]

    Review deadline:
      Days to complete review after cycle opens: [30]

    Override rationale minimum:
      Minimum characters required: [50]

    Escalation timeout:
      Days before escalation is flagged overdue: [7]

    Override rate alert:
      Alert when override rate exceeds: [30]%

  SECTION: Notification Settings
    Email notifications:
      [ ] New review cycle opened
      [ ] Pending decisions approaching deadline
      [ ] Escalation assigned to me
      [ ] Escalation overdue
      [ ] AI recommendation changed since last cycle
      [ ] Sync failure
    Notification email: [text field]

  SECTION: Data Retention
    Keep analysis history for: [12] months
    Keep decision records for: [36] months (compliance)
    Keep sync logs for:        [6]  months

    [Save Configuration] button
    [Reset to Defaults] button (confirm required)


────────────────────────────────────────────────────────────────────
SCREEN: /admin/logs — Activity and Analysis Logs
────────────────────────────────────────────────────────────────────

  HEADER: "Logs"
  SUBTEXT: "Activity log, analysis history, and system events
            for your PortfolioIQ instance."

  TABS: [Activity Log] [Analysis History] [Sync Log] [AI Advisor Log]

  TAB: Activity Log
    Every user action in the system:
      Columns: Timestamp | User | Action | Details | IP Address
      Actions logged:
        Login / Logout
        Analysis run triggered
        Decision submitted (Accept/Override/Escalate)
        Configuration changed (what changed, old value, new value)
        User invited / removed
        Data source added / removed
        CSV uploaded
        Export generated
        Session started / ended (session mode)
      Filter by: user, action type, date range
      [Export to CSV] button

  TAB: Analysis History
    Every AI analysis run:
      Columns: Date | Triggered by | Apps analyzed | Duration |
               AI cost ($) | Model version | Prompt version | Status
      Click any row → shows full analysis results for that run
      Comparison view: select two runs to see what changed
      [Export] button

  TAB: Sync Log
    Every connector sync attempt:
      Columns: Date | Source | Status | Records synced |
               Records failed | Duration | Error message
      Color coded: green=success, amber=partial, red=failed
      Click any row → shows detailed sync report
      [Retry Failed] button for failed syncs

  TAB: AI Advisor Log
    Every question asked in the AI Portfolio Advisor:
      Columns: Date | User | Question | Response time | Preset used
      Question text shown (truncated, expandable)
      NOTE: Full response not stored (privacy + cost)
      Useful for: improving preset questions, product analytics
      [Export to CSV] button


────────────────────────────────────────────────────────────────────
SCREEN: /admin/billing — Subscription and Usage
────────────────────────────────────────────────────────────────────

  HEADER: "Billing & Usage"

  CURRENT PLAN:
    Plan name: [Starter | Growth | Professional | Enterprise]
    Billing period: Monthly / Annual
    Next renewal: {date}
    [Upgrade Plan] button | [Cancel Subscription] button

  USAGE THIS PERIOD:
    Applications in portfolio:    {n} / {plan_limit}
    Analysis runs this month:     {n}
    AI Advisor queries this month: {n}
    Data sources connected:       {n}
    Users:                        {n} / {plan_limit}

  USAGE BAR for each metric:
    Green if < 80% of limit
    Amber if 80-95% of limit
    Red if > 95% — show upgrade prompt

  AI COST TRACKING:
    Estimated AI API cost this month: ${n}
    Cost per analysis run: ${n} avg
    NOTE: "AI costs are included in your subscription.
           This is shown for transparency."

  INVOICE HISTORY:
    Table: Date | Amount | Status | [Download PDF]

  PAYMENT METHOD:
    Current card: Visa ending 4242
    [Update Payment Method] → Stripe customer portal

  HIDDEN IN SESSION MODE (Jan's version)


────────────────────────────────────────────────────────────────────
SCREEN: /admin/session — Session Mode Settings (Jan's version)
────────────────────────────────────────────────────────────────────

  ONLY VISIBLE WHEN SESSION_MODE == true

  HEADER: "Session Configuration"
  SUBTEXT: "Configure how PortfolioIQ behaves during client engagements."

  SESSION DEFAULTS:
    Default client name prefix: [text field]
      e.g. "Client" → sessions named "Client — June 4 2026"
    Session timeout (hours): [4] — slider 1-8
    Auto-clear on logout: [ON] (cannot be disabled in session mode)
    Require session start confirmation: [ON]
      Forces Jan to enter client name before each engagement

  EXPORT SETTINGS:
    PDF report header: [The Litchfield Practice] or [PortfolioIQ]
    Include PortfolioIQ branding in exports: [ON / OFF]
    Default export format: [PDF] [CSV] [Both]

  SESSION HISTORY:
    Log of past sessions (no client data — metadata only):
      Date | Duration | Apps analyzed | Decisions made | Export generated
    NOTE: "No client data is stored. Only session metadata is logged."

  BRANDING:
    Logo upload: [Upload logo] — appears in session header and exports
    Primary color: [color picker]
    Organization name: [text field]
```

---

### 9.2 PLATFORM ADMIN — /platform

```
PURPOSE:
  Ken (and Matt) manages the entire PortfolioIQ platform.
  Full visibility across all tenants. System health, costs, usage,
  and the ability to create and manage client accounts.
  Never accessible to tenant users under any circumstances.

ACCESS:
  Separate login check at route level:
    IF user.platform_admin != true:
      REDIRECT to /dashboard
      LOG unauthorized access attempt

PLATFORM ADMIN NAVIGATION:

  /platform/tenants     — All client tenants
  /platform/create      — Create new tenant
  /platform/system      — System health and metrics
  /platform/costs       — AI API cost tracking across all tenants
  /platform/logs        — Platform-wide activity log
  /platform/config      — Global platform configuration
  /platform/schema      — Schema version management


────────────────────────────────────────────────────────────────────
SCREEN: /platform/tenants — All Client Tenants
────────────────────────────────────────────────────────────────────

  HEADER: "Tenants"
  SUBTEXT: "All PortfolioIQ client instances."

  TENANT TABLE:
    Columns: Tenant | Slug | Plan | Status | Users | Apps |
             Last Active | AI Cost MTD | Created | Actions

    FOR each tenant:
      ROW:
        tenant.name          e.g. "Nexus Global Solutions"
        tenant.slug          e.g. "nexus-global"
        plan badge           [Starter] [Growth] [Professional] [Trial] [Session]
        status badge         [Active] [Trial] [Suspended] [Churned]
        user_count
        app_count
        last_active          datetime of last user login
        ai_cost_mtd          AI API cost this calendar month
        created_at
        Actions:
          [Impersonate]      → log in AS this tenant (full access) for support
          [View Logs]        → all activity for this tenant
          [Edit]             → change plan, status, settings
          [Suspend]          → disable all logins (confirm required)
          [Delete]           → permanent delete (confirm + type tenant name)

  IMPERSONATE MODE:
    When Ken impersonates a tenant:
      SHOW persistent amber banner: "IMPERSONATING: {tenant_name} — [Exit]"
      ALL actions are logged with: impersonated_by = Ken's user_id
      Ken sees exactly what the client sees
      EXIT returns to /platform/tenants

  SEARCH and FILTER:
    Search by tenant name or slug
    Filter by: plan, status, created date, last active
    Sort by: ai_cost_mtd (find expensive tenants), last_active (find churning)


────────────────────────────────────────────────────────────────────
SCREEN: /platform/create — Create New Tenant
────────────────────────────────────────────────────────────────────

  HEADER: "Create New Tenant"

  FORM:
    Organization name:     [text field] (required)
    Slug:                  [text field] auto-generated from name, editable
                           Validates: unique, lowercase, no spaces
    Plan:                  [Starter | Growth | Professional | Session | Trial]
    Admin email:           [text field] — first user, gets invite email
    Admin name:            [text field]
    Session mode:          [toggle] — for Jan's version
    Notes:                 [textarea] — internal notes (e.g. "Jan Barlow referral")
    Trial expiry:          [date picker] — if plan = Trial

  ON submit:
    createTenant(formValues)
    createUserTenant(adminEmail, tenantId, role="admin")
    sendInviteEmail(adminEmail)
    SHOW success: "Tenant created. Invite sent to {adminEmail}."
    NAVIGATE to /platform/tenants

  FUNCTION createTenant(formValues):
    INSERT into tenants:
      name:         formValues.organization_name
      slug:         formValues.slug
      plan:         formValues.plan
      session_mode: formValues.session_mode
      status:       "Active"
      notes:        formValues.notes
      trial_expiry: formValues.trial_expiry
      created_by:   platform_admin_user_id
      created_at:   now()
    RETURN tenant_id


────────────────────────────────────────────────────────────────────
SCREEN: /platform/system — System Health
────────────────────────────────────────────────────────────────────

  HEADER: "System Health"
  AUTO-REFRESH every 60 seconds

  STATUS CARDS (top row):
    Supabase DB:        [● Healthy] | Response time: {ms}ms
    Claude API:         [● Healthy] | Last call: {n}s ago
    Vercel Frontend:    [● Healthy] | Last deploy: {datetime}
    Auth Service:       [● Healthy] | Active sessions: {n}

  LIVE METRICS:
    Active sessions right now:   {n}
    Analyses running right now:  {n}
    API calls last hour:         {n}
    Database size:               {n} MB / {limit} MB (free tier)
    RLS policies active:         {n} / {n} tables

  RECENT ERRORS:
    Last 10 errors across all tenants:
      Timestamp | Tenant | Error type | Message | [View Details]
    Color coded by severity: red=critical, amber=warning, blue=info

  DATABASE HEALTH:
    Table row counts (all 19+ tables)
    RLS status: all tables showing rowsecurity = true
    Schema version: {version}
    Last migration: {datetime}

  UPTIME (last 30 days):
    Simple uptime chart
    Incidents logged with duration and resolution


────────────────────────────────────────────────────────────────────
SCREEN: /platform/costs — AI API Cost Tracking
────────────────────────────────────────────────────────────────────

  HEADER: "AI Cost Tracking"
  SUBTEXT: "Anthropic API costs across all tenants.
            At ~$0.05 per 15-app analysis this should stay very low."

  SUMMARY ROW:
    Total cost MTD:           ${n}
    Total cost last month:    ${n}
    Projected month-end:      ${n}
    Cost per tenant avg:      ${n}
    Most expensive tenant:    {tenant_name} (${n} MTD)

  COST BY TENANT TABLE:
    Columns: Tenant | Plan | Analysis Runs | Advisor Queries |
             Total Tokens | Total Cost MTD | Cost Last Month

    Sortable by cost — find outliers immediately

  COST TREND CHART:
    Daily cost for last 30 days
    Line per tenant (top 5 tenants)

  COST ALERTS:
    IF any tenant exceeds ${threshold} in a month:
      SEND email to Ken: "Cost alert: {tenant} spent ${n} this month"
    Configure threshold: [$10] per tenant per month

  ANTHROPIC API STATUS:
    Current rate limits
    API key health check
    Last successful call: {datetime}


────────────────────────────────────────────────────────────────────
SCREEN: /platform/logs — Platform-Wide Activity Log
────────────────────────────────────────────────────────────────────

  HEADER: "Platform Logs"

  TABS: [All Activity] [Errors] [Security] [Analysis Runs]

  TAB: All Activity
    Every significant event across all tenants:
      Timestamp | Tenant | User | Action | Details
    Filter by: tenant, action type, date range, severity
    Search by: user email, tenant name, action keyword
    [Export to CSV]

  TAB: Errors
    All errors and exceptions:
      Timestamp | Tenant | Error type | Stack trace (expandable)
      Severity: [Critical] [Error] [Warning]
      Status: [New] [Acknowledged] [Resolved]
      [Mark Resolved] button

  TAB: Security
    Security-relevant events:
      Failed login attempts (flag brute force)
      Unauthorized access attempts to /platform
      RLS policy violations (should never happen — flag if they do)
      Impersonation sessions started/ended
      Tenant suspended/deleted
      Platform admin login

  TAB: Analysis Runs
    Every AI analysis across all tenants:
      Timestamp | Tenant | Apps | Duration | Cost | Model | Status
      [View Results] for any run


────────────────────────────────────────────────────────────────────
SCREEN: /platform/config — Global Platform Configuration
────────────────────────────────────────────────────────────────────

  HEADER: "Platform Configuration"
  WARNING: "Changes here affect all tenants. Test in demo tenant first."

  SECTION: Default AI Settings (applied to new tenants)
    Default AI model:            claude-sonnet-4-5
    Default max tokens:          1000
    Default confidence warn:     60%
    Default confidence block:    40%
    Default batch size:          15

  SECTION: Plan Limits
    TABLE: Plan | Max Apps | Max Users | Max Analyses/mo | Price
    [Edit] each plan's limits

  SECTION: Feature Flags
    Toggle features on/off globally or per-plan:
      [ ] Capability mapping        (Phase 2)
      [ ] Governance dashboard      (Phase 2)
      [ ] Live API sync             (Phase 2)
      [ ] Export to PDF             (Phase 1)
      [ ] AI Portfolio Advisor      (Phase 1)
      [ ] Security posture scoring  (Phase 1)
      [x] TIME model classification (Phase 1)

    PER-TENANT OVERRIDE:
      Any feature flag can be overridden for a specific tenant
      Useful for: beta features, enterprise custom agreements

  SECTION: Maintenance Mode
    [Enable Maintenance Mode] → shows maintenance page to all users
    Maintenance message: [textarea]
    Bypass token: [text field] — allows Ken to access during maintenance

  SECTION: Schema Management
    Current schema version: v2.1
    [View migration history]
    [Run pending migrations] (shows what will change before running)
    WARNING: "Migrations cannot be undone. Back up data first."


────────────────────────────────────────────────────────────────────
SCREEN: /platform/schema — Schema Version Management
────────────────────────────────────────────────────────────────────

  HEADER: "Schema Management"

  CURRENT STATE:
    Schema version:     v2.1
    Tables:             19 (all with RLS enabled)
    Last migration:     {datetime}
    Pending migrations: {n}

  MIGRATION HISTORY TABLE:
    Version | Applied at | Applied by | Changes | Status

  PENDING MIGRATIONS:
    IF pending > 0:
      SHOW list of pending changes with SQL preview
      [Apply Migrations] button (requires confirmation)

  SCHEMA HEALTH CHECK:
    [Run Health Check] → verifies:
      All tables have RLS enabled
      All foreign keys valid
      No orphaned records
      Index health
      Shows results with pass/fail per check
```

---

### 9.3 ACCESS CONTROL IMPLEMENTATION

```
USER ROLES TABLE:

  role              | /dashboard | /admin | /platform | Impersonate
  ──────────────────────────────────────────────────────────────────
  viewer            | read only  | ✗      | ✗          | ✗
  analyst           | read+run   | ✗      | ✗          | ✗
  reviewer          | read+decide| ✗      | ✗          | ✗
  admin             | full       | own    | ✗          | ✗
  platform_admin    | full       | any    | full       | ✓


SCHEMA ADDITIONS:

  tenants table — ADD:
    plan          TEXT     # Starter / Growth / Professional / Trial / Session
    status        TEXT     # Active / Trial / Suspended / Churned
    session_mode  BOOLEAN  # true for Jan's version
    trial_expiry  DATE
    notes         TEXT     # internal notes, not visible to tenant
    created_by    UUID     # platform admin who created it

  users table — ADD:
    platform_admin  BOOLEAN  DEFAULT false  # Ken and Matt only
    last_active     TIMESTAMP
    invited_by      UUID

  platform_logs table — NEW:
    id              UUID
    tenant_id       UUID     # null for platform-level events
    user_id         UUID
    impersonated_by UUID     # set when Ken impersonates a tenant
    action          TEXT
    details         JSONB
    severity        TEXT     # info / warning / error / critical
    created_at      TIMESTAMP

  ai_costs table — NEW:
    id              UUID
    tenant_id       UUID
    analysis_id     UUID
    tokens_input    INTEGER
    tokens_output   INTEGER
    cost_usd        NUMERIC(10,6)
    model_version   TEXT
    recorded_at     TIMESTAMP


ROUTE PROTECTION:

  MIDDLEWARE checkAccess(route, user):

    IF route starts with "/platform":
      IF NOT user.platform_admin:
        LOG security_event: "Unauthorized platform access attempt"
        REDIRECT to /dashboard
        RETURN

    IF route starts with "/admin":
      IF user.role NOT IN ["admin", "platform_admin"]:
        REDIRECT to /dashboard
        RETURN

    ALLOW access
```

---

### 9.4 UPDATED NAVIGATION STRUCTURE

```
MAIN APP NAVIGATION (all users):
  Portfolio Overview
  AI Analysis & Signals
  Validation Queue    [•4]
  Decision Audit Log
  Capability Map
  Scoring Methodology
  AI Portfolio Advisor
  ──────────────────────
  Settings / Admin      → /admin (visible to admin role and above only)

TENANT ADMIN NAVIGATION (/admin):
  Users & Access        → /admin/users
  Data Sources          → /admin/data-sources
  Configuration         → /admin/configuration
  Logs                  → /admin/logs
  Billing & Usage       → /admin/billing
  Session Settings      → /admin/session (session mode only)
  ──────────────────────
  ← Back to Dashboard

PLATFORM ADMIN NAVIGATION (/platform):
  Tenants               → /platform/tenants
  Create Tenant         → /platform/create
  System Health         → /platform/system
  Cost Tracking         → /platform/costs
  Platform Logs         → /platform/logs
  Configuration         → /platform/config
  Schema Management     → /platform/schema
  ──────────────────────
  [Exit to App] → returns to /dashboard as Ken's own tenant

SESSION MODE NAVIGATION (Jan):
  Portfolio Overview
  AI Analysis & Signals
  Validation Queue
  AI Portfolio Advisor
  ──────────────────────
  Session Settings      → /admin/session
  [End Session]         → clears all data, returns to start
```

---

### 9.5 JAN-SPECIFIC ADMIN BEHAVIOR

```
Jan's version has SESSION_MODE = true.
Her admin section is simplified to exactly what she needs
before and during a client engagement.

WHAT JAN SEES IN /admin:
  ✓ Session Settings    — configure engagement defaults
  ✓ Logs               — session history only (no client data)
  ✗ Users              — hidden (single reviewer)
  ✗ Billing            — hidden (free license from Ken)
  ✗ Data Sources       — hidden (CSV upload only, configured per session)

WHAT JAN SEES IN /platform:
  Nothing — Jan is a tenant admin, not a platform admin

JAN'S SESSION START FLOW:
  1. Jan logs in → lands on Session Start screen
  2. Enters client name/code
  3. Selects data source (CSV or API)
  4. Uploads/connects data
  5. Analysis runs
  6. Presents findings to client
  7. Client wants subscription → Jan gives them Ken's contact
  8. [End Session] → all client data wiped
  9. Ken creates new tenant for the client
  10. Client migrates their own data via CSV or connector
```

---

*PortfolioIQ Standalone — Pseudocode v2.2 | Ken Turner | June 2026*
*v2.0: Gartner TIME alignment, scoring transparency, security posture,*
*business capability mapping, review cadence, AI Portfolio Advisor*
*v2.1: Validation Queue with live badge, AI Analysis & Signals screen,*
*updated navigation structure, signals_audit and data_quality_scores tables*
*v2.2: Admin section — Tenant Admin (/admin) and Platform Admin (/platform),*
*access control implementation, Jan session admin, AI cost tracking,*
*impersonation, schema management, feature flags*

---

## SPRINT 10: ENGAGEMENT FILE ARCHITECTURE
### The persistence layer — data stays with the client, not on your servers

```
PURPOSE:
  The .portfolioiq file is how PortfolioIQ handles multi-day engagements
  without storing client data on Ken's servers. Jan exports the file
  at the end of each working session. The client keeps the file. Jan imports
  it at the start of the next session to resume exactly where she left off.
  Data sovereignty stays with the client. Ken has zero liability for
  stored portfolio data.

FILE FORMAT:
  Extension:  .portfolioiq
  Format:     JSON (rename to .json to inspect in any text editor)
  Location:   Jan's laptop or client's shared drive
  Encryption: None (client can verify contents — builds trust)
              Note: add optional AES-256 encryption in Phase 2
                    if enterprise clients require it

ENGAGEMENT FILE STRUCTURE:

  {
    "metadata": {
      "portfolioiq_version": "2.3",
      "engagement_id":       "uuid — unique per engagement",
      "client_name":         "Nexus Global Solutions",
      "client_code":         "NGS-2026-001 — Jan's internal reference",
      "analyst":             "Jan Barlow",
      "analyst_email":       "jan@litchfieldpractice.com",
      "engagement_key_id":   "uuid — links to the key Ken issued",
      "key_expires_at":      "2026-07-04",
      "created_at":          "2026-06-04T09:00:00",
      "last_updated":        "2026-06-05T16:45:00",
      "session_count":       3,
      "schema_version":      "v2.3"
    },

    "source": {
      "type":               "csv",
      "original_filename":  "nexus_app_inventory.xlsx",
      "uploaded_at":        "2026-06-04T09:15:00",
      "field_mapping":      { "App_Name": "name", ... },
      "value_mapping":      { "lifecycle_stage": { "Active": "Current" } },
      "mapping_confidence": 0.94,
      "records_loaded":     47
    },

    "applications": [
      {
        "id":                    "app_001",
        "name":                  "LegacyDB",
        "vendor":                "Oracle",
        "lifecycle_stage":       "End of Life",
        "support_status":        "End of Life",
        "annual_cost":           142000,
        "active_user_count":     12,
        "duplicate_functionality": true,
        "application_owner":     null,
        "data_classification":   "Confidential",
        "ai_disposition":        "Retire",
        "ai_confidence":         0.91,
        "ai_reasoning":          "Full reasoning text...",
        "technical_debt_score":  95,
        "business_value_score":  22,
        "security_posture_score": 88,
        "security_risk_level":   "High",
        "time_classification":   "Eliminate",
        "signals": {
          "technical_debt": {
            "lifecycle":      { "value": "End of Life", "points": 30 },
            "support":        { "value": "End of Life", "points": 25 },
            "incidents":      { "value": 23,            "points": 20 },
            "duplicate":      { "value": true,          "points": 15 },
            "infrastructure": { "value": "2 EOL servers","points": 10 }
          },
          "business_value": {
            "users":       { "value": 12,      "points": 0  },
            "services":    { "value": 0,       "points": 0  },
            "cost":        { "value": 142000,  "points": 6  },
            "replacement": { "value": false,   "points": 20 }
          },
          "security": {
            "data_class":  { "value": "Confidential", "points": 5  },
            "eol_software":{ "value": "End of Life",  "points": 30 },
            "eol_infra":   { "value": "2 EOL servers","points": 20 },
            "no_owner":    { "value": true,           "points": 10 }
          }
        },
        "decision": {
          "status":            "Overridden",
          "final_disposition": "Modernize",
          "rationale":         "Retiring LegacyDB before Q3 migration completes
                                creates unacceptable operational risk.",
          "decided_by":        "Jan Barlow",
          "decided_at":        "2026-06-04T14:23:00",
          "review_session":    2
        }
      }
    ],

    "summary": {
      "total_apps":             47,
      "total_annual_cost":      3200000,
      "potential_savings":      890000,
      "disposition_breakdown":  {
        "Retain": 18, "Modernize": 8, "Retire": 15, "Replace": 6
      },
      "time_breakdown": {
        "Invest": 14, "Migrate": 12, "Tolerate": 9, "Eliminate": 12
      },
      "security_breakdown": {
        "High": 8, "Medium": 15, "Low": 24
      },
      "decisions_made":         31,
      "decisions_pending":      16,
      "override_count":         4,
      "override_rate":          "12.9%",
      "analyses_run":           2,
      "last_analysis_at":       "2026-06-04T09:45:00",
      "ai_model":               "claude-sonnet-4-5",
      "prompt_version":         "v2.0"
    }
  }


EXPORT FUNCTION:

  FUNCTION exportEngagementFile(state):

    file = buildEngagementFile(state)
    json = JSON.stringify(file, null, 2)
    filename = sanitize(
      f"{state.metadata.client_name}_{state.metadata.created_at}.portfolioiq"
    )

    # Electron: write directly to disk via IPC
    IF window.api exists:
      path = await window.api.saveFile(filename, json)
      SHOW success: "Engagement saved to {path}"

    # Browser fallback: trigger download
    ELSE:
      triggerDownload(filename, json)
      SHOW success: "Engagement file downloaded: {filename}"

    UPDATE state.metadata.last_updated = now()
    UPDATE state.metadata.session_count += 1


IMPORT FUNCTION:

  FUNCTION importEngagementFile(file):

    # Parse and validate
    TRY:
      data = JSON.parse(file.contents)
    CATCH:
      SHOW error: "Invalid file format. This doesn't appear to be
                   a PortfolioIQ engagement file."
      RETURN

    # Version check
    IF data.metadata.portfolioiq_version not in SUPPORTED_VERSIONS:
      SHOW error: "This file was created with PortfolioIQ
                   {data.metadata.portfolioiq_version}. Please update
                   your app to open this file."
      RETURN

    # Key check — does current key match this engagement?
    IF current_key.engagement_id != data.metadata.engagement_key_id:
      SHOW warning: "This engagement was created with a different key.
                     Enter the original key to continue, or start a
                     new engagement."
      SHOW: [Enter original key] [Start new engagement]
      RETURN

    # Restore state
    loadApplications(data.applications)
    restoreDecisions(data.applications)
    restoreMapping(data.source)
    restoreSummary(data.summary)

    SHOW success banner:
      "✓ Engagement restored — {data.metadata.client_name}
       {data.summary.decisions_made} of {data.summary.total_apps}
       decisions made. {data.summary.decisions_pending} pending.
       Last updated: {data.metadata.last_updated}"

    NAVIGATE to ValidationQueue
      # Takes Jan straight to pending decisions


AUTO-SAVE (Electron only):

  FUNCTION startAutoSave(state):
    EVERY 15 minutes:
      path = getAutoSavePath()   # fixed location: ~/PortfolioIQ/autosave.tmp
      await window.api.setAutoSave(JSON.stringify(state))
      SHOW subtle indicator: "● Auto-saved {time}"

  ON APP LAUNCH:
    autosave = await window.api.getAutoSave()
    IF autosave exists AND age < 24 hours:
      SHOW banner:
        "⚠ We found an unsaved engagement from {time}.
         [Restore unsaved work] [Start fresh]"
      IF user clicks Restore:
        importEngagementFile(autosave)
```

---

## SPRINT 11: ENGAGEMENT KEY SYSTEM
### Ken controls every engagement Jan runs

```
PURPOSE:
  Ken issues a key before each engagement begins. The key encodes
  what Jan is allowed to do and for how long. No key = no new engagement.
  Jan can always view and export existing work after key expiry —
  the client deliverable is never held hostage.

KEY STRUCTURE:

  RAW PAYLOAD (before encoding):
  {
    "key_id":         "uuid",
    "issued_to":      "jan@litchfieldpractice.com",
    "issued_by":      "Ken@telority.com",
    "issued_at":      "2026-06-04",
    "expires_at":     "2026-07-04",     # Ken sets per engagement
    "app_limit":      150,              # max applications (0 = unlimited)
    "analysis_limit": 10,               # max analysis runs
    "client_name":    "Nexus Global Solutions",
    "engagement_id":  "uuid",
    "features": {
      "advisor":      true,
      "signals":      true,
      "export_pdf":   true,
      "capability_map": false           # Phase 2 feature, not yet enabled
    },
    "notes": "Q2 2026 portfolio rationalization engagement"
  }

  ENCODING:
    1. Serialize payload to JSON string
    2. Sign with HMAC-SHA256 using SECRET_KEY
       (SECRET_KEY lives only in Electron main process and Ken's
        key generator — never in React renderer)
    3. Base64url encode: signature + payload
    4. Format as readable blocks of 4 characters:
       PIQ-A3F2-9K12-MN45-PQ78-XY23

  WHAT THE KEY LOOKS LIKE:
    PIQ-A3F2-9K12-MN45-PQ78-XY23
    Jan copies this from Ken's email and pastes it into the app.


KEY VALIDATION (Electron — offline capable):

  FUNCTION validateKey(keyString):

    # Strip formatting
    raw = keyString.replace(/-/g, '').replace('PIQ', '')

    # Decode
    TRY:
      decoded = base64url.decode(raw)
      payload = JSON.parse(decoded.payload)
      signature = decoded.signature
    CATCH:
      RETURN { valid: false, error: "Invalid key format" }

    # Verify signature
    expected = HMAC_SHA256(SECRET_KEY, JSON.stringify(payload))
    IF signature != expected:
      RETURN { valid: false, error: "Key signature invalid" }

    # Check expiry
    IF payload.expires_at < today():
      RETURN {
        valid: false,
        expired: true,
        error: f"Key expired on {payload.expires_at}",
        allow_export: true    # always allow report generation
      }

    # Check issued_to matches current user
    IF payload.issued_to != current_user.email:
      RETURN { valid: false, error: "This key was issued to a different user" }

    RETURN {
      valid:           true,
      engagement_id:   payload.engagement_id,
      client_name:     payload.client_name,
      expires_at:      payload.expires_at,
      app_limit:       payload.app_limit,
      analysis_limit:  payload.analysis_limit,
      features:        payload.features,
      days_remaining:  calculateDaysRemaining(payload.expires_at)
    }


KEY VALIDATION (Web / Phase 1a — requires internet):

  FUNCTION validateKeyWeb(keyString):
    response = await supabase.functions.invoke('validate-key', {
      body: { key: keyString, user_email: current_user.email }
    })
    RETURN response.data


KEY EXPIRY BEHAVIOR:

  IF key.valid == true:
    ALL features unlocked per key.features
    App limit enforced: block upload if apps would exceed limit
    Analysis limit enforced: block re-analysis if limit reached

  IF key.expired == true:
    SHOW persistent amber banner:
      "⚠ Engagement key expired {key.expires_at}.
       You can view and export this engagement but cannot
       run new analyses. Contact Ken Turner to renew."
    ALLOW: viewing all screens, exporting report, exporting file
    BLOCK: uploading new data, running new analysis, starting new engagement

  IF key.valid == false (tampered or wrong user):
    SHOW error screen:
      "Invalid engagement key. Contact Ken Turner."
    BLOCK all access


KEY USAGE TRACKING:

  Stored in engagement file (not on server):
    "key_usage": {
      "apps_loaded":       47,
      "analyses_run":      2,
      "last_analysis_at":  "2026-06-04T09:45:00"
    }

  On each restricted action:
    CHECK key_usage against key limits
    IF over limit:
      SHOW: "You've reached the analysis limit for this engagement key.
             Contact Ken Turner to increase the limit."


ENGAGEMENT MODES — SESSION START SCREEN:

  SCREEN SessionStart:

    HEADER: "PortfolioIQ"
    SUBLOGO: "by Telority"

    THREE OPTIONS:

    ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
    │   NEW ENGAGEMENT    │  │  RESUME ENGAGEMENT   │  │    QUICK DEMO       │
    │                     │  │                      │  │                     │
    │  Start fresh with   │  │  Continue a project  │  │  Explore with       │
    │  a new client       │  │  already in progress │  │  sample data        │
    │                     │  │                      │  │                     │
    │  Requires an        │  │  Import your         │  │  No key needed      │
    │  engagement key     │  │  .portfolioiq file   │  │  No data stored     │
    │  from Ken       │  │  Key auto-detected   │  │  15 sample apps     │
    └─────────────────────┘  └─────────────────────┘  └─────────────────────┘

    NEW ENGAGEMENT flow:
      1. Enter engagement key: [PIQ-____-____-____-____-____]
         [Validate Key] button
      2. IF valid: show engagement details
         "Client: {client_name}
          Expires: {expires_at} ({n} days)
          App limit: {limit}
          Analysis runs: {limit}"
         [Start Engagement] button
      3. Upload screen → AI Schema Mapper → Dashboard

    RESUME ENGAGEMENT flow:
      1. [Browse for .portfolioiq file] or drag and drop
      2. File parsed → key auto-detected
      3. Key re-validated (checks expiry)
      4. IF valid: restore state → ValidationQueue
      5. IF expired: restore state → view/export mode only

    QUICK DEMO flow:
      1. Load Nexus Global Solutions sample dataset (15 apps)
      2. All features available
      3. No key required
      4. Data in memory only — nothing saved
      5. "DEMO MODE" watermark on all exports
      6. [Export] shows: "Remove DEMO watermark with an engagement key"
```

---

## SPRINT 12: PLATFORM ADMIN — KEY MANAGEMENT
### Ken generates and manages engagement keys

```
SCREEN: /platform/keys — Engagement Key Management

  HEADER: "Engagement Keys"
  SUBTEXT: "Generate time-bounded keys for partner engagements.
            Each key controls access duration, app limits, and features."

  GENERATE NEW KEY:

    FORM:
      Partner:          [dropdown — Jan Barlow | Add new partner]
      Client name:      [text field] e.g. "Nexus Global Solutions"
      Expiry:           [date picker] default: 30 days from today
      App limit:        [number] default: 150 (0 = unlimited)
      Analysis runs:    [number] default: 10  (0 = unlimited)
      Features:
        [x] AI Portfolio Advisor
        [x] Signals Screen
        [x] PDF Report Export
        [ ] Capability Map (Phase 2)
        [ ] Live API Sync  (Phase 2)
      Notes:            [text field] internal only

      [Generate Key] button

    ON generate:
      payload = buildKeyPayload(formValues)
      key = signAndEncodeKey(payload, SECRET_KEY)
      storeKeyRecord(payload)
      DISPLAY generated key:

        ┌────────────────────────────────────────┐
        │  PIQ-A3F2-9K12-MN45-PQ78-XY23          │
        │                                        │
        │  Client:   Nexus Global Solutions      │
        │  Expires:  July 4, 2026 (30 days)      │
        │  App limit: 150 applications           │
        │  Analyses: 10 runs                     │
        │                                        │
        │  [Copy Key]  [Email to Jan]  [Done]    │
        └────────────────────────────────────────┘

      [Email to Jan] generates pre-written email:
        Subject: "PortfolioIQ Engagement Key — Nexus Global Solutions"
        Body:
          "Hi Jan,
           Here is your engagement key for Nexus Global Solutions.
           This key is valid until July 4, 2026.

           PIQ-A3F2-9K12-MN45-PQ78-XY23

           Enter this key when starting a new engagement in PortfolioIQ.
           Reply if you have any questions.
           — Ken"


  ACTIVE KEYS TABLE:
    Columns: Partner | Client | Key (masked) | Issued | Expires |
             Status | Apps Used | Analyses Used | Actions

    Status badges:
      [Active]    — valid, not expired
      [Expiring]  — expires within 7 days (amber)
      [Expired]   — past expiry date (grey)
      [Revoked]   — manually revoked (red)

    Actions:
      [Extend]    — adds days to expiry
      [Increase limits] — raises app or analysis limit
      [Revoke]    — immediately invalidates key
      [View usage] — shows engagement file metadata if synced


  KEY ANALYTICS:
    Total keys issued:     {n}
    Active keys:           {n}
    Engagements completed: {n}
    SaaS conversions:      {n} ({pct}% conversion rate)
    Revenue attributed:    ${n} (from Jan's engagements)
```

---

## PHASE 1 — FINAL DEFINITION

```
PHASE 1 GOAL:
  Jan can run professional client engagements using PortfolioIQ.
  Data stays on Jan's laptop. Client gets a board-ready report.
  Ken controls every engagement via time-bounded keys.
  No client data on Ken's servers. Zero legal liability for storage.

WHAT PHASE 1 DELIVERS:

  For Jan:
    ✓ Electron desktop app (Windows + Mac)
    ✓ New / Resume / Demo engagement modes
    ✓ CSV and Excel upload for any client data format
    ✓ AI schema mapper — works with any column names
    ✓ Mapping review — Jan confirms before data loads
    ✓ AI scoring — disposition, TIME, debt, value, security per app
    ✓ Dashboard — KPIs, charts, top candidates
    ✓ AI Analysis & Signals screen — what Jan presents in the room
    ✓ Validation Queue — pending decisions with live badge
    ✓ Decision Audit Log — complete record of all decisions
    ✓ AI Portfolio Advisor — conversational Q&A during presentations
    ✓ PDF Report — board-ready client deliverable
    ✓ Engagement file export/import — multi-day persistence
    ✓ Auto-save every 15 minutes — crash recovery
    ✓ Session branding — Jan's logo on exports (optional)

  For Ken:
    ✓ Web-based Platform Admin
    ✓ Engagement key generation and management
    ✓ Partner management (Jan + future partners)
    ✓ Usage tracking per key
    ✓ Email key directly to Jan from admin panel

  For clients (via Jan):
    ✓ .portfolioiq engagement file — their data, their custody
    ✓ PDF report — professional board-ready deliverable
    ✓ Clear path to SaaS subscription for ongoing access

WHAT PHASE 1 DOES NOT INCLUDE:
    ✗ Live API connectors (ServiceNow, Freshservice — Phase 2)
    ✗ Paying SaaS subscriber tenants (Phase 2)
    ✗ Stripe billing (Phase 2)
    ✗ SOC 2 (Phase 3)
    ✗ On-premise deployment (Phase 3)
    ✗ Capability mapping (Phase 2)
    ✗ Governance Dashboard (Phase 2)

DATA HANDLING IN PHASE 1:
    Client portfolio data:   Jan's laptop only
    Engagement files:        Client's custody (.portfolioiq)
    AI analysis calls:       Anthropic API (no portfolio data stored)
    Key validation:          Electron: offline HMAC / Web: Supabase Edge Fn
    Auto-save:               Jan's laptop disk only
    PDF reports:             Jan's laptop, given to client
    Ken's servers:       Key metadata only (no portfolio data)


PHASE 1 BUILD SEQUENCE:

  Phase 1a — React app (Ken + Claude):
    Session 1:  Session Start screen + Key validation
    Session 2:  AI Schema Mapper
    Session 3:  Mapping Review UI
    Session 4:  Engagement file export + import + auto-save
    Session 5:  AI Analysis & Signals screen
    Session 6:  Validation Queue (Phase 1 version)
    Session 7:  PDF Report generation
    Session 8:  Platform Admin — Key generation screen
    Session 9:  End-to-end test with 3 synthetic datasets
    Session 10: Handoff document for Matt (Electron spec)

  Phase 1b — Electron packaging (Matt):
    Wrap React app in Electron shell
    Implement IPC bridge (file system, Claude proxy, key validation)
    Code sign for Windows (.exe) and Mac (.dmg)
    Set up auto-update via electron-updater
    Set up secure download distribution for Jan
    Test on Jan's actual laptop


MID-MARKET CONNECTOR PRIORITY (Phase 2):
    Priority 1: Freshservice — dominant mid-market ITSM
    Priority 2: Jira Service Management — common in PE-backed tech
    Priority 3: ManageEngine — budget mid-market
    Priority 4: ServiceNow — upper end of ICP
    Always:     CSV/Excel — primary path for companies with no CMDB


SAAS CONVERSION FLOW (Phase 2):
  Jan completes engagement
  Client asks: "Can we keep using this?"
  Jan gives client Ken's contact
  Ken creates paid tenant in Platform Admin
  Client loads their own data via CSV or connector
  Client accesses their tenant at app.getportfolioiq.com
  Jan receives revenue share (20% of Year 1 subscription)
  Engagement file can be imported into their new tenant
    to restore all decisions and history
```

---

*PortfolioIQ Standalone — Pseudocode v2.3 | Ken Turner | June 2026*
*v2.0: Gartner TIME alignment, scoring transparency, security posture,*
*business capability mapping, review cadence, AI Portfolio Advisor*
*v2.1: Validation Queue with live badge, AI Analysis & Signals screen,*
*updated navigation structure, signals_audit and data_quality_scores tables*
*v2.2: Admin section — Tenant Admin and Platform Admin, access control,*
*Jan session admin, AI cost tracking, impersonation, schema management*
*v2.3: Electron architecture, IPC bridge, engagement file (.portfolioiq),*
*engagement key system (HMAC), Session Start screen (New/Resume/Demo),*
*Phase 1 final definition, mid-market connector priority, SaaS conversion flow,*
*50/50 partnership model, Phase 1a/1b build sequence*
